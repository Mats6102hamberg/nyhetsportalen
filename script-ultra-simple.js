// Ultra simple version - no event listeners at all
console.log('Ultra simple script loading at:', new Date().toLocaleString('sv-SE'));

// Mock news data
const articles = [
    {
        title: "Ny teknologisk genombrott inom artificiell intelligens",
        description: "Forskare har utvecklat en ny AI-modell som kan förstå och generera text på svenska med ännu högre precision.",
        source: "Teknik Idag"
    },
    {
        title: "Klimatpolitik får nytt fokus i riksdagen", 
        description: "Nya förslag för miljövänligare transport och energiproduktion diskuteras i parlamentet.",
        source: "Politik Direkt"
    },
    {
        title: "Svensk fotboll - nya stjärnor på väg upp",
        description: "Flera unga talanger visar lovande prestationer i de svenska ligorna.", 
        source: "Sport Express"
    },
    {
        title: "Börsen visar positiv utveckling",
        description: "Stockholmsbörsen stiger med flera procent efter positiva ekonomiska rapporter.",
        source: "Ekonomi Nu"
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
                    <article class="news-card">
                        <img src="https://via.placeholder.com/400x200/667eea/ffffff?text=Nyhetsbild" 
                             alt="${article.title}" class="news-image">
                        <div class="news-content">
                            <span class="news-category">${article.source}</span>
                            <h3 class="news-title">${article.title}</h3>
                            <p class="news-description">${article.description}</p>
                            <div class="news-meta">
                                <span class="news-source">${article.source}</span>
                                <span class="news-date">${new Date().toLocaleDateString('sv-SE')}</span>
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
