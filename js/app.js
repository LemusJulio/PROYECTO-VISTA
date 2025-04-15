// ==================================================
// Configuración global
// ==================================================
const CONFIG = {
  RADIO: {
    DESKTOP: 450,
    MOVIL: 0,
    MIN: 100
  },
  ESPACIADO_MOVIL: 130,
  ANIMACIONES: {
    SPIN: "spinAndGlow 1s ease-in-out",
    PULSE: "pulse 2s infinite",
    ENTRADA_DESKTOP: "bounceOut 0.3s ease-in-out forwards",
    SALIDA_DESKTOP: "fadeOut 0.1s ease forwards"
  }
};

class MapaMental {
  constructor() {
    this.nodos = [];
    this.datosMapa = null;
    this.cache = null; // Eliminar Map() para prevenir desbordamiento
    this.initTime = Date.now();

    this.DOM = {
      container: document.querySelector(".mapa-container"),
      mainNode: document.getElementById("nodo-principal"),
      isMobile: () => window.innerWidth <= 768
    };
    this.DOM.container.setAttribute("aria-live", "polite");
  }

  async init() {
    initializeDarkMode();
    this.configurarEventos();
    await this.cargarDatos();
  }

  obtenerAreaDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('area');
  }

  getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  cargarMapaPorArea(areaId) {
    let selectedAreaData;
    if (areaId) {
      selectedAreaData = this.datosMapa.areas.find(area => area.id === areaId);
      if (selectedAreaData) {
        this.renderizarNodoCentral(
          selectedAreaData.nodoPrincipalTexto || selectedAreaData.texto,
          selectedAreaData.nodoCentralIcono,
          areaId
        );
        this.crearNodos(selectedAreaData.elementos);
        initializeDarkMode(); // Apply dark mode after loading area
      } else {
        console.error(`Área no encontrada: ${areaId}`);
        this.cargarMapaPrincipal();
      }
    } else {
      this.cargarMapaPrincipal();
    }
  }

  cargarMapaPrincipal() {
    const principalArea = this.datosMapa.areas.find(area => area.id === 'principal');
    if (principalArea) {
      this.renderizarNodoCentral(
        this.datosMapa.nodoCentral.textos[0],
        null,
        'principal'
      );
      this.crearNodos(principalArea.elementos);
    } else {
      console.error("Área principal no encontrada");
      Swal.fire('Error', 'Configuración base no encontrada', 'error');
    }
  }

  async cargarDatos() {
    try {
      // Limpiar caché al inicio
      if (typeof Android !== 'undefined' && Android !== null) {
        try {
          Android.clearAppCache();
        } catch (e) {
          console.warn('No se pudo limpiar caché:', e);
        }
      }

      const data = await this.fetchConReintentos();
      
      if (!data || !data.areas) {
        throw new Error('Formato de datos inválido');
      }

      this.datosMapa = data;
      this.renderizarMapa();
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      await this.manejarErrorCarga(error);
    }
  }

  async fetchConReintentos(intentos = 3) {
    let ultimoError;
    
    for (let i = 0; i < intentos; i++) {
      try {
        const response = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', 'data/mapa.json?v=' + this.initTime, true);
          xhr.onload = function() {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (e) {
                reject(new Error('Error parsing JSON'));
              }
            } else {
              reject(new Error('HTTP Error: ' + xhr.status));
            }
          };
          xhr.onerror = () => {
            if (!navigator.onLine) {
              reject(new Error('No internet connection'));
            } else {
              reject(new Error('Network error'));
            }
          };
          xhr.send();
        });

        return response;
      } catch (error) {
        ultimoError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    throw ultimoError;
  }

  async manejarErrorCarga(error) {
    if (typeof Swal !== 'undefined') {
      let errorMessage = 'No se pudieron cargar los datos. ¿Deseas reintentar?';
      if (error.message === 'No internet connection') {
        errorMessage = 'No hay conexión a Internet. Por favor, verifica tu conexión y reintenta.';
      }
      const result = await Swal.fire({
        title: 'Error de carga',
        text: errorMessage,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Reintentar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        if (typeof Android !== 'undefined' && Android !== null) {
          Android.restartApp();
        } else {
          window.location.reload();
        }
      }
    } else {
      alert('Error de carga. La aplicación se reiniciará.');
      window.location.reload();
    }
  }

  manejarError(error) {
    console.error('Error:', error);
    window.location.href = '404.html';
  }

  renderizarMapa() {
    // Actualizar manejo de URLs para infografías
    const currentPath = window.location.pathname;
    if (currentPath.includes('infografia-template.html') || 
        currentPath.includes('data/infografias/')) {
      const imageSrc = this.getURLParameter('imagen');
      const imageAlt = this.getURLParameter('alt');
      const imageTitle = this.getURLParameter('titulo');
      const imageDesc = this.getURLParameter('descripcion');
      const areaPadre = this.getURLParameter('areaPadre');

      this.actualizarMetadatos(imageSrc, imageAlt, title, desc);
      this.configurarBotonVolver(areaPadre);
      return;
    }

    const areaId = this.obtenerAreaDesdeURL();
    this.cargarMapaPorArea(areaId);
    this.mostrarBotonRegresar(areaId);

    window.addEventListener('popstate', (event) => {
      const areaId = event.state && event.state.area ? event.state.area : this.obtenerAreaDesdeURL();
      this.cargarMapaPorArea(areaId);
    });
  }

  actualizarMetadatos(src, alt, title, desc) {
    const img = document.getElementById('image');
    if (img && src) {
      img.src = src;
      img.alt = alt || 'Infografía';
      document.title = title || 'Infografía';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && desc) metaDesc.content = desc;
    }
  }

  configurarBotonVolver(areaPadre) {
    const btn = document.querySelector('.btn-back');
    if (btn && areaPadre) {
      btn.href = `../../index.html?area=${areaPadre}`;
    }
  }

  mostrarErrorCarga(mensaje) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Error de carga',
        text: `${mensaje}`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Reintentar'
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload();
        }
      });
    } else {
      alert(`${mensaje} Reintentando en 5 segundos...`);
      setTimeout(() => location.reload(), 5000);
    }
  }

  configurarEventos() {
    this.DOM.mainNode.addEventListener("click", () => this.toggleNodos());
    setupDarkMode();
    document.getElementById('instructionsBtn').addEventListener('click', this.mostrarInstrucciones);
  }

  renderizarNodoCentral(textoNodoPrincipal, iconoNodoCentral, areaId) {
    this.DOM.mainNode.innerHTML = '';
    this.DOM.mainNode.style.backgroundImage = '';
    this.DOM.mainNode.style.backgroundColor = '';
    this.DOM.mainNode.style.backgroundSize = '';
    this.DOM.mainNode.style.backgroundRepeat = 'no-repeat';

    let textoSuperior = "";
    let textoInferior = "";
    if (areaId === 'principal') {
      const textos = this.datosMapa.nodoCentral.textos;
      textoSuperior = textos[0];
      textoInferior = textos[1] || "";
      this.DOM.mainNode.style.backgroundImage = `url(${this.datosMapa.nodoCentral.imagen})`;
      this.DOM.mainNode.style.backgroundSize = 'contain';
    } else {
      const areaData = this.datosMapa.areas.find(area => area.id === areaId);
      this.DOM.mainNode.style.backgroundImage = iconoNodoCentral ? `url(${iconoNodoCentral})` : '';
      this.DOM.mainNode.style.backgroundColor = areaData.nodoCentralColor || '#aeb6bf';
      this.DOM.mainNode.style.backgroundSize = '60%';

      if (textoNodoPrincipal) {
        const textos = textoNodoPrincipal.split(' ');
        textoSuperior = textos.slice(0, Math.ceil(textos.length / 2)).join(' ');
        textoInferior = textos.slice(Math.ceil(textos.length / 2)).join(' ');
      }
    }

    // Crear SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 220 220");

    // Definir paths para el texto
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const pathSuperior = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathSuperior.setAttribute("id", "texto-superior");
    pathSuperior.setAttribute("d", "M20,110 A90,90 0 0,1 200,110");
    const pathInferior = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathInferior.setAttribute("id", "texto-inferior");
    pathInferior.setAttribute("d", "M200,110 A90,90 0 0,1 20,110");
    defs.appendChild(pathSuperior);
    defs.appendChild(pathInferior);
    svg.appendChild(defs);

    // Crear elementos de texto
    const textoSuperiorElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textoSuperiorElement.setAttribute("fill", "white");
    textoSuperiorElement.setAttribute("font-size", "20");
    textoSuperiorElement.setAttribute("font-weight", "bold");
    const textoSuperiorPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    textoSuperiorPath.setAttribute("href", "#texto-superior");
    textoSuperiorPath.setAttribute("startOffset", "50%");
    textoSuperiorPath.setAttribute("text-anchor", "middle");
    textoSuperiorPath.textContent = textoSuperior;
    textoSuperiorElement.appendChild(textoSuperiorPath);
    svg.appendChild(textoSuperiorElement);

    let textoInferiorElement;
    const areasProblematicas = ['operacion_logistica', 'direccion_general', 'sistema_gestion', 'almacen_general'];
    if (textoInferior && areasProblematicas.includes(areaId)) {
      const pathInferiorFixed = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathInferiorFixed.setAttribute("id", "texto-inferior-fixed");
      pathInferiorFixed.setAttribute("d", "M20,155 A100,100 0 0,0 200,155");
      defs.appendChild(pathInferiorFixed);

      textoInferiorElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textoInferiorElement.setAttribute("fill", "white");
      textoInferiorElement.setAttribute("font-size", "20");
      textoInferiorElement.setAttribute("font-weight", "bold");
      const textoInferiorPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
      textoInferiorPath.setAttribute("href", "#texto-inferior-fixed");
      textoInferiorPath.setAttribute("startOffset", "50%");
      textoInferiorPath.setAttribute("text-anchor", "middle");
      textoInferiorPath.textContent = textoInferior;
      textoInferiorElement.appendChild(textoInferiorPath);
    } else {
      textoInferiorElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textoInferiorElement.setAttribute("fill", "white");
      textoInferiorElement.setAttribute("font-size", "20");
      textoInferiorElement.setAttribute("font-weight", "bold");
      const textoInferiorPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
      textoInferiorPath.setAttribute("href", "#texto-inferior");
      textoInferiorPath.setAttribute("startOffset", "50%");
      textoInferiorPath.setAttribute("text-anchor", "middle");
      textoInferiorPath.textContent = textoInferior;
      textoInferiorElement.appendChild(textoInferiorPath);
    }
    svg.appendChild(textoInferiorElement);

    this.DOM.mainNode.innerHTML = '';
    this.DOM.mainNode.appendChild(svg);
  }

  toggleNodos() {
    this.nodos.length ? this.eliminarNodos() : this.crearNodos(this.currentElements);
  }

  crearNodos(elementosArea) {
    this.currentElements = elementosArea;
    elementosArea.forEach((area, index) => {
      const nodo = this.crearNodo(area);
      this.posicionarNodo(nodo, index);
      this.DOM.container.appendChild(nodo);
      this.configurarAnimacion(nodo, index);
    });

    this.nodos = [...this.DOM.container.querySelectorAll('.nodo-hijo')];
    this.iniciarAnimacionPrincipal();
  }

  crearNodo(area) {
    const nodo = document.createElement("div");
    nodo.className = "nodo nodo-hijo";
    nodo.setAttribute("role", "button");
    nodo.setAttribute("aria-label", `Acceder a ${area.texto}`);
    nodo.tabIndex = 0;
    nodo.innerHTML = `
      <img src="${area.icono}" 
           alt="${area.texto}"
           width="100"
           height="100"
           loading="lazy">
      <span>${area.texto}</span>
    `;

    if (area.infografia) {
      const url = new URL('data/infografias/infografia.html', window.location.href);
      url.searchParams.set('id', area.infografia);
      nodo.addEventListener("click", () => {
        console.log('Cargando infografía:', area.infografia);
        window.location.href = url.href;
      });
    } else if (area.link) {
      nodo.addEventListener("click", () => window.location.href = area.link);
    } else {
      nodo.style.opacity = "0.5";
      nodo.style.cursor = "not-allowed";
      nodo.setAttribute("aria-disabled", "true");
    }

    nodo.addEventListener("keypress", (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        nodo.click();
      }
    });

    return nodo;
  }

  posicionarNodo(nodo, index) {
    if (this.DOM.isMobile()) {
      nodo.style.position = 'absolute'; // Mantener posición absoluta
      nodo.style.setProperty('--y', `${index * CONFIG.ESPACIADO_MOVIL}px`);
    } else {
      const angulo = (index / this.currentElements.length) * Math.PI * 2;
      const radio = this.calcularRadio();

      nodo.style.setProperty('--x', `${Math.cos(angulo) * radio}px`);
      nodo.style.setProperty('--y', `${Math.sin(angulo) * radio}px`);
    }
  }

  calcularRadio() {
    const anchoPantalla = window.innerWidth;
    const maxRadio = Math.max(
      (anchoPantalla / 2) - 
      parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nodo-max-size')) / 2,
      CONFIG.RADIO.MIN
    );

    return Math.min(CONFIG.RADIO.DESKTOP, maxRadio);
  }

  configurarAnimacion(nodo, index) {
    const animacion = this.DOM.isMobile()
      ? `slideDownBounce 0.6s ease ${index * 0.2}s forwards`
      : `${CONFIG.ANIMACIONES.ENTRADA_DESKTOP} ${index * 0.1}s forwards`;

    // Use CSS media queries instead of DOM.isMobile()
    // nodo.style.animation = animacion;
  }

  eliminarNodos() {
    this.nodos.forEach((nodo, index) => {
      const animacion = this.DOM.isMobile()
        ? "none"
        : `${CONFIG.ANIMACIONES.SALIDA_DESKTOP} ${index * 0.01}s`;
  
      nodo.style.animation = animacion;
      nodo.classList.add('exit');
  
      if (this.DOM.isMobile()) {
        nodo.remove(); // Eliminar inmediatamente en móviles
      } else {
        nodo.addEventListener('animationend', () => nodo.remove(), { once: true });
      }
      });
  
    this.nodos = [];
    this.DOM.mainNode.style.animation = CONFIG.ANIMACIONES.PULSE;
  }

  iniciarAnimacionPrincipal() {
    this.DOM.mainNode.style.animation = CONFIG.ANIMACIONES.SPIN;
    this.DOM.mainNode.removeEventListener('animationend', this.handleAnimationEnd);
    this.DOM.mainNode.addEventListener('animationend', this.handleAnimationEnd);
  }

  handleAnimationEnd = () => {
    this.DOM.mainNode.style.animation = CONFIG.ANIMACIONES.PULSE;
  }

  mostrarInstrucciones = () => {
    if (typeof Swal !== 'undefined') {
      const isDarkMode = document.body.classList.contains('dark-mode');
      Swal.fire({
        title: '¿Cómo funciona?',
        html: `
          <div style="text-align: left">
        <p>1. Presiona el círculo central con el logo de Diseño Visual para desplegar las áreas de la empresa.</p>
        <p>2. Cada área contiene sus procedimientos específicos.</p>
        <p>3. Al oprimir el círculo del área de tu interés, accederás a otro mapa donde encontrarás los procedimientos correspondientes.</p>
        <p>4. En la parte superior de la pantalla encontrarás un botón para alternar entre modo claro y oscuro según tu preferencia.</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido',
        customClass: {
          container: 'help-popup',
          popup: 'help-popup-content'
        },
        background: isDarkMode ? '#17202a' : '#F5F7FB',
        color: isDarkMode ? '#FFFFFF' : '#000000'
      });
    } else {
      alert('Error: No se pudieron cargar las instrucciones.');
    }
  }

  mostrarBotonRegresar(areaId) {
    const backButton = document.getElementById('backButton');
    if (backButton) {
      backButton.style.display = areaId ? 'inline-block' : 'none';
    }
  }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const loadJSON = () => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'data/mapa.json', true);
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } catch (e) {
                            reject(new Error('Error parsing JSON'));
                        }
                    } else {
                        reject(new Error('Failed to load JSON'));
                    }
                };
                xhr.onerror = () => {
                  if (!navigator.onLine) {
                    reject(new Error('No internet connection'));
                  } else {
                    reject(new Error('Network error'));
                  }
                };
                xhr.send();
            });
        };

        const data = await loadJSON();
        new MapaMental().init();
    } catch (error) {
        console.error('Error loading data:', error);
        let errorMessage = 'No se pudieron cargar los datos. Por favor verifica tu conexión e intenta de nuevo.';
        if (error.message === 'No internet connection') {
          errorMessage = 'No hay conexión a Internet. Por favor, verifica tu conexión y reintenta.';
        }
        if (window.Swal) {
            Swal.fire({
                title: 'Error de carga',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Reintentar',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload();
                }
            });
        } else {
          alert('Error de carga. La aplicación se reiniciará.');
          location.reload();
        }
    }
});

function initializeDarkMode() {
    const isDark = localStorage.getItem('appDarkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDark);
    updateDarkModeButton(isDark);
}

function setupDarkMode() {
    const toggleButton = document.getElementById('toggleDarkMode');
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
    const toggleButton = document.getElementById('toggleDarkMode');
    if (!toggleButton) return;

    const icon = toggleButton.querySelector('i');
    const text = toggleButton.querySelector('span');

    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (text) {
        // Changed the logic here - text should reflect the mode it will switch to
        text.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
    } else {
        // If no span element exists, update the button text directly
        toggleButton.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
    }
}

// Agregar al inicio de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Aplicar modo oscuro inmediatamente al cargar
    initializeDarkMode();

    window.addEventListener('storage', (e) => {
        if (e.key === 'appDarkMode') {
            const isDark = e.newValue === 'true';
            document.body.classList.toggle('dark-mode', isDark);
            updateDarkModeButton(isDark);
        }
    });
  });
