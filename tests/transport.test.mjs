import test from 'node:test';
import assert from 'node:assert/strict';
import { TencentTransport, probe, ENDPOINT } from '../plugins/tencent-docs/scripts/transport.mjs';
const token='synthetic-test-token';
test('passes auth only to Tencent and preserves session/protocol', async()=>{
  const calls=[];const transport=new TencentTransport(token,{fetchImpl:async(url,options)=>{
    calls.push({url,options});
    return new Response(JSON.stringify({jsonrpc:'2.0',id:1,result:{protocolVersion:'2025-03-26'}}),{headers:{'content-type':'application/json','mcp-session-id':'session-one'}});
  }});
  await transport.send({jsonrpc:'2.0',id:1,method:'initialize'});
  await transport.send({jsonrpc:'2.0',id:2,method:'tools/list'});
  assert.equal(calls[0].url,ENDPOINT);assert.equal(calls[0].options.headers.Authorization,token);
  assert.equal(calls[1].options.headers['Mcp-Session-Id'],'session-one');
  assert.equal(calls[1].options.headers['MCP-Protocol-Version'],'2025-03-26');
  assert.equal(calls[0].options.redirect,'error');
});
test('parses chunked SSE and forwards notifications before result',async()=>{
  const encoder=new TextEncoder();
  const payload=': heartbeat\r\n\r\ndata: {"jsonrpc":"2.0","method":"notifications/progress"}\r\n\r\ndata: {"jsonrpc":"2.0","id":7,"result":{"tools":[]}}\r\n\r\n';
  const stream=new ReadableStream({start(c){for(let i=0;i<payload.length;i+=11)c.enqueue(encoder.encode(payload.slice(i,i+11)));c.close();}});
  const t=new TencentTransport(token,{fetchImpl:async()=>new Response(stream,{headers:{'content-type':'text/event-stream'}})});
  const messages=[];const result=await t.send({jsonrpc:'2.0',id:7,method:'tools/list'},m=>messages.push(m));
  assert.equal(result.id,7);assert.equal(messages.length,2);
});
test('redacts token in upstream JSON',async()=>{
  const t=new TencentTransport(token,{fetchImpl:async()=>new Response(JSON.stringify({id:1,result:{content:[{text:token}]}}))});
  const result=await t.send({id:1,method:'tools/call'});
  assert.equal(result.result.content[0].text,'[REDACTED]');
});
test('does not reveal raw authentication errors or retry mutations',async()=>{
  let count=0;const t=new TencentTransport(token,{fetchImpl:async()=>{count++;return new Response(token,{status:401});}});
  await assert.rejects(t.send({id:9,method:'tools/call'}),e=>!e.message.includes(token)&&e.message.includes('Authentication failed'));
  assert.equal(count,1);
});
test('network timeout is reported without automatically retrying',async()=>{
  let count=0;const t=new TencentTransport(token,{timeout:10,fetchImpl:async(_url,{signal})=>{count++;return await new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error(token))));}});
  await assert.rejects(t.send({id:3,method:'tools/call'}),/not retried/);assert.equal(count,1);
});
test('session expiration and missing responses fail clearly',async()=>{
  const t=new TencentTransport(token,{fetchImpl:async()=>new Response('',{status:404})});t.session='expired';
  await assert.rejects(t.send({id:1,method:'tools/call'}),/Session expired/);
  const missing=new TencentTransport(token,{fetchImpl:async()=>new Response(null,{status:202})});
  await assert.rejects(missing.send({id:1,method:'tools/list'}),/no response/);
  assert.equal(await missing.send({method:'notifications/initialized'}),null);
});
test('probe only initializes, discovers tools and performs read-only account check',async()=>{
  const methods=[];const result=await probe(token,{fetchImpl:async(_,{body})=>{
    const r=JSON.parse(body);methods.push(r);
    if(!('id' in r))return new Response(null,{status:202});
    const result=r.method==='initialize'?{protocolVersion:'2025-03-26'}:r.method==='tools/list'?{tools:[{name:'get_user_info'},{name:'create_excel_by_markdown'}]}:{content:[{type:'text',text:'{"ok":true}'}]};
    return new Response(JSON.stringify({jsonrpc:'2.0',id:r.id,result}));
  }});
  assert.deepEqual(result,{toolCount:2,userInfoChecked:true});
  assert.deepEqual(methods.map(r=>r.method),['initialize','notifications/initialized','tools/list','tools/call']);
  assert.equal(methods.at(-1).params.name,'get_user_info');
});
test('probe rejects Tencent account errors instead of reporting ready',async()=>{
  await assert.rejects(probe(token,{fetchImpl:async(_,{body})=>{
    const r=JSON.parse(body);if(!('id'in r))return new Response(null,{status:202});
    return new Response(JSON.stringify({id:r.id,result:r.method==='initialize'?{protocolVersion:'2025-03-26'}:r.method==='tools/list'?{tools:[{name:'get_user_info'}]}:{content:[{type:'text',text:'400007'}]}}));
  }}),/permission check failed/);
});
