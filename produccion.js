import { toggleDarkMode } from './darkMode.js';

document.getElementById("nodo-principal").addEventListener("click", function() {
    const container = document.querySelector(".mapa-container");
    let nodos = document.querySelectorAll(".nodo-hijo");

    if (nodos.length === 0) {
        const elementos = [
            { texto: "Infografía de prueba", icono:"https://cdn-icons-png.freepik.com/512/1581/1581942.png", link: "infografia.html"},
            { texto: "2", icono: "https://cdn-icons-png.freepik.com/512/18191/18191216.png", link: ""},
            { texto: "3", icono: "https://cdn-icons-png.freepik.com/512/10908/10908520.png", link: ""},
            { texto: "4", icono: "https://cdn-icons-png.freepik.com/512/778/778631.png", link: ""},
            { texto: "5", icono: "https://cdn-icons-png.freepik.com/512/16517/16517493.png", link: ""},
            { texto: "6", icono: "https://cdn-icons-png.freepik.com/512/1022/1022382.png", link: ""},
            { texto: "7", icono: "https://cdn-icons-png.freepik.com/512/13339/13339430.png", link: ""},
            { texto: "8", icono: "https://cdn-icons-png.freepik.com/512/780/780477.png", link: ""},
            { texto: "9", icono: "https://cdn-icons-png.freepik.com/512/18771/18771476.png", link: ""},
        ];

        let screenWidth = window.innerWidth;
        let baseRadius = screenWidth > 768 ? 300 : 130;
        let minRadius = 100;
        let maxRadius = screenWidth / 2 - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nodo-max-size')) / 2;
        let radius = Math.max(minRadius, Math.min(baseRadius, maxRadius));

        elementos.forEach((elem, i) => {
            let nodo = document.createElement("div");
            nodo.classList.add("nodo", "nodo-hijo");
            nodo.innerHTML = `<img src="${elem.icono}" alt="${elem.texto}"><span>${elem.texto}</span>`;
            nodo.style.backgroundColor = elem.color;
            nodo.addEventListener("click", function() {
                window.location.href = elem.link;
            });
            container.appendChild(nodo);

            let angle = (i / elementos.length) * (2 * Math.PI);
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            nodo.style.setProperty('--x', `${x}px`);
            nodo.style.setProperty('--y', `${y}px`);
            nodo.style.opacity = "1";
            nodo.style.display = "flex";
        });
    } else {
        nodos.forEach(nodo => nodo.remove());
    }
});

document.getElementById("toggleDarkMode").addEventListener("click", toggleDarkMode);
