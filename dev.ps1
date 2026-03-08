# JanSamadhan+ Dev Environment Activation Script
# Usage: . .\dev.ps1
# This adds the portable Node.js to the current session's PATH only (no global changes)

$nodeDir = Join-Path $PSScriptRoot ".node\node-v20.11.1-win-x64"

if (-not (Test-Path $nodeDir)) {
    Write-Host "ERROR: Portable Node.js not found at $nodeDir" -ForegroundColor Red
    Write-Host "Run the setup first." -ForegroundColor Yellow
    return
}

$env:PATH = "$nodeDir;$env:PATH"
$env:npm_config_prefix = Join-Path $PSScriptRoot ".npm-global"

Write-Host ""
Write-Host "  JanSamadhan+ Dev Environment Activated" -ForegroundColor Green
Write-Host "  Node: $(node --version)  |  npm: $(npm --version)" -ForegroundColor Cyan
Write-Host "  All tools are LOCAL to this project folder." -ForegroundColor DarkGray
Write-Host ""
