document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Document loaded');
        await initializeApp();
        initializeDarkMode();
    } catch (error) {
        console.error('Global error:', error);
        handleImageError();
    }
});

async function initializeApp() {
    // Get the infografia ID from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const infografiaId = urlParams.get('id');
    
    // Determine if the app is running on Android
    const isAndroid = window.location.protocol === 'file:';
    const basePath = isAndroid ? 'file:///android_asset/' : '../../';
    
    const data = await loadInfografiaData(basePath);
    const infografia = data.infografias.find(inf => inf.id === infografiaId);
    
    if (!infografia) {
        throw new Error('Infografía no encontrada');
    }

    setupImage(infografia, basePath);
    setupControls();
}

async function loadInfografiaData(basePath) {
    try {
        if (window.location.protocol === 'file:') {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', `${basePath}data/infografias.json`, true);
                xhr.onload = () => xhr.status === 200 ? 
                    resolve(JSON.parse(xhr.responseText)) : 
                    reject(new Error('Failed to load data'));
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send();
            });
        } else {
            const response = await fetch(`${basePath}data/infografias.json`);
            return await response.json();
        }
    } catch (e) {
        console.error('Error loading JSON:', e);
        throw e;
    }
}

function setupImage(infografia, basePath) {
    const img = document.getElementById('image');
    if (!img) return;

    img.style.visibility = 'hidden';
    img.src = `${basePath}${infografia.imagen}`;
    img.alt = infografia.alt;
    document.title = infografia.titulo;

    img.onload = () => {
        img.style.visibility = 'visible';
        initializePanzoom();
    };

    img.onerror = handleImageError;
}

function setupControls() {
    setupDarkMode();
    initializeDarkMode();
    setupBackButton();
    setupInfoButton();
    setupWhatsAppButton();
}

function initializePanzoom() {
    const container = document.getElementById('image-container');
    if (!container) return;

    const panzoom = Panzoom(container, {
        maxScale: 5,
        minScale: 0.5,
        contain: 'outside',
        startScale: 1,
        animate: true
    });

    // Zoom controls
    document.getElementById('zoomIn')?.addEventListener('click', () => panzoom.zoomIn());
    document.getElementById('zoomOut')?.addEventListener('click', () => panzoom.zoomOut());
    document.getElementById('resetZoom')?.addEventListener('click', () => {
        panzoom.reset({
            animate: true,
            startScale: 1,
            startX: 0,
            startY: 0
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '+' || e.key === '=') panzoom.zoomIn();
        if (e.key === '-') panzoom.zoomOut();
        if (e.key === '0' || e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            panzoom.reset();
        }
    });
}

function initializeDarkMode() {
    const isDark = localStorage.getItem('appDarkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDark);
    updateDarkModeButton(isDark);
}

function setupDarkMode() {
    const toggleButton = document.getElementById('toggleImage');
    if (!toggleButton) return;

    const updateDarkMode = (isDark) => {
        document.body.classList.toggle('dark-mode', isDark);
        updateDarkModeButton(isDark);
        localStorage.setItem('appDarkMode', isDark.toString());

        // Broadcast the change to other windows/tabs
        const event = new StorageEvent('storage', {
            key: 'appDarkMode',
            newValue: isDark.toString(),
            url: window.location.href
        });
        window.dispatchEvent(event);
    };

    toggleButton.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        updateDarkMode(isDark);
    });

    // Listen for changes from other windows/tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'appDarkMode') {
            const isDark = e.newValue === 'true';
            document.body.classList.toggle('dark-mode', isDark);
            updateDarkModeButton(isDark);
        }
    });

    // Listen for the custom darkModeChange event
    window.addEventListener('darkModeChange', (e) => {
        const isDark = e.detail.isDark;
        document.body.classList.toggle('dark-mode', isDark);
        updateDarkModeButton(isDark);
    });

    // Cargar preferencia guardada al iniciar
    let savedDarkMode = localStorage.getItem('appDarkMode');
    let isDark = false;
    if (savedDarkMode === null) {
        isDark = true;
        localStorage.setItem('appDarkMode', 'true');
    } else {
        isDark = savedDarkMode === 'true';
    }
    updateDarkMode(isDark);
}

function updateDarkModeButton(isDark) {
    const toggleButton = document.getElementById('toggleImage');
    if (!toggleButton) return;

    const icon = toggleButton.querySelector('i');
    const text = toggleButton.querySelector('span');
    
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (text) {
        text.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
    }
}

function setupInfoButton() {
    const infoButton = document.getElementById('infoButton');
    if (!infoButton) return;

    infoButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        Swal.fire({
            title: '¿Cómo funciona?',
            html: `
                <div style="text-align: left">
                    <p>🔍 <strong>Zoom:</strong> Haz clic en los botones <strong>+</strong> y <strong>-</strong> para acercar y alejar la imagen.</p>
                    <p>🔄 <strong>Reset:</strong> Presiona el botón <strong>R</strong> o <strong>0</strong> para restablecer la vista.</p>
                    <p>✋ <strong>Arrastrar:</strong> Mantén presionado y arrastra para mover la imagen.</p>
                    <p>📱 <strong>Móvil:</strong> Pellizca para zoom y arrastra con un dedo.</p>
                    <p>🌙 <strong>Modo oscuro:</strong> Cambia entre modo claro y oscuro.</p>
                    <p>↩️ <strong>Volver:</strong> Regresa al menú anterior.</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Entendido',
            background: isDarkMode ? '#17202a' : '#F5F7FB',
            color: isDarkMode ? '#FFFFFF' : '#000000'
        });
    });
}

function setupBackButton() {
    const backButton = document.querySelector('.btn-back');
    if (!backButton) return;

    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
    });
}

function setupWhatsAppButton() {
    const whatsappButton = document.getElementById('whatsappButton');
    if (!whatsappButton) return;

    whatsappButton.addEventListener('click', (e) => {
        e.preventDefault();
        const whatsappLink = "https://chat.whatsapp.com/K4XHQtL0QZE725imWIFVXM";
        
        try {
            if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                window.location.href = whatsappLink;
            } else {
                window.open(whatsappLink, '_blank');
            }
        } catch (error) {
            console.warn('WhatsApp not available:', error);
        }
    });
}

function handleImageError() {
    const container = document.getElementById('image-container');
    if (container) {
        container.innerHTML = '<p>Error al cargar la imagen. Por favor, inténtalo más tarde.</p>';
    }
}

window.addEventListener('storage', (e) => {
    if (e.key === 'appDarkMode') {
        const isDark = e.newValue === 'true';
        document.body.classList.toggle('dark-mode', isDark);
        updateDarkModeButton(isDark);
    }
});
