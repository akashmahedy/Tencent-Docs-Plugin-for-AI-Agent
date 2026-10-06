export const ENDPOINT = 'https://docs.qq.com/openapi/mcp';
export class TencentTransport {
  constructor(token, {fetchImpl = globalThis.fetch, timeout = 60000} = {}) {
    this.token = token; this.fetch = fetchImpl; this.timeout = timeout;
    this.session = null; this.protocol = null;
  }
  redact(value) { return String(value).split(this.token).join('[REDACTED]'); }
  async send(message, onMessage = () => {}) {
    const headers = {'Content-Type':'application/json', Accept:'application/json, text/event-stream', Authorization:this.token};
    if(this.session) headers['Mcp-Session-Id'] = this.session;
    if(this.protocol) headers['MCP-Protocol-Version'] = this.protocol;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await this.fetch(ENDPOINT, {method:'POST',headers,body:JSON.stringify(message),signal:controller.signal,redirect:'error'});
      if(response.status === 401 || response.status === 403) throw new Error('Authentication failed / 认证失败，请检查令牌或账户权限。');
      if(response.status === 404 && this.session) throw new Error('Session expired. Start a new chat / 会话已过期，请新建聊天。');
      if(!response.ok) throw new Error('Tencent HTTP ' + response.status + ' / 腾讯服务请求失败');
      const session = response.headers.get('mcp-session-id');
      if(session) this.session = session;
      if(response.status === 202 || response.status === 204) {
        if(message.id !== undefined) throw new Error('Tencent returned no response / 腾讯未返回结果');
        return null;
      }
      const accept = value => {
        value = JSON.parse(this.redact(JSON.stringify(value)));
        if(message.method === 'initialize' && value.result?.protocolVersion) this.protocol = value.result.protocolVersion;
        onMessage(value);
        return value;
      };
      if((response.headers.get('content-type') || '').includes('text/event-stream')) {
        const reader = response.body.getReader(), decoder = new TextDecoder();
        let pending='', result=null;
        try {
          while(true) {
            const {value,done} = await reader.read();
            pending += decoder.decode(value || new Uint8Array(), {stream:!done}).replace(/\r\n/g,'\n');
            let index;
            while((index = pending.indexOf('\n\n')) >= 0) {
              const frame = pending.slice(0,index); pending = pending.slice(index+2);
              const data = frame.split('\n').filter(x => x.startsWith('data:')).map(x => x.slice(5).replace(/^ /,'')).join('\n');
              if(!data) continue;
              const item = accept(JSON.parse(data));
              if(message.id !== undefined && item.id === message.id && ('result' in item || 'error' in item)) {
                result=item; return result;
              }
            }
            if(done) break;
          }
        } finally { await reader.cancel().catch(() => {}); }
        if(message.id !== undefined && !result) throw new Error('Incomplete Tencent response / 腾讯响应不完整');
        return result;
      }
      const raw = await response.text();
      if(!raw && message.id === undefined) return null;
      return accept(JSON.parse(raw));
    } catch(e) {
      if(controller.signal.aborted) throw new Error('Tencent request timed out; it was not retried / 腾讯请求超时，未自动重试。');
      // Never surface raw HTTP/network errors: they may include credential headers.
      if(/^(Authentication failed|Session expired|Tencent HTTP|Tencent returned|Incomplete Tencent)/.test(e.message)) throw e;
      throw new Error('Cannot reach or parse Tencent MCP. Check your network / 无法连接或解析腾讯 MCP，请检查网络。');
    } finally { clearTimeout(timer); }
  }
}
export async function probe(token, options) {
  const transport = new TencentTransport(token, options);
  const init = await transport.send({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'akashmahedy-tencent-docs-check',version:'1.2.2'}}});
  if(init?.error) throw new Error('Tencent initialization failed / 腾讯初始化失败');
  await transport.send({jsonrpc:'2.0',method:'notifications/initialized'});
  const list = await transport.send({jsonrpc:'2.0',id:2,method:'tools/list',params:{}});
  if(list?.error || !Array.isArray(list?.result?.tools)) throw new Error('Could not discover Tencent tools / 无法发现腾讯工具');
  const info = list.result.tools.find(t => t.name === 'get_user_info');
  let userInfoChecked = false;
  if(info) {
    const r = await transport.send({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:info.name,arguments:{}}});
    const text = JSON.stringify(r);
    if(r?.error || r?.result?.isError || /400006|400007/.test(text)) throw new Error('Token or Tencent account permission check failed / 令牌或腾讯账户权限检查失败');
    userInfoChecked = true;
  }
  return {toolCount:list.result.tools.length,userInfoChecked};
}
