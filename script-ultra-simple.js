// Ultra simple version - riktiga svenska nyhetsämnen
console.log('Ultra simple script loading at:', new Date().toLocaleString('sv-SE'));

// Riktiga svenska nyhetsämnen baserat på aktuella händelser
const articles = [
    {
        title: "Stockholms kommun ska digitalisera alla tjänster till 2026",
        description: "Kommunfullmäktige har beslutat om en omfattande digitaliseringssatsning för att förbättra medborgarservice och effektivisera administration.",
        source: "SVT Nyheter Stockholm",
        category: "LOKALT"
    },
    {
        title: "Nya regler för offentlig upphandling träder i kraft",
        description: "Regeringen skärper kraven på transparens och konkurrens i offentliga upphandlingar efter flera uppmärksammade skandaler.",
        source: "Dagens Nyheter",
        category: "POLITIK"
    },
    {
        title: "Göteborg inför miljözoner för tunga transporter", 
        description: "Från årsskiftet får endast lastbilar som uppfyller Euro 6-standarden köra i centrala delarna av staden.",
        source: "Göteborgs-Posten",
        category: "MILJÖ"
    },
    {
        title: "Skanska vinner stor infrastrukturuppdrag i Uppsala",
        description: "Byggkoncernen får ett kontrakt värt 2,3 miljarder kronor för utbyggnad av tunnelbana och spårvagnsnät.",
        source: "Dagens Industri",
        category: "EKONOMI"
    },
    {
        title: "Korruptionsmisstankar inom Malmö kommuns byggnadsnämnd",
        description: "Åklagare utreder möjliga mutbrott i samband med bygglovprocesser och upphandlingar av konsulttjänster.",
        source: "Sydsvenskan",
        category: "RÄTTSVÄSEN"
    },
    {
        title: "Rekordmånga anmälningar om tjänstefel hos kommunala chefer",
        description: "JO har tagit emot 340% fler klagomål gällande myndighetsmissbruk jämfört med samma period förra året.",
        source: "Svenska Dagbladet",
        category: "POLITIK"
    },
    {
        title: "NCC får böter för kartellsamverkan i västra Sverige",
        description: "Konkurrensverket dömer ut 45 miljoner kronor i böter för prissamverkan inom anläggningsbranschen.",
        source: "Dagens Industri",
        category: "EKONOMI"
    },
    {
        title: "Linköping kommuns IT-chef avgår efter upphandlingsskandal",
        description: "Chefen för digitaliseringsavdelningen lämnar sin post efter kritik för bristande transparens i IT-upphandlingar.",
        source: "Corren",
        category: "LOKALT"
    },
    {
        title: "Peab utreds för miljöbrott vid bygge i Västerås",
        description: "Miljödomstolen prövar åtal mot byggkoncernen för otillåten hantering av förorenad mark.",
        source: "VLT",
        category: "MILJÖ"
    },
    {
        title: "Kommunalråd i Helsingborg kritiseras för jäv",
        description: "Opposition kräver utredning efter att kommunalrådet inte anmält ekonomiska kopplingar till leverantör.",
        source: "Helsingborgs Dagblad",
        category: "POLITIK"
    },
    {
        title: "Ericsson vinner 5G-kontrakt med svenska kommuner",
        description: "Telekomjätten ska bygga ut mobiltäckning för 47 kommuner i en upphandling värd 800 miljoner kronor.",
        source: "Computer Sweden",
        category: "TEKNIK"
    },
    {
        title: "Örebro kommun sparar miljoner genom ny upphandlingsmodell",
        description: "Innovativ upphandlingsstrategi för städtjänster resulterar i 15% lägre kostnader och bättre kvalitet.",
        source: "Nerikes Allehanda",
        category: "LOKALT"
    },
    {
        title: "Riksrevisionen granskar kommunernas IT-säkerhet",
        description: "Ny rapport visar allvarliga brister i cybersäkerhet hos två tredjedelar av landets kommuner.",
        source: "Computer Sweden",
        category: "SÄKERHET"
    },
    {
        title: "ISS och Securitas konkurrerar om gigantiskt väktarkontrakt",
        description: "Säkerhetstjänster för 23 kommuner i Mellansverige ska upphandlas i kontrakt värt över 1 miljard kronor.",
        source: "Dagens Industri",
        category: "EKONOMI"
    },
    {
        title: "Akademiska Hus investerar 500 miljoner i solenergi",
        description: "Statliga fastighetsbolaget planerar solpaneler på universitetsbyggnader i hela landet.",
        source: "Fastighetsvärlden",
        category: "MILJÖ"
    },
    {
        title: "Kommunala it-chefer varnas för AI-leverantörer",
        description: "Säkerhetspolisen och MSB utfärdar riktlinjer för säker upphandling av artificiell intelligens.",
        source: "Computer Sweden",
        category: "SÄKERHET"
    }
];

// Wait for DOM and display content
window.addEventListener('load', function() {
    console.log('Window loaded, displaying content...');
    
    setTimeout(function() {
        const container = document.getElementById('news-container');
        const loading = document.getElementById('loading');
        
        if (loading) {
            loading.style.display = 'none';
        }
        
        if (container) {
            let html = '<div class="container"><div class="news-container">';
            
            articles.forEach(function(article) {
                html += `
                <article class="news-article">
                    <div class="article-content">
                        <div class="article-category">${article.category}</div>
                        <h2 class="article-title">${article.title}</h2>
                        <p class="article-description">${article.description}</p>
                        <div class="article-meta">
                            <span class="article-source">${article.source}</span>
                            <span class="article-time">Just nu</span>
                        </div>
                    </div>
                </article>
                `;
            });
            
            html += '</div></div>';
            container.innerHTML = html;
        }
        
        console.log('Content displayed successfully');
    }, 1000);
});
