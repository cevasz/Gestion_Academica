"""
datos_ejemplo.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Datos de ejemplo para probar el generador de boletines.

Los datos están estructurados como espejo del modelo de BD:
  - instituciones (tabla)
  - estudiantes + acudientes (tablas)
  - calificaciones por período (tabla calificaciones)

En producción, estos datos vendrían de Supabase vía la API.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from datetime import date
from backend.boletines.generador_boletin import (
    DatosBoletin,
    Estudiante,
    Institucion,
    NotaMateria,
)

# ─────────────────────────────────────────────
#  INSTITUCIÓN (tabla: instituciones)
# ─────────────────────────────────────────────
COLEGIO_EJEMPLO = Institucion(
    nombre="Institución Educativa Técnica San Francisco de Asís",
    nit="800.123.456-7",
    municipio="Bogotá D.C.",
    departamento="Cundinamarca",
    resolucion="Res. 2847 de 2005 — Sec. de Educación Distrital",
    rector="Mg. Patricia Lorena Suárez Velandia",
    email="rector@iesanfrancisco.edu.co",
    telefono="(601) 345-6789",
    direccion="Calle 45 # 12-34, Localidad de Chapinero",
    logo_path=None,   # Reemplazar con ruta real del logo PNG
)

# ─────────────────────────────────────────────
#  MATERIAS Y NOTAS — Estudiante 1
#  (tabla: calificaciones — tipo: regular)
# ─────────────────────────────────────────────
NOTAS_ANA_SOFIA = [
    NotaMateria("Matemáticas",             p1=4.2, p2=3.8, p3=4.5, p4=4.0),
    NotaMateria("Lengua Castellana",       p1=4.8, p2=4.6, p3=4.9, p4=5.0),
    NotaMateria("Ciencias Naturales",      p1=3.5, p2=3.2, p3=3.8, p4=4.0),
    NotaMateria("Ciencias Sociales",       p1=4.0, p2=4.2, p3=4.1, p4=3.9),
    NotaMateria("Inglés",                  p1=3.8, p2=4.0, p3=4.3, p4=4.5),
    NotaMateria("Educación Física",        p1=4.5, p2=4.8, p3=5.0, p4=4.7),
    NotaMateria("Artes",                   p1=4.0, p2=4.2, p3=4.5, p4=4.8),
    NotaMateria("Tecnología e Informática",p1=3.9, p2=4.1, p3=4.0, p4=4.3),
    NotaMateria("Ética y Valores",         p1=4.5, p2=4.7, p3=5.0, p4=5.0),
    NotaMateria("Religión",                p1=4.0, p2=4.0, p3=4.2, p4=4.5),
]

ESTUDIANTE_ANA_SOFIA = DatosBoletin(
    institucion=COLEGIO_EJEMPLO,
    estudiante=Estudiante(
        nombre_completo="Ana Sofía Martínez Gómez",
        tipo_documento="TI",
        numero_documento="1023456789",
        fecha_nacimiento=date(2011, 3, 15),
        grado="8°A",
        numero_matricula="2026-0001",
        acudiente="Claudia Patricia Gómez Ramírez",
        telefono_acudiente="3001234567",
    ),
    año_lectivo=2026,
    periodo_actual=4,
    materias=NOTAS_ANA_SOFIA,
    observaciones_director=(
        "La estudiante Ana Sofía ha demostrado un desempeño académico sobresaliente durante "
        "el año lectivo 2026. Se destaca por su disciplina, responsabilidad y compromiso con "
        "sus actividades escolares. Se le reconoce como monitora del aula en Lengua Castellana "
        "y participante activa en el Gobierno Escolar. Se invita a la familia a continuar "
        "apoyando el proceso formativo de su hija."
    ),
    observaciones_docente=(
        "Ana Sofía muestra liderazgo positivo dentro del grupo y participa activamente en "
        "todas las actividades propuestas. Su desempeño en matemáticas mejoró notablemente "
        "en el segundo semestre gracias a su compromiso con las nivelaciones. Se recomienda "
        "continuar fortaleciendo hábitos de lectura en inglés para el próximo año."
    ),
    puesto_grupo=3,
    total_estudiantes_grupo=32,
    dias_asistidos=188,
    dias_ausentes=4,
    dias_totales=192,
    fecha_entrega=date(2026, 12, 5),
)


# ─────────────────────────────────────────────
#  ESTUDIANTE 2 — Con notas bajas (para demostrar semáforo rojo)
# ─────────────────────────────────────────────
NOTAS_CARLOS_ANDRES = [
    NotaMateria("Matemáticas",             p1=2.5, p2=2.8, p3=2.1, p4=3.0),
    NotaMateria("Lengua Castellana",       p1=3.2, p2=3.0, p3=2.8, p4=3.5),
    NotaMateria("Ciencias Naturales",      p1=2.9, p2=2.5, p3=3.0, p4=2.7),
    NotaMateria("Ciencias Sociales",       p1=3.5, p2=3.2, p3=3.0, p4=3.1),
    NotaMateria("Inglés",                  p1=2.0, p2=2.3, p3=2.5, p4=2.8),
    NotaMateria("Educación Física",        p1=4.0, p2=4.2, p3=4.5, p4=4.0),
    NotaMateria("Artes",                   p1=3.5, p2=3.8, p3=3.5, p4=4.0),
    NotaMateria("Tecnología e Informática",p1=3.0, p2=3.2, p3=2.8, p4=3.5),
    NotaMateria("Ética y Valores",         p1=3.5, p2=3.2, p3=3.0, p4=3.5),
    NotaMateria("Religión",                p1=3.5, p2=3.0, p3=3.5, p4=3.8),
]

ESTUDIANTE_CARLOS_ANDRES = DatosBoletin(
    institucion=COLEGIO_EJEMPLO,
    estudiante=Estudiante(
        nombre_completo="Carlos Andrés Rojas Hernández",
        tipo_documento="TI",
        numero_documento="1034567890",
        fecha_nacimiento=date(2010, 7, 22),
        grado="8°A",
        numero_matricula="2026-0002",
        acudiente="Martha Elena Hernández Perdomo",
        telefono_acudiente="3109876543",
    ),
    año_lectivo=2026,
    periodo_actual=4,
    materias=NOTAS_CARLOS_ANDRES,
    observaciones_director=(
        "Carlos Andrés presenta dificultades académicas en áreas de ciencias exactas e inglés. "
        "Se realizaron reuniones con el acudiente para establecer un plan de mejoramiento. "
        "Se recomienda apoyo en refuerzo escolar y acompañamiento en casa. La institución "
        "pondrá a disposición del estudiante el programa de tutorías para el primer período "
        "del siguiente año lectivo."
    ),
    observaciones_docente=(
        "El estudiante muestra actitud positiva pero requiere mayor dedicación al estudio "
        "en casa. Sus resultados en educación física y artes demuestran que tiene capacidades "
        "que puede potenciar en las demás áreas. Se recomienda establecer rutinas de estudio "
        "de al menos 1 hora diaria y asistir a las tutorías programadas."
    ),
    puesto_grupo=28,
    total_estudiantes_grupo=32,
    dias_asistidos=175,
    dias_ausentes=17,
    dias_totales=192,
    fecha_entrega=date(2026, 12, 5),
)


# ─────────────────────────────────────────────
#  LISTA COMPLETA PARA GENERAR EN LOTE
# ─────────────────────────────────────────────
TODOS_LOS_BOLETINES = [
    ESTUDIANTE_ANA_SOFIA,
    ESTUDIANTE_CARLOS_ANDRES,
]
