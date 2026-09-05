#!/usr/bin/env node
/**
 * Serve the built site with `astro preview`, run a command against it, then
 * stop the server and exit with the command's status. Lets every gate that
 * needs a live URL run identically locally and in CI without extra tooling.
 *
 *   node scripts/with-preview.mjs <command> [args...]
 */
import { spawn } from 'node:child_process';

const HOST = '127.0.0.1';
const PORT = 4321;
const URL = `http://${HOST}:${PORT}/`;

const [, , command, ...args] = process.argv;
if (!command) {
  console.error('usage: with-preview.mjs <command> [args...]');
  process.exit(2);
}

const server = spawn('npx', ['astro', 'preview', '--host', HOST, '--port', String(PORT)], {
  stdio: ['ignore', 'ignore', 'inherit'],
});

async function waitForServer(attempts = 100) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(URL);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`preview server did not answer at ${URL}`);
}

let code = 1;
try {
  await waitForServer();
  code = await new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (c) => resolve(c ?? 1));
  });
} catch (err) {
  console.error(err.message);
} finally {
  server.kill();
}
process.exit(code);
