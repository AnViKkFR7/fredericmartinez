Construye la web completa siguiendo estrictamente estas instrucciones. Lee TODOS los archivos de referencia antes de escribir una sola línea de código.

1. ARCHIVOS DE REFERENCIA — léelos en este orden
/archivos_secretos/Project_context.md
— entiende el propósito del proyecto, las secciones y la lógica general antes de cualquier otra cosa

/archivos_secretos/DB_SCHEMA.sql
— entiende la estructura completa de tablas, relaciones y tipos de datos

/archivos_secretos/inputs_frederic_normalized.sql
— ÚNICA fuente de verdad para todos los contenidos de la web; lee el modelo conceptual explicado más abajo antes de interpretarlo

/lookalike/Guía visual.txt
— paleta de colores, tipografías, espaciados y reglas visuales; respétalas al 100%

/lookalike/ (todas las imágenes de mockup)
— la web debe ser visualmente idéntica a lo que muestran; los textos NO provienen de estas imágenes sino de Supabase (ver sección 4)

2. STACK Y ARQUITECTURA
Remix + Vite + React 18 + TypeScript (strict)
Arquitectura basada en componentes funcionales y hooks
Alias ~/* → ./app/* ya configurado en el proyecto
Estructura de carpetas: app/components/, app/hooks/, app/lib/, app/routes/, app/styles/, app/types/
3. PESTAÑAS / RUTAS
Crea ÚNICAMENTE las pestañas que aparecen en los mockups de /lookalike/. No inventes ni añadas secciones.
Cada pestaña es una ruta de Remix con su propio archivo en app/routes/.

4. MODELO DE CONTENIDOS — CÓMO LEER inputs_frederic_normalized.sql
Los contenidos NO son un JSON estático. Están modelados como entidades editables en Supabase con esta lógica de tres niveles:

Nivel 1 — items
Cada item es una unidad de contenido editable identificada por su item_type:

web_section → sección estructural de la web (Home, Sobre mí, Proyectos, Servicios, Global)
Guarda contenido de cabecera y contexto de sección. NO guarda tarjetas individuales.
Dentro encontrarás: identidad de sección (clave técnica), hero (título/subtítulo/descripción),
bloques narrativos, CTAs, metadatos SEO, elementos globales reutilizables y colecciones
simples de texto cuando aplica (por ejemplo, textos de un carrusel textual).

web_project_case → un caso de portfolio individual, autónomo y ordenable.
Dentro encontrarás: referencia a su sección funcional, orden de presentación,
título, cliente, descripción (problema/enfoque), resultado, y tags de clasificación.

web_service → un servicio individual, autónomo y ordenable.
Dentro encontrarás: referencia a su sección de servicios, orden de visualización,
título y descripción (propuesta de valor).

Nivel 2 — attribute_definitions
Define el "schema lógico" de cada tipo de item: qué atributos existen y de qué tipo son.
Léelo para saber qué keys buscar en el nivel 3.

Nivel 3 — attribute_values
Contiene los valores concretos de cada item. Es donde están los textos, títulos,
descripciones y metadatos reales que debes mostrar en la web.

Para entender mejor el modelado de la base de datos revisa los ficheros DB_SCHEMA.sql y inputs_frederic_normalized.sql y Project_context.md para endender la logica detras de la BDD si no la entiendes solo con los SQL.
Cómo mapear datos a componentes
Las secciones (hero, narrativa, CTAs) se renderizan con los items de tipo web_section
Las tarjetas de portfolio se generan iterando los items de tipo web_project_case, ordenados por su campo de orden
Las tarjetas de servicios se generan iterando los items de tipo web_service, ordenados por su campo de orden
Puedes añadir o reordenar proyectos/servicios sin cambiar el esquema: la UI se adapta dinámicamente
Cómo obtener los datos en Remix
Usa los loader de cada ruta para consultar Supabase
Instala y configura el cliente de Supabase: @supabase/supabase-js
Lee las credenciales desde variables de entorno: SUPABASE_URL y SUPABASE_ANON_KEY
Crea un cliente reutilizable en app/lib/supabase.server.ts
En cada loader, consulta los items y attribute_values necesarios para esa ruta y pásalos al componente vía useLoaderData()
Crea helpers tipados en app/lib/content.server.ts para encapsular las queries y el mapeo de attribute_values a objetos limpios
Define las interfaces TypeScript de los contenidos resultantes en app/types/index.ts
5. GUÍA VISUAL
Usa exclusivamente los colores definidos en /lookalike/Guía visual.pdf. Defínelos como variables CSS en app/styles/global.css
Usa exclusivamente las fuentes mencionadas en /lookalike/Guía visual.pdf. Impórtalas desde Google Fonts o donde indique la guía. No uses ninguna otra fuente
Respeta los espaciados, tamaños de texto, pesos tipográficos y radios de borde que aparecen en la guía
La web debe ser visualmente idéntica a los mockups de /lookalike/
Los textos visibles en los mockups son solo referencia de layout; el contenido real viene de Supabase
6. IMÁGENES
Las imágenes (fondo y tarjetas) no están disponibles todavía. Para cada imagen que falte:

Sustituye el <img> por un <div> con background-color de un color similar al que tendría la imagen real según el mockup
Dale las mismas dimensiones y proporciones que tendría la imagen
Añade un comentario {/* TODO: reemplazar por imagen real */} encima de cada div placeholder
7. RESPONSIVE
La web debe funcionar correctamente en mobile (320px+), tablet (768px+) y desktop (1280px+)
Usa CSS custom properties y media queries; no uses ningún framework de estilos externo
Los layouts deben adaptarse según los mockups; si el mockup no especifica versión móvil, interpreta la adaptación más lógica
8. BOTONES E INTERACTIVIDAD
Todos los botones y CTAs deben tener estados hover atractivos y muy visuales
Copia el estilo y la física de las animaciones de hover de esta web: https://aeline.webflow.io/about-us/about-us
— observa especialmente: el movimiento magnético, el desplazamiento de texto/icono al hacer hover, los transitions suaves con easing personalizado
Implementa estas animaciones con CSS puro (transition, transform, clip-path) o con pequeños hooks de React cuando el efecto requiera JavaScript
Usa cubic-bezier personalizados, no ease o linear genéricos
9. CAROUSELS LINEALES (tipo cinta infinita)
Los carousels lineales deben moverse automáticamente hacia la derecha a velocidad lenta
El movimiento es continuo e infinito: cuando el último elemento sale por la derecha, vuelve a entrar por la izquierda sin salto visible
Copia la física y el estilo visual de los carousels de: https://www.osmo.supply/
— observa el ritmo, el easing, el espaciado entre elementos y cómo se duplican los items para crear el efecto de loop
Implementa el loop duplicando los elementos en el DOM y usando una animación CSS @keyframes con translateX
No uses ninguna librería de carousel externa; impleméntalo desde cero
Los textos dentro de estos carousels provienen del campo correspondiente en los attribute_values de su web_section
10. CAROUSELS CIRCULARES
Los carousels circulares deben girar automáticamente en el sentido de las agujas del reloj a velocidad lenta y constante
El movimiento debe ser continuo, sin pausas ni saltos
Copia el estilo visual de los carousels de: https://www.osmo.supply/
Implementa la rotación con CSS @keyframes y transform: rotate()
11. CAROUSEL DE LA PESTAÑA "SOBRE MÍ" — control manual
Este carousel NO se mueve automáticamente
El usuario lo controla manualmente: arrastrar con ratón (drag), swipe táctil en móvil y tablet
Copia exactamente el sistema de interacción de: https://www.osmo.supply/product/page-transition-course
— observa la inercia al soltar, el snapping a cada slide, la resistencia en los extremos
Implementa el drag con onMouseDown / onMouseMove / onMouseUp y el swipe con onTouchStart / onTouchMove / onTouchEnd
Crea un hook personalizado app/hooks/useDragCarousel.ts que encapsule toda la lógica
El carousel debe mostrar navegación visual (puntos o flechas) que refleje el slide activo
El contenido de cada slide proviene de los attribute_values del item web_section correspondiente a "Sobre mí"
12. ANIMACIONES GENERALES
Todas las animaciones deben sentirse fluidas y premium
Usa will-change: transform solo donde sea necesario para rendimiento
Respeta prefers-reduced-motion: si el usuario tiene activada esta preferencia, desactiva o reduce todas las animaciones
13. TYPESCRIPT
Todos los componentes y hooks deben estar completamente tipados
No uses any; usa unknown o tipos explícitos
Define en app/types/index.ts:
Las interfaces del modelo de datos de Supabase (Item, AttributeDefinition, AttributeValue)
Las interfaces de negocio ya mapeadas (WebSection, ProjectCase, WebService) que son las que usan los componentes
Los loaders de Remix deben tener sus tipos de retorno explícitos
14. ORGANIZACIÓN DEL CÓDIGO
Un componente por archivo
app/lib/supabase.server.ts — cliente de Supabase (solo server-side)
app/lib/content.server.ts — helpers tipados para consultar y mapear los contenidos (queries + transformación de attribute_values a objetos limpios)
Los carousels son componentes propios: app/components/ui/CarouselLinear.tsx, app/components/ui/CarouselCircular.tsx, app/components/ui/CarouselManual.tsx
Los hooks de animación/interacción en app/hooks/
Las variables CSS y el reset en app/styles/global.css
Sin comentarios obvios; solo comenta lógica no evidente
15. LO QUE NO DEBES HACER
No hardcodees ningún texto, título ni descripción en el JSX (solo los textos del header y de los botones); todo viene de Supabase vía loader
No uses los textos que aparecen visualmente en los mockups de /lookalike/ como fuente de contenido (solo los textos del header y de los botones); solo como referencia de layout
No instales librerías de carousel (Swiper, Embla, Splide…)
No instales librerías de animación (Framer Motion, GSAP, Anime.js…)
No uses Tailwind ni ningún framework CSS externo
No crees pestañas o secciones que no estén en los mockups de /lookalike/
No uses any en TypeScript
No uses fuentes distintas a las de la guía visual
RESULTADO ESPERADO
Una web Remix funcional que:

Arranca sin errores con npm run dev
Pasa npm run typecheck sin errores
Es visualmente idéntica a los mockups de /lookalike/
Obtiene todos los contenidos dinámicamente de Supabase usando el modelo de inputs_frederic_normalized.sql
Tiene todos los carousels y animaciones implementados según las referencias dadas
Es completamente responsive
Escala limpiamente: añadir un nuevo proyecto o servicio en Supabase lo hace aparecer en la web sin tocar código