param([Parameter(ValueFromRemainingArguments = $true)][string[]]$SetupArgs)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
function Test-Node([string]$Binary) {
    try { & $Binary -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)' *> $null; return $LASTEXITCODE -eq 0 }
    catch { return $false }
}
try {
    $node = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($env:TENCENT_DOCS_FORCE_PORTABLE_NODE -ne '1' -and $node -and (Test-Node $node.Source)) {
        $binary = $node.Source
    } else {
        $architecture = $env:PROCESSOR_ARCHITEW6432
        if (-not $architecture) { $architecture = $env:PROCESSOR_ARCHITECTURE }
        $arch = switch ($architecture) { 'AMD64' { 'x64' }; 'ARM64' { 'arm64' }; 'x86' { 'x86' }; default { throw 'Unsupported Windows architecture.' } }
        $manifest = Get-Content (Join-Path $PSScriptRoot 'node-runtime.txt')
        $version = $manifest[0]
        $asset = "node-$version-win-$arch.zip"
        $checksumLine = $manifest | Where-Object { ($_ -split '\s+')[1] -eq $asset }
        if (@($checksumLine).Count -ne 1) { throw 'Missing Node checksum.' }
        $expected = ($checksumLine -split '\s+')[0]
        if ($expected -notmatch '^[a-f0-9]{64}$') { throw 'Invalid Node checksum.' }
        $base = Join-Path $env:LOCALAPPDATA 'akashmahedy/tencent-docs/runtime'
        if ($env:TENCENT_DOCS_RUNTIME_DIR) { $base = $env:TENCENT_DOCS_RUNTIME_DIR }
        $runtime = Join-Path $base "node-$version-win-$arch"
        $binary = Join-Path $runtime 'node.exe'
        if (-not (Test-Path $binary) -or -not (Test-Node $binary)) {
            Write-Host 'Preparing Node.js automatically / 正在自动准备 Node.js…'
            New-Item -ItemType Directory -Path $base -Force | Out-Null
            $stage = Join-Path $base ('.download.' + [guid]::NewGuid().ToString('N'))
            New-Item -ItemType Directory -Path $stage | Out-Null
            try {
                [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                $archive = Join-Path $stage 'node.zip'
                Invoke-WebRequest -Uri "https://nodejs.org/download/release/$version/$asset" -OutFile $archive -UseBasicParsing -TimeoutSec 300
                if ((Get-FileHash $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) { throw 'Node checksum failed; nothing was run.' }
                Expand-Archive -LiteralPath $archive -DestinationPath $stage
                $extracted = Join-Path $stage "node-$version-win-$arch"
                if (-not (Test-Node (Join-Path $extracted 'node.exe'))) { throw 'Downloaded Node cannot run on this OS.' }
                if (Test-Path $runtime) { Move-Item -LiteralPath $runtime -Destination (Join-Path $stage 'previous-runtime') }
                Move-Item -LiteralPath $extracted -Destination $runtime
            } finally { Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue }
        }
    }
    & $binary (Join-Path $root 'setup.mjs') @SetupArgs
    exit $LASTEXITCODE
} catch {
    Write-Error "Setup failed / 安装失败: $($_.Exception.Message)" -ErrorAction Continue
    exit 1
}
