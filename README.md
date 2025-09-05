# Nyhetsportalen

En modern, responsiv nyhetsportal byggd med HTML, CSS och JavaScript. Portalen hämtar nyheter från NewsAPI och presenterar dem i en användarvänlig layout.

## Funktioner

- **Responsiv design** - Fungerar perfekt på desktop, tablet och mobil
- **Kategoriserade nyheter** - Politik, Ekonomi, Sport, Teknik
- **Modern UI** - Ren och professionell design
- **Mobile-first** - Optimerad för mobila enheter
- **API-integration** - Hämtar riktiga nyheter från NewsAPI
- **Fallback-innehåll** - Visar exempelinnehåll när API inte är tillgängligt

## Installation

1. Klona repositoryet:
```bash
git clone https://github.com/Mats6102hamberg/nyhetsportalen.git
cd nyhetsportalen
```

2. För att använda riktiga nyheter, registrera dig på [NewsAPI.org](https://newsapi.org) och få en gratis API-nyckel.

3. Öppna `script.js` och ersätt `'din-api-nyckel-här'` med din faktiska API-nyckel:
```javascript
const NEWS_API_KEY = 'din-riktiga-api-nyckel';
```

4. Öppna `index.html` i din webbläsare eller starta en lokal server.

## Användning

### Lokal utveckling
```bash
# Använd Python för en enkel HTTP-server
python -m http.server 8000

# Eller använd Node.js
npx http-server

# Eller använd PHP
php -S localhost:8000
```

### Deployment till Vercel

1. Pusha koden till GitHub
2. Gå till [vercel.com](https://vercel.com)
3. Connecta ditt GitHub-konto
4. Välj ditt repository
5. Klicka "Deploy"

## Teknisk stack

- **HTML5** - Semantisk markup
- **CSS3** - Modern styling med Grid och Flexbox
- **Vanilla JavaScript** - Ingen ramverk, ren JavaScript
- **NewsAPI** - För att hämta nyheter
- **Google Fonts** - Inter-typsnitt för modern läsbarhet

## Projektstruktur

```
nyhetsportalen/
├── index.html          # Huvudsidan
├── styles.css          # All styling
├── script.js           # JavaScript-funktionalitet
└── README.md           # Denna fil
```

## Funktioner i detalj

### Responsiv Navigation
- Desktop: Horisontell meny
- Mobil: Hamburger-meny som expanderar

### Nyhetskategorier
- **Hem** - Allmänna nyheter
- **Politik** - Politiska nyheter
- **Ekonomi** - Ekonomiska nyheter och börsinformation
- **Sport** - Sportnyheter
- **Teknik** - Teknologi och innovation

### API-integration
Portalen är konfigurerad för NewsAPI men fungerar även utan API-nyckel genom att visa exempelinnehåll.

## Anpassning

### Färger
Huvudfärgerna definieras i CSS:
- Primärfärg: `#2563eb` (blå)
- Bakgrund: `#f8fafc` (ljusgrå)
- Text: `#333` (mörkgrå)

### Layout
- Container max-width: 1200px
- Grid: Auto-fit med minimum 350px kolumner
- Responsiva breakpoints: 768px och 480px

## Browser-support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Licens

MIT License - se LICENSE filen för detaljer.

## Bidrag

Pull requests välkomnas! För större ändringar, öppna först en issue för diskussion.

## Support

Vid frågor eller problem, öppna en issue på GitHub.
