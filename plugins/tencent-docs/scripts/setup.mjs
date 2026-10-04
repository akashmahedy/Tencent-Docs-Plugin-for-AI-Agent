import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { CredentialStore } from './credentials.mjs';
import { probe } from './transport.mjs';

const args=process.argv.slice(2);
let zh=args.includes('--lang=zh') || args.includes('--lang=zh-CN') || (!args.includes('--lang=en') && /^zh/i.test(process.env.LANG || ''));
const say=(en,cn)=>console.log(zh?cn:en);
const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../..');
const store=new CredentialStore();
function run(binary,argv) {
  return spawnSync(binary,argv,{encoding:'utf8',windowsHide:true,timeout:120000});
}
export function findCodex() {
  const candidates = [];
  const index=args.indexOf('--codex');
  if(index>=0 && args[index+1]) candidates.push(args[index+1]);
  if(process.env.CODEX_BINARY) candidates.push(process.env.CODEX_BINARY);
  if(process.platform==='darwin') candidates.push(
    '/Applications/Codex.app/Contents/Resources/codex-cli/bin/codex',
    '/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex',
    '/Applications/Codex.app/Contents/Resources/codex',
    '/Applications/ChatGPT.app/Contents/Resources/codex');
  candidates.push('codex', ...(process.platform==='win32'?['codex.cmd','codex.exe']:[]));
  for(const candidate of candidates) {
    // .cmd wrappers need cmd.exe; a user-supplied executable is always invoked without a shell.
    let result;
    if(candidate==='codex.cmd') result=run('cmd.exe',['/d','/s','/c','codex.cmd --version']);
    else result=run(candidate,['--version']);
    if(!result.error && result.status===0) return candidate;
  }
  throw new Error(zh?'未找到可用的 Codex CLI。请更新桌面应用或安装 Codex CLI，并使用 --codex 指定路径。':'No working Codex CLI found. Update the desktop app or install Codex CLI; use --codex PATH if needed.');
}
function codex(binary,argv) {
  if(binary==='codex.cmd') {
    // All arguments here are fixed selectors or paths; don't invoke arbitrary shell input.
    const quote=s=>'"'+s.replace(/"/g,'')+'"';
    return run('cmd.exe',['/d','/s','/c',[binary,...argv.map(quote)].join(' ')]);
  }
  return run(binary,argv);
}
async function hiddenToken() {
  if(!process.stdin.isTTY || !process.stdin.setRawMode) throw new Error(zh?'请在交互式终端运行安装向导。':'Run setup in an interactive terminal.');
  process.stdout.write(zh?'粘贴腾讯个人令牌（输入隐藏），然后回车：':'Paste your Tencent personal token (hidden), then press Enter: ');
  return await new Promise((resolvePromise,reject)=>{
    let value=''; const previous=process.stdin.isRaw;
    process.stdin.setRawMode(true);process.stdin.resume();
    const done=()=>{process.stdin.off('data',onData);process.stdin.setRawMode(previous);process.stdin.pause();process.stdout.write('\n');};
    const onData=chunk=>{
      for(const c of chunk.toString('utf8')) {
        if(c==='\x03') {done();reject(new Error('Cancelled / 已取消'));return;}
        if(c==='\r'||c==='\n') {done();resolvePromise(value.trim());return;}
        if(c==='\x7f'||c==='\b') value=value.slice(0,-1);
        else if(c>=' ') value+=c;
      }
    };
    process.stdin.on('data',onData);
  });
}
async function main() {
  if(Number(process.versions.node.split('.')[0])<22) throw new Error('Node.js 22+ required / 需要 Node.js 22 或更高版本');
  if(args.includes('--help')) {
    console.log('node setup.mjs [--lang=en|--lang=zh] [--check] [--forget-token] [--uninstall] [--codex PATH] [--skip-install] [--replace-token] [--install-only]');
    return;
  }
  if(args.includes('--forget-token')) {store.remove();say('Saved token removed.','已删除保存的令牌。');return;}
  if(args.includes('--check')) {
    const result=await probe(store.load());
    say('Connection OK. Tools discovered: '+result.toolCount+(result.userInfoChecked?'; account checked.':'; discovery only.'),
      '连接正常。已发现 '+result.toolCount+' 个工具'+(result.userInfoChecked?'；账户检查通过。':'；仅完成工具发现。'));
    return;
  }
  if(!args.some(x=>x.startsWith("--lang=")) && process.stdin.isTTY) {
    const rl=createInterface({input:process.stdin,output:process.stdout});
    const language=await rl.question("Language / 语言: 1 English, 2 简体中文 [1]: "); rl.close(); zh=language.trim()==="2";
  }
  const binary=findCodex();
  if(args.includes('--uninstall')) {
    const result=codex(binary,['plugin','remove','tencent-docs@akashmahedy-plugins','--json']);
    if(result.error||result.status!==0) throw new Error('Plugin removal failed / 插件卸载失败');
    say('Plugin removed. Run --forget-token to remove its saved token.','已卸载插件。如需删除保存的令牌，请运行 --forget-token。');
    return;
  }
  if(!args.includes('--skip-install')) {
    if(!existsSync(join(root,'.agents/plugins/marketplace.json'))) throw new Error('Extract the complete repository or release ZIP first / 请先完整解压仓库或发布 ZIP');
    say('Installing Tencent Docs plugin…','正在安装腾讯文档插件…');
    for(const argv of [['plugin','marketplace','add',root,'--json'],['plugin','add','tencent-docs@akashmahedy-plugins','--json']]) {
      const result=codex(binary,argv);
      if(result.error||result.status!==0) throw new Error('Plugin installation failed. Check CLI version and marketplace access / 插件安装失败，请检查 CLI 版本及市场访问权限');
      if(argv[1]==='add') {
        // Resolve Node's executable in this installed copy for desktop apps with a restricted PATH.
        try {
          const data=JSON.parse(result.stdout);
          const locate=obj=>{
            if(!obj||typeof obj!=='object') return null;
            for(const [key,value] of Object.entries(obj)) {
              if(typeof value==='string' && /install.*path|plugin.*path|install.*dir|plugin.*dir|installedRoot/i.test(key) && existsSync(join(value,'.mcp.json'))) return value;
              const child=locate(value);if(child)return child;
            }
            return null;
          };
          const installed=locate(data);
          if(installed) {
            const file=join(installed,'.mcp.json'),conf=JSON.parse(readFileSync(file,'utf8'));
            conf.mcpServers.tencent_docs.command=process.execPath;
            writeFileSync(file,JSON.stringify(conf,null,2)+'\n');
          }
        } catch { /* PATH must provide node when the CLI does not report its installed location. */ }
      }
    }
  }
  if(args.includes('--install-only')) {say('Plugin installed. Run setup again to configure your token.','插件已安装。请再次运行向导配置个人令牌。');return;}
  let token;
  try {if(args.includes("--replace-token")) throw new Error("replace"); token=store.load();say('Using your saved token.','正在使用已保存的令牌。');}
  catch {
    say('Get your own token at https://docs.qq.com/open/auth/mcp.html. Never paste it into chat.','请在 https://docs.qq.com/open/auth/mcp.html 获取个人令牌，切勿粘贴到聊天中。');
    token=await hiddenToken();
  }
  const result=await probe(token);
  store.save(token);
  say('Ready. Discovered '+result.toolCount+' tools. Restart Codex and start a new chat.','设置完成，已发现 '+result.toolCount+' 个工具。请重启 Codex 并新建聊天。');
}
export function runSetup() { return main().catch((e)=>{ console.error(e.message); say('Setup/check failed. Check your token, Tencent permissions (400006/400007), network, Node and Codex CLI. Run --help for options.','安装或检查失败。请检查令牌、腾讯权限（400006/400007）、网络、Node 和 Codex CLI。运行 --help 查看选项。');process.exitCode=1;}); }

if(process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await runSetup();
