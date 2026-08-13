import { spawn } from 'node:child_process';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'assets', 'readme', 'ultradian-view.html');
const outMp4 = path.join(root, 'assets', 'readme', 'ultradian.mp4');
const outWebp = path.join(root, 'assets', 'readme', 'ultradian.webp');
const outPoster = path.join(root, 'assets', 'readme', 'ultradian-poster.png');

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FPS = 30;
const DURATION = 10;
const FRAMES = FPS * DURATION;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

const frameDir = await mkdtemp(path.join(tmpdir(), 'ultradian-frames-'));
await mkdir(frameDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--font-render-hinting=none', '--disable-lcd-text'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(htmlPath).href + '?still=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.dataset.fonts === 'ready');

  for (let i = 0; i < FRAMES; i++) {
    const t = i / FPS;
    await page.evaluate((time) => window.renderAt(time), t);
    await page.screenshot({
      path: path.join(frameDir, `f${String(i).padStart(4, '0')}.png`),
      type: 'png',
      omitBackground: false,
    });
    if (i === 186) {
      await page.screenshot({ path: outPoster, type: 'png' });
    }
    if (i % 30 === 0) process.stdout.write(`frame ${i}/${FRAMES}\n`);
  }
} finally {
  await browser.close();
}

const input = path.join(frameDir, 'f%04d.png');

await run('ffmpeg', [
  '-y',
  '-framerate', String(FPS),
  '-i', input,
  '-vf', 'scale=1280:720:flags=lanczos',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-crf', '18',
  '-preset', 'slow',
  '-movflags', '+faststart',
  outMp4,
]);

await run('ffmpeg', [
  '-y',
  '-framerate', String(FPS),
  '-i', input,
  '-vf', 'scale=1280:720:flags=lanczos',
  '-c:v', 'libwebp',
  '-lossless', '0',
  '-compression_level', '6',
  '-q:v', '72',
  '-loop', '0',
  outWebp,
]);

await rm(frameDir, { recursive: true, force: true });
process.stdout.write(`wrote\n  ${outMp4}\n  ${outWebp}\n  ${outPoster}\n`);
