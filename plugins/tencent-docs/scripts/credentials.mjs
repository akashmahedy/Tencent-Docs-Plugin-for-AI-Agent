import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const SERVICE = 'com.akashmahedy.tencent-docs-codex';
const ACCOUNT = 'tencent-docs';
export function validateToken(token) {
  if (typeof token !== 'string' || !token.trim() || /[\r\n\0]/.test(token)) throw new Error('Invalid token / 令牌格式无效');
  return token.trim();
}
export class CredentialStore {
  constructor({ platform = process.platform, dir = join(homedir(), '.config', 'akashmahedy', 'tencent-docs'), service = SERVICE } = {}) {
    this.platform = platform; this.dir = dir; this.service = service;
    this.file = join(dir, 'credentials.json');
  }
  powershell(script, input) {
    const result = spawnSync('powershell.exe', ['-NoProfile','-NonInteractive','-Command', script],
      { input, encoding:'utf8', windowsHide:true, timeout:15000 });
    if (result.error || result.status !== 0) throw new Error('Windows credential operation failed / Windows 凭据操作失败');
    return result.stdout.trim();
  }
  load() {
    try {
      if (this.platform === 'darwin') return validateToken(execFileSync('/usr/bin/security',
        ['find-generic-password','-s',this.service,'-a',ACCOUNT,'-w'], {encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:15000}).trim());
      const value = JSON.parse(readFileSync(this.file, 'utf8'));
      if (this.platform === 'win32') return validateToken(this.powershell(
        '$v=[Console]::In.ReadToEnd(); ConvertTo-SecureString $v | ForEach-Object { $p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($_); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($p) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p) } }',
        value.encrypted));
      return validateToken(value.token);
    } catch { throw new Error('Token unavailable. Run setup / 未找到令牌，请运行安装向导。'); }
  }
  save(token) {
    token = validateToken(token);
    if (this.platform === 'darwin') {
      // Send through stdin, never place the token in argv or logs.
      const result = spawnSync('/usr/bin/security',
        ['add-generic-password','-U','-s',this.service,'-a',ACCOUNT,'-w'],
        {input:token+'\n'+token+'\n',encoding:'utf8',stdio:['pipe','pipe','pipe'],timeout:15000});
      if (result.error || result.status !== 0) throw new Error('Keychain save failed / 钥匙串保存失败');
      // Verify persistence without printing the stored credential.
      if (this.load() !== token) throw new Error('Keychain verification failed / 钥匙串验证失败');
      return;
    }
    mkdirSync(this.dir, {recursive:true,mode:0o700});
    const data = this.platform === 'win32'
      ? {encrypted:this.powershell('$v=[Console]::In.ReadToEnd(); ConvertTo-SecureString -String $v -AsPlainText -Force | ConvertFrom-SecureString',token)}
      : {token};
    const temporary = this.file + '.tmp-' + process.pid;
    writeFileSync(temporary, JSON.stringify(data), {mode:0o600,flag:'wx'});
    renameSync(temporary, this.file);
    if (this.platform !== 'win32') { chmodSync(this.dir,0o700); chmodSync(this.file,0o600); }
  }
  remove() {
    if (this.platform === 'darwin') {
      const r = spawnSync('/usr/bin/security',['delete-generic-password','-s',this.service,'-a',ACCOUNT],{stdio:'ignore',timeout:15000});
      if (r.error || (r.status !== 0 && r.status !== 44)) throw new Error('Could not remove credential / 无法删除凭据');
    } else {
      try { unlinkSync(this.file); } catch(e) { if(e.code !== 'ENOENT') throw e; }
    }
  }
}
