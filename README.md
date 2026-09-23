<div align="center">

# 🎓 Gestión Académica

**Plataforma para digitalizar colegios en Colombia: matrícula, documentos, asistencia, notas y comunicación con las familias, en un solo sistema.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)
![Python](https://img.shields.io/badge/Python-ReportLab-3776AB?logo=python&logoColor=white)
![License](https://img.shields.io/badge/licencia-MIT-green)

</div>

---

## Qué resuelve

Muchos colegios todavía matriculan en papel, guardan los documentos en carpetas
físicas y pasan notas en hojas de cálculo. Esta plataforma lo reúne en un mismo
sistema, pensado para que varias instituciones compartan una instalación y un
sistema de planes decida qué módulos tiene activos cada colegio.

## Módulos

Los siete módulos del plan **Esencial** están implementados:

| Módulo | Qué hace | Componente |
|---|---|---|
| 📝 Matrícula digital | Inscripción, renovación y actualización con validación en vivo (documento, celular colombiano, edad entre 3 y 20 años); número de matrícula `AAAA-XXXX` automático | `MatriculaForm.jsx` |
| 👤 Perfil del estudiante | Datos, acudientes e historial en una vista | `PerfilEstudiante.jsx` |
| 📁 Gestión documental | Subida de PDF, Word e imágenes (máx. 10 MB), clasificación por tipo, estados pendiente/aprobado/rechazado, filtros | `GestionDocumental.jsx` |
| ✅ Asistencia | Registro diario por curso | `ControlAsistencia.jsx` |
| 📊 Calificaciones | Registro de notas por periodo | `RegistroCalificaciones.jsx` |
| 📣 Comunicados | Avisos a familias y docentes | `Comunicados.jsx` |
| 📚 Biblioteca digital | Catálogo de recursos | `Biblioteca.jsx` |

Además hay un **generador de boletines en PDF** (Python + ReportLab) en `backend/`.

### Planes

El acceso a módulos se define en `frontend/src/constants/planes.constants.js`:

| Plan | Incluye |
|---|---|
| **Esencial** | Los 7 módulos base |
| **Smart** | + Encuestas, Gobierno escolar, Reconocimientos, Eventos, PQRS, Chatbot |
| **Campus IA** | + Asistente con IA, OVAs inteligentes, Analítica avanzada, Informes con IA |
| **Enterprise** | + Agente de WhatsApp, Agente de voz, Analítica predictiva… |

Los módulos de Smart en adelante están modelados en el catálogo pero todavía no implementados.

## Arquitectura

```
frontend/                 React + Vite + Tailwind
  components/             un componente por módulo
  contexts/AppContext     institución y plan activos
  services/               capa de acceso a Supabase (estudiante, matrícula, documento…)
backend/
  generar_boletines.py    boletines PDF con ReportLab
supabase_schema.sql       tablas, vistas, triggers y políticas RLS
```

**Permisos en la base de datos:** las políticas Row Level Security de PostgreSQL
leen el rol del JWT de Supabase (`admin`, `directivo`, `secretaria`, `docente`) y
deciden quién puede leer, crear o modificar cada tabla. Por ejemplo, un docente
consulta estudiantes pero solo administración y secretaría los matriculan. La
matrícula pública entra por una función `SECURITY DEFINER` (`crear_matricula_publica`)
en lugar de abrir la tabla.

**Auditoría:** unos triggers registran cada cambio de matrícula en `historial_matriculas`.

## Arrancar en local

Requisitos: Node.js 18+ y un proyecto en [Supabase](https://supabase.com).

```bash
git clone https://github.com/cevasz/Gestion_Academica.git
cd Gestion_Academica

cp .env.example frontend/.env        # VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm install --prefix frontend
npm run dev                          # http://localhost:5173
```

Base de datos: ejecuta `supabase_schema.sql` en el SQL Editor de Supabase y
configura el bucket siguiendo [`supabase_storage_setup.md`](supabase_storage_setup.md).

Boletines:

```bash
pip install reportlab
python3 backend/generar_boletines.py          # ejemplos
python3 backend/generar_boletines.py --lote   # lote completo
```

| Comando | |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run preview` | Build de producción y vista previa |
| `npm run lint` | ESLint |

## Hoja de ruta

- [x] Siete módulos del plan Esencial
- [x] Permisos por rol con RLS
- [x] Boletines PDF
- [ ] Aislamiento por `institucion_id` en todas las tablas
- [ ] Inicio de sesión por rol en el frontend
- [ ] Módulos del plan Smart
- [ ] Exportación a Excel
- [ ] Despliegue público de demo

---

<div align="center">

[`CHANGELOG`](CHANGELOG.md) · [`CONTRIBUTING`](CONTRIBUTING.md) · [`LICENSE`](LICENSE) · hecho por <a href="https://github.com/cevasz">@cevasz</a>

</div>
