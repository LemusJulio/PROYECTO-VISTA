// Módulo para manejar el modo oscuro
export function toggleDarkMode() {
    const body = document.body;
    const button = document.getElementById('toggleDarkMode');
    
    // Alternar la clase dark-mode
    body.classList.toggle('dark-mode');
    
    // Actualizar el texto del botón
    if (body.classList.contains('dark-mode')) {
      button.textContent = 'Modo Claro';
      localStorage.setItem('darkMode', 'enabled');
    } else {
      button.textContent = 'Modo Oscuro';
      localStorage.setItem('darkMode', 'disabled');
    }
  }
  
  // Función para cargar la preferencia de modo oscuro al iniciar
  export function loadDarkModePreference() {
    const darkModePreference = localStorage.getItem('darkMode');
    const button = document.getElementById('toggleDarkMode');
    
    if (darkModePreference === 'enabled') {
      document.body.classList.add('dark-mode');
      button.textContent = 'Modo Claro';
    }
  }
  
  // Inicializar el modo oscuro según la preferencia guardada
  document.addEventListener('DOMContentLoaded', loadDarkModePreference);