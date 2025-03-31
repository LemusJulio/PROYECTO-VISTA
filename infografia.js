document.addEventListener('DOMContentLoaded', () => {
    const MOBILE_BREAKPOINT = 768;
    const ZOOM_STEP = 0.1;
    const MAX_SCALE = 5;
    const MIN_SCALE = 0.5;

    try {
        // 1. Configuración inicial
        const element = document.getElementById('image-container');
        if (!element) throw new Error('Container element not found');

let isMobile = window.innerWidth <= MOBILE_BREAKPOINT; // Usar 'let' en lugar de 'const'
        // 2. Configuración de Panzoom
        const startScale = isMobile ? 1.2 : 3.0; // Reducir zoom inicial solo para móviles

        const panzoomConfig = {
            maxScale: 5,
            minScale: 0.5,
            contain: 'outside',
            startScale: startScale,
            step: 0.1,
            animate: true,
            duration: 200,
            easing: 'ease-out',
            transformOrigin: 'center center',
            setPosition: 'center', // Asegurar que la imagen se centre
            overflow: 'visible', // Añadir esta línea
            bounds: true // Añadir esta línea
        };

        const panzoom = Panzoom(element, panzoomConfig);

        // Ajustar la posición inicial para mostrar la parte superior de la imagen
        panzoom.pan(0, element.offsetHeight * (startScale / 2));

        // 3. Accesibilidad
        const setupAccessibility = () => {
            const controls = document.querySelectorAll('.control-btn');
            controls.forEach(control => {
                control.setAttribute('role', 'button');
                control.setAttribute('tabindex', '0');
                control.setAttribute('aria-label', control.textContent.trim());
                control.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        control.click();
                    }
                });
            });
        };

        setupAccessibility();

        // 4. Eventos de ratón y cursor
        element.style.cursor = 'grab';
        element.addEventListener('mousedown', () => {
            element.style.cursor = 'grabbing';
        });
        element.addEventListener('mouseup', () => {
            element.style.cursor = 'grab';
        });

        // 5. Eventos de zoom y reset
        document.getElementById('zoomIn').addEventListener('click', () => {
            panzoom.zoomIn();
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            panzoom.zoomOut();
        });

        document.getElementById('resetZoom').addEventListener('click', () => {
            panzoom.reset();
            panzoom.pan(0, element.offsetHeight * (startScale / 2));
        });

        // 6. Eventos de teclado y rueda del ratón (solo para desktop)
        if (!isMobile) {
            element.addEventListener('wheel', (event) => {
                if (event.ctrlKey) {
                    event.preventDefault();
                    panzoom.zoomWithWheel(event);
                }
            });

            document.addEventListener('keydown', (event) => {
                switch(event.key) {
                    case '+':
                    case '=':
                        panzoom.zoomIn();
                        break;
                    case '-':
                        panzoom.zoomOut();
                        break;
                    case '0':
                        panzoom.reset();
                        panzoom.pan(0, element.offsetHeight * (startScale / 2));
                        break;
                }
            });
        }

        // 7. Modo oscuro
        const moonImage = document.getElementById('toggleImage');
        const body = document.body;
        let isDarkMode = localStorage.getItem('darkMode') === 'true';

        // Función para actualizar el icono
        const updateThemeIcon = () => {
            const icon = moonImage.querySelector('i');
            icon.classList.toggle('fa-moon', !isDarkMode);
            icon.classList.toggle('fa-sun', isDarkMode);
        };

        // Aplicar tema inicial
        if (isDarkMode) {
            body.classList.add('dark-mode');
        }
        updateThemeIcon();

        moonImage.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            isDarkMode = !isDarkMode;
            localStorage.setItem('darkMode', isDarkMode);
            updateThemeIcon();
        });

        // 8. Manejo de redimensionamiento
        const handleResize = debounce(() => {
            const newIsMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            if (newIsMobile !== isMobile) {
                location.reload();
            }
        }, 250);

        window.addEventListener('resize', handleResize);

        // 9. Gestos táctiles
        let lastTouchDistance = 0;
        element.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                lastTouchDistance = getTouchDistance(e.touches);
            }
        }, { passive: true });

        // 10. Observador de redimensionamiento
        const resizeObserver = new ResizeObserver(debounce(() => {
            panzoom.reset();
            panzoom.pan(0, element.offsetHeight * (startScale / 2));
        }, 250));
        resizeObserver.observe(element);

        // 11. Información de ayuda
        const infoButton = document.getElementById('infoButton');
        if (infoButton) {
            infoButton.addEventListener('click', () => {
                Swal.fire({
                    title: '¿Cómo funciona?',
                    html: `
                        <div style="text-align: left">
                            <h3>Controles básicos:</h3>
                            <p>🔍 <strong>Zoom:</strong> Usa los botones + y - para acercar y alejar la imagen</p>
                            <p>🔄 <strong>Restablecer:</strong> El botón de reset devuelve la imagen a su tamaño original</p>
                            <p>🖱️ <strong>Arrastrar:</strong> Haz clic y arrastra para mover la imagen</p>
                            <p>🌙 <strong>Modo oscuro:</strong> Cambia entre modo claro y oscuro</p>
                            <p>🏠 <strong>Inicio:</strong> Vuelve a la página principal</p>
                            <p>↩️ <strong>Volver:</strong> Regresa a la página anterior</p>

                            <h3>Gestos táctiles:</h3>
                            <p>👆 <strong>Pellizcar:</strong> Usar dos dedos para zoom</p>
                            <p>👆 <strong>Arrastrar:</strong> Deslizar con un dedo para mover</p>
                            
                            <h3>Atajos de teclado (PC):</h3>
                            <p>➕ <strong>Zoom in:</strong> Tecla + o =</p>
                            <p>➖ <strong>Zoom out:</strong> Tecla -</p>
                            <p>0️⃣ <strong>Reset:</strong> Tecla 0</p>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonText: 'Entendido',
                    customClass: {
                        container: 'help-popup',
                        popup: 'help-popup-content'
                    }
                });
            });
        }

        // 12. Manejo del botón de retroceso
        window.onBackPressed = function() {
            try {
                if (typeof Android !== 'undefined') {
                    Android.goBack();
                } else if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Error handling back press:', error);
                window.location.href = 'index.html';
            }
            return true;
        };

        window.addEventListener('popstate', function(event) {
            try {
                if (typeof Android !== 'undefined') {
                    Android.goBack();
                } else if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = 'index.html';
            }
            } catch (error) {
                console.error('Error handling popstate:', error);
                window.location.href = 'index.html';
            }
        });

        // 13. Limpieza
        return () => {
            resizeObserver.disconnect();
            panzoom.destroy();
        };
    } catch (error) {
        // 14. Manejo de errores
        console.error('Error initializing viewer:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al cargar el visor de imágenes. Por favor, recarga la página.',
            icon: 'error'
        });
    }
});

// 15. Funciones auxiliares
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}