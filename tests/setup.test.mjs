import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { findCodex } from '../plugins/tencent-docs/scripts/setup.mjs';
test('setup help runs without requesting credentials or changing configuration',()=>{
  const result=spawnSync(process.execPath,['plugins/tencent-docs/scripts/setup.mjs','--help'],{encoding:'utf8'});
  assert.equal(result.status,0);assert.ok(result.stdout.includes('--replace-token'));assert.equal(result.stderr,'');
});
test('supports explicit executable fallback without shell interpolation',()=>{
  const old=process.env.CODEX_BINARY;
  process.env.CODEX_BINARY=process.execPath;
  try{assert.equal(findCodex(),process.execPath);}
  finally{if(old===undefined)delete process.env.CODEX_BINARY;else process.env.CODEX_BINARY=old;}
});
