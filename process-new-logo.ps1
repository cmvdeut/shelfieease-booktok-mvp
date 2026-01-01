# Script om nieuw Shelfie logo te verwerken
# Plaats logo.png in project root, dan run dit script

$logoPath = Join-Path $PSScriptRoot "logo.png"
$publicPath = Join-Path $PSScriptRoot "public"

if (-not (Test-Path $logoPath)) {
    Write-Host "❌ logo.png niet gevonden in: $logoPath"
    Write-Host "`nPlaats het logo bestand als 'logo.png' in:"
    Write-Host "  $logoPath"
    exit 1
}

Write-Host "✅ logo.png gevonden"
Write-Host "`nDit script zal:"
Write-Host "  1. Logo kopiëren naar /public/logo.png"
Write-Host "  2. Favicon.ico genereren van logo"
Write-Host "  3. Alle icon sizes genereren (192x192, 512x512, etc.)"
Write-Host "  4. Homepage logo updaten"
Write-Host "`nRun dit script met: .\process-new-logo.ps1"

