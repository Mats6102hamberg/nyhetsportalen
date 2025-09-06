// Ultra simple version - no event listeners at all
console.log('Ultra simple script loading at:', new Date().toLocaleString('sv-SE'));

// Mock news data
const articles = [
    {
        title: "Ny teknologisk genombrott inom artificiell intelligens",
        description: "Forskare har utvecklat en ny AI-modell som kan förstå och generera text på svenska med ännu högre precision.",
        source: "Teknik Idag",
        category: "TEKNIK IDAG"
    },
    {
        title: "Klimatpolitik får nytt fokus i riksdagen", 
        description: "Nya förslag för miljövänligare transport och energiproduktion diskuteras i parlamentet.",
        source: "Politik Direkt",
        category: "POLITIK DIREKT"
    },
    {
        title: "Svensk fotboll - nya stjärnor på väg upp",
        description: "Flera unga talanger visar lovande prestationer i de svenska ligorna.", 
        source: "Sport Express",
        category: "SPORT EXPRESS"
    },
    {
        title: "Börsen visar positiv utveckling",
        description: "Stockholmsbörsen stiger med flera procent efter positiva ekonomiska rapporter.",
        source: "Ekonomi Nu",
        category: "EKONOMI NU"
    },
    {
        title: "Nya rön inom cancerforskning ger hopp",
        description: "Svenska forskare har gjort betydande framsteg i utvecklingen av mer effektiva cancerbehandlingar.",
        source: "Medicin Aktuellt",
        category: "MEDICIN AKTUELLT"
    },
    {
        title: "Rekordmånga elbilar sålda under augusti",
        description: "Försäljningen av eldrivna fordon fortsätter att öka kraftigt i Sverige under sommarmånaderna.",
        source: "Auto Motor",
        category: "AUTO MOTOR"
    },
    {
        title: "Ny skattereform föreslås av regeringen",
        description: "Omfattande förändringar av skattesystemet kan vänta nästa år enligt nya förslag.",
        source: "Ekonomi Direkt",
        category: "EKONOMI DIREKT"
    },
    {
        title: "Svenska företag satsar på hållbarhet",
        description: "Allt fler svenska bolag investerar i miljövänlig teknik och hållbara produktionsmetoder.",
        source: "Miljö & Företag",
        category: "MILJÖ & FÖRETAG"
    },
    {
        title: "Ny app hjälper småföretagare med bokföring",
        description: "Innovativ mobilapplikation förenklar vardagen för tusentals svenska entreprenörer.",
        source: "Startup Sverige",
        category: "STARTUP SVERIGE"
    },
    {
        title: "Rekordvarmt väder väntas hela veckan",
        description: "Meteorologer spår fortsatt höga temperaturer över hela landet de kommande dagarna.",
        source: "Väder Direkt",
        category: "VÄDER DIREKT"
    },
    {
        title: "Nya bostäder planeras i Stockholmsregionen",
        description: "Omfattande satsning på bostadsbyggande ska minska bostadsbristen i huvudstadsområdet.",
        source: "Bostad Idag",
        category: "BOSTAD IDAG"
    },
    {
        title: "Svenska idrottare förbereder sig för VM",
        description: "Landslagets stjärnor tränar intensivt inför världsmästerskapen nästa månad.",
        source: "Sport24",
        category: "SPORT24"
    },
    {
        title: "Cyberattacker mot svenska myndigheter ökar",
        description: "Säkerhetspolisen varnar för ökad digital hotbild mot kritisk infrastruktur.",
        source: "Säkerhet Nu",
        category: "SÄKERHET NU"
    },
    {
        title: "Ny streaming-tjänst lanseras i Sverige",
        description: "Internationell mediajätte etablerar sig på den svenska marknaden med lokalt innehåll.",
        source: "Media Magasinet",
        category: "MEDIA MAGASINET"
    },
    {
        title: "Rekordstor satsning på järnvägstrafik",
        description: "Regeringen aviserar miljardinvesteringar i utbyggnad av järnvägsnätet.",
        source: "Transport Aktuellt",
        category: "TRANSPORT AKTUELLT"
    },
    {
        title: "Svenska skolor får modernare teknik",
        description: "Omfattande digitalisering av utbildningssektorn planeras över hela landet.",
        source: "Skola & Utbildning",
        category: "SKOLA & UTBILDNING"
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
                    articlesHTML += `
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
                `;
            });
            
            html += '</div></div>';
            container.innerHTML = html;
        }
        
        console.log('Content displayed successfully');
    }, 1000);
});
