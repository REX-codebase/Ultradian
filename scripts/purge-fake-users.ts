/**
 * Purge fake / demo / sample Firebase Auth users and their public projections.
 *
 * Uses the logged-in Firebase CLI OAuth token (firebase-tools.json) so this
 * does not require a service-account file. Targets the named Ultradian
 * Firestore database, never `(default)`.
 *
 *   npx tsx scripts/purge-fake-users.ts           # dry-run
 *   npx tsx scripts/purge-fake-users.ts --apply   # delete
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const PROJECT_ID = 'project-ori-ccd9e';
const FIRESTORE_DATABASE_ID = 'ai-studio-ultradianfocuspu-43134014-ac79-4dd7-bc54-b2d2b1a8658f';
const AGGREGATE_SOURCE = 'session-aggregation-v2';
const APPLY = process.argv.includes('--apply');

const FIREBASE_CLI_CLIENT_ID =
  '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLI_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

const FAKE_NAME =
  /^(sample|seed|demo|test|friend|local_peer|mock|bot|fake|guest|anonymous|user\s*\d+)([-_\s.]|$)/i;
const FAKE_EMAIL = /(demo|sample|seed|fake|mock|test[+._-]).*@|@(example\.com|test\.com|fake\.local)$/i;
const FAKE_SESSION_ID = /^(sample|seed|demo|test|friend|local_peer|mock)[_-]/i;
const LEAGUE_TIERS = ['wood', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'ultradian_master'];

interface AuthUser {
  localId: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  providerUserInfo?: Array<{ providerId: string; email?: string; displayName?: string }>;
  createdAt?: string;
  lastLoginAt?: string;
}

interface FirestoreDoc {
  name: string;
  fields?: Record<string, any>;
}

function decodeValue(value: any): any {
  if (value == null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) out[k] = decodeValue(v);
    return out;
  }
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  return value;
}

function fieldsOf(doc: FirestoreDoc): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(doc.fields || {})) out[k] = decodeValue(v);
  return out;
}

function docId(name: string): string {
  return decodeURIComponent(name.split('/').pop() || '');
}

function loadCliRefreshToken(): string {
  const candidates = [
    path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'configstore', 'firebase-tools.json'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const token = parsed?.tokens?.refresh_token;
    if (token) {
      console.log(`Using Firebase CLI session for ${parsed.user?.email || 'unknown user'}`);
      return token;
    }
  }
  throw new Error('No Firebase CLI login found. Run `firebase login` first.');
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: FIREBASE_CLI_CLIENT_ID,
    client_secret: FIREBASE_CLI_CLIENT_SECRET,
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Token refresh failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

async function api(accessToken: string, url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`${init.method || 'GET'} ${url} -> ${res.status} ${text.slice(0, 500)}`);
  }
  return json;
}

async function listAuthUsers(accessToken: string): Promise<AuthUser[]> {
  const users: AuthUser[] = [];
  let nextPageToken: string | undefined;
  do {
    const json = await api(
      accessToken,
      'https://www.googleapis.com/identitytoolkit/v3/relyingparty/downloadAccount',
      {
        method: 'POST',
        body: JSON.stringify({
          targetProjectId: PROJECT_ID,
          maxResults: 1000,
          ...(nextPageToken ? { nextPageToken } : {}),
        }),
      }
    );
    users.push(...(json.users || []));
    nextPageToken = json.nextPageToken;
  } while (nextPageToken);
  return users;
}

function firestoreRoot(): string {
  return `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents`;
}

async function listCollection(accessToken: string, collectionPath: string): Promise<FirestoreDoc[]> {
  const docs: FirestoreDoc[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`${firestoreRoot()}/${collectionPath}`);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const json = await api(accessToken, url.toString());
    docs.push(...(json.documents || []));
    pageToken = json.nextPageToken;
  } while (pageToken);
  return docs;
}

async function listSubcollection(
  accessToken: string,
  parentDocPath: string,
  sub: string
): Promise<FirestoreDoc[]> {
  return listCollection(accessToken, `${parentDocPath}/${sub}`);
}

async function deleteDocRecursive(accessToken: string, docPathFromRoot: string) {
  const collections = ['sessions', 'weeks', 'members'];
  for (const sub of collections) {
    try {
      const children = await listSubcollection(accessToken, docPathFromRoot, sub);
      for (const child of children) {
        const childId = docId(child.name);
        await deleteDocRecursive(accessToken, `${docPathFromRoot}/${sub}/${childId}`);
      }
    } catch {
      // Subcollection may not exist.
    }
  }
  await api(accessToken, `${firestoreRoot()}/${docPathFromRoot}`, { method: 'DELETE' });
}

function isAnonymous(user: AuthUser): boolean {
  const providers = user.providerUserInfo || [];
  return providers.length === 0 || providers.every((p) => p.providerId === 'anonymous');
}

function looksFakeName(name?: string): boolean {
  const trimmed = (name || '').trim();
  if (!trimmed) return false;
  return FAKE_NAME.test(trimmed);
}

function looksFakeEmail(email?: string): boolean {
  return Boolean(email && FAKE_EMAIL.test(email));
}

interface SessionSummary {
  total: number;
  genuine: number;
  sample: number;
}

async function summarizeSessions(accessToken: string, uid: string): Promise<SessionSummary> {
  let sessions: FirestoreDoc[] = [];
  try {
    sessions = await listSubcollection(accessToken, `users/${uid}`, 'sessions');
  } catch {
    return { total: 0, genuine: 0, sample: 0 };
  }
  let genuine = 0;
  let sample = 0;
  for (const session of sessions) {
    const data = fieldsOf(session);
    const id = docId(session.name);
    if (data.isSample === true || FAKE_SESSION_ID.test(id)) sample += 1;
    else genuine += 1;
  }
  return { total: sessions.length, genuine, sample };
}

interface Verdict {
  uid: string;
  email: string;
  name: string;
  anonymous: boolean;
  reasons: string[];
  sessions: SessionSummary;
}

async function main() {
  console.log(APPLY ? 'APPLY MODE — deletions will be executed.' : 'DRY RUN — pass --apply to delete.');
  const accessToken = await refreshAccessToken(loadCliRefreshToken());

  console.log('Listing Auth users…');
  const authUsers = await listAuthUsers(accessToken);
  console.log(`Auth users: ${authUsers.length}`);

  console.log('Listing Firestore profiles / leaderboard / leagues / tribes…');
  const [profileDocs, leaderboardDocs, tribeDocs, ...leagueMemberSets] = await Promise.all([
    listCollection(accessToken, 'users').catch(() => [] as FirestoreDoc[]),
    listCollection(accessToken, 'leaderboard').catch(() => [] as FirestoreDoc[]),
    listCollection(accessToken, 'tribes').catch(() => [] as FirestoreDoc[]),
    ...LEAGUE_TIERS.map((tier) =>
      listCollection(accessToken, `leagues/${tier}/members`).catch(() => [] as FirestoreDoc[])
    ),
  ]);

  const leagueMembers = leagueMemberSets.flatMap((docs, index) =>
    docs.map((doc) => ({ tier: LEAGUE_TIERS[index], doc }))
  );

  const authById = new Map(authUsers.map((user) => [user.localId, user]));
  const verdicts: Verdict[] = [];

  for (const user of authUsers) {
    const reasons: string[] = [];
    const name = user.displayName || '';
    const email = user.email || user.providerUserInfo?.find((p) => p.email)?.email || '';
    const anonymous = isAnonymous(user);
    const sessions = await summarizeSessions(accessToken, user.localId);

    if (looksFakeName(name)) reasons.push(`fake displayName "${name}"`);
    if (looksFakeEmail(email)) reasons.push(`fake email "${email}"`);
    if (sessions.total > 0 && sessions.genuine === 0) reasons.push('only sample/demo sessions');
    if (anonymous && !name && !email && sessions.genuine === 0) {
      reasons.push('anonymous ghost with no genuine sessions');
    }

    if (reasons.length > 0) {
      verdicts.push({
        uid: user.localId,
        email: email || '(none)',
        name: name || '(unnamed)',
        anonymous,
        reasons,
        sessions,
      });
    }
  }

  const fakeUids = new Set(verdicts.map((v) => v.uid));
  const orphanPublic: Array<{ path: string; reason: string }> = [];

  for (const doc of leaderboardDocs) {
    const id = docId(doc.name);
    const data = fieldsOf(doc);
    const name = String(data.name || '');
    if (!authById.has(id)) {
      orphanPublic.push({ path: `leaderboard/${id}`, reason: 'no Auth user' });
    } else if (data.source !== AGGREGATE_SOURCE) {
      orphanPublic.push({ path: `leaderboard/${id}`, reason: `unverified source=${data.source || 'missing'}` });
    } else if (looksFakeName(name)) {
      orphanPublic.push({ path: `leaderboard/${id}`, reason: `fake public name "${name}"` });
      fakeUids.add(id);
    }
  }

  for (const { tier, doc } of leagueMembers) {
    const id = docId(doc.name);
    const data = fieldsOf(doc);
    const name = String(data.name || '');
    if (!authById.has(id)) {
      orphanPublic.push({ path: `leagues/${tier}/members/${id}`, reason: 'no Auth user' });
    } else if (data.source !== AGGREGATE_SOURCE) {
      orphanPublic.push({ path: `leagues/${tier}/members/${id}`, reason: `unverified source=${data.source || 'missing'}` });
    } else if (looksFakeName(name) || fakeUids.has(id)) {
      orphanPublic.push({
        path: `leagues/${tier}/members/${id}`,
        reason: looksFakeName(name) ? `fake public name "${name}"` : 'linked fake Auth user',
      });
    }
  }

  for (const doc of tribeDocs) {
    const id = docId(doc.name);
    const data = fieldsOf(doc);
    if (data.source !== AGGREGATE_SOURCE || looksFakeName(String(data.name || id))) {
      orphanPublic.push({
        path: `tribes/${id}`,
        reason: data.source !== AGGREGATE_SOURCE ? `unverified source=${data.source || 'missing'}` : 'fake tribe',
      });
    }
  }

  for (const doc of profileDocs) {
    const id = docId(doc.name);
    if (!authById.has(id) || fakeUids.has(id)) {
      orphanPublic.push({
        path: `users/${id}`,
        reason: fakeUids.has(id) ? 'linked fake Auth user' : 'profile with no Auth user',
      });
    }
  }

  console.log('\n=== Fake Auth users ===');
  if (verdicts.length === 0) console.log('(none)');
  for (const v of verdicts) {
    console.log(
      `- ${v.uid}  ${v.name}  ${v.email}  anon=${v.anonymous}  sessions=${v.sessions.genuine}g/${v.sessions.sample}s  [${v.reasons.join('; ')}]`
    );
  }

  console.log('\n=== Public / profile docs to remove ===');
  if (orphanPublic.length === 0) console.log('(none)');
  for (const item of orphanPublic) {
    console.log(`- ${item.path}  (${item.reason})`);
  }

  console.log(
    `\nSummary: ${verdicts.length} Auth users, ${orphanPublic.length} Firestore docs. Mode=${APPLY ? 'APPLY' : 'DRY-RUN'}`
  );

  if (!APPLY) {
    console.log('Re-run with --apply to delete the rows above.');
    return;
  }

  for (const item of orphanPublic) {
    try {
      await deleteDocRecursive(accessToken, item.path);
      console.log(`deleted firestore ${item.path}`);
    } catch (error) {
      console.warn(`failed firestore ${item.path}:`, (error as Error).message);
    }
  }

  for (const v of verdicts) {
    try {
      await api(
        accessToken,
        `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:delete`,
        { method: 'POST', body: JSON.stringify({ localId: v.uid }) }
      );
      console.log(`deleted auth ${v.uid}`);
    } catch (error) {
      console.warn(`failed auth ${v.uid}:`, (error as Error).message);
    }
  }

  console.log('Purge complete.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
