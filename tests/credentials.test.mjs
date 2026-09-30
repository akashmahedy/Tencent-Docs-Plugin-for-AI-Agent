import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CredentialStore, validateToken } from '../plugins/tencent-docs/scripts/credentials.mjs';
test('rejects empty and multiline credentials',()=>{
  for(const value of ['', ' ', 'one\ntwo','one\r','one\0two',null])assert.throws(()=>validateToken(value));
  assert.equal(validateToken(' test '),'test');
});
test('private file storage saves, replaces and forgets only its credential',()=>{
  const dir=mkdtempSync(join(tmpdir(),'tencent-credential-test-'));
  try{
    const store=new CredentialStore({dir,platform:'linux'});
    assert.throws(()=>store.load(),/unavailable/);
    store.save('test-one');assert.equal(store.load(),'test-one');
    store.save('test-two');assert.equal(store.load(),'test-two');
    if(process.platform!=='win32'){assert.equal(statSync(store.file).mode&0o777,0o600);assert.equal(statSync(dir).mode&0o777,0o700);}
    store.remove();store.remove();assert.throws(()=>store.load(),/unavailable/);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('Windows uses DPAPI and round trips without plaintext on disk',{skip:process.platform!=='win32'},()=>{
  const dir=mkdtempSync(join(tmpdir(),'tencent-dpapi-test-'));
  try{
    const store=new CredentialStore({dir});
    store.save('synthetic-dpapi-token');
    assert.ok(!readFileSync(store.file,'utf8').includes('synthetic-dpapi-token'));
    assert.equal(store.load(),'synthetic-dpapi-token');store.save('synthetic-dpapi-replacement');assert.equal(store.load(),'synthetic-dpapi-replacement');store.remove();
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('macOS Keychain stdin storage round trips without modifying other services',{skip:process.platform!=='darwin'||process.env.RUN_KEYCHAIN_TESTS!=='1'},()=>{
  const service='com.akashmahedy.tencent-docs-test.'+process.pid;
  const store=new CredentialStore({service});
  try{store.save('synthetic-keychain-token');assert.equal(store.load(),'synthetic-keychain-token');store.save('synthetic-updated-token');assert.equal(store.load(),'synthetic-updated-token');}
  finally{store.remove();}
});
