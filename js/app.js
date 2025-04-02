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
    await this.cargarDatos();
    this.configurarModoOscuro();
    this.configurarEventos();
    const areaId = this.obtenerAreaDesdeURL();
    this.cargarMapaPorArea(areaId);
    this.mostrarBotonRegresar(areaId);
  }

  obtenerAreaDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('area');
  }

  cargarMapaPorArea(areaId) {
    let areaData;
    if (areaId) {
      areaData = this.datosMapa.areas.find(area => area.id === areaId);
      if (areaData) {
        this.renderizarNodoCentral(
          areaData.nodoPrincipalTexto || areaData.texto,
          areaData.nodoCentralIcono,
          areaId
        );
        this.crearNodos(areaData.elementos);
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
        this.datosMapa.nodoCentral.textos.join(" "),
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
      const response = await fetch('data/mapa.json');
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      this.datosMapa = await response.json();
      
      if (!this.datosMapa?.areas) {
        throw new Error('Estructura de datos inválida');
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        title: 'Error de carga',
        html: `No se pudieron cargar los datos.<br>Reintentando en 5 segundos...`,
        icon: 'error',
        timer: 5000,
        willClose: () => location.reload()
      });
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
    const svg = this.DOM.mainNode.querySelector('svg');
    while (svg.childNodes.length > 2) svg.removeChild(svg.lastChild);

    this.DOM.mainNode.style.backgroundRepeat = 'no-repeat';

    if (areaId === 'principal') {
      const { imagen } = this.datosMapa.nodoCentral;
      this.DOM.mainNode.style.backgroundImage = `url(${imagen})`;
      this.DOM.mainNode.style.backgroundColor = '';
      this.DOM.mainNode.style.backgroundSize = 'contain';
      
      this.datosMapa.nodoCentral.textos.forEach((texto, i) => {
        const textElement = this.crearElementoTexto(
          texto,
          `texto-${i ? 'inferior' : 'superior'}`
        );
        svg.appendChild(textElement);
      });
    } else {
      const [textoSuperior, textoInferior] = this.dividirTexto(textoNodoPrincipal);
      
      this.DOM.mainNode.style.backgroundImage = iconoNodoCentral 
        ? `url(${iconoNodoCentral})`
        : '';
      
      const areaData = this.datosMapa.areas.find(area => area.id === areaId);
      this.DOM.mainNode.style.backgroundColor = areaData.nodoCentralColor || '#aeb6bf';
      this.DOM.mainNode.style.backgroundSize = '60%';

      // Texto superior
      const textElementSuperior = this.crearElementoTexto(
        textoSuperior,
        'texto-superior'
      );
      
      // Texto inferior
      const textElementInferior = this.crearElementoTexto(
        textoInferior,
        'texto-inferior'
      );

      svg.appendChild(textElementSuperior);
      svg.appendChild(textElementInferior);
    }
  }

  dividirTexto(texto) {
    const palabras = texto.split(' ');
    const mitad = Math.ceil(palabras.length / 2);
    return [
      palabras.slice(0, mitad).join(' '),
      palabras.slice(mitad).join(' ') || ' ' // Asegurar al menos un espacio
    ];
  }

  crearElementoTexto(texto, pathId) {
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("fill", "white");
    textElement.setAttribute("font-size", "20");
    textElement.setAttribute("font-weight", "bold");

    const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    textPath.setAttribute("href", `#${pathId}`);
    textPath.setAttribute("startOffset", "50%");
    textPath.setAttribute("text-anchor", "middle");
    textPath.textContent = texto;

    textElement.appendChild(textPath);
    return textElement;
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

    nodo.style.animation = animacion;
  }

  eliminarNodos() {
    this.nodos.forEach((nodo, index) => {
      const animacion = this.DOM.isMobile()
        ? "none"
        : `${CONFIG.ANIMACIONES.SALIDA_DESKTOP} ${index * 0.01}s`;

      nodo.style.animation = animacion;
      nodo.classList.add('exit');

      nodo.addEventListener('animationend', () => nodo.remove(), { once: true });
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
    const isDarkMode = document.body.classList.contains('dark-mode');
    Swal.fire({
      title: '¿Cómo funciona?',
      html: `...`,
      background: isDarkMode ? '#17202a' : '#F5F7FB',
      customClass: {
        popup: isDarkMode ? 'swal-dark' : 'swal-light',
        title: isDarkMode ? 'swal-title-dark' : 'swal-title-light'
      }
    });
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