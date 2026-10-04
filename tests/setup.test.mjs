import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { findCodex, pinInstalledRuntime } from '../plugins/tencent-docs/scripts/setup.mjs';
test('both setup entry points work outside the repository without requesting credentials',()=>{
  for (const entry of ['setup.mjs','plugins/tencent-docs/scripts/setup.mjs']) {
    const result=spawnSync(process.execPath,[resolve(entry),'--help'],{encoding:'utf8',cwd:tmpdir()});
    assert.equal(result.status,0,entry);assert.ok(result.stdout.includes('--replace-token'));assert.equal(result.stderr,'');
  }
});
test('supports explicit executable fallback without shell interpolation',()=>{
  const old=process.env.CODEX_BINARY;
  process.env.CODEX_BINARY=process.execPath;
  try{assert.equal(findCodex(),process.execPath);}
  finally{if(old===undefined)delete process.env.CODEX_BINARY;else process.env.CODEX_BINARY=old;}
});

test('installed bridge uses the setup runtime even without Node on desktop PATH', () => {
  const temp = mkdtempSync(join(tmpdir(), 'tencent-installed-'));
  try {
    const file = join(temp, '.mcp.json');
    const config = {mcpServers:{tencent_docs:{command:'node',args:['scripts/bridge.mjs'],cwd:'.'}}};
    writeFileSync(file, JSON.stringify(config));
    pinInstalledRuntime({plugin:{installedRoot:temp}});
    const actual = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(actual.mcpServers.tencent_docs.command, process.execPath);
    assert.deepEqual(actual.mcpServers.tencent_docs.args, config.mcpServers.tencent_docs.args);
    assert.equal(actual.mcpServers.tencent_docs.cwd, '.');
    assert.throws(() => pinInstalledRuntime({plugin:{name:'tencent-docs'}}), /Missing installed plugin path/);
  } finally { rmSync(temp, {recursive:true,force:true}); }
});
