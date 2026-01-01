# Script om favicon.zip uit te pakken en iconen op juiste locaties te plaatsen

$zipPath = Join-Path $PSScriptRoot "favicon.zip"
$tempDir = Join-Path $PSScriptRoot "temp_favicons"

if (-not (Test-Path $zipPath)) {
    Write-Host "❌ favicon.zip niet gevonden in: $zipPath"
    Write-Host "`nPlaats favicon.zip in: $zipPath"
    exit 1
}

Write-Host "✅ favicon.zip gevonden"
Write-Host "Uitpakken..."

# Maak temp directory
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Pak uit
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

Write-Host "`nGevonden bestanden:"
Get-ChildItem $tempDir -Recurse -File | Select-Object Name | Format-Table -AutoSize

# Verplaats bestanden naar juiste locaties
Write-Host "`nVerplaatsen bestanden..."

# PWA Icons
$icon192 = Get-ChildItem $tempDir -Recurse -Filter "*192*" | Select-Object -First 1
$icon512 = Get-ChildItem $tempDir -Recurse -Filter "*512*" | Select-Object -First 1

if ($icon192) {
    Copy-Item $icon192.FullName "$PSScriptRoot\public\icons\icon-192.png" -Force
    Write-Host "✅ icon-192.png geplaatst"
}
if ($icon512) {
    Copy-Item $icon512.FullName "$PSScriptRoot\public\icons\icon-512.png" -Force
    Write-Host "✅ icon-512.png geplaatst"
}

# Apple Touch Icon
$appleIcon = Get-ChildItem $tempDir -Recurse -Filter "*apple*" | Select-Object -First 1
if ($appleIcon) {
    Copy-Item $appleIcon.FullName "$PSScriptRoot\public\apple-touch-icon.png" -Force
    Write-Host "✅ apple-touch-icon.png geplaatst"
}

# Favicons
$favicon32 = Get-ChildItem $tempDir -Recurse -Filter "*32*32*" | Select-Object -First 1
$favicon16 = Get-ChildItem $tempDir -Recurse -Filter "*16*16*" | Select-Object -First 1
$faviconIco = Get-ChildItem $tempDir -Recurse -Filter "*.ico" | Select-Object -First 1

if ($favicon32) {
    Copy-Item $favicon32.FullName "$PSScriptRoot\public\favicon-32x32.png" -Force
    Write-Host "✅ favicon-32x32.png geplaatst"
}
if ($favicon16) {
    Copy-Item $favicon16.FullName "$PSScriptRoot\public\favicon-16x16.png" -Force
    Write-Host "✅ favicon-16x16.png geplaatst"
}
if ($faviconIco) {
    Copy-Item $faviconIco.FullName "$PSScriptRoot\public\favicon.ico" -Force
    Write-Host "✅ favicon.ico geplaatst"
}

# Opschonen
Write-Host "`nOpschonen..."
Remove-Item $tempDir -Recurse -Force

Write-Host "`n✅ Klaar! Alle iconen zijn geplaatst."
Write-Host "`nVerificatie:"
$required = @(
    "public\icons\icon-192.png",
    "public\icons\icon-512.png",
    "public\apple-touch-icon.png",
    "public\favicon-32x32.png",
    "public\favicon-16x16.png",
    "public\favicon.ico"
)

foreach ($file in $required) {
    $path = Join-Path $PSScriptRoot $file
    if (Test-Path $path) {
        Write-Host "✅ $file"
    } else {
        Write-Host "❌ $file MISSING"
    }
}

