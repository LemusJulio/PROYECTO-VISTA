import { toggleDarkMode } from './darkMode.js';

// Configuración global
const APP_CONFIG = {
  nodeSettings: {
    baseRadius: {
      desktop: 300,
      mobile: 0 // Usaremos disposición vertical
    },
    minRadius: 100,
    spacing: 120 // Espacio entre nodos en móvil
  },
  animations: {
    spin: "spinAndGlow 1s ease-in-out",
    pulse: "pulse 2s infinite",
    spinInfinite: "spinAndGlowInfinite 0.5s linear infinite",
    exitDesktop: "spiralExit 1.45s ease-in-out forwards",
    exitMobile: "fadeOutDown 0.5s ease forwards",
    enterDesktop: "bounceOut 0.3s ease-in-out forwards",
    enterMobile: "fadeInUp 0.5s ease forwards"
  }
};

// Elementos de la aplicación
const DOM = {
  container: document.querySelector(".mapa-container"),
  mainNode: document.getElementById("nodo-principal"),
  nodes: () => document.querySelectorAll(".nodo-hijo"),
  isMobile: () => window.innerWidth <= 768
};

// Funcionalidad principal
function initApp() {
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
    { texto: "Producción", icono: "https://cdn-icons-png.freepik.com/512/2973/2973740.png", link: "produccion.html"},
    { texto: "Operación y Logística", icono: "https://cdn-icons-png.freepik.com/512/18191/18191216.png", link: "operacion_logistica.html"},
    { texto: "Dirección General", icono: "https://cdn-icons-png.freepik.com/512/10908/10908520.png", link: "direccion_general.html"},
    { texto: "Tecnología", icono: "https://cdn-icons-png.freepik.com/512/778/778631.png", link: "tecnologia.html"},
    { texto: "Sistema de Gestión", icono: "https://cdn-icons-png.freepik.com/512/16517/16517493.png", link: "gestion_calidad.html"},
    { texto: "Seguridad", icono: "https://cdn-icons-png.freepik.com/512/1022/1022382.png", link: "seguridad.html"},
    { texto: "Administración", icono: "https://cdn-icons-png.freepik.com/512/13339/13339430.png", link: "administracion.html"},
    { texto: "TIC's", icono: "https://cdn-icons-png.freepik.com/512/780/780477.png", link: "tics.html"},
    { texto: "Almacén General", icono: "https://cdn-icons-png.freepik.com/512/18771/18771476.png", link: "almacen.html"},
    { texto: "Compras", icono: "https://cdn-icons-png.freepik.com/512/7438/7438697.png", link: "compras.html"}
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
  node.addEventListener("click", () => window.location.href = element.link);
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
    node.style.setProperty('--x', `${radius * Math.cos(angle)}px`);
    node.style.setProperty('--y', `${radius * Math.sin(angle)}px`);
  }
}

function calculateRadius() {
  const screenWidth = window.innerWidth;
  const maxRadius = screenWidth / 2 - 
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nodo-max-size')) / 2;
    
  return Math.max(
    APP_CONFIG.nodeSettings.minRadius,
    Math.min(
      screenWidth > 768 ? APP_CONFIG.nodeSettings.baseRadius.desktop : APP_CONFIG.nodeSettings.baseRadius.mobile,
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
    const animation = DOM.isMobile() ? 
      APP_CONFIG.animations.exitMobile : 
      `${APP_CONFIG.animations.exitDesktop} ${index * 0.01}s`;

    node.style.animation = animation;
    node.classList.add('exit');

    node.addEventListener('animationend', () => {
      node.remove();
      if (DOM.nodes().length === 0) {
        DOM.mainNode.style.animation = APP_CONFIG.animations.pulse;
      }
    }, { once: true });
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
  Swal.fire({
    title: '¿Cómo funciona?',
    html: `
      <div style="text-align: left">
        <p>1. Presiona el círculo central con el logo de Diseño Visual para desplegar las áreas de la empresa.</p>
        <p>2. Cada área tiene sus procedimientos.</p>
        <p>3. Al oprimir el círculo del área de tu interés, te enviará a otro mapa, dónde encontrarás los procedimientos del área correspondiente.</p>
        <p>4. Siempre en la parte superior de la pantalla tendrás un botón para hacer el fondo oscuro para tu cómodidad.</p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#33CC66',
    customClass: {
      popup: 'swal-wide'
    }
  });
}

// Inicializar la aplicación
initApp();