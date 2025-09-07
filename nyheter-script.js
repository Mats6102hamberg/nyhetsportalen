// Enkel JavaScript utan ES6+ för maximal kompatibilitet
// DOM elements
var newsContainer, loadingElement, hamburger, navMenu, navLinks;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
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
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    if (navLinks) {
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', handleNavigation);
        }
    }
}

// Initialize the application
function initializeApp() {
    console.log('🚀 Nyhetsportalen startar - Produktionsläge');
    
    setTimeout(function() {
        loadProcurementNews();
    }, 100);
}

// Show loading
function showLoading() {
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
}

// Hide loading
function hideLoading() {
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Load procurement news
function loadProcurementNews() {
    console.log('📊 Laddar svenska upphandlingar...');
    showLoading();
    
    // Prova Vercel API först
    fetch('/api/procurements?limit=20')
        .then(function(response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error('API error');
        })
        .then(function(procurements) {
            displayProcurementsAsNews(procurements);
            hideLoading();
        })
        .catch(function(error) {
            console.warn('API failed, using fallback:', error);
            displayFallbackNews();
            hideLoading();
        });
}

// Display procurements as news
function displayProcurementsAsNews(procurements) {
    if (!newsContainer) return;
    
    if (!procurements || procurements.length === 0) {
        newsContainer.innerHTML = 
            '<div class="no-news">' +
            '<h3>Inga upphandlingar hittades</h3>' +
            '<p>Systemet är under uppstart. Produktionsdata laddas...</p>' +
            '</div>';
        return;
    }
    
    var newsCards = '';
    
    for (var i = 0; i < procurements.length; i++) {
        var procurement = procurements[i];
        var title = procurement.title || 'Ny upphandling';
        var authority = procurement.contracting_authority || 'Okänd myndighet';
        var winner = procurement.winner_name || 'Okänt företag';
        var value = formatCurrency(procurement.value);
        var date = formatDate(procurement.award_date);
        
        var description = authority + ' har tilldelat kontrakt till ' + winner + ' för ' + value + '.';
        
        newsCards += 
            '<article class="news-card">' +
            '<div class="news-image">' +
            '<div class="procurement-badge">' +
            '<i class="fas fa-gavel"></i>' +
            '<span>Upphandling</span>' +
            '</div>' +
            '</div>' +
            '<div class="news-content">' +
            '<h3 class="news-title">' + title + '</h3>' +
            '<p class="news-description">' + description + '</p>' +
            '<div class="news-meta">' +
            '<span class="news-source">' +
            '<i class="fas fa-building"></i>' +
            authority +
            '</span>' +
            '<span class="news-date">' +
            '<i class="fas fa-calendar"></i>' +
            date +
            '</span>' +
            '<span class="news-value">' +
            '<i class="fas fa-coins"></i>' +
            value +
            '</span>' +
            '</div>' +
            '<div class="procurement-details">' +
            '<span class="winner">Vinnare: ' + winner + '</span>' +
            '</div>' +
            '</div>' +
            '</article>';
    }
    
    newsContainer.innerHTML = newsCards;
}

// Display fallback news
function displayFallbackNews() {
    var fallbackData = [
        {
            title: 'IT-drift och support för Stockholms stad',
            contracting_authority: 'Stockholms stad',
            winner_name: 'CGI Sverige AB',
            value: 18500000,
            award_date: '2025-09-05'
        },
        {
            title: 'Byggentreprenad för Göteborgs kommun',
            contracting_authority: 'Göteborgs kommun', 
            winner_name: 'Skanska Sverige AB',
            value: 67200000,
            award_date: '2025-09-04'
        },
        {
            title: 'Säkerhetstjänster för Malmö kommun',
            contracting_authority: 'Malmö kommun',
            winner_name: 'Securitas Sverige AB',
            value: 9800000,
            award_date: '2025-09-03'
        }
    ];
    
    displayProcurementsAsNews(fallbackData);
}

// Format currency
function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return 'Okänt belopp';
    
    return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: 'SEK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Okänt datum';
    
    var date = new Date(dateString);
    var options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return date.toLocaleDateString('sv-SE', options);
}

// Toggle mobile menu
function toggleMobileMenu() {
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    if (hamburger) {
        hamburger.classList.toggle('active');
    }
}

// Handle navigation
function handleNavigation(event) {
    var category = event.target.getAttribute('data-category');
    
    // Remove active class from all links
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.remove('active');
    }
    
    // Add active class to clicked link
    event.target.classList.add('active');
    
    // Close mobile menu
    if (navMenu) {
        navMenu.classList.remove('active');
    }
    if (hamburger) {
        hamburger.classList.remove('active');
    }
    
    // Load news for category (för framtida utökning)
    console.log('Navigerar till kategori:', category);
}

// Add status indicator
function addStatusIndicator() {
    var indicator = document.createElement('div');
    indicator.id = 'api-status';
    indicator.style.cssText = 
        'position: fixed;' +
        'top: 10px;' +
        'right: 10px;' +
        'padding: 8px 12px;' +
        'border-radius: 4px;' +
        'font-size: 12px;' +
        'font-weight: bold;' +
        'z-index: 1000;' +
        'color: white;' +
        'background-color: #ffc107;' +
        'color: #000;';
    indicator.textContent = '🔧 DEMO DATA';
    document.body.appendChild(indicator);
}

// Add status indicator when page loads
window.addEventListener('load', function() {
    setTimeout(addStatusIndicator, 1000);
});
