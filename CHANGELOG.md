# Changelog

Todos los cambios notables de este proyecto están documentados aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y [Versionado Semántico](https://semver.org/lang/es/).

---

## [1.2.1] — 2026-07-12

### 🔧 Cambiado
- Agregada configuración ESLint para el frontend y exclusión de artefactos generados.
- Generado `frontend/package-lock.json` para instalaciones reproducibles.
- `vite.config.js` ajustado a módulos ES y aliases existentes.
- `README.md` actualizado con el repositorio `Gestion_Academica` y comandos consistentes desde la raíz.

### 🐛 Corregido
- Eliminados imports y variables no usadas detectadas por lint.
- Estabilizadas dependencias de hooks en asistencia y perfil de estudiante.
- `MatriculaService.obtenerMatriculasAnoActual` ahora aplica filtro por `institucion_id` cuando se entrega.

---

## [1.2.0] — 2026-07-10

### ✨ Agregado
- **Módulo Comunicados** — Redacción, búsqueda y filtrado por categoría (Urgente, Académico, General, Eventos). Panel de detalle lateral.
- **Módulo Biblioteca Digital** — Explorador de recursos (PDF, Libro, Video, Enlace) con filtros por materia y formato. Formulario de alta de recursos.
- **`.env.example`** — Plantilla de variables de entorno para facilitar onboarding de nuevos colaboradores.

### 🔧 Cambiado
- `App.jsx` actualizado con rutas `comunicados` y `biblioteca` integradas al router y mapa de títulos.
- `README.md` reescrito para reflejar la estructura real del proyecto.
- `package.json` raíz simplificado: eliminadas dependencias duplicadas, queda solo como task runner.

### 🗑️ Eliminado
- Carpetas vacías: `backend/src/`, `frontend/src/utils`, `frontend/src/assets`, `frontend/src/hooks`.
- Archivos duplicados de configuración raíz: `index.html`, `vite.config.js`, `postcss.config.js`, `tailwind.config.js`, `package-lock.json`.
- `obsidian_export/` raíz (scaffold vacío — contenido real en `.codex/obsidian_export/`).
- `LOG_REFACTORIZACION_CALIFICACIONES.md` y `RESUMEN_REFACTORIZACION.md` (artefactos de sesión de AI).
- `boletines_generados/` (outputs generados, no código fuente).
- `.env` raíz (duplicado con valores placeholder — reemplazado por `.env.example`).
- `.vscode/settings.json` vacío.
- `frontend/src/services/calificacion.service.js` (servicio sin importar en ningún componente).
- `node_modules/` y `dist/` raíz (no pertenecen a la raíz del proyecto).

### 🔄 Reorganizado
- `generar_boletines.py` movido a `backend/` para co-ubicación con los módulos Python.
- Documentación técnica local mantenida en `.codex/obsidian_export/` sin publicarla en Git.
- Agregadas reglas y workflow de Graphify para consultar el grafo local en `graphify-out/`.

---

## [1.1.0] — 2026-07-03

### ✨ Agregado
- **Módulo Control de Asistencia** — Registro diario por grupo con estados Presente/Ausente/Tardanza/Excusa, estadísticas y reporte generado.
- **Módulo Registro de Calificaciones** — Tabla editable por estudiante, materia y período (4 períodos). Semáforo de notas, promedio automático.
- Hook `useCalificaciones.js` con separación de lógica de presentación.

### 🔧 Cambiado
- Refactorización de `RegistroCalificaciones.jsx`: lógica extraída a hook, manejo de errores visual, estado vacío, accesibilidad (aria-labels).

---

## [1.0.0] — 2026-06-24

### ✨ Agregado

#### Módulos Plan Esencial (base)
- **Matrícula Digital** — Inscripción, renovación y actualización de matrículas con validaciones en tiempo real y generación de número único.
- **Gestión Documental** — Subida, clasificación y gestión de documentos con filtros avanzados y alertas de pendientes.
- **Perfil Integral del Estudiante** — Vista 360° con edición inline de información personal y académica.

#### Sistema Multiinstitucional
- Soporte para múltiples instituciones con aislamiento de datos por `institucion_id`.
- 4 planes comerciales: Esencial, Smart, Campus IA, Enterprise.
- Control de acceso a módulos según plan contratado.
- Menú lateral inteligente con módulos bloqueados y modales de upgrade.

#### Base de Datos (Supabase)
- Schema PostgreSQL completo con índices, RLS y vistas.
- Triggers automáticos de auditoría.
- Configuración de Storage para documentos.

#### Infraestructura
- Frontend: React 18 + Vite + Tailwind CSS 3.4.
- Backend Python: Generador de boletines PDF con ReportLab.
- Sistema de diseño con tokens CSS (paleta navy/cream/brown).

---

## Tipos de Cambios
- `✨ Agregado` para nuevas funcionalidades
- `🔧 Cambiado` para cambios en funcionalidades existentes
- `⚠️ Deprecado` para funcionalidades próximas a eliminar
- `🗑️ Eliminado` para funcionalidades removidas
- `🐛 Corregido` para corrección de bugs
- `🔄 Reorganizado` para cambios estructurales sin cambio de funcionalidad
- `🔐 Seguridad` para vulnerabilidades corregidas
