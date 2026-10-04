import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

test('bootstrap rejects a corrupt download before extracting or running it', () => {
  const temp = mkdtempSync(join(tmpdir(), 'tencent-bootstrap-'));
  try {
    const scripts = join(temp, 'scripts');
    mkdirSync(scripts);
    copyFileSync('scripts/node-runtime.txt', join(scripts, 'node-runtime.txt'));
    const runtime = join(temp, 'runtime');
    const marker = join(temp, 'unexpected-execution');
    writeFileSync(join(temp, 'setup.mjs'), `import {writeFileSync} from 'node:fs';writeFileSync(${JSON.stringify(marker)},'bad');`);
    const env = {...process.env, TENCENT_DOCS_FORCE_PORTABLE_NODE:'1', TENCENT_DOCS_RUNTIME_DIR:runtime};
    let result;
    if (process.platform === 'win32') {
      const script = join(scripts, 'bootstrap.ps1');
      copyFileSync('scripts/bootstrap.ps1', script);
      const quoted = script.replaceAll("'", "''");
      result = spawnSync('powershell.exe', ['-NoProfile','-Command', `function Invoke-WebRequest { param($Uri,$OutFile,[switch]$UseBasicParsing,$TimeoutSec) [IO.File]::WriteAllText($OutFile,'corrupt') }; & '${quoted}' --help`], {env,encoding:'utf8'});
    } else {
      copyFileSync('scripts/bootstrap.sh', join(scripts, 'bootstrap.sh'));
      const bin = join(temp, 'bin');mkdirSync(bin);
      writeFileSync(join(bin, 'curl'), '#!/bin/bash\nwhile [ "$#" -gt 0 ]; do if [ "$1" = -o ]; then printf corrupt > "$2"; exit 0; fi; shift; done\nexit 1\n', {mode:0o700});
      env.PATH = bin + ':' + process.env.PATH;
      result = spawnSync('bash',[join(scripts,'bootstrap.sh'),'--help'],{env,encoding:'utf8'});
    }
    assert.equal(result.status,1,result.stdout+result.stderr);
    assert.match(result.stdout+result.stderr,/checksum failed/i);
    assert.equal(existsSync(marker),false);
    assert.deepEqual(readdirSync(runtime),[]);
  } finally { rmSync(temp,{recursive:true,force:true}); }
});

test('Unix launcher reuses an available compatible Node without downloading', {skip:process.platform==='win32'}, () => {
  const temp = mkdtempSync(join(tmpdir(), 'tencent-existing-node-'));
  try {
    const bin=join(temp,'bin');mkdirSync(bin);
    const marker=join(temp,'unexpected-download');
    writeFileSync(join(bin,'curl'),`#!/bin/bash\ntouch '${marker.replaceAll("'", "'\\''")}'\nexit 1\n`,{mode:0o700});
    const result=spawnSync('bash',[resolve('scripts/bootstrap.sh'),'--help'],{encoding:'utf8',env:{...process.env,PATH:bin+':'+process.env.PATH,TENCENT_DOCS_FORCE_PORTABLE_NODE:'0',TENCENT_DOCS_RUNTIME_DIR:join(temp,'runtime')}});
    assert.equal(result.status,0,result.stdout+result.stderr);
    assert.match(result.stdout,/--replace-token/);
    assert.equal(existsSync(marker),false);
    assert.equal(existsSync(join(temp,'runtime')),false);
  } finally { rmSync(temp,{recursive:true,force:true}); }
});
