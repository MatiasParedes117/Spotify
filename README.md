# Taller de Programación

## Ejercicio: Clon visual de Spotify

## Objetivo

Reproducir, con la mayor fidelidad posible, la interfaz de Spotify:

https://open.spotify.com/

El objetivo es crear un **clon visual y de interacción** de Spotify utilizando vibe coding.

No se pide implementar el backend real de Spotify, reproducción real de música, cuentas, pagos ni servicios de Spotify. Se busca reproducir la experiencia visual y las principales interacciones de la aplicación.

---

## Alcance mínimo (obligatorio)

Clonar la interfaz principal de Spotify, incluyendo:

### 1. Barra lateral

* Logo de Spotify.
* Inicio.
* Buscar.
* Tu biblioteca.
* Playlists.
* Opciones para crear playlist.
* Otros elementos visibles en la interfaz actual.
* Estados hover y activo.

### 2. Contenido principal

* Sección de bienvenida.
* Artistas populares.
* Álbumes populares.
* Playlists recomendadas.
* Música recientemente reproducida.
* Cards con imágenes, títulos y descripciones.
* Hover sobre las cards.
* Botón de reproducción al pasar el mouse.

### 3. Reproductor inferior

Crear un reproductor visual similar al de Spotify con:

* Canción actual.
* Artista.
* Imagen del álbum.
* Botón Play/Pause.
* Anterior / siguiente.
* Barra de progreso.
* Volumen.
* Controles adicionales.

No es necesario que reproduzca música realmente.

### 4. Header

* Navegación.
* Botones de atrás y adelante.
* Buscar.
* Perfil.
* Botones o acciones visibles en la interfaz.

### 5. Responsive

Adaptar la interfaz para:

* Desktop.
* Tablet.
* Móvil.

En móvil, adaptar la barra lateral y el reproductor de acuerdo con el diseño de Spotify.

---

## Alcance extra (opcional, suma puntos)

* Reproductor funcional con una canción local.
* Playlists interactivas.
* Buscador simulado.
* Página de artista.
* Página de álbum.
* Página de playlist.
* Menú contextual.
* Animaciones y transiciones.
* Cambio entre diferentes secciones.
* Sidebar colapsable.
* Modo responsive más avanzado.

---

## Requisitos técnicos

* HTML5 semántico.
* TailwindCSS 4.2.
* JavaScript solo cuando sea necesario.
* Responsive Design.
* Componentes reutilizables.
* Código organizado y fácil de mantener.

Se permite utilizar herramientas de IA para generar código, modificar componentes, corregir errores y acelerar el desarrollo mediante **vibe coding**.

El estudiante debe comprender y poder explicar el código generado.

No vale utilizar un screenshot ni un iframe de Spotify.

---

## Imágenes y recursos

Para la práctica local se pueden utilizar imágenes y recursos similares a los utilizados por Spotify.

Si el proyecto se publica:

* Utilizar imágenes propias, placeholders o recursos con licencia adecuada.
* No presentar el proyecto como Spotify oficial.
* Indicar en el README que se trata de un clon académico.

---

## Entrega

* Repositorio local.
* README.md.
* Link de preview.
* Instrucciones para ejecutar el proyecto.
* Breve explicación de qué elementos fueron clonados y cuáles fueron simulados.

---

## Criterios de evaluación

* Fidelidad visual (40%)
* Estructura y calidad del código (25%)
* Responsive y usabilidad (20%)
* Detalles de interacción (10%)
* Presentación y README (5%)

---

## Modalidad

Individual.

---

## Aclaración

Este ejercicio es exclusivamente académico.

No se está creando un producto comercial ni se debe hacer pasar el clon por el sitio oficial de Spotify.

El objetivo es practicar desarrollo frontend utilizando **vibe coding**, HTML, TailwindCSS y JavaScript.

---

## Entrega del proyecto

### Estructura de archivos

```
src/
├── index.html                  # Estructura semántica del shell (header global, biblioteca, reproductor, modales)
└── assets/
    ├── css/
    │   ├── input.css           # Fuente de estilos: theme Tailwind 4 y CSS personalizado
    │   └── style.css           # CSS compilado (generado por npm run build:css)
    ├── img/
    │   ├── artists/            # Fotos de artistas (600×600)
    │   ├── albums/             # Portadas de álbumes (600×600)
    │   ├── playlists/          # Portadas de playlists y playlists del usuario
    │   └── genres/             # Imágenes de categorías (900×500)
    └── js/
        ├── icons.js            # Librería de íconos SVG (spotify, home, search, play, etc.)
        ├── store.js            # Persistencia local (localStorage): me gusta, playlists, plan, perfil
        ├── data.js             # Base de datos simulada (artistas, álbumes, playlists, planes, géneros)
        ├── audio.js            # Reproductor: estado, controles y motor de audio (Web Audio API)
        ├── cards.js            # Componentes reutilizables: cards, grids, buscador, biblioteca
        ├── views.js            # Páginas de detalle: playlist, álbum, artista, liked, premium, cuenta
        └── script.js           # Router, delegación de eventos, menú contextual y arranque
package.json                     # Scripts de Tailwind (build:css / watch:css)
```

### Cómo ejecutar

1. Instalar dependencias (una sola vez):

   ```bash
   npm install
   ```

2. Compilar el CSS de Tailwind (se muestra `style.css`):

   ```bash
   npm run build:css
   ```

   Durante el desarrollo, se puede usar el modo de vigilancia:

   ```bash
   npm run watch:css
   ```

3. Servir la carpeta `src/` con cualquier servidor estático y abrir en el navegador:

   ```bash
   python3 -m http.server 8000 --directory src
   # abrir http://localhost:8000
   ```

   El proyecto usa *hash routing* (`#/`, `#/search`, `#/library`, `#/premium`, `#/account`, `#/playlist/...`, `#/album/...`, `#/artist/...`), por lo que funciona servido por HTTP o abriendo `src/index.html` directamente.

### Link de preview

> Preview local: servido con un servidor estático desde la carpeta `src/` (ver instrucciones arriba).
> *(Aquí se puede incluir el enlace de un deploy en Vercel/Netlify/GitHub Pages en caso de publicarlo).*

### Qué fue clonado (visual e interacción)

* **Barra superior global** con logo, botón Inicio, buscador global, botón Premium, instalación, notificaciones y menú de perfil, siempre visible por encima del contenido.
* **Barra lateral de biblioteca** debajo de la barra superior, con playlists, álbumes y artistas guardados, filtros, búsqueda interna, acción de crear playlist y modo colapsado (solo desktop).
* **Contenido principal** con secciones de bienvenida, acceso rápido, «Canciones del momento», artistas populares, álbumes y sencillos populares, playlists recomendadas, banner de Premium y exploración por géneros; tarjetas con portada fotográfica, título, descripción, hover y botón de reproducción al pasar el mouse.
* **Canciones del momento**: fila horizontal de tarjetas con portada, título, artista y reproducción directa dentro de la cola de la lista.
* **Reproductor inferior** con canción actual, artista, portada, play/pause, anterior/siguiente, barra de progreso, volumen, aleatorio, repetición y botón de cola.
* **Header** con logo, botón Inicio, buscador global, campana de notificaciones, plan activo, perfil y menú de perfil.
* **Buscador completo** con resultados agrupados (mejor resultado, canciones, artistas, álbumes, playlists), filtros por tipo, búsquedas recientes, sugerencias y normalización de acentos.
* **Páginas de detalle** de playlist, álbum, artista, canciones que te gustan, género y perfil/cuenta, con portadas fotográficas, fondos ambientados con la imagen del álbum/artista, listas de canciones, acciones y menús contextuales.
* **Imágenes en todo el flujo**: tarjetas, filas de canciones, miniaturas de la biblioteca, cola, reproductor, minirreproductor y pantalla “Now Playing”.
* **Premium** con cuatro planes (Individual, Duo, Familiar y Estudiantes), comparación de características, facturación mensual/anual, checkout simulado, FAQ y gestión del plan desde la cuenta.
* **Cuenta** con datos editables, resumen de suscripción, estadísticas, preferencias, notificaciones y dispositivos simulados.
* **Cola y letra** en un panel lateral con canción actual, próximas canciones y letra sincronizada visualmente (sin audio real).
* **Notificaciones** y menú de perfil funcionales, con estado de lectura.
* **Persistencia local** en `localStorage` (clave `spotify-clone-state-v2`): me gusta, playlists creadas o modificadas, plan contratado, perfil, búsquedas recientes, preferencias, volumen y silencio.
* **Responsive**: desde `lg` se muestra la barra lateral y el reproductor completo; por debajo se usa el layout móvil con minirreproductor, navegación inferior y pantalla "Now Playing".
* **Menú contextual** sobre tarjetas y canciones (Reproducir, Agregar a me gusta, Agregar a playlist, Ir al artista/álbum, Compartir, etc.).
* **Animaciones y transiciones** (fade de vistas, ecualizador animado en la canción activa, hover en cards y botones).
* **Navegación SPA** con historial atrás/adelante entre secciones y atajos de teclado (barra espaciadora, flechas, etc.).

### Qué fue simulado

* **Música**: no hay archivos de audio reales. `audio.js` sintetiza melodías deterministas en tiempo real con la **Web Audio API** (osciladores y envolventes generadas a partir de una semilla por canción). Play/pause, siguiente/anterior, barra de progreso y volumen son totalmente funcionales; el timbre es una aproximación instrumental, no la canción original.
* **Base de datos**: artistas, álbumes, playlists y canciones son datos inventados en `data.js` (catálogo ficticio inspirado en géneros actuales, con nombres que recuerdan a artistas reales).
* **Buscador**: filtra en memoria sobre el catálogo simulado (no consulta ningún servicio).
* **Cuentas y suscripciones**: el registro, el perfil y los planes Premium son simulados. El checkout no procesa pagos reales ni envía datos a ningún servidor; solo guarda la elección en `localStorage`.
* **Persistencia**: `store.js` usa `localStorage` del navegador. No hay backend ni sincronización entre dispositivos; borrar los datos del sitio restablece la aplicación.
* **Portadas e imágenes**: el catálogo usa archivos locales en `src/assets/img/` (fotos de artistas, portadas de álbumes, playlists y categorías). Los degradados CSS (`GRADIENTS`) se conservan como respaldo para playlists nuevas o cuando una imagen no está disponible. No se descargan imágenes de Spotify en tiempo de ejecución.
* **Servicios de red**: no hay llamadas de red; toda la aplicación es estática y local.

### Créditos de las imágenes

* **Artistas**: fotografías obtenidas desde las fichas de Wikipedia/Wikimedia Commons de cada artista. Cada archivo mantiene la licencia de su autor original; se usan aquí con fines académicos y sin ánimo comercial.
* **Álbumes**: portadas de los álbumes referenciados, descargadas localmente desde la API pública de Deezer. Son marcas y obras de sus respectivos titulares; este proyecto académico no las licencia ni las explota comercialmente.
* **Playlists y géneros**: fotografías de [Unsplash](https://unsplash.com/license), usadas bajo su licencia gratuita.
* **Íconos**: SVG propios inspirados en la interfaz de Spotify (`icons.js`).
* Si el proyecto se publica, reemplazar las portadas de álbumes por arte propio o con licencia explícita y agregar la atribución completa de cada fotografía.

### Nota académica

Este es un clon visual e interactivo de Spotify con fines exclusivamente educativos. No está afiliado a Spotify AB, no reproduce música con derechos de autor y no debe presentarse como el sitio oficial ni como un producto comercial. Cumple además con los requisitos de no usar screenshots ni iframes de Spotify.
