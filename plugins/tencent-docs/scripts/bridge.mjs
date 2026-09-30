import { createInterface } from 'node:readline';
import { CredentialStore } from './credentials.mjs';
import { TencentTransport } from './transport.mjs';

let token;
try { token = new CredentialStore().load(); }
catch { console.error('Tencent Docs: run setup first / 腾讯文档：请先运行安装向导。'); process.exit(1); }
const transport = new TencentTransport(token);
const write = value => process.stdout.write(JSON.stringify(value) + '\n');
const input = createInterface({input:process.stdin,crlfDelay:Infinity});
let chain = Promise.resolve();
input.on('line', line => {
  chain = chain.then(async() => {
    let request;
    try { request=JSON.parse(line); }
    catch { write({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Invalid JSON / JSON 格式无效'}}); return; }
    if(request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
      write({jsonrpc:'2.0',id:request.id ?? null,error:{code:-32600,message:'Invalid request / 请求格式无效'}}); return;
    }
    // No server-initiated sampling or elicitation: this bridge supports request/response tool workflows.
    if(request.method === 'initialize') request.params = {...request.params,capabilities:{}};
    try { await transport.send(request,write); }
    catch(e) {
      if(request.id !== undefined) write({jsonrpc:'2.0',id:request.id,error:{code:-32000,message:e.message}});
      else console.error('Tencent notification failed / 腾讯通知发送失败');
    }
  }).catch(() => { console.error('Tencent bridge failed / 腾讯桥接程序发生错误'); });
});
input.on('close', () => chain.then(() => process.exit(0)));
