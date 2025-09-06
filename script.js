// News API configuration
const NEWS_API_KEY = 'din-api-nyckel-här'; // Du behöver registrera dig på newsapi.org
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

// DOM elements - will be initialized after DOM loads
let newsContainer, loadingElement, hamburger, navMenu, navLinks;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    newsContainer = document.getElementById('news-container');
    loadingElement = document.getElementById('loading');
    hamburger = document.querySelector('.hamburger');
    navMenu = document.querySelector('.nav-menu');
    navLinks = document.querySelectorAll('.nav-link');
    
    initializeApp();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove active class from all links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to clicked link
    e.target.classList.add('active');
    
    // Close mobile menu
    navMenu.classList.remove('active');
    
    // Get category from href
    const category = e.target.getAttribute('href').substring(1);
    
    // Prevent loading the same category multiple times
    const currentActive = document.querySelector('.nav-link.active');
    if (currentActive && currentActive.getAttribute('href').substring(1) === category) {
        return;
    }
    
    console.log(`Navigating to category: ${category}`);
    
    // Load news for category
    if (category === 'hem') {
        loadNews('general');
    } else {
        loadNews(category);
    }
}

// Initialize the application
async function initializeApp() {
    console.log('Initializing app...');
    
    // Add a small delay to ensure DOM is fully ready
    setTimeout(async () => {
        try {
            // Load general news by default
            await loadNews('general');
        } catch (error) {
            console.error('Error during initialization:', error);
            hideLoading();
            displayMockNews('general');
        }
    }, 100);
}

// Load news from API
async function loadNews(category = 'general') {
    console.log(`Loading news for category: ${category}`);
    showLoading();
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
        console.log('Loading timeout - showing mock data');
        hideLoading();
        displayMockNews(category);
    }, 3000); // 3 second timeout
    
    try {
        // Check if we have a valid API key
        if (!NEWS_API_KEY || NEWS_API_KEY === 'din-api-nyckel-här') {
            // Clear timeout and use mock data if no API key
            clearTimeout(timeoutId);
            displayMockNews(category);
            return;
        }
        
        const response = await fetch(`${NEWS_API_URL}?country=se&category=${category}&apiKey=${NEWS_API_KEY}`);
        
        // Clear timeout since we got a response
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'ok') {
            displayNews(data.articles);
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
        
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error fetching news:', error);
        displayError('Det gick inte att hämta nyheter. Visar exempelinnehåll istället.');
        displayMockNews(category);
    }
}

// Display news articles
function displayNews(articles) {
    hideLoading();
    
    if (!articles || articles.length === 0) {
        displayError('Inga nyheter hittades för denna kategori.');
        return;
    }
    
    const newsHTML = articles
        .filter(article => article.title && article.title !== '[Removed]')
        .slice(0, 12) // Limit to 12 articles
        .map(article => createNewsCard(article))
        .join('');
    
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = `
        <div class="container">
            <div class="news-container">
                ${newsHTML}
            </div>
        </div>
    `;
}

// Create a news card HTML
function createNewsCard(article) {
    const publishedDate = new Date(article.publishedAt).toLocaleDateString('sv-SE');
    const defaultImage = 'https://via.placeholder.com/400x200/667eea/ffffff?text=Nyhetsbild';
    
    return `
        <article class="news-card" onclick="openArticle('${encodeURIComponent(article.url)}')">
            <img 
                src="${article.urlToImage || defaultImage}" 
                alt="${article.title}"
                class="news-image"
                onerror="this.src='${defaultImage}'"
            >
            <div class="news-content">
                <span class="news-category">${getCategoryInSwedish(article.source?.name || 'Okänd källa')}</span>
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

// Open article in new tab
function openArticle(encodedUrl) {
    const url = decodeURIComponent(encodedUrl);
    window.open(url, '_blank');
}

// Get category name in Swedish
function getCategoryInSwedish(sourceName) {
    const categories = {
        'general': 'Allmänt',
        'politik': 'Politik',
        'ekonomi': 'Ekonomi',
        'sport': 'Sport',
        'teknik': 'Teknik',
        'business': 'Ekonomi',
        'entertainment': 'Underhållning',
        'health': 'Hälsa',
        'science': 'Vetenskap',
        'sports': 'Sport',
        'technology': 'Teknik'
    };
    
    return categories[sourceName.toLowerCase()] || sourceName;
}

// Display mock news when API is not available
function displayMockNews(category) {
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
    
    // Filter mock articles based on category if needed
    let filteredArticles = mockArticles;
    if (category !== 'general' && category !== 'hem') {
        filteredArticles = mockArticles.filter(article => 
            article.source.name.toLowerCase().includes(category) ||
            article.title.toLowerCase().includes(category)
        );
        
        // If no category-specific articles, show all
        if (filteredArticles.length === 0) {
            filteredArticles = mockArticles;
        }
    }
    
    displayNews(filteredArticles);
}

// Show loading spinner
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
    
    // Hide any existing content
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        const existingContent = newsContainer.querySelector('.news-container');
        if (existingContent) {
            existingContent.style.display = 'none';
        }
    }
}

// Hide loading spinner
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Display error message
function displayError(message) {
    hideLoading();
    
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = `
        <div class="container">
            <div class="error-message">
                <h3>⚠️ ${message}</h3>
                <p>För att få riktiga nyheter, registrera dig på <a href="https://newsapi.org" target="_blank">NewsAPI.org</a> och lägg till din API-nyckel i script.js</p>
            </div>
        </div>
    `;
}

// PRODUKTIONS-API INTEGRATION OCH FALLBACK SYSTEM
// ==============================================

// Global API state
let currentAPIProvider = 'fallback';
let universalAPI = null;

// Smart API selection - försöker production först, sedan fallback
async function selectBestAPI() {
    try {
        // Kontrollera om production API är tillgängligt
        if (window.productionAPI) {
            const isOnline = await window.productionAPI.checkBackendStatus();
            if (isOnline) {
                console.log('🚀 Production API aktivt');
                return 'production';
            }
        }

        // Fallback till statisk data om backend ej tillgängligt
        if (window.fallbackProcurementAPI) {
            console.log('🔧 Använder fallback API - Backend ej tillgängligt');
            return 'fallback';
        }

        // Sista utväg - simulatorer (om de finns)
        if (window.procurementAPI) {
            console.log('📱 Använder simulator API');
            return 'simulators';
        }

        console.log('⚠️ Inget API tillgängligt');
        return 'none';
    } catch (error) {
        console.warn('⚠️ API selection error:', error);
        return 'fallback';
    }
}

// Universal API wrapper som väljer bästa tillgängliga API
class UniversalAPI {
    constructor() {
        this.currentProvider = 'fallback';
        this.init();
    }

    async init() {
        this.currentProvider = await selectBestAPI();
        console.log(`📡 API Provider: ${this.currentProvider}`);
        this.updateStatusIndicator();
    }

    getAPI(type) {
        switch (this.currentProvider) {
            case 'production':
                return window.productionAPI;
            case 'fallback':
                switch (type) {
                    case 'procurement': return window.fallbackProcurementAPI;
                    case 'company': return window.fallbackCompanyAPI;
                    case 'political': return window.fallbackPoliticalAPI;
                }
                break;
            case 'simulators':
                switch (type) {
                    case 'procurement': return window.procurementAPI;
                    case 'company': return window.companyAPI;
                    case 'political': return window.politicalAPI;
                }
                break;
            default:
                return null;
        }
    }

    async switchProvider(provider) {
        this.currentProvider = provider;
        console.log(`🔄 Växlade till ${provider} API`);
        this.updateStatusIndicator();
    }

    updateStatusIndicator() {
        // Skapa eller uppdatera API-status indikator
        let indicator = document.getElementById('api-status');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'api-status';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                z-index: 1000;
                color: white;
            `;
            document.body.appendChild(indicator);
        }

        // Sätt färg och text baserat på provider
        switch (this.currentProvider) {
            case 'production':
                indicator.style.backgroundColor = '#28a745';
                indicator.textContent = '🚀 LIVE DATA';
                break;
            case 'fallback':
                indicator.style.backgroundColor = '#ffc107';
                indicator.style.color = '#000';
                indicator.textContent = '🔧 DEMO DATA';
                break;
            case 'simulators':
                indicator.style.backgroundColor = '#17a2b8';
                indicator.textContent = '📱 SIMULATOR';
                break;
            default:
                indicator.style.backgroundColor = '#dc3545';
                indicator.textContent = '❌ OFFLINE';
        }
    }
}

// Initiera Universal API när alla script är laddade
function initUniversalAPI() {
    if (!universalAPI) {
        universalAPI = new UniversalAPI();
        window.universalAPI = universalAPI;
    }
}

// Lägg till i initialization
const originalInitializeApp = window.initializeApp || initializeApp;
window.initializeApp = function() {
    if (originalInitializeApp) {
        originalInitializeApp();
    }
    // Vänta lite för att alla scripts ska ladda
    setTimeout(initUniversalAPI, 1000);
};
