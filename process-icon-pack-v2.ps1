# Script om shelfieease-icon-pack.zip te verwerken
# Plaats shelfieease-icon-pack.zip in project root, dan run dit script

$zipPath = Join-Path $PSScriptRoot "shelfieease-icon-pack.zip"
$tempDir = Join-Path $PSScriptRoot "temp-icon-pack"
$brandV2 = Join-Path $PSScriptRoot "public\brand\v2"
$iconsV2 = Join-Path $PSScriptRoot "public\icons\v2"

# Check if zip exists
if (-not (Test-Path $zipPath)) {
    Write-Host "❌ shelfieease-icon-pack.zip niet gevonden in: $zipPath"
    Write-Host "`nPlaats het zip bestand in:"
    Write-Host "  $zipPath"
    exit 1
}

Write-Host "✅ shelfieease-icon-pack.zip gevonden"
Write-Host "Uitpakken..."

# Create temp directory
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Extract zip
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

Write-Host "`nGevonden bestanden:"
Get-ChildItem $tempDir -Recurse -File | Select-Object Name, DirectoryName | Format-Table -AutoSize

# Step 1: Copy logo-mark-tight.png to /public/brand/v2/logo-mark.png
Write-Host "`n=== Stap 1: Logo mark kopiëren ==="
$logoMark = Get-ChildItem $tempDir -Recurse -Filter "*logo-mark-tight*" | Select-Object -First 1
if ($logoMark) {
    Copy-Item $logoMark.FullName "$brandV2\logo-mark.png" -Force
    Write-Host "✅ logo-mark.png geplaatst in /public/brand/v2/"
} else {
    Write-Host "⚠️  logo-mark-tight.png niet gevonden in zip"
}

# Step 2: Copy icon files to /public/icons/v2/
Write-Host "`n=== Stap 2: Iconen kopiëren ==="
$iconFiles = @(
    "favicon.ico",
    "favicon-16.png",
    "favicon-32.png",
    "favicon-48.png",
    "favicon-64.png",
    "favicon-96.png",
    "favicon-128.png",
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png"
)

foreach ($iconFile in $iconFiles) {
    $source = Get-ChildItem $tempDir -Recurse -Filter $iconFile | Select-Object -First 1
    if ($source) {
        Copy-Item $source.FullName "$iconsV2\$iconFile" -Force
        Write-Host "  ✅ $iconFile"
    } else {
        Write-Host "  ⚠️  $iconFile niet gevonden"
    }
}

# Cleanup
Write-Host "`nOpschonen..."
Remove-Item $tempDir -Recurse -Force

Write-Host "`n✅ Icon pack verwerkt!"
Write-Host "`nVolgende stappen:"
Write-Host "  1. Update app/layout.tsx metadata"
Write-Host "  2. Update public/site.webmanifest"
Write-Host "  3. Update homepage logo"

