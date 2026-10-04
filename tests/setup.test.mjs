import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { findCodex } from '../plugins/tencent-docs/scripts/setup.mjs';
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
