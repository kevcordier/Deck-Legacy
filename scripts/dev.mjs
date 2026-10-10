/**
 * Starts the API server and the Expo dev server together.
 *
 * Expo keeps the terminal (keyboard shortcuts w / i / a and prompts work), the server runs as a
 * background child whose output is prefixed, and both stop together. Metro uses the first free
 * port from 8081 (or EXPO_PORT when set).
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import readline from 'node:readline';

function isFree(port) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

async function firstFreePort(start) {
  for (let port = start; port < start + 20; port += 1) {
    if (await isFree(port)) return port;
  }
  throw new Error(`No free port between ${start} and ${start + 19}`);
}

// Absolute path of the pnpm that runs this script (`pnpm dev`), instead of a PATH lookup.
const pnpmPath = process.env.npm_execpath;
if (!pnpmPath) {
  console.error('[dev] Run this script with "pnpm dev".');
  process.exit(1);
}

/** Spawns pnpm, whether it is a native binary or a JavaScript entry point. */
function pnpm(args, options) {
  return /\.[cm]?js$/.test(pnpmPath)
    ? spawn(process.execPath, [pnpmPath, ...args], options)
    : spawn(pnpmPath, args, options);
}

const requested = Number(process.env.EXPO_PORT ?? 8081);
const port = await firstFreePort(requested);
if (port !== requested) {
  console.warn(`[dev] Port ${requested} is busy, Metro will use ${port}.`);
}

const server = pnpm(['--filter', '@deck-legacy/server', 'dev'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
for (const stream of [server.stdout, server.stderr]) {
  readline.createInterface({ input: stream }).on('line', line => {
    process.stdout.write(`\x1b[36m[server]\x1b[0m ${line}\n`);
  });
}

const client = pnpm(
  ['--filter', '@deck-legacy/client', 'exec', 'expo', 'start', '--port', String(port)],
  {
    stdio: 'inherit',
  },
);

let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  process.exitCode = code;
}

client.on('exit', code => stop(code ?? 0));
server.on('exit', code => {
  if (!stopping) {
    console.error(`[dev] The API server stopped (exit code ${code}).`);
    stop(code ?? 1);
  }
});
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
