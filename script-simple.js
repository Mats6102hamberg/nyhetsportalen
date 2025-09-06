// Simple version to fix jumping issue
console.log('Simple script loading...');

// Mock news data
const mockArticles = [
    {
        title: "Ny teknologisk genombrott inom artificiell intelligens",
        description: "Forskare har utvecklat en ny AI-modell som kan förstå och generera text på svenska med ännu högre precision.",
        urlToImage: "https://via.placeholder.com/400x200/667eea/ffffff?text=AI+Genombrott",
        source: { name: "Teknik Idag" },
        publishedAt: new Date().toISOString(),
        url: "https://example.com/ai-news"
    },
    {
        title: "Klimatpolitik får nytt fokus i riksdagen",
        description: "Nya förslag för miljövänligare transport och energiproduktion diskuteras i parlamentet.",
        urlToImage: "https://via.placeholder.com/400x200/10b981/ffffff?text=Klimat",
        source: { name: "Politik Direkt" },
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        url: "https://example.com/climate-news"
    },
    {
        title: "Svensk fotboll - nya stjärnor på väg upp",
        description: "Flera unga talanger visar lovande prestationer i de svenska ligorna.",
        urlToImage: "https://via.placeholder.com/400x200/f59e0b/ffffff?text=Fotboll",
        source: { name: "Sport Express" },
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        url: "https://example.com/sports-news"
    },
    {
        title: "Börsen visar positiv utveckling",
        description: "Stockholmsbörsen stiger med flera procent efter positiva ekonomiska rapporter.",
        urlToImage: "https://via.placeholder.com/400x200/059669/ffffff?text=Ekonomi",
        source: { name: "Ekonomi Nu" },
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        url: "https://example.com/economy-news"
    },
    {
        title: "Ny app revolutionerar kollektivtrafiken",
        description: "En innovativ mobilapplikation gör det enklare att planera och betala för kollektivresor.",
        urlToImage: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Transport",
        source: { name: "Mobil Sverige" },
        publishedAt: new Date(Date.now() - 345600000).toISOString(),
        url: "https://example.com/transport-news"
    },
    {
        title: "Hållbar utveckling - nya initiativ lanseras",
        description: "Kommuner och företag samarbetar för mer miljövänliga lösningar i vardagen.",
        urlToImage: "https://via.placeholder.com/400x200/06b6d4/ffffff?text=H%C3%A5llbarhet",
        source: { name: "Miljö Aktuellt" },
        publishedAt: new Date(Date.now() - 432000000).toISOString(),
        url: "https://example.com/sustainability-news"
    }
];

// Create news card HTML
function createNewsCard(article) {
    const publishedDate = new Date(article.publishedAt).toLocaleDateString('sv-SE');
    const defaultImage = 'https://via.placeholder.com/400x200/667eea/ffffff?text=Nyhetsbild';
    
    return `
        <article class="news-card" onclick="window.open('${article.url}', '_blank')">
            <img 
                src="${article.urlToImage || defaultImage}" 
                alt="${article.title}"
                class="news-image"
                onerror="this.src='${defaultImage}'"
            >
            <div class="news-content">
                <span class="news-category">${article.source?.name || 'Okänd källa'}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || 'Ingen beskrivning tillgänglig.'}</p>
                <div class="news-meta">
                    <span class="news-source">${article.source?.name || 'Okänd källa'}</span>
                    <span class="news-date">${publishedDate}</span>
                </div>
            </div>
        </article>
    `;
}

// Display news
function displayNews() {
    console.log('Displaying news...');
    
    const newsContainer = document.getElementById('news-container');
    const loading = document.getElementById('loading');
    
    if (loading) {
        loading.style.display = 'none';
    }
    
    if (newsContainer) {
        const newsHTML = mockArticles
            .slice(0, 6)
            .map(article => createNewsCard(article))
            .join('');
        
        newsContainer.innerHTML = `
            <div class="container">
                <div class="news-container">
                    ${newsHTML}
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing simple version...');
    
    // Small delay to ensure everything is ready
    setTimeout(() => {
        displayNews();
    }, 500);
});

// Prevent any form submissions or link clicks that might cause reload
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        console.log('Navigation prevented');
    }
});
