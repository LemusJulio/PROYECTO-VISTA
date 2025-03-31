// Módulo para manejar el modo oscuro
export function toggleDarkMode() {
    const body = document.body;
    const button = document.getElementById('toggleDarkMode');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        button.textContent = 'Modo Claro';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        button.textContent = 'Modo Oscuro';
        localStorage.setItem('darkMode', 'disabled');
    }
}

export function loadDarkModePreference() {
    const darkModePreference = localStorage.getItem('darkMode');
    const button = document.getElementById('toggleDarkMode');
    
    if (darkModePreference === 'enabled') {
        document.body.classList.add('dark-mode');
        button.textContent = 'Modo Claro';
    }
}