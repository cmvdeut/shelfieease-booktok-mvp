# Favicon.zip Uitpakken en Plaatsen

## Stap 1: Plaats favicon.zip

Plaats het `favicon.zip` bestand in één van deze locaties:
- `C:\Projects\shelfieease-booktok-mvp\favicon.zip` (project root)
- `C:\Projects\shelfieease-booktok-mvp\public\favicon.zip` (public folder)
- Of geef aan waar het bestand staat

## Stap 2: Uitpakken

Na het plaatsen, run dit commando in PowerShell:

```powershell
cd C:\Projects\shelfieease-booktok-mvp
Expand-Archive -Path "favicon.zip" -DestinationPath "temp_favicons" -Force
```

Of gebruik Windows Explorer:
1. Rechtsklik op `favicon.zip`
2. Kies "Extract All..."
3. Extract naar `temp_favicons` folder

## Stap 3: Bestanden Verplaatsen

Na uitpakken, verplaats de bestanden naar de juiste locaties:

### PWA Icons (in /public/icons/)
- `icon-192.png` → `/public/icons/icon-192.png`
- `icon-512.png` → `/public/icons/icon-512.png`

### Favicons (in /public/)
- `apple-touch-icon.png` → `/public/apple-touch-icon.png`
- `favicon-32x32.png` → `/public/favicon-32x32.png`
- `favicon-16x16.png` → `/public/favicon-16x16.png`
- `favicon.ico` → `/public/favicon.ico`

## Stap 4: Opschonen

Verwijder na plaatsing:
- `favicon.zip` (optioneel, kan blijven)
- `temp_favicons` folder (tijdelijk)

## Automatisch Script

Als je het bestand hebt geplaatst, kan ik een script maken om automatisch uit te pakken en te plaatsen.

