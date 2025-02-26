import { toggleDarkMode, loadDarkModePreference } from './darkMode.js';

// ==================================================
// Código de las burbujas
// ==================================================
const bubblesContainer = document.querySelector('.bubbles');

function createBubbles() {
  const bubbleCount = 50; // Número de burbujas
  const colors = [
    "#28b463", "#d4ac0d", "#f06292", "#9fa8da", "#ef9a9a",
    "#f57c00", "#aeb6bf", "#42a5f5", "#a1887f", "#4db6ac"
  ]; // Colores de los nodos hijos

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    // Asignar propiedades aleatorias a cada burbuja
    const size = Math.random() * 40 + 20; // Tamaño entre 20px y 60px
    const left = Math.random() * 100; // Posición horizontal aleatoria
    const delay = Math.random() * 5; // Retraso de la animación
    const duration = Math.random() * 10 + 5; // Duración de la animación entre 5s y 15s
    const color = colors[Math.floor(Math.random() * colors.length)]; // Color aleatorio

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDelay = `${delay}s`;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.backgroundColor = color; // Asignar color

    bubblesContainer.appendChild(bubble);
  }
}

// Llamar a la función para crear las burbujas
createBubbles();

// ==================================================
// Resto del código de la aplicación
// ==================================================
const APP_CONFIG = {
  nodeSettings: {
    baseRadius: {
      desktop: 500, // Ajusta este valor para cambiar el radio en desktop
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
  node.addEventListener("click", () => {
    // Activar la transición de página antes de redirigir
    DOM.pageTransition.classList.add("active");
    setTimeout(() => {
      window.location.href = element.link;
    }, 300); // Ajusta el tiempo según la duración de la animación
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