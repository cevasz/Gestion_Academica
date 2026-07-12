# 🎓 Sistema de Digitalización Institucional

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Plataforma SaaS para la digitalización y gestión integral de instituciones educativas en Colombia. Sistema multiinstitucional con 4 planes escalonados y módulos especializados por área.

---

## 🗂️ Estructura del Proyecto

```
proyecto/
├── frontend/               # Aplicación React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Módulos funcionales (UI)
│   │   ├── pages/          # Páginas de nivel superior
│   │   ├── contexts/       # Estado global (AppContext)
│   │   ├── constants/      # Configuración de planes y módulos
│   │   ├── services/       # Capa de acceso a Supabase
│   │   └── config/         # Configuración de Supabase
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                # Utilidades Python del servidor
│   ├── boletines/          # Generador de boletines PDF (ReportLab)
│   └── generar_boletines.py
│
├── supabase_schema.sql     # Schema completo de PostgreSQL
├── supabase_storage_setup.md
├── .env.example            # Variables de entorno de referencia
├── package.json            # Task runner raíz (delega a frontend/)
└── .agents/                # Reglas y workflows locales para agentes
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js ≥ 18
- Cuenta en [Supabase](https://supabase.com/)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/cevasz/Gestion_Academica.git
cd Gestion_Academica

# Configurar variables de entorno
cp .env.example frontend/.env
# Editar frontend/.env con tus credenciales de Supabase

# Instalar dependencias del frontend
npm install --prefix frontend

# Iniciar en modo desarrollo (desde la raíz)
npm run dev
```

### Base de datos

```bash
# En el panel de Supabase → SQL Editor, ejecutar:
supabase_schema.sql

# Configurar Storage según:
supabase_storage_setup.md
```

---

## ✅ Módulos Implementados — Plan Esencial

| Módulo | Componente | Estado |
|---|---|---|
| Matrícula Digital | `MatriculaForm.jsx` | ✅ Completo |
| Perfil del Estudiante | `PerfilEstudiante.jsx` | ✅ Completo |
| Gestión Documental | `GestionDocumental.jsx` | ✅ Completo |
| Control de Asistencia | `ControlAsistencia.jsx` | ✅ Completo |
| Registro de Calificaciones | `RegistroCalificaciones.jsx` | ✅ Completo |
| Comunicados | `Comunicados.jsx` | ✅ Completo |
| Biblioteca Digital | `Biblioteca.jsx` | ✅ Completo |

---

## 🔒 Sistema de Planes

El acceso a módulos se controla mediante un sistema de planes escalonados definido en `frontend/src/constants/planes.constants.js`:

| Plan | Módulos | Precio |
|---|---|---|
| **Esencial** | Los 7 módulos base | Contactar |
| **Smart** | + Encuestas, Gobierno Escolar, PQRS, Chatbot… | $4.000.000/mes |
| **Campus IA** | + Asistente IA, OVAs, Analítica… | $5.500.000/mes |
| **Enterprise** | + WhatsApp Bot, Firma Digital, API… | $7.000.000/mes |

---

## 🗄️ Base de Datos

El schema en `supabase_schema.sql` define:

- **Tablas principales:** `instituciones`, `estudiantes`, `acudientes`, `matriculas`, `documentos`, `calificaciones`
- **Seguridad:** Row Level Security (RLS) con aislamiento por `institucion_id`
- **Vistas:** `vista_matriculas_completas`, `vista_calificaciones_completas`
- **Triggers:** Auditoría automática de cambios

---

## 🖨️ Generador de Boletines (Python)

Genera boletines académicos en PDF usando ReportLab:

```bash
# Instalar dependencias Python
pip install reportlab

# Generar boletines de ejemplo
cd /ruta/del/proyecto
python3 backend/generar_boletines.py            # Ambos ejemplos
python3 backend/generar_boletines.py --lote     # Lote completo
python3 backend/generar_boletines.py --uno      # Solo primer estudiante
```

---

## 🛠️ Comandos

```bash
npm run dev       # Servidor de desarrollo (http://localhost:5173)
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # Linter ESLint
```

---

## 📚 Documentación Adicional

| Documento | Descripción |
|---|---|
| [`supabase_schema.sql`](./supabase_schema.sql) | Schema completo de la BD |
| [`supabase_storage_setup.md`](./supabase_storage_setup.md) | Configuración de Storage |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Guía de contribución |
| [`CHANGELOG.md`](./CHANGELOG.md) | Historial de versiones |

---

## 🤝 Contribuir

Ver [`CONTRIBUTING.md`](./CONTRIBUTING.md) para el flujo de trabajo, convenciones de código y proceso de PR.

---

## 📄 Licencia

MIT — Ver [`LICENSE`](./LICENSE) para detalles.
