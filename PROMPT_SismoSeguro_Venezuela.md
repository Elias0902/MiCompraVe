# Prompt inicial — SismoSeguro Venezuela

> Pega este texto completo al comenzar el nuevo chat.

---

Actúa como un **Desarrollador Senior especializado en Arquitectura Web y UX para aplicaciones críticas**. Vamos a construir **"SismoSeguro Venezuela"**, una aplicación web de monitoreo sísmico en tiempo real para el territorio venezolano. Trabajaremos de forma iterativa: por partes, mostrando avances y ajustando.

## 1. Objetivo
Dar a los ciudadanos información sísmica precisa y alertas (de eventos recientes/ocurridos) de forma **ligera, rápida y de altísima legibilidad**, pensada para situaciones de emergencia. **Mobile First** y luego escritorio.

## 2. Arquitectura y stack (respétalo)
- **HTML5 + CSS3 + JavaScript puro (Vanilla)**. Sin frameworks.
- **PWA** instalable: `manifest.json` + Service Worker (cachea el app shell, fallback offline, funciona sin conexión mostrando los últimos datos guardados).
- **Sin registro ni base de datos de usuarios.** Toda la configuración se guarda en `localStorage`.
- Consume **APIs públicas directamente desde el cliente** (Fetch API, asíncrono, con manejo de errores y estados de carga).
- **Mapas:** Leaflet.js (vía CDN).
- **Alertas:** Web Notifications API (notificaciones del navegador).
- **Estructura modular de carpetas:**
  ```
  /index.html
  /manifest.json
  /service-worker.js
  /css/   (styles.css, y parciales si hace falta)
  /js/    (app.js, api.js, map.js, notifications.js, ui.js, storage.js)
  /assets/ (íconos, logo)
  ```

## 3. Fuentes de datos (verifícalas ANTES de programar)
Antes de escribir código, **prueba los endpoints reales** y mira la estructura que devuelven; construye los parsers según lo observado, no según suposiciones.
- **USGS (principal, confiable y con CORS):**
  - Feeds en vivo (GeoJSON): `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson` (también `all_day`, `2.5_day`, `4.5_week`, etc.).
  - Consulta filtrada por Venezuela (bounding box aprox. lat 0.5–12.5, lon −73.5 a −59.5):
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=...&minlatitude=0.5&maxlatitude=12.9&minlongitude=-73.5&maxlongitude=-59.5&minmagnitude=...`
  - Campos útiles: `properties.mag`, `properties.place`, `properties.time`, `properties.url`, `geometry.coordinates` (lon, lat, profundidad), `id`.
- **FUNVISIS** (organismo oficial venezolano): menciónalo como referencia, pero **verifica si expone una API pública con CORS**; si no, usa USGS como fuente principal y déjalo documentado.
- Si una API no es accesible por CORS desde el cliente, **dilo claramente** y propón alternativa; no inventes datos.

## 4. Funcionalidades (mobile-first)
1. **Inicio / Lista de sismos recientes:** magnitud (grande, con color por escala), lugar, profundidad, hora relativa ("hace 12 min"), y distancia aproximada si el usuario da permiso de ubicación (opcional, nunca obligatorio).
2. **Mapa (Leaflet):** marcadores escalados y coloreados por magnitud, popup con detalle, centrado en Venezuela.
3. **Detalle del evento:** magnitud, profundidad, coordenadas, hora exacta, enlace a la fuente (USGS).
4. **Filtros:** magnitud mínima, periodo (última hora / día / semana), y "solo Venezuela / toda la región".
5. **Alertas (Web Notifications):** notificar cuando entra un sismo nuevo por encima de un **umbral de magnitud configurable**. Polling eficiente (intervalo configurable, p. ej. 60 s), **deduplicado por `id`** para no repetir. Pausar el polling cuando la pestaña no está visible (`visibilitychange`).
6. **Configuración:** umbral de magnitud para alertas, periodo por defecto, activar/desactivar notificaciones (con flujo de permiso), tema, región. Todo en `localStorage`.
7. **Estado "todo tranquilo":** mensaje claro y tranquilizador cuando no hay sismos relevantes recientes.
8. **¿Qué hacer?** guía breve de seguridad: antes, durante y después de un sismo.
9. **Indicador de última actualización** y manejo de reconexión / errores de red.

## 5. UX de emergencia (prioridad alta)
- **Alto contraste** y **legibilidad inmediata bajo estrés**: tipografía grande, jerarquía clara, tap targets amplios.
- **Escala de color por magnitud** consistente en lista y mapa, por ejemplo: < 3 verde · 3–4.4 amarillo · 4.5–5.9 naranja · ≥ 6 rojo. Incluye una leyenda.
- Accesibilidad: roles ARIA, contraste AA, funciona con texto ampliado.
- Define una **identidad visual** sobria y seria (no juguetona): propón paleta, logo simple (SVG) y nombre en el header.

## 6. Rendimiento
- Nada de recargas completas: actualiza el DOM de forma incremental.
- Uso eficiente de `setInterval`/eventos; pausar en segundo plano.
- Cargar Leaflet y dependencias solo desde CDN; mantener el bundle mínimo.

## 7. Cómo quiero que trabajemos (igual que en mi proyecto anterior)
- **Primero hazme 2–4 preguntas de aclaración** (alcance, prioridades, qué incluir en la primera versión) antes de construir.
- **Verifica las APIs reales** con pruebas antes de codear y enséñame la estructura que devuelven.
- **Construye por partes**, muéstrame una **vista previa** del diseño y vamos iterando.
- **Crea archivos reales** (no solo pegues código en el chat), con la estructura modular indicada y **comentarios en español**.
- **Verifica** que el código corre / no tiene errores de sintaxis, y sé **honesto con las limitaciones** (CORS, exactitud de datos, cobertura).
- Guarda preferencias en `localStorage`. Mobile-first y luego escritorio.

## 8. Entregable de la primera iteración
Una PWA funcional con: lista de sismos recientes de Venezuela (USGS), mapa Leaflet, filtro por magnitud/periodo, y la base de notificaciones. Empecemos por confirmar el alcance y verificar el feed de USGS.
