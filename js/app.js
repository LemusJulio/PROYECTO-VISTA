import { toggleDarkMode, loadDarkModePreference } from './darkMode.js';

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

    this.DOM = {
      container: document.querySelector(".mapa-container"),
      mainNode: document.getElementById("nodo-principal"),
      isMobile: () => window.innerWidth <= 768
    };
  }

  async init() {
    this.configurarModoOscuro();
    this.configurarEventos();
    await this.cargarDatos();
  }

  obtenerAreaDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('area');
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
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/mapa.json', true);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            this.datosMapa = JSON.parse(xhr.responseText);
            if (!this.datosMapa?.areas) {
              throw new Error('Estructura de datos inválida');
            }
            this.renderizarMapa(); // Llamar a la función para renderizar el mapa
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            this.mostrarErrorCarga(`Error al analizar los datos JSON: ${parseError.message}`);
          }
        } else {
          console.error('Error HTTP:', xhr.status);
          this.mostrarErrorCarga(`Error HTTP: ${xhr.status}`);
        }
      };
      xhr.onerror = () => {
        console.error('Error de red');
        this.mostrarErrorCarga('Error de red al cargar los datos.');
      };
      xhr.send();
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.mostrarErrorCarga(`Error cargando datos: ${error.message}`);
    }
  }

  renderizarMapa() {
    const areaId = this.obtenerAreaDesdeURL();
    this.cargarMapaPorArea(areaId);
    this.mostrarBotonRegresar(areaId);
  }

  mostrarErrorCarga(mensaje) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Error de carga',
        html: `${mensaje}<br>Reintentando en 5 segundos...`,
        icon: 'error',
        timer: 5000,
        willClose: () => location.reload()
      });
    } else {
      alert(`${mensaje} Reintentando en 5 segundos...`);
      setTimeout(() => location.reload(), 5000);
    }
  }

  configurarModoOscuro() {
    document.body.classList.add('dark-mode');
    loadDarkModePreference();
  }

  configurarEventos() {
    this.DOM.mainNode.addEventListener("click", () => this.toggleNodos());
    document.getElementById("toggleDarkMode").addEventListener("click", toggleDarkMode);
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

    const textoInferiorElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textoInferiorElement.setAttribute("fill", "white");
    textoInferiorElement.setAttribute("font-size", "20");
    textoInferiorElement.setAttribute("font-weight", "bold");
    const textoInferiorPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    textoInferiorPath.setAttribute("href", "#texto-inferior");
    textoInferiorPath.setAttribute("startOffset", "50%");
    textoInferiorPath.setAttribute("text-anchor", "middle");
    textoInferiorPath.textContent = textoInferior;
    textoInferiorElement.appendChild(textoInferiorPath);
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
    nodo.setAttribute("aria-hidden", "true"); // Initially hidden
    nodo.tabIndex = 0;
    nodo.innerHTML = `
      <img src="${area.icono}" 
           alt="${area.texto}"
           width="100"
           height="100"
           loading="lazy"
           aria-hidden="true">
      <span>${area.texto}</span>
    `;

    nodo.addEventListener("click", () => {
      window.location.href = area.link;
    });

    nodo.addEventListener("keypress", (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        window.location.href = area.link;
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
    console.log('mostrarInstrucciones function called');
    const isDarkMode = document.body.classList.contains('dark-mode');
    console.log('isDarkMode:', isDarkMode);
    if (typeof Swal !== 'undefined') {
      console.log('Swal is defined');
      Swal.fire({
        title: '¿Cómo funciona?',
        html: `
          <div style="text-align: left">
        <p>1. Presiona el círculo central con el logo de Diseño Visual para desplegar las áreas de la empresa.</p>
        <p>2. Cada área tiene sus procedimientos.</p>
        <p>3. Al oprimir el círculo del área de tu interés, te enviará a otro mapa, dónde encontrarás los procedimientos del área correspondiente.</p>
        <p>4. Siempre en la parte superior de la pantalla tendrás un botón para hacer el fondo oscuro para tu comodidad.</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido',
        customClass: {
          container: 'help-popup',
          popup: 'help-popup-content'
        },
        background: isDarkMode ? '#17202a' : '#F5F7FB',
        color: isDarkMode ? '#FFFFFF' : '#000000',
      });
    } else {
      console.log('Swal is not defined');
      alert('SweetAlert2 is not defined. Please check if the library is loaded correctly.');
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
new MapaMental().init();
