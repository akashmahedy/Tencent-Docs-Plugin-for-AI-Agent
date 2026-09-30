import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const marketplace=json('.agents/plugins/marketplace.json');
assert.equal(marketplace.name,'akashmahedy-plugins');
for(const entry of marketplace.plugins){
 const dir=resolve(root,entry.source.path);
 assert.ok(dir.startsWith(root+'/')||dir.startsWith(root+'\\'));
 const manifest=JSON.parse(readFileSync(join(dir,'.codex-plugin/plugin.json'),'utf8'));
 assert.equal(manifest.name,entry.name);assert.equal(manifest.author.name,'akashmahedy');
 assert.ok(existsSync(join(dir,manifest.skills)));
 const mcp=JSON.parse(readFileSync(join(dir,manifest.mcpServers),'utf8'));
 for(const server of Object.values(mcp.mcpServers)){assert.equal(server.cwd,'.');assert.ok(existsSync(join(dir,server.args[0])));}
}
const names=['README.md','README.zh-CN.md','START_HERE_FOR_CODEX.md','LICENSE','PRIVACY.md','docs/index.html','docs/zh/index.html','docs/sitemap.xml'];
for(const name of names)assert.ok(existsSync(join(root,name)),name+' missing');
function walk(dir){
 for(const item of readdirSync(dir,{withFileTypes:true})){
  if(['.git','.validation','dist','node_modules'].includes(item.name))continue;
  const path=join(dir,item.name);
  if(item.isDirectory())walk(path);
  else{
   assert.ok(!/^\.env|credentials\.json|\.token$/.test(item.name),'Private credential file found');
   const text=readFileSync(path,'utf8');
   assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text),'Private key found');
   assert.ok(!/\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/.test(text),'GitHub secret found');
  }
 }
}
walk(root);
const en=readFileSync(join(root,'docs/index.html'),'utf8'),zh=readFileSync(join(root,'docs/zh/index.html'),'utf8');
assert.ok(en.includes('hreflang="zh-CN"'));assert.ok(zh.includes('hreflang="en"'));
assert.ok(en.includes('akashmahedy')&&zh.includes('akashmahedy'));
console.log('Marketplace, scripts, credit, bilingual docs and public-file checks passed.');
