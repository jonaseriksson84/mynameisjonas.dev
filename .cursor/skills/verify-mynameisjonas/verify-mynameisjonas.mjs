#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../..');
const runsRoot = '/tmp/verify-mynameisjonas';
const forbiddenHosts = new Set(['mynameisjonas.dev', 'www.mynameisjonas.dev']);
const databaseName = 'mynameisjonas-subscribers';

class Fail extends Error {}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function cmdline(pid) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`).toString('utf8').replaceAll('\0', ' ').trim();
  } catch {
    return '';
  }
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function assertOurProcess(pid, needles) {
  const command = cmdline(pid);
  if (!command || needles.some((needle) => !command.includes(needle))) {
    throw new Fail(`pid ${pid} is not a process this run started`);
  }
}

async function stopPid(pid) {
  const signal = (sig) => {
    try {
      process.kill(-pid, sig);
    } catch {
      try {
        process.kill(pid, sig);
      } catch {
        // already gone
      }
    }
  };
  signal('SIGTERM');
  for (let i = 0; i < 30; i++) {
    if (!alive(pid)) return;
    await sleep(100);
  }
  signal('SIGKILL');
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
  });
}

function runIdFromEnv() {
  const fromEnv = process.env.VERIFY_RUN_ID;
  if (fromEnv) return fromEnv;
  const latest = path.join(runsRoot, 'latest');
  if (!existsSync(latest)) throw new Fail('no verification run; launch first or set VERIFY_RUN_ID');
  return readFileSync(latest, 'utf8').trim();
}

function assertRunId(id) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,40}$/.test(id)) throw new Fail(`bad run id ${id}`);
  return id;
}

function pathsFor(id) {
  const runDir = path.join(runsRoot, assertRunId(id));
  return {
    id,
    runDir,
    runFile: path.join(runDir, 'run.json'),
    evidenceDir: path.join(runDir, 'evidence'),
    persistDir: path.join(runDir, 'persist'),
    logPath: path.join(runDir, 'wrangler.log'),
    browserLog: path.join(runDir, 'browser.log'),
    socketPath: path.join(runDir, 'browser.sock'),
  };
}

function loadState() {
  const paths = pathsFor(runIdFromEnv());
  if (!existsSync(paths.runFile)) throw new Fail(`missing ${paths.runFile}`);
  return readJson(paths.runFile);
}

function saveState(state) {
  writeJson(pathsFor(state.runId).runFile, state);
}

function assertLocalUrl(urlString, port) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    throw new Fail(`bad url ${urlString}`);
  }
  const host = url.hostname.toLowerCase();
  if (forbiddenHosts.has(host)) throw new Fail(`refusing production host ${host}`);
  if (url.protocol !== 'http:' || host !== '127.0.0.1') throw new Fail(`refusing non-local url ${urlString}`);
  if (port && String(url.port) !== String(port)) throw new Fail(`refusing port ${url.port}; this run is on ${port}`);
  return url;
}

function resolveLocalPath(state, input) {
  if (/^https?:\/\//i.test(input)) {
    assertLocalUrl(input, state.port);
    return input;
  }
  if (!input.startsWith('/')) throw new Fail(`path must start with /: ${input}`);
  return new URL(input, state.baseUrl).toString();
}

function tail(file, lines = 40) {
  if (!existsSync(file)) return '';
  const text = readFileSync(file, 'utf8');
  return text.split('\n').slice(-lines).join('\n');
}

function contentLength(headers) {
  if (!headers) return null;
  const raw = headers['content-length'] ?? headers['Content-Length'];
  if (raw == null) return null;
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isFinite(value) ? value : null;
}

function slugFromPath(pathname) {
  const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-');
  return slug || 'home';
}

function formatRequests(url, status, rows, unfinished) {
  const finished = rows.filter((row) => !row.redirectOnly);
  const total = finished.reduce((sum, row) => sum + (row.transferBytes || 0), 0);
  const lines = [`${status ?? '—'} ${url} transferBytes=${total} requests=${finished.length} unfinished=${unfinished}`];
  const sorted = [...finished].sort((a, b) => (b.transferBytes || 0) - (a.transferBytes || 0));
  for (const row of sorted) {
    const length = contentLength(row.headers);
    const lengthText = length == null ? '' : ` content-length=${length}`;
    const pathname = safePathname(row.url);
    lines.push(`  ${row.transferBytes ?? 0} ${row.method || ''} ${row.status ?? '—'} ${row.mimeType || row.type || ''} ${pathname}${lengthText}`.replace(/ +/g, ' ').trim());
  }
  return { total, lines: lines.join('\n') };
}

function safePathname(urlString) {
  try {
    return new URL(urlString).pathname;
  } catch {
    return urlString;
  }
}

function assertNoProduction(rows) {
  for (const row of rows) {
    let host = '';
    try {
      host = new URL(row.url).hostname.toLowerCase();
    } catch {
      continue;
    }
    if (forbiddenHosts.has(host)) throw new Fail(`request touched ${host}: ${row.url}`);
  }
}

async function launch() {
  if (!existsSync(path.join(repoRoot, 'wrangler.toml'))) {
    throw new Fail(`wrangler.toml not found from ${repoRoot}`);
  }
  const preset = process.env.VERIFY_RUN_ID;
  const id = assertRunId(preset || `${new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '')}-${randomBytes(2).toString('hex')}`);
  const paths = pathsFor(id);
  if (existsSync(paths.runFile)) {
    const previous = readJson(paths.runFile);
    if (previous.pid && alive(previous.pid)) throw new Fail(`run ${id} is already up; cleanup first`);
  }
  mkdirSync(paths.evidenceDir, { recursive: true });
  mkdirSync(paths.persistDir, { recursive: true });

  const build = spawnSync('pnpm', ['run', 'build'], { cwd: repoRoot, stdio: 'inherit' });
  if (build.status !== 0) throw new Fail('pnpm run build failed');
  const workerConfig = path.join(repoRoot, 'dist/server/wrangler.json');
  if (!existsSync(workerConfig)) throw new Fail('dist/server/wrangler.json is missing after the build');

  const migrate = spawnSync('pnpm', [
    'exec', 'wrangler', 'd1', 'migrations', 'apply', databaseName,
    '--local',
    '--persist-to', paths.persistDir,
    '--config', path.join(repoRoot, 'wrangler.toml'),
  ], { cwd: repoRoot, stdio: ['ignore', 'inherit', 'inherit'] });
  if (migrate.status !== 0) throw new Fail('local D1 migration failed');

  const port = await freePort();
  const inspectorPort = await freePort();
  const logFd = openSync(paths.logPath, 'a');
  // Built worker, local workerd, private D1. Never pass --remote or --tunnel.
  const child = spawn('pnpm', [
    'exec', 'wrangler', 'dev',
    '--config', workerConfig,
    '--local',
    '--persist-to', paths.persistDir,
    '--ip', '127.0.0.1',
    '--port', String(port),
    '--inspector-port', String(inspectorPort),
    '--show-interactive-dev-session', 'false',
    '--log-level', 'info',
  ], {
    cwd: repoRoot,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  });
  child.unref();
  closeSync(logFd);

  const state = {
    runId: id,
    baseUrl: `http://127.0.0.1:${port}`,
    port,
    inspectorPort,
    pid: child.pid,
    persistDir: paths.persistDir,
    evidenceDir: paths.evidenceDir,
    logPath: paths.logPath,
    repoRoot,
    browserPid: null,
    startedAt: new Date().toISOString(),
  };
  saveState(state);
  if (!preset) writeFileSync(path.join(runsRoot, 'latest'), `${id}\n`);

  try {
    await waitReady(state);
  } catch (err) {
    await stopPid(child.pid);
    throw new Fail(`${err.message}\n${tail(paths.logPath)}`);
  }
  console.log(`ok run=${id} base=${state.baseUrl} evidence=${paths.evidenceDir}`);
  console.log(`VERIFY_RUN_ID=${id}`);
}

async function waitReady(state) {
  const deadline = Date.now() + 45000;
  let last = 'no response';
  while (Date.now() < deadline) {
    if (!alive(state.pid)) throw new Fail('worker process exited');
    try {
      const response = await fetch(`${state.baseUrl}/`, { redirect: 'manual' });
      const text = await response.text();
      if (response.status === 200 && text.includes('mynameisjonas') && text.includes('Jonas')) return;
      last = `status ${response.status}`;
    } catch (err) {
      last = err.message;
    }
    await sleep(250);
  }
  throw new Fail(`worker not ready: ${last}`);
}

async function doctor() {
  const state = loadState();
  assertLocalUrl(state.baseUrl, state.port);
  if (!alive(state.pid)) throw new Fail(`worker pid ${state.pid} is not running`);
  assertOurProcess(state.pid, ['dist/server/wrangler.json', state.persistDir]);
  const home = await fetch(`${state.baseUrl}/`, { redirect: 'manual' });
  const html = await home.text();
  if (home.status !== 200) throw new Fail(`GET / returned ${home.status}`);
  if (!html.includes('mynameisjonas') || !html.includes('Jonas')) throw new Fail('home page is missing the site marker');
  const type = home.headers.get('content-type') || '';
  if (!type.includes('text/html')) throw new Fail(`home content-type is ${type}`);
  const favicon = await fetch(`${state.baseUrl}/favicon.svg`, { redirect: 'manual' });
  if (favicon.status !== 200) throw new Fail(`GET /favicon.svg returned ${favicon.status}`);
  await favicon.arrayBuffer();
  console.log(`ok base=${state.baseUrl} pid=${state.pid} marker=Jonas favicon=200`);
}

function browserCommand(argv) {
  const [command, ...rest] = argv;
  if (command === 'open') return { cmd: 'open', path: rest.join(' ') };
  if (command === 'click') return { cmd: 'click', role: rest[0], name: rest.slice(1).join(' ') };
  if (command === 'fill') {
    if (rest.length < 3) throw new Fail('usage: fill <role> <name> <value>');
    return { cmd: 'fill', role: rest[0], name: rest.slice(1, -1).join(' '), value: rest.at(-1) };
  }
  if (command === 'expect-heading') return { cmd: 'expect-heading', name: rest.join(' ') };
  if (command === 'expect-role') return { cmd: 'expect-role', role: rest[0], name: rest.slice(1).join(' ') };
  if (command === 'expect-text') return { cmd: 'expect-text', text: rest.join(' ') };
  if (command === 'expect-path') return { cmd: 'expect-path', path: rest.join(' ') };
  if (command === 'expect-request') {
    const [method, requestPath, status] = rest;
    if (!method || !requestPath || !status) throw new Fail('usage: expect-request <method> <path> <status>');
    return { cmd: 'expect-request', method: method.toUpperCase(), path: requestPath, status: Number(status) };
  }
  if (command === 'capture') {
    const id = rest[0];
    if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Fail('usage: capture <id>');
    return { cmd: 'capture', id };
  }
  return null;
}

async function ensureBrowser(state) {
  const paths = pathsFor(state.runId);
  if (state.browserPid && alive(state.browserPid) && existsSync(paths.socketPath)) {
    assertOurProcess(state.browserPid, ['browser-server', paths.runDir]);
    return paths.socketPath;
  }
  if (existsSync(paths.socketPath)) {
    try { unlinkSync(paths.socketPath); } catch { /* stale */ }
  }
  const logFd = openSync(paths.browserLog, 'a');
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'browser-server', paths.runDir], {
    cwd: repoRoot,
    detached: true,
    stdio: ['ignore', logFd, logFd],
  });
  child.unref();
  closeSync(logFd);
  state.browserPid = child.pid;
  saveState(state);
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (!alive(child.pid)) break;
    if (existsSync(paths.socketPath)) {
      await callBrowserRetry(paths.socketPath, { cmd: 'ping' });
      return paths.socketPath;
    }
    await sleep(100);
  }
  throw new Fail(`browser did not start\n${tail(paths.browserLog)}`);
}

async function callBrowserRetry(socketPath, message) {
  let last;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      return await callBrowser(socketPath, message);
    } catch (err) {
      last = err;
      if (attempt === 19 || !/ECONNREFUSED|ENOENT|ECONNRESET|bad browser response/.test(err.message)) throw err;
      await sleep(100);
    }
  }
  throw last;
}

function callBrowser(socketPath, message) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(socketPath);
    let buf = '';
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Fail('browser command timed out'));
    }, 60000);
    socket.on('data', (chunk) => {
      buf += chunk.toString('utf8');
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(new Fail(err.message));
    });
    socket.on('end', () => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(buf));
      } catch {
        reject(new Fail(`bad browser response ${buf.slice(0, 300)}`));
      }
    });
    socket.write(`${JSON.stringify(message)}\n`);
  });
}

async function drive(argv) {
  const message = browserCommand(argv);
  if (!message) throw new Fail(`unknown browser command ${argv[0] || ''}`.trim());
  const state = loadState();
  assertLocalUrl(state.baseUrl, state.port);
  const socketPath = await ensureBrowser(state);
  const response = await callBrowser(socketPath, message);
  if (!response.ok) throw new Fail(response.error || 'browser command failed');
  if (response.summary) console.log(response.summary);
}

async function browserServer(runDir) {
  const state = readJson(path.join(runDir, 'run.json'));
  assertLocalUrl(state.baseUrl, state.port);
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.route('**/*', async (route) => {
    let url;
    try {
      url = new URL(route.request().url());
    } catch {
      await route.abort();
      return;
    }
    if (url.protocol === 'data:' || url.protocol === 'blob:') {
      await route.continue();
      return;
    }
    const host = url.hostname.toLowerCase();
    if (forbiddenHosts.has(host) || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
      await route.abort('blockedbyclient');
      return;
    }
    await route.continue();
  });
  const page = await context.newPage();
  let lastRows = [];
  let lastDocument = null;

  let chain = Promise.resolve();
  const server = net.createServer({ allowHalfOpen: true }, (socket) => {
    let buf = '';
    socket.on('error', (err) => console.error(err.message));
    socket.on('data', (chunk) => {
      buf += chunk.toString('utf8');
      if (!buf.includes('\n')) return;
      const line = buf.slice(0, buf.indexOf('\n'));
      buf = '';
      const run = chain.then(() => handle(line));
      chain = run.then(() => {}, () => {});
      run
        .then((response) => socket.end(`${JSON.stringify(response)}\n`))
        .catch((err) => socket.end(`${JSON.stringify({ ok: false, error: err.message })}\n`));
    });
  });

  async function handle(line) {
    const message = JSON.parse(line);
    if (message.cmd === 'ping') return { ok: true, summary: 'ready' };
    if (message.cmd === 'open') return open(message.path);
    if (message.cmd === 'click') return click(message.role, message.name);
    if (message.cmd === 'fill') return fill(message.role, message.name, message.value);
    if (message.cmd === 'expect-heading') return expectHeading(message.name);
    if (message.cmd === 'expect-role') return expectRole(message.role, message.name);
    if (message.cmd === 'expect-text') return expectText(message.text);
    if (message.cmd === 'expect-path') return expectPath(message.path);
    if (message.cmd === 'expect-request') return expectRequest(message.method, message.path, message.status);
    if (message.cmd === 'capture') return capture(message.id);
    return { ok: false, error: `unknown command ${message.cmd}` };
  }

  function roleLocator(role, name) {
    if (!role) throw new Fail('missing role');
    return name ? page.getByRole(role, { name, exact: true }) : page.getByRole(role);
  }

  async function failWithAria(error) {
    const aria = await page.locator('body').ariaSnapshot().catch(() => '');
    const file = path.join(state.evidenceDir, 'failures', `${Date.now()}.aria.yaml`);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, aria);
    throw new Fail(`${error.message}\naria: ${file}`);
  }

  async function attachTiming(rows) {
    const timing = await page.evaluate(() => {
      const map = (entry) => ({
        name: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        initiatorType: entry.initiatorType,
      });
      return [
        ...performance.getEntriesByType('navigation').map(map),
        ...performance.getEntriesByType('resource').map(map),
      ];
    }).catch(() => []);
    for (const row of rows) {
      const match = timing.find((entry) => entry.name === row.url);
      if (!match) continue;
      row.encodedBodySize = match.encodedBodySize;
      row.decodedBodySize = match.decodedBodySize;
      row.timingTransferSize = match.transferSize;
      if (!row.transferBytes && match.transferSize) row.transferBytes = match.transferSize;
    }
    return timing;
  }

  async function track(action) {
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    const pending = new Map();
    const done = [];
    client.on('Network.requestWillBeSent', (event) => {
      const previous = pending.get(event.requestId) || { redirects: [] };
      if (event.redirectResponse) {
        previous.redirects.push({
          url: previous.url,
          status: event.redirectResponse.status,
          headers: event.redirectResponse.headers,
        });
      }
      pending.set(event.requestId, {
        ...previous,
        url: event.request.url,
        method: event.request.method,
        type: event.type,
        postData: event.request.postData && event.request.postData.length < 2000 ? event.request.postData : undefined,
      });
    });
    client.on('Network.responseReceived', (event) => {
      const row = pending.get(event.requestId) || { url: event.response.url, redirects: [] };
      row.status = event.response.status;
      row.mimeType = event.response.mimeType;
      row.headers = event.response.headers;
      row.type = event.type;
      row.url = event.response.url;
      pending.set(event.requestId, row);
    });
    client.on('Network.loadingFinished', (event) => {
      const row = pending.get(event.requestId);
      if (!row) return;
      row.transferBytes = event.encodedDataLength;
      done.push(row);
      pending.delete(event.requestId);
    });
    client.on('Network.loadingFailed', (event) => {
      const row = pending.get(event.requestId);
      if (!row) return;
      row.error = event.errorText;
      row.transferBytes = 0;
      done.push(row);
      pending.delete(event.requestId);
    });
    try {
      await action();
      await waitQuiet(pending, 20000);
    } finally {
      await client.detach().catch(() => {});
    }
    assertNoProduction(done);
    return { rows: done, unfinished: pending.size };
  }

  async function waitQuiet(pending, timeoutMs) {
    const start = Date.now();
    let quietSince = null;
    while (Date.now() - start < timeoutMs) {
      if (pending.size === 0) {
        quietSince ??= Date.now();
        if (Date.now() - quietSince >= 400) return;
      } else {
        quietSince = null;
      }
      await sleep(50);
    }
  }

  function storeNavigation(rows, unfinished, resourceTiming) {
    lastRows = rows;
    const document = [...rows].reverse().find((row) => row.type === 'Document') || null;
    if (document) lastDocument = document;
    const pathname = new URL(page.url()).pathname;
    const file = path.join(state.evidenceDir, 'navigations', `${slugFromPath(pathname)}.json`);
    writeJson(file, {
      url: page.url(),
      fetchedAt: new Date().toISOString(),
      document,
      unfinished,
      requests: rows,
      resourceTiming,
    });
    return file;
  }

  async function open(input) {
    const target = resolveLocalPath(state, input);
    let status = null;
    const { rows, unfinished } = await track(async () => {
      const response = await page.goto(target, { waitUntil: 'load', timeout: 30000 });
      status = response ? response.status() : null;
    });
    const resourceTiming = await attachTiming(rows);
    const file = storeNavigation(rows, unfinished, resourceTiming);
    const formatted = formatRequests(page.url(), status, rows, unfinished);
    return { ok: true, summary: `${formatted.lines}\nwritten ${file}` };
  }

  async function click(role, name) {
    const locator = roleLocator(role, name);
    if (await locator.count() !== 1) {
      await failWithAria(new Fail(`expected one ${role} "${name}", found ${await locator.count()}`));
    }
    const { rows, unfinished } = await track(async () => {
      try {
        await locator.click({ timeout: 10000 });
      } catch (err) {
        await failWithAria(err);
      }
    });
    const status = [...rows].reverse().find((row) => row.type === 'Document')?.status ?? null;
    const resourceTiming = await attachTiming(rows);
    const file = storeNavigation(rows, unfinished, resourceTiming);
    const formatted = formatRequests(page.url(), status, rows, unfinished);
    return { ok: true, summary: `${formatted.lines}\nwritten ${file}` };
  }

  async function fill(role, name, value) {
    const locator = roleLocator(role, name);
    const count = await locator.count();
    if (count !== 1) await failWithAria(new Fail(`expected one ${role} "${name}", found ${count}`));
    await locator.fill(value);
    return { ok: true, summary: `filled ${role} "${name}"` };
  }

  async function expectHeading(name) {
    try {
      await page.getByRole('heading', { name, exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    } catch (err) {
      await failWithAria(err);
    }
    return { ok: true, summary: `visible heading "${name}"` };
  }

  async function expectRole(role, name) {
    const locator = roleLocator(role, name);
    try {
      await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch (err) {
      await failWithAria(err);
    }
    const count = await locator.count();
    if (count !== 1) await failWithAria(new Fail(`expected one ${role} "${name}", found ${count}`));
    return { ok: true, summary: `visible ${role} "${name}"` };
  }

  async function expectText(text) {
    try {
      await page.getByText(text, { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    } catch (err) {
      await failWithAria(err);
    }
    return { ok: true, summary: `visible text "${text}"` };
  }

  async function expectPath(pathname) {
    const current = new URL(page.url()).pathname;
    if (current !== pathname) await failWithAria(new Fail(`path is ${current}`));
    return { ok: true, summary: `path ${current}` };
  }

  function expectRequest(method, requestPath, status) {
    assertNoProduction(lastRows);
    const match = lastRows.find((row) => {
      if ((row.method || '').toUpperCase() !== method) return false;
      if (row.status !== status) return false;
      return safePathname(row.url) === requestPath;
    });
    if (!match) {
      const seen = lastRows.map((row) => `${row.method || '?'} ${row.status ?? '—'} ${safePathname(row.url)}`).join('\n');
      throw new Fail(`no ${method} ${requestPath} ${status} in the last request log\n${seen}`);
    }
    return { ok: true, summary: `${method} ${requestPath} ${status}` };
  }

  async function capture(id) {
    const dir = path.join(state.evidenceDir, id);
    mkdirSync(dir, { recursive: true });
    const screenshot = path.join(dir, 'screenshot.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    const aria = await page.locator('body').ariaSnapshot();
    writeFileSync(path.join(dir, 'aria.yaml'), aria);
    const url = page.url();
    assertLocalUrl(url, state.port);
    assertNoProduction(lastRows);
    const formatted = formatRequests(url, lastDocument?.status ?? null, lastRows, 0);
    writeJson(path.join(dir, 'document.json'), {
      url,
      status: lastDocument?.status ?? null,
      headers: lastDocument?.headers ?? null,
      feature: id,
    });
    writeJson(path.join(dir, 'requests.json'), lastRows);
    writeJson(path.join(dir, 'summary.json'), {
      feature: id,
      url,
      status: lastDocument?.status ?? null,
      transferBytes: formatted.total,
      requestCount: lastRows.length,
      capturedAt: new Date().toISOString(),
    });
    writeFileSync(path.join(dir, 'transfers.txt'), `${formatted.lines}\n`);
    return { ok: true, summary: `${formatted.lines}\ncaptured ${dir}` };
  }

  const socketPath = path.join(runDir, 'browser.sock');
  if (existsSync(socketPath)) unlinkSync(socketPath);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(socketPath, () => resolve());
  });
  const shutdown = async () => {
    server.close();
    await browser.close().catch(() => {});
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  browser.on('disconnected', () => process.exit(1));
}

async function fetchPath(argv) {
  const positional = [];
  let expectStatus = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--expect') {
      expectStatus = Number(argv[++i]);
      if (!Number.isInteger(expectStatus)) throw new Fail('--expect needs an integer status');
    } else {
      positional.push(argv[i]);
    }
  }
  const input = positional.join(' ');
  if (!input) throw new Fail('usage: fetch <path> [--expect <status>]');
  const state = loadState();
  const target = resolveLocalPath(state, input);
  const response = await fetch(target, { redirect: 'manual' });
  const location = response.headers.get('location');
  if (location) {
    const next = new URL(location, target);
    if (forbiddenHosts.has(next.hostname.toLowerCase())) throw new Fail(`refusing redirect to ${next.hostname}`);
  }
  const body = Buffer.from(await response.arrayBuffer());
  const headers = Object.fromEntries(response.headers.entries());
  const type = headers['content-type'] || '';
  const textLike = /json|xml|text|javascript|svg/.test(type);
  const record = {
    url: target,
    status: response.status,
    headers,
    bytes: body.length,
    sha256: createHash('sha256').update(body).digest('hex'),
    location,
    body: textLike && body.length <= 262144 ? body.toString('utf8') : undefined,
  };
  const pathname = new URL(target).pathname;
  const file = path.join(state.evidenceDir, 'fetch', `${slugFromPath(pathname)}.json`);
  writeJson(file, record);
  if (expectStatus != null && response.status !== expectStatus) {
    throw new Fail(`${pathname} returned ${response.status}, expected ${expectStatus}\nwritten ${file}`);
  }
  console.log(`${response.status} ${pathname} bytes=${body.length} sha256=${record.sha256}`);
  console.log(`written ${file}`);
}

async function lighthouse(argv) {
  const input = argv.join(' ');
  if (!input) throw new Fail('usage: lighthouse <path>');
  const state = loadState();
  const target = resolveLocalPath(state, input);
  const { chromium } = await import('playwright');
  const slug = slugFromPath(new URL(target).pathname);
  const dir = path.join(state.evidenceDir, 'lighthouse');
  mkdirSync(dir, { recursive: true });
  const output = path.join(dir, `${slug}.json`);
  const child = spawnSync('pnpm', [
    'exec', 'lighthouse', target,
    '--preset=desktop',
    '--only-categories=performance',
    '--output=json',
    `--output-path=${output}`,
    '--quiet',
    '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
    '--blocked-url-patterns=*://mynameisjonas.dev/*',
    '--blocked-url-patterns=*://www.mynameisjonas.dev/*',
  ], {
    cwd: repoRoot,
    env: { ...process.env, CHROME_PATH: chromium.executablePath() },
    encoding: 'utf8',
    timeout: 180000,
  });
  if (child.status !== 0 || !existsSync(output)) {
    throw new Fail(`lighthouse failed\n${child.stdout || ''}\n${child.stderr || ''}`);
  }
  const report = readJson(output);
  const items = report.audits?.['network-requests']?.details?.items || [];
  for (const item of items) {
    if (!item.url) continue;
    let host = '';
    try { host = new URL(item.url).hostname.toLowerCase(); } catch { continue; }
    if (forbiddenHosts.has(host)) throw new Fail(`lighthouse requested ${item.url}`);
  }
  const score = report.categories?.performance?.score;
  const summary = {
    url: target,
    preset: 'desktop',
    performance: score == null ? null : Math.round(score * 100),
    lcpMs: report.audits?.['largest-contentful-paint']?.numericValue ?? null,
    cls: report.audits?.['cumulative-layout-shift']?.numericValue ?? null,
    totalBytes: report.audits?.['total-byte-weight']?.numericValue ?? null,
    finalUrl: report.finalUrl || report.requestedUrl,
  };
  const summaryFile = path.join(dir, `${slug}.summary.json`);
  writeJson(summaryFile, summary);
  console.log(`lighthouse ${new URL(target).pathname} performance=${summary.performance} lcpMs=${summary.lcpMs} cls=${summary.cls} totalBytes=${summary.totalBytes}`);
  console.log(`written ${output}`);
  console.log(`written ${summaryFile}`);
}

async function subscribers() {
  const state = loadState();
  const result = spawnSync('pnpm', [
    'exec', 'wrangler', 'd1', 'execute', databaseName,
    '--local',
    '--persist-to', state.persistDir,
    '--config', path.join(repoRoot, 'wrangler.toml'),
    '--json',
    '--command', 'SELECT email, subscribed_at FROM subscribers',
  ], { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) throw new Fail(`d1 execute failed\n${result.stderr || result.stdout}`);
  const start = result.stdout.search(/[[{]/);
  if (start < 0) throw new Fail(`d1 execute returned no json\n${result.stdout}`);
  const parsed = JSON.parse(result.stdout.slice(start));
  const rows = parsed?.[0]?.results ?? [];
  const file = path.join(state.evidenceDir, 'subscribers.json');
  writeJson(file, { rows, queriedAt: new Date().toISOString() });
  if (rows.length > 0) throw new Fail(`subscribers table has ${rows.length} row(s)\nwritten ${file}`);
  console.log(`subscribers=0`);
  console.log(`written ${file}`);
}

async function cleanup() {
  const id = process.env.VERIFY_RUN_ID || (existsSync(path.join(runsRoot, 'latest')) ? readFileSync(path.join(runsRoot, 'latest'), 'utf8').trim() : '');
  if (!id) {
    console.log('no run');
    return;
  }
  const paths = pathsFor(id);
  if (!existsSync(paths.runFile)) {
    console.log('no run');
    return;
  }
  const state = readJson(paths.runFile);
  if (state.browserPid) {
    if (alive(state.browserPid)) {
      assertOurProcess(state.browserPid, ['browser-server', paths.runDir]);
      await stopPid(state.browserPid);
      console.log(`stopped browser pid ${state.browserPid}`);
    } else {
      console.log(`browser pid ${state.browserPid} already stopped`);
    }
  }
  if (state.pid) {
    if (alive(state.pid)) {
      assertOurProcess(state.pid, ['dist/server/wrangler.json', state.persistDir]);
      await stopPid(state.pid);
      console.log(`stopped worker pid ${state.pid}`);
    } else {
      console.log(`worker pid ${state.pid} already stopped`);
    }
  }
  console.log(`evidence ${state.evidenceDir}`);
}

function usage() {
  return `usage: verify-mynameisjonas.mjs <launch|doctor|cleanup|open|click|fill|expect-heading|expect-role|expect-text|expect-path|expect-request|capture|fetch|lighthouse|subscribers>`;
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === 'browser-server') await browserServer(args[0]);
  else if (command === 'launch') await launch();
  else if (command === 'doctor') await doctor();
  else if (command === 'cleanup') await cleanup();
  else if (command === 'fetch') await fetchPath(args);
  else if (command === 'lighthouse') await lighthouse(args);
  else if (command === 'subscribers') await subscribers();
  else if (browserCommand([command, ...args])) await drive([command, ...args]);
  else throw new Fail(usage());
} catch (err) {
  console.error(err instanceof Fail ? err.message : err.stack || err.message);
  process.exit(1);
}
