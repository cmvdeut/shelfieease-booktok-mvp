# ShelfieEase - Project Samenvatting

## Wat is ShelfieEase?

**ShelfieEase** is een Progressive Web App (PWA) waarmee boekenliefhebbers hun fysieke boekenverzameling digitaal kunnen beheren en delen. De app is speciaal ontworpen voor de BookTok community en maakt het super eenvoudig om boeken te scannen, te organiseren en te delen.

## Kern Value Proposition

**"Build your bookshelf in seconds"** - Van barcode naar digitale boekenkast in seconden, zonder gedoe.

## Doelgroep

- **BookTok community** (TikTok boekenliefhebbers)
- Mensen met fysieke boekenverzamelingen
- Lezers die hun TBR (To Be Read), Reading en Finished boeken willen bijhouden
- Mensen die hun boekenverzameling willen delen op social media

## Belangrijkste Features

### 📷 **Snel scannen**
- Scan ISBN-barcodes met je telefooncamera (iPhone & Android)
- Handmatige ISBN-invoer als alternatief
- Zoeken op titel/auteur als scannen niet lukt
- Automatische boekdata ophalen (titel, auteur, cover) via Google Books API

### 📚 **Organisatie met Shelves**
- Maak emoji-shelves (mini collecties) zoals "📖 Fantasy", "❤️ Favorites", "🎯 TBR"
- Organiseer boeken in categorieën
- Status tracking: TBR · Reading · Finished

### 📊 **Reading Statistics**
- Overzicht van totaal aantal boeken
- Breakdown per status (TBR, Reading, Finished)
- Grootste shelf statistiek
- No-stress tracking (geen druk, gewoon bijhouden)

### 🪄 **Share je Shelfie**
- Genereer 9:16 share cards (perfect voor TikTok/Instagram Stories)
- Deel je boekenverzameling op social media
- Visueel aantrekkelijke cards met je boeken

### 💾 **Backup & Restore**
- Export je data als JSON
- Import om te herstellen of over te zetten naar ander apparaat
- Alles lokaal opgeslagen (privacy-first)

### 🎨 **Mood-aware UI**
- Drie UI moods: Default, Bold, Calm
- Dynamische headlines die per mood veranderen
- Visueel aantrekkelijke gradient backgrounds

## Technische Details

- **Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Deployment**: Cloudflare Pages (static export)
- **Storage**: LocalStorage (client-side only)
- **APIs**: Google Books API, Open Library API
- **Scanner**: html5-qrcode library (camera-based barcode scanning)
- **PWA**: Volledig installable als app op telefoon
- **i18n**: Engels/Nederlands (Engels als primaire UI taal)

## Business Model

- **Demo versie**: Gratis, max. 10 boeken
- **Pro versie**: Onbeperkt boeken (via Stripe betaling)
- Demo boeken blijven behouden na upgrade naar Pro

## Unique Selling Points

1. **Super snel**: Van scan naar boekenkast in seconden
2. **No-stress**: Geen druk, gewoon je boeken bijhouden
3. **Share-ready**: Direct shareable cards voor social media
4. **Privacy-first**: Alles lokaal opgeslagen, geen account nodig
5. **BookTok-optimized**: Perfect voor de TikTok boekencommunity

## Content Angles voor TikTok

### Hook ideeën:
- "POV: Je hebt eindelijk een app gevonden die je boekenverzameling organiseert"
- "Deze app scan je boeken en maakt automatisch je boekenkast"
- "BookTok, deze app is gemaakt voor ons"
- "Van 200 boeken naar georganiseerde shelves in 10 minuten"

### Feature highlights:
- **Scan functionaliteit**: "Scan je boeken met je camera - zo snel!"
- **Shelves**: "Maak emoji-shelves voor je favoriete genres"
- **Share cards**: "Deel je boekenkast op TikTok met deze cards"
- **Statistics**: "Zie hoeveel boeken je echt hebt gelezen"

### Pain points die het oplost:
- "Je weet niet meer welke boeken je hebt"
- "Je TBR lijst is een chaos"
- "Je wilt je boeken delen maar weet niet hoe"
- "Je hebt geen zin in ingewikkelde apps"

## Tone of Voice

- **Vriendelijk en toegankelijk**: Geen technisch jargon
- **Enthousiast maar niet overdreven**: Positief zonder te pushen
- **BookTok-native**: Spreekt de taal van de community
- **No-stress**: Geen druk, gewoon leuk en handig

## Call-to-Actions

- "Scan je eerste boek nu"
- "Maak je eigen boekenkast"
- "Deel je Shelfie op TikTok"
- "Probeer de demo (gratis, max 10 boeken)"

## URL & Branding

- **Website**: shelfieease.app
- **Tagline**: "Scan · Shelf · Share"
- **Logo**: Modern, clean design met boeken-icoon
