# Mapa Mental Interactivo - Marketing Interno

## Descripción
Sistema de visualización interactiva para conceptos de marketing y gestión empresarial mediante un mapa mental dinámico. Diseñado para funcionar tanto en entorno web como en aplicación Android nativa.

## Características
- Visualización interactiva de nodos con animaciones fluidas
- Diseño completamente responsive (móvil/tablet/desktop)
- Modo oscuro/claro con persistencia
- Sistema de navegación intuitivo
- Visor de infografías con controles de zoom
- Botón de WhatsApp para soporte directo
- Funcionamiento offline
- Transiciones y animaciones optimizadas
- Accesibilidad mejorada (ARIA labels, navegación por teclado)
- Manejo de errores robusto

## Tecnologías
- HTML5
- CSS3 (Flexbox, Grid, Variables CSS)
- JavaScript (ES6+)
- WebView Android
- SweetAlert2 para notificaciones
- PanZoom.js para manipulación de imágenes
- Font Awesome para iconografía

## Estructura del Proyecto
```
/assets
├── index.html              # Página principal
├── css/                    # Estilos
│   ├── base.css           # Estilos base y variables
│   ├── animations.css     # Animaciones y transiciones
│   ├── layout.css        # Estructura y grid
│   ├── header.css        # Estilos del encabezado
│   ├── footer.css        # Estilos del pie de página
│   ├── buttons.css       # Componentes de botones
│   ├── nodes.css         # Estilos de nodos del mapa
│   ├── themes.css        # Temas claro/oscuro
│   ├── responsive.css    # Media queries
│   └── infografia.css    # Estilos del visor de infografías
├── data/                  # Datos de la aplicación
│   ├── mapa.json         # Estructura del mapa mental
│   ├── infografias.json  # Configuración de infografías
│   └── infografias/      # Plantilla única de infografías
│       └── infografia.html
├── imagenes/             # Recursos visuales
│   ├── logo.webp        # Logo principal
│   ├── icons/           # Iconos de navegación
│   └── infografias/     # Imágenes de infografías
├── js/                   # Scripts
│   ├── app.js           # Lógica principal
│   ├── darkMode.js      # Control de tema
│   └── infografia.js    # Visor de infografías
└── README.md            # Documentación
```
MyApplication/                  # Proyecto Android Studio
├── app/                       
│   ├── build/                # Archivos de construcción
│   ├── libs/                 # Librerías externas
│   └── src/
│       └── main/
│           ├── assets/       # Recursos web
│           │   ├── css/      
│           │   ├── data/     
│           │   ├── imagenes/ 
│           │   ├── js/       
│           │   └── index.html
│           ├── java/         # Código Java
│           │   └── com/example/myapplication/
│           │       └── MainActivity.java
│           ├── res/          # Recursos Android
│           │   ├── layout/
│           │   │   └── activity_main.xml
│           │   ├── values/
│           │   └── drawable/
│           └── AndroidManifest.xml
├── gradle/
├── build.gradle              # Configuración Gradle del proyecto
└── app/build.gradle         # Configuración Gradle del módulo

## Estructura del Proyecto Android Studio
```
C:\Users\pdiar\AndroidStudioProjects\MyApplication\  # Raíz del proyecto
├── app\
│   ├── build\                      # Archivos generados
│   ├── libs\                       # Librerías externas
│   └── src\
│       └── main\
│           ├── assets\            # Recursos web
│           │   ├── css\          # Hojas de estilo
│           │   │   ├── animations.css
│           │   │   ├── base.css
│           │   │   ├── buttons.css
│           │   │   ├── footer.css
│           │   │   ├── header.css
│           │   │   ├── infografia.css
│           │   │   ├── layout.css
│           │   │   ├── nodes.css
│           │   │   ├── responsive.css
│           │   │   └── themes.css
│           │   ├── data\         # Datos JSON
│           │   │   ├── infografias.json
│           │   │   ├── mapa.json
│           │   │   └── infografias\
│           │   │       └── infografia.html
│           │   ├── imagenes\     # Recursos visuales
│           │   │   ├── icons\
│           │   │   ├── infografias\
│           │   │   └── logo.webp
│           │   ├── js\           # JavaScript
│           │   │   ├── app.js
│           │   │   ├── darkMode.js
│           │   │   └── infografia.js
│           │   ├── index.html    # Página principal
│           │   └── README.md     # Documentación
│           ├── java\             # Código Java
│           │   └── com\example\myapplication\
│           │       └── MainActivity.java
│           ├── res\              # Recursos Android
│           │   ├── drawable\
│           │   ├── layout\
│           │   │   └── activity_main.xml
│           │   └── values\
│           │       ├── colors.xml
│           │       ├── strings.xml
│           │       └── themes.xml
│           └── AndroidManifest.xml
├── gradle\
│   └── wrapper\
├── .gitignore
├── build.gradle
├── gradle.properties
├── gradlew
├── gradlew.bat
├── local.properties
└── settings.gradle
```

## Rutas Importantes
- **Assets Web**: `app/src/main/assets/`
- **Código Java**: `app/src/main/java/com/example/myapplication/`
- **Recursos Android**: `app/src/main/res/`
- **Manifest**: `app/src/main/AndroidManifest.xml`
- **Build Config**: `app/build.gradle`

## Requisitos del Sistema
- Android 7.0 (API 24) o superior
- WebView actualizado
- 2GB RAM mínimo recomendado
- 50MB espacio disponible

## Funcionalidades Principales
1. **Mapa Mental**
   - Navegación circular en desktop
   - Navegación vertical en móvil
   - Animaciones suaves
   - Persistencia de estado

2. **Visor de Infografías**
   - Zoom in/out
   - Reset de vista
   - Modo oscuro independiente
   - Controles táctiles y de mouse
   - Botón de ayuda contextual

3. **Integración WhatsApp**
   - Contacto directo con administración
   - Mensaje predefinido
   - Compatibilidad multiplataforma

## Configuración para Desarrollo
1. Clonar el repositorio
2. Abrir en Android Studio
3. Verificar SDK mínimo (API 24)
4. Sincronizar Gradle
5. Ejecutar en emulador o dispositivo físico

## Configuración Android Studio
1. **Requisitos del IDE**
   - Android Studio Hedgehog | 2023.1.1 o superior
   - JDK 17 o superior
   - SDK Android 33 (mínimo API 24)

2. **Configuraciones Gradle**
   ```gradle
   android {
       namespace = "com.example.myapplication"
       compileSdk = 35
       
       defaultConfig {
           minSdk = 24
           targetSdk = 35
           versionCode = 1
           versionName = "1.0"
       }
   }
   ```

3. **Permisos AndroidManifest**
   ```xml
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

4. **Configuración WebView**
   - Hardware Acceleration habilitado
   - JavaScript habilitado
   - Local File Access permitido
   - Cache habilitado
   - DOM Storage habilitado

## Desarrollo en Android Studio

### Preparación del Entorno
1. Instalar Android Studio
2. Configurar SDK Android
3. Configurar emulador o dispositivo físico
4. Importar proyecto

### Compilación y Ejecución
1. Clean Project: `Build > Clean Project`
2. Rebuild Project: `Build > Rebuild Project`
3. Run: `Run > Run 'app'`

### Debug
1. Logcat para monitoreo
2. Chrome DevTools para WebView
3. Android Debug Bridge (ADB)

### Optimizaciones Android
- Hardware Acceleration
- WebView Pool
- Memoria optimizada
- Caché gestionado
- Estado preservado

## Optimizaciones
- Imágenes en formato WebP
- Carga diferida de recursos
- Caché local para funcionamiento offline
- Manejo de memoria optimizado
- Compresión de assets

## Mantenimiento
- Limpiar caché: `Settings > Apps > MyApplication > Storage > Clear Cache`
- Actualizar WebView: Play Store
- Verificar permisos: Storage, Internet (opcional)

## Soporte
- Contacto directo vía WhatsApp
- Issues en repositorio
- Documentación técnica disponible

## Licencia
Todos los derechos reservados © 2025 Marketing Interno