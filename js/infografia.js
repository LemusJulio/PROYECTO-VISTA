document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Document loaded');
        const urlParams = new URLSearchParams(window.location.search);
        const infografiaId = urlParams.get('id');
        
        const isAndroid = window.location.protocol === 'file:';
        const basePath = isAndroid ? 'file:///android_asset/' : '../../';
        
        let data;
        try {
            if (isAndroid) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', `${basePath}data/infografias.json`, false);
                xhr.send(null);
                data = JSON.parse(xhr.responseText);
            } else {
                const response = await fetch(`${basePath}data/infografias.json`);
                data = await response.json();
            }
            console.log('Data loaded:', data);
        } catch (e) {
            console.error('Error loading JSON:', e);
            throw e;
        }
        
        const infografia = data.infografias.find(inf => inf.id === infografiaId);
        console.log('Found infografia:', infografia);
        
        if (!infografia) {
            throw new Error('Infografía no encontrada');
        }

        const img = document.getElementById('image');
        
        img.onload = () => {
            console.log('Image loaded successfully');
            img.style.visibility = 'visible';
            initializeInfografia();
        };

        img.onerror = (e) => {
            console.error('Error loading image:', img.src);
            handleImageError();
        };

        img.style.visibility = 'hidden';
        img.src = `${basePath}${infografia.imagen}`;
        img.alt = infografia.alt;
        document.title = infografia.titulo;

    } catch (error) {
        console.error('Global error:', error);
        handleImageError();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded');
    const container = document.getElementById('image-container');
    const loader = document.getElementById('loading');

    if (container) {
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

        // Dark mode toggle
        const toggleButton = document.getElementById('toggleImage');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                toggleButton.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                localStorage.setItem('darkMode', isDark);
            });
        }

        // Back button
        const backButton = document.querySelector('.btn-back');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back();
            });
        }

        // Info button
        const infoButton = document.getElementById('infoButton');
        if (infoButton) {
            infoButton.addEventListener('click', () => {
                const isDarkMode = document.body.classList.contains('dark-mode');
                Swal.fire({
                    title: '¿Cómo funciona?',
                    html: `
                        <div style="text-align: left">
                            <p>🔍 <strong>Zoom:</strong> Usa los botones + y - para acercar y alejar</p>
                            <p>🔄 <strong>Reset:</strong> Vuelve la imagen a su tamaño original</p>
                            <p>🖱️ <strong>Arrastrar:</strong> Mueve la imagen</p>
                            <p>🌙 <strong>Modo oscuro:</strong> Cambia el tema</p>
                            <p>↩️ <strong>Volver:</strong> Regresa al menú anterior</p>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonText: 'Entendido',
                    background: isDarkMode ? '#17202a' : '#F5F7FB',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                });
            });
        }

        // Load dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            if (toggleButton) {
                toggleButton.querySelector('i').className = 'fas fa-sun';
            }
        }
    }
});

// Eliminar los event listeners anteriores y reemplazar con uno solo
document.getElementById('whatsappButton').addEventListener('click', function(e) {
    e.preventDefault();
    const mensaje = "Buen día Directora, espero se encuentre bien. Me gustaría solicitar su apoyo para resolver algunas dudas.";
    const numero = "525552522687";
    
    try {
        if (/Android/i.test(navigator.userAgent)) {
            // Para Android, usar URL directa
            window.location.href = `whatsapp://send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
        } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // Para iOS
            window.location.href = `whatsapp://send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
        } else {
            // Para Desktop
            window.open(`https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`, '_blank');
        }
    } catch (error) {
        console.error('Error opening WhatsApp:', error);
        // URL de respaldo
        window.location.href = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
    }
});

function handleImageError() {
    const container = document.getElementById('image-container');
    if (container) {
        container.innerHTML = '<p>Error al cargar la imagen. Por favor, inténtalo más tarde.</p>';
    }
}