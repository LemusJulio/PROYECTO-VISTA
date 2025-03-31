import { toggleDarkMode, loadDarkModePreference } from './darkMode.js';

// ==================================================
// Configuración global
// ==================================================
const APP_CONFIG = {
  nodeSettings: {
    baseRadius: {
      desktop: 450, // Ajusta este valor para cambiar el radio en desktop
      mobile: 0 // Usaremos disposición vertical
    },
    minRadius: 100,
    spacing: 130 // Espacio entre nodos en móvil
  },
  animations: {
    spin: "spinAndGlow 1s ease-in-out",
    pulse: "pulse 2s infinite",
    spinInfinite: "spinAndGlowInfinite 0.5s linear infinite",
    exitDesktop: "fadeOut 0.1s ease forwards", // Reemplazamos spiralExit con fadeOut
    exitMobile: "fadeOutDown 0.5s ease forwards",
    enterDesktop: "bounceOut 0.3s ease-in-out forwards",  }
};

// Elementos de la aplicación
const DOM = {
  container: document.querySelector(".mapa-container"),
  mainNode: document.getElementById("nodo-principal"),
  nodes: () => document.querySelectorAll(".nodo-hijo"),
  isMobile: () => window.innerWidth <= 768,
  pageTransition: document.getElementById("pageTransition")
};

// Funcionalidad principal
function initApp() {
  // Activar el modo oscuro por defecto
  document.body.classList.add('dark-mode');
  document.getElementById('toggleDarkMode').textContent = 'Modo Claro';
  loadDarkModePreference(); // Cargar preferencia de modo oscuro
  setupEventListeners();
}

function setupEventListeners() {
  DOM.mainNode.addEventListener("click", handleMainNodeClick);
  document.getElementById("toggleDarkMode").addEventListener("click", toggleDarkMode);
  document.getElementById('instructionsBtn').addEventListener('click', showInstructions);
}

function handleMainNodeClick() {
  DOM.nodes().length === 0 ? createChildNodes() : removeChildNodes();
}

// Creación de nodos hijos
function createChildNodes() {
  startMainNodeAnimation();

  const elementos = [
    { texto: "1",            icono: "https://cdn-icons-png.freepik.com/512/2973/2973740.png",   link: ""},
    { texto: "2",            icono: "https://cdn-icons-png.freepik.com/512/18191/18191216.png", link: ""},
    { texto: "3",            icono: "https://cdn-icons-png.freepik.com/512/10908/10908520.png", link: ""},
    { texto: "4",            icono: "https://cdn-icons-png.freepik.com/512/778/778631.png",     link: ""},
    { texto: "5",            icono: "https://cdn-icons-png.freepik.com/512/16517/16517493.png", link: ""},
    { texto: "6",            icono: "https://cdn-icons-png.freepik.com/512/1022/1022382.png",   link: ""},
    { texto: "7",            icono: "https://cdn-icons-png.freepik.com/512/13339/13339430.png", link: ""},
    { texto: "8",            icono: "https://cdn-icons-png.freepik.com/512/780/780477.png",     link: ""},
    { texto: "9",            icono: "https://cdn-icons-png.freepik.com/512/18771/18771476.png", link: ""},
    { texto: "10",           icono: "https://cdn-icons-png.freepik.com/512/7438/7438697.png",   link: ""},
  ];

  elementos.forEach((elem, index) => {
    const node = createNodeElement(elem, index);
    setupNodePosition(node, index, elementos.length);
    setupNodeAnimations(node, index); // Pasamos el índice para el retraso
    DOM.container.appendChild(node);
  });
}

function createNodeElement(element, index) {
  const node = document.createElement("div");
  node.classList.add("nodo", "nodo-hijo");
  node.innerHTML = `<img src="${element.icono}" alt="${element.texto}"><span>${element.texto}</span>`;
  node.style.backgroundColor = element.color;
  node.addEventListener("click", () => {
    window.location.href = element.link;
  });
  
  return node;
}

function setupNodePosition(node, index, totalElements) {
  if (DOM.isMobile()) {
    // Disposición vertical para móvil
    node.style.opacity = "1";
    node.style.display = "flex";
    node.style.setProperty('--x', '0');
    node.style.setProperty('--y', `${index * APP_CONFIG.nodeSettings.spacing}px`);
  } else {
    // Disposición circular para desktop
    const radius = calculateRadius();
    const angle = (index / totalElements) * (2 * Math.PI);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    node.style.setProperty('--x', `${x}px`);
    node.style.setProperty('--y', `${y}px`);
  }
}

function calculateRadius() {
  const screenWidth = window.innerWidth;
  const maxRadius = screenWidth / 2 - 
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nodo-max-size')) / 2;
    
  return Math.max(
    APP_CONFIG.nodeSettings.minRadius,
    Math.min(
      APP_CONFIG.nodeSettings.baseRadius.desktop, // Usamos el radio base configurado
      maxRadius
    )
  );
}

function setupNodeAnimations(node, index, isRemoving = false) {
  node.style.opacity = "1";
  node.style.display = "flex";

  if (!DOM.isMobile()) {
    // Animación para pantallas grandes (> 768px)
    const delay = index * 0.1; // Retraso de 0.1s entre cada nodo
    node.style.animation = `${APP_CONFIG.animations.enterDesktop} ${delay}s forwards`;
  } else {
    // Animación para móviles
    const delay = index * 0.2; // Retraso de 0.2s entre cada nodo

    if (isRemoving) {
      // Animación de salida (Slide Up + Bounce)
      node.style.animation = `slideUpBounce 0.6s ease ${delay}s forwards`;
    } else {
      // Animación de entrada (Slide Down + Bounce)
      node.style.animation = `slideDownBounce 0.6s ease ${delay}s forwards`;
    }
  }
}

// Eliminación de nodos hijos
function removeChildNodes() {
  DOM.mainNode.style.animation = APP_CONFIG.animations.spinInfinite;

  DOM.nodes().forEach((node, index) => {
    // Modificar esta parte
    const animation = DOM.isMobile() ? 
      "none" : // Desactivar animación en móvil
      `${APP_CONFIG.animations.exitDesktop} ${index * 0.01}s`;

    node.style.animation = animation;
    node.classList.add('exit');

    node.addEventListener('animationend', () => {
      node.remove();
      if (DOM.nodes().length === 0) {
        DOM.mainNode.style.animation = APP_CONFIG.animations.pulse;
      }
    }, { once: true });

    // Forzar eliminación inmediata en móvil
    if (DOM.isMobile()) {
      node.remove();
    }
  });
}

function startMainNodeAnimation() {
  DOM.mainNode.style.animation = APP_CONFIG.animations.spin;
  DOM.mainNode.addEventListener('animationend', () => {
    DOM.mainNode.style.animation = APP_CONFIG.animations.pulse;
  }, { once: true });
}

// Instrucciones
function showInstructions() {
  const isDarkMode = document.body.classList.contains('dark-mode');

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
    confirmButtonColor: isDarkMode ? '#33CC66' : '#182349', // Color del botón según el modo
    customClass: {
      popup: isDarkMode ? 'swal-dark' : 'swal-light', // Clase personalizada para el modo oscuro/claro
      title: isDarkMode ? 'swal-title-dark' : 'swal-title-light', // Clase para el título
      htmlContainer: isDarkMode ? 'swal-html-dark' : 'swal-html-light', // Clase para el contenido
    },
    background: isDarkMode ? '#17202a' : '#F5F7FB', // Fondo del SweetAlert
    color: isDarkMode ? '#FFFFFF' : '#2D3436', // Color del texto
  });
}

// Inicializar la aplicación
initApp();