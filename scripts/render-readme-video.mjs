import { spawn } from 'node:child_process';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'assets', 'readme', 'ultradian-view.html');
const outMp4 = path.join(root, 'assets', 'readme', 'ultradian.mp4');
const outGif = path.join(root, 'assets', 'readme', 'ultradian.gif');
const outWebp = path.join(root, 'assets', 'readme', 'ultradian.webp');
const outPoster = path.join(root, 'assets', 'readme', 'ultradian-poster.png');

const CHROME_PATH = 'C:\\Users\\hp1\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';
const FPS = 30;
const DURATION = 10;
const FRAMES = FPS * DURATION;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log('Creating temp frame directory...');
  const frameDir = await mkdtemp(path.join(tmpdir(), 'ultradian-frames-'));
  await mkdir(frameDir, { recursive: true });

  console.log('Launching browser for frame rendering...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage'],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const url = pathToFileURL(htmlPath).href + '?still=1';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);

    console.log(`Capturing ${FRAMES} frames @ ${FPS} FPS...`);
    for (let i = 0; i < FRAMES; i++) {
      const t = i / FPS;
      await page.evaluate((time) => window.renderAt(time), t);
      const framePath = path.join(frameDir, `f${String(i).padStart(4, '0')}.png`);
      await page.screenshot({
        path: framePath,
        type: 'png',
        omitBackground: false,
      });

      if (i === 60) {
        await page.screenshot({ path: outPoster, type: 'png' });
      }

      if (i % 30 === 0) {
        console.log(`  Frame ${i}/${FRAMES} (${Math.round((i / FRAMES) * 100)}%)`);
      }
    }
  } finally {
    await browser.close();
  }

  const input = path.join(frameDir, 'f%04d.png');

  console.log('Encoding MP4 (H.264 High Profile)...');
  await run('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', input,
    '-vf', 'scale=1280:720:flags=lanczos',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-preset', 'fast',
    '-movflags', '+faststart',
    outMp4,
  ]);

  console.log('Encoding Animated GIF (PaletteGen)...');
  const palette = path.join(frameDir, 'palette.png');
  await run('ffmpeg', [
    '-y',
    '-i', input,
    '-vf', 'scale=1280:720:flags=lanczos,palettegen=stats_mode=diff',
    palette,
  ]);
  await run('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', input,
    '-i', palette,
    '-lavfi', 'scale=1280:720:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3',
    outGif,
  ]);

  console.log('Encoding Animated WebP...');
  await run('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', input,
    '-vf', 'scale=1280:720:flags=lanczos',
    '-c:v', 'libwebp',
    '-lossless', '0',
    '-compression_level', '4',
    '-q:v', '75',
    '-loop', '0',
    outWebp,
  ]);

  await rm(frameDir, { recursive: true, force: true });
  console.log(`\n🎉 SUCCESSFULLY GENERATED:\n  ✓ ${outMp4}\n  ✓ ${outGif}\n  ✓ ${outWebp}\n  ✓ ${outPoster}`);
}

main().catch((err) => {
  console.error('Fatal rendering error:', err);
  process.exit(1);
});
