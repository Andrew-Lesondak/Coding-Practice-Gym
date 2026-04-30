import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const dest = path.join(root, 'public', 'monaco', 'vs');
const destMaps = path.join(root, 'public', 'min-maps', 'vs');

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const listUnpluggedCandidates = () => {
  const roots = [
    path.join(root, '.yarn', 'unplugged'),
    path.join(os.homedir(), '.yarn', 'unplugged')
  ];
  const out = [];
  for (const unpluggedRoot of roots) {
    if (!fs.existsSync(unpluggedRoot)) continue;
    const entries = fs.readdirSync(unpluggedRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith('monaco-editor-')) continue;
      out.push(path.join(unpluggedRoot, entry.name, 'node_modules', 'monaco-editor', 'min', 'vs'));
    }
  }
  return out;
};

const findWorkingCandidate = () => {
  // First try standard node_modules layout (works for non-PnP)
  const pkgJsonPath = require.resolve('monaco-editor/package.json');
  const pkgRoot = path.dirname(pkgJsonPath);
  const normalCandidate = path.join(pkgRoot, 'min', 'vs');

  // If package is zip-backed (Yarn PnP), do NOT use normalCandidate directly.
  const isZipBacked = pkgJsonPath.includes('.zip/');
  if (!isZipBacked && fs.existsSync(normalCandidate) && fs.statSync(normalCandidate).isDirectory()) {
    return normalCandidate;
  }

  // Ensure unplugged copy exists for PnP zip-backed package.
  spawnSync('yarn', ['unplug', 'monaco-editor'], {
    cwd: root,
    stdio: 'ignore'
  });

  const candidates = listUnpluggedCandidates();
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    try {
      if (fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      // keep scanning
    }
  }

  throw new Error(
    `Could not locate copyable Monaco assets. pkgJsonPath=${pkgJsonPath}; checked unplugged candidates: ${candidates.join(', ') || '(none)'}`
  );
};


const findWorkingMapsCandidate = (vsSrc) => {
  const minRoot = path.resolve(vsSrc, '..', '..');
  const mapsCandidate = path.join(minRoot, 'min-maps', 'vs');
  if (fs.existsSync(mapsCandidate) && fs.statSync(mapsCandidate).isDirectory()) {
    return mapsCandidate;
  }
  return null;
};

const copyDir = (src, dst) => {
  fs.rmSync(dst, { recursive: true, force: true });
  ensureDir(path.dirname(dst));
  fs.cpSync(src, dst, { recursive: true, force: true });
};

try {
  const src = findWorkingCandidate();
  copyDir(src, dest);
  const mapsSrc = findWorkingMapsCandidate(src);
  if (mapsSrc) {
    copyDir(mapsSrc, destMaps);
    console.log(`[sync-monaco] copied ${mapsSrc} -> ${destMaps}`);
  }
  console.log(`[sync-monaco] copied ${src} -> ${dest}`);
} catch (error) {
  console.warn('[sync-monaco] failed to copy Monaco assets; dev server may fall back to CDN');
  console.warn(error instanceof Error ? error.message : String(error));
  process.exitCode = 0;
}
