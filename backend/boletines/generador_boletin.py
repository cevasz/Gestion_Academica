"""
generador_boletin.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generador de boletines académicos en PDF para instituciones
educativas colombianas.

Proyecto: Digitalización Institucional
Módulo  : Plan Esencial → Módulo Académico → Boletines
Librería : ReportLab 5.x + Pillow
Escala   : 0.0 – 5.0 (sistema colombiano)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uso rápido:
    from backend.boletines.generador_boletin import GeneradorBoletin
    gen = GeneradorBoletin()
    gen.generar(datos_boletin, "boletin_ana_sofia.pdf")
"""

from __future__ import annotations

import io
import os
from dataclasses import dataclass, field
from datetime import date
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    Image,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.flowables import BalancedColumns


# ─────────────────────────────────────────────
#  PALETA DE COLORES (alineada al proyecto)
#  Primario: Indigo-600  → #4F46E5
#  Secundario: Emerald-500 → #10B981
#  Alertas: Red, Yellow, Green (sistema colombiano)
# ─────────────────────────────────────────────
INDIGO_OSCURO  = colors.HexColor("#312E81")   # indigo-900
INDIGO         = colors.HexColor("#4F46E5")   # indigo-600
INDIGO_CLARO   = colors.HexColor("#E0E7FF")   # indigo-100
EMERALD        = colors.HexColor("#10B981")   # emerald-500
EMERALD_CLARO  = colors.HexColor("#D1FAE5")   # emerald-100
GRIS_OSCURO    = colors.HexColor("#1F2937")   # gray-800
GRIS           = colors.HexColor("#6B7280")   # gray-500
GRIS_BORDE     = colors.HexColor("#E5E7EB")   # gray-200
GRIS_FILA      = colors.HexColor("#F9FAFB")   # gray-50
BLANCO         = colors.white
ROJO           = colors.HexColor("#DC2626")   # red-600
ROJO_CLARO     = colors.HexColor("#FEE2E2")   # red-100
AMARILLO       = colors.HexColor("#D97706")   # amber-600
AMARILLO_CLARO = colors.HexColor("#FEF3C7")   # amber-100
VERDE          = colors.HexColor("#16A34A")   # green-600
VERDE_CLARO    = colors.HexColor("#DCFCE7")   # green-100


# ─────────────────────────────────────────────
#  ESTRUCTURAS DE DATOS (espejo del modelo BD)
# ─────────────────────────────────────────────

@dataclass
class Institucion:
    nombre: str
    nit: str
    municipio: str
    departamento: str
    resolucion: str
    rector: str
    logo_path: Optional[str] = None
    email: str = ""
    telefono: str = ""
    direccion: str = ""


@dataclass
class Estudiante:
    nombre_completo: str
    tipo_documento: str           # TI, CC, RC, CE
    numero_documento: str
    fecha_nacimiento: date
    grado: str                    # ej: "8°A"
    numero_matricula: str         # formato AAAA-XXXX
    acudiente: str = ""
    telefono_acudiente: str = ""


@dataclass
class NotaMateria:
    """Notas de una materia por los 4 períodos (escala 0.0-5.0)."""
    materia: str
    p1: Optional[float] = None
    p2: Optional[float] = None
    p3: Optional[float] = None
    p4: Optional[float] = None

    @property
    def promedio(self) -> Optional[float]:
        notas = [n for n in [self.p1, self.p2, self.p3, self.p4] if n is not None]
        if not notas:
            return None
        return round(sum(notas) / len(notas), 2)

    def formato(self, valor: Optional[float]) -> str:
        return f"{valor:.1f}" if valor is not None else "—"


@dataclass
class DatosBoletin:
    institucion: Institucion
    estudiante: Estudiante
    año_lectivo: int
    periodo_actual: int           # 1-4, o 0 para boletin anual
    materias: list[NotaMateria] = field(default_factory=list)
    observaciones_director: str = ""
    observaciones_docente: str = ""
    puesto_grupo: Optional[int] = None
    total_estudiantes_grupo: Optional[int] = None
    dias_asistidos: Optional[int] = None
    dias_ausentes: Optional[int] = None
    dias_totales: Optional[int] = None
    fecha_entrega: date = field(default_factory=date.today)


# ─────────────────────────────────────────────
#  ESTILOS TIPOGRÁFICOS
# ─────────────────────────────────────────────

def _construir_estilos() -> dict:
    base = getSampleStyleSheet()

    estilos = {
        "titulo_inst": ParagraphStyle(
            "titulo_inst",
            fontName="Helvetica-Bold",
            fontSize=15,
            textColor=INDIGO_OSCURO,
            alignment=TA_CENTER,
            spaceAfter=2,
            leading=18,
        ),
        "subtitulo_inst": ParagraphStyle(
            "subtitulo_inst",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS,
            alignment=TA_CENTER,
            spaceAfter=1,
            leading=11,
        ),
        "encabezado_seccion": ParagraphStyle(
            "encabezado_seccion",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=BLANCO,
            alignment=TA_LEFT,
            leading=10,
        ),
        "campo_label": ParagraphStyle(
            "campo_label",
            fontName="Helvetica-Bold",
            fontSize=7.5,
            textColor=GRIS,
            leading=10,
        ),
        "campo_valor": ParagraphStyle(
            "campo_valor",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_OSCURO,
            leading=10,
        ),
        "nombre_estudiante": ParagraphStyle(
            "nombre_estudiante",
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=INDIGO_OSCURO,
            leading=15,
        ),
        "encabezado_tabla": ParagraphStyle(
            "encabezado_tabla",
            fontName="Helvetica-Bold",
            fontSize=7,
            textColor=BLANCO,
            alignment=TA_CENTER,
            leading=9,
        ),
        "celda_materia": ParagraphStyle(
            "celda_materia",
            fontName="Helvetica-Bold",
            fontSize=7.5,
            textColor=GRIS_OSCURO,
            leading=10,
        ),
        "celda_nota": ParagraphStyle(
            "celda_nota",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=GRIS_OSCURO,
            alignment=TA_CENTER,
            leading=10,
        ),
        "observaciones": ParagraphStyle(
            "observaciones",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_OSCURO,
            alignment=TA_JUSTIFY,
            leading=12,
            spaceAfter=4,
        ),
        "firma_titulo": ParagraphStyle(
            "firma_titulo",
            fontName="Helvetica-Bold",
            fontSize=7.5,
            textColor=GRIS_OSCURO,
            alignment=TA_CENTER,
            leading=10,
        ),
        "firma_subtitulo": ParagraphStyle(
            "firma_subtitulo",
            fontName="Helvetica",
            fontSize=7,
            textColor=GRIS,
            alignment=TA_CENTER,
            leading=9,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontName="Helvetica",
            fontSize=6.5,
            textColor=GRIS,
            alignment=TA_CENTER,
            leading=9,
        ),
        "escala_texto": ParagraphStyle(
            "escala_texto",
            fontName="Helvetica",
            fontSize=6.5,
            textColor=GRIS_OSCURO,
            alignment=TA_LEFT,
            leading=9,
        ),
    }
    return estilos


# ─────────────────────────────────────────────
#  HELPERS DE COLOR SEMAFÓRICO
# ─────────────────────────────────────────────

def _color_nota(nota: Optional[float]) -> colors.Color:
    """Devuelve color de fondo según la nota (escala colombiana 0-5)."""
    if nota is None:
        return GRIS_BORDE
    if nota < 3.0:
        return ROJO_CLARO
    if nota < 4.0:
        return AMARILLO_CLARO
    return VERDE_CLARO


def _color_texto_nota(nota: Optional[float]) -> colors.Color:
    if nota is None:
        return GRIS
    if nota < 3.0:
        return ROJO
    if nota < 4.0:
        return AMARILLO
    return VERDE


def _nivel_desempeno(nota: Optional[float]) -> str:
    """Niveles de desempeño MEN Colombia."""
    if nota is None:
        return "—"
    if nota < 3.0:
        return "Bajo"
    if nota < 3.9:
        return "Básico"
    if nota < 4.6:
        return "Alto"
    return "Superior"


# ─────────────────────────────────────────────
#  CLASE PRINCIPAL
# ─────────────────────────────────────────────

class GeneradorBoletin:
    """
    Genera boletines académicos en PDF para instituciones educativas colombianas.

    Ejemplo de uso:
        gen = GeneradorBoletin()
        gen.generar(datos, "salida/boletin_juan.pdf")
    """

    MARGEN = 1.5 * cm
    ANCHO_PAGINA, ALTO_PAGINA = LETTER   # 21.59 × 27.94 cm

    def __init__(self):
        self._estilos = _construir_estilos()

    # ── API PÚBLICA ─────────────────────────────
    def generar(self, datos: DatosBoletin, ruta_salida: str) -> str:
        """
        Genera el PDF del boletín y lo guarda en ruta_salida.
        Retorna la ruta absoluta del archivo generado.
        """
        os.makedirs(os.path.dirname(os.path.abspath(ruta_salida)), exist_ok=True)

        doc = BaseDocTemplate(
            ruta_salida,
            pagesize=LETTER,
            leftMargin=self.MARGEN,
            rightMargin=self.MARGEN,
            topMargin=self.MARGEN,
            bottomMargin=self.MARGEN,
        )

        # Frame principal (área de contenido)
        frame = Frame(
            self.MARGEN,
            self.MARGEN,
            self.ANCHO_PAGINA - 2 * self.MARGEN,
            self.ALTO_PAGINA - 2 * self.MARGEN,
            id="main",
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
        )

        plantilla = PageTemplate(
            id="boletin",
            frames=[frame],
            onPage=self._dibujar_decoraciones_pagina,
            onPageEnd=self._dibujar_footer,
        )
        doc.addPageTemplates([plantilla])

        self._datos_actuales = datos
        historia = self._construir_historia(datos)
        doc.build(historia)

        return os.path.abspath(ruta_salida)

    def generar_lote(
        self,
        lista_datos: list[DatosBoletin],
        carpeta_salida: str,
    ) -> list[str]:
        """Genera boletines para múltiples estudiantes y devuelve lista de rutas."""
        rutas = []
        for datos in lista_datos:
            nombre_archivo = (
                f"boletin_{datos.estudiante.nombre_completo.replace(' ', '_').lower()}"
                f"_p{datos.periodo_actual}_{datos.año_lectivo}.pdf"
            )
            ruta = os.path.join(carpeta_salida, nombre_archivo)
            self.generar(datos, ruta)
            rutas.append(ruta)
            print(f"  ✅ {datos.estudiante.nombre_completo} → {ruta}")
        return rutas

    # ── CONSTRUCCIÓN DEL DOCUMENTO ───────────────
    def _construir_historia(self, datos: DatosBoletin) -> list:
        """Ensambla todos los bloques del boletín en orden."""
        historia = []

        historia += self._bloque_encabezado(datos)
        historia.append(Spacer(1, 5 * mm))
        historia += self._bloque_datos_estudiante(datos)
        historia.append(Spacer(1, 5 * mm))
        historia += self._bloque_tabla_calificaciones(datos)
        historia.append(Spacer(1, 5 * mm))
        historia += self._bloque_resumen_estadisticas(datos)
        historia.append(Spacer(1, 5 * mm))
        historia += self._bloque_asistencia(datos)
        historia.append(Spacer(1, 5 * mm))
        historia += self._bloque_observaciones(datos)
        historia.append(Spacer(1, 8 * mm))
        historia += self._bloque_escala_valoracion()
        historia.append(Spacer(1, 8 * mm))
        historia += self._bloque_firmas(datos)

        return historia

    # ── BLOQUE 1: ENCABEZADO ─────────────────────
    def _bloque_encabezado(self, datos: DatosBoletin) -> list:
        inst = datos.institucion
        es = self._estilos
        ancho_util = self.ANCHO_PAGINA - 2 * self.MARGEN

        # Determinar columnas: logo | info institución | sello boletin
        ancho_logo = 3.5 * cm
        ancho_sello = 4.5 * cm
        ancho_info = ancho_util - ancho_logo - ancho_sello - 10 * mm

        # ── Logo ──
        if inst.logo_path and os.path.isfile(inst.logo_path):
            logo = Image(inst.logo_path, width=ancho_logo, height=2.8 * cm, kind="proportional")
        else:
            logo = self._logo_placeholder(ancho_logo, 2.8 * cm)

        # ── Info institución ──
        col_info = [
            Paragraph(inst.nombre.upper(), es["titulo_inst"]),
            Paragraph(f"NIT: {inst.nit}", es["subtitulo_inst"]),
            Paragraph(f"{inst.municipio}, {inst.departamento}", es["subtitulo_inst"]),
            Paragraph(f"Res. Aprobación: {inst.resolucion}", es["subtitulo_inst"]),
            Paragraph(inst.email, es["subtitulo_inst"]),
            Paragraph(inst.telefono, es["subtitulo_inst"]),
        ]

        # ── Sello "Boletín" ──
        periodo_texto = (
            f"PERÍODO {datos.periodo_actual}"
            if datos.periodo_actual > 0
            else "BOLETIN ANUAL"
        )
        col_sello = [
            Paragraph("BOLETÍN", ParagraphStyle(
                "sel1", fontName="Helvetica-Bold", fontSize=13,
                textColor=INDIGO, alignment=TA_CENTER, leading=16,
            )),
            Paragraph("ACADÉMICO", ParagraphStyle(
                "sel2", fontName="Helvetica-Bold", fontSize=13,
                textColor=INDIGO, alignment=TA_CENTER, leading=16,
            )),
            Spacer(1, 3 * mm),
            Paragraph(periodo_texto, ParagraphStyle(
                "sel3", fontName="Helvetica-Bold", fontSize=9,
                textColor=BLANCO, alignment=TA_CENTER, leading=11,
                backColor=INDIGO, borderPad=4,
            )),
            Spacer(1, 2 * mm),
            Paragraph(str(datos.año_lectivo), ParagraphStyle(
                "sel4", fontName="Helvetica-Bold", fontSize=16,
                textColor=INDIGO_OSCURO, alignment=TA_CENTER, leading=20,
            )),
            Paragraph(
                f"Fecha de entrega: {datos.fecha_entrega.strftime('%d/%m/%Y')}",
                es["subtitulo_inst"],
            ),
        ]

        tabla_encabezado = Table(
            [[logo, col_info, col_sello]],
            colWidths=[ancho_logo, ancho_info, ancho_sello],
        )
        tabla_encabezado.setStyle(TableStyle([
            ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN",       (0, 0), (0, 0), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING",(0, 0), (-1, -1), 6),
            ("TOPPADDING",  (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
            ("LINEBELOW",   (0, 0), (-1, -1), 2, INDIGO),
        ]))

        return [tabla_encabezado]

    # ── BLOQUE 2: DATOS DEL ESTUDIANTE ──────────
    def _bloque_datos_estudiante(self, datos: DatosBoletin) -> list:
        est = datos.estudiante
        es = self._estilos
        ancho_util = self.ANCHO_PAGINA - 2 * self.MARGEN

        def par_campo(label: str, valor: str):
            return [
                Paragraph(label, es["campo_label"]),
                Paragraph(valor or "—", es["campo_valor"]),
            ]

        edad = (date.today() - est.fecha_nacimiento).days // 365

        campos = [
            ["NOMBRE COMPLETO:", est.nombre_completo],
            [f"{est.tipo_documento}:", est.numero_documento],
            ["FECHA DE NACIMIENTO:", f"{est.fecha_nacimiento.strftime('%d/%m/%Y')} ({edad} años)"],
            ["GRADO:", est.grado],
            ["N° MATRÍCULA:", est.numero_matricula],
            ["ACUDIENTE:", est.acudiente],
            ["TEL. ACUDIENTE:", est.telefono_acudiente],
            ["AÑO LECTIVO:", str(datos.año_lectivo)],
        ]

        # 2 columnas de 4 campos
        col1 = [[Paragraph(c[0], es["campo_label"]), Paragraph(c[1] or "—", es["campo_valor"])]
                for c in campos[:4]]
        col2 = [[Paragraph(c[0], es["campo_label"]), Paragraph(c[1] or "—", es["campo_valor"])]
                for c in campos[4:]]

        ancho_col = (ancho_util - 6 * mm) / 2

        def construir_mini_tabla(filas):
            data = []
            for f in filas:
                data.append([f[0], f[1]])
            t = Table(data, colWidths=[ancho_col * 0.38, ancho_col * 0.62])
            t.setStyle(TableStyle([
                ("VALIGN",      (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING",  (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING",(0, 0), (-1, -1), 3),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING",(0, 0), (-1, -1), 6),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [GRIS_FILA, BLANCO]),
                ("LINEBELOW",   (0, 0), (-1, -1), 0.3, GRIS_BORDE),
            ]))
            return t

        encabezado_datos = self._encabezado_seccion("📋  INFORMACIÓN DEL ESTUDIANTE", ancho_util)

        tabla_contenedor = Table(
            [[construir_mini_tabla(col1), construir_mini_tabla(col2)]],
            colWidths=[ancho_col, ancho_col],
            hAlign="LEFT",
        )
        tabla_contenedor.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
            ("TOPPADDING",   (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 0),
            ("LINEAFTER",    (0, 0), (0, -1), 0.5, GRIS_BORDE),
        ]))

        return [encabezado_datos, Spacer(1, 2 * mm), tabla_contenedor]

    # ── BLOQUE 3: TABLA DE CALIFICACIONES ────────
    def _bloque_tabla_calificaciones(self, datos: DatosBoletin) -> list:
        es = self._estilos
        ancho_util = self.ANCHO_PAGINA - 2 * self.MARGEN

        encabezado = self._encabezado_seccion("📊  REGISTRO DE CALIFICACIONES", ancho_util)

        # Anchos de columna
        ancho_materia   = 5.0 * cm
        ancho_periodo   = 1.55 * cm
        ancho_promedio  = 1.8 * cm
        ancho_nivel     = 2.2 * cm

        # ── Encabezados de la tabla ──
        encabezados = [
            Paragraph("MATERIA / ÁREA", es["encabezado_tabla"]),
            Paragraph("P1", es["encabezado_tabla"]),
            Paragraph("P2", es["encabezado_tabla"]),
            Paragraph("P3", es["encabezado_tabla"]),
            Paragraph("P4", es["encabezado_tabla"]),
            Paragraph("PROMEDIO", es["encabezado_tabla"]),
            Paragraph("DESEMPEÑO", es["encabezado_tabla"]),
        ]

        filas_tabla = [encabezados]

        for i, m in enumerate(datos.materias):
            prom = m.promedio
            color_prom = _color_nota(prom)
            texto_prom = m.formato(prom)

            fila = [
                Paragraph(m.materia, es["celda_materia"]),
                Paragraph(m.formato(m.p1), es["celda_nota"]),
                Paragraph(m.formato(m.p2), es["celda_nota"]),
                Paragraph(m.formato(m.p3), es["celda_nota"]),
                Paragraph(m.formato(m.p4), es["celda_nota"]),
                Paragraph(texto_prom, ParagraphStyle(
                    f"prom_{i}",
                    fontName="Helvetica-Bold",
                    fontSize=8,
                    textColor=_color_texto_nota(prom),
                    alignment=TA_CENTER,
                    leading=10,
                )),
                Paragraph(_nivel_desempeno(prom), ParagraphStyle(
                    f"nivel_{i}",
                    fontName="Helvetica-Bold",
                    fontSize=7.5,
                    textColor=_color_texto_nota(prom),
                    alignment=TA_CENTER,
                    leading=10,
                )),
            ]
            filas_tabla.append(fila)

        # ── Fila de promedio general ──
        notas_validas = [m.promedio for m in datos.materias if m.promedio is not None]
        prom_general = round(sum(notas_validas) / len(notas_validas), 2) if notas_validas else None

        fila_total = [
            Paragraph("PROMEDIO GENERAL", ParagraphStyle(
                "total_label",
                fontName="Helvetica-Bold",
                fontSize=8,
                textColor=INDIGO_OSCURO,
                leading=10,
            )),
            Paragraph("", es["celda_nota"]),
            Paragraph("", es["celda_nota"]),
            Paragraph("", es["celda_nota"]),
            Paragraph("", es["celda_nota"]),
            Paragraph(
                f"{prom_general:.2f}" if prom_general else "—",
                ParagraphStyle(
                    "total_prom",
                    fontName="Helvetica-Bold",
                    fontSize=9,
                    textColor=_color_texto_nota(prom_general),
                    alignment=TA_CENTER,
                    leading=11,
                ),
            ),
            Paragraph(
                _nivel_desempeno(prom_general),
                ParagraphStyle(
                    "total_nivel",
                    fontName="Helvetica-Bold",
                    fontSize=8,
                    textColor=_color_texto_nota(prom_general),
                    alignment=TA_CENTER,
                    leading=10,
                ),
            ),
        ]
        filas_tabla.append(fila_total)

        tabla = Table(
            filas_tabla,
            colWidths=[
                ancho_materia,
                ancho_periodo, ancho_periodo, ancho_periodo, ancho_periodo,
                ancho_promedio,
                ancho_nivel,
            ],
            hAlign="LEFT",
            repeatRows=1,
        )

        n_materias = len(datos.materias)
        n_filas_total = n_materias + 2  # encabezado + materias + total

        comandos_estilo = [
            # Encabezado
            ("BACKGROUND",    (0, 0), (-1, 0), INDIGO),
            ("TEXTCOLOR",     (0, 0), (-1, 0), BLANCO),
            ("ALIGN",         (0, 0), (-1, 0), "CENTER"),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, 0), 7.5),
            ("TOPPADDING",    (0, 0), (-1, 0), 7),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
            ("ROWBACKGROUNDS",(0, 1), (-1, n_materias), [BLANCO, GRIS_FILA]),
            # Borde izquierdo materia
            ("LINEBEFORE",    (0, 1), (0, -2), 3, INDIGO_CLARO),
            # Columna promedio
            ("BACKGROUND",    (5, 1), (5, n_materias), INDIGO_CLARO),
            # Fila total
            ("BACKGROUND",    (0, -1), (-1, -1), INDIGO_CLARO),
            ("TOPPADDING",    (0, -1), (-1, -1), 6),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
            ("LINEABOVE",     (0, -1), (-1, -1), 1.5, INDIGO),
            # Colores por nota (filas de materias)
            ("TOPPADDING",    (0, 1), (-1, -2), 5),
            ("BOTTOMPADDING", (0, 1), (-1, -2), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 6),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
            # Bordes generales
            ("GRID",          (0, 0), (-1, -1), 0.4, GRIS_BORDE),
            ("LINEBELOW",     (0, 0), (-1, 0), 0, INDIGO),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ]

        # Aplicar colores semafóricos a celdas de notas
        for fila_idx, m in enumerate(datos.materias, start=1):
            for col_idx, nota in enumerate([m.p1, m.p2, m.p3, m.p4], start=1):
                if nota is not None:
                    comandos_estilo.append(
                        ("BACKGROUND", (col_idx, fila_idx), (col_idx, fila_idx), _color_nota(nota))
                    )

        tabla.setStyle(TableStyle(comandos_estilo))

        return [encabezado, Spacer(1, 2 * mm), tabla]

    # ── BLOQUE 4: ESTADÍSTICAS ───────────────────
    def _bloque_resumen_estadisticas(self, datos: DatosBoletin) -> list:
        es = self._estilos
        ancho_util = self.ANCHO_PAGINA - 2 * self.MARGEN

        if datos.puesto_grupo is None and datos.total_estudiantes_grupo is None:
            return []

        encabezado = self._encabezado_seccion("🏆  POSICIÓN EN EL GRUPO", ancho_util)

        notas_validas = [m.promedio for m in datos.materias if m.promedio is not None]
        prom_general = round(sum(notas_validas) / len(notas_validas), 2) if notas_validas else 0

        stats = [
            ("Promedio\nGeneral", f"{prom_general:.2f}", _color_nota(prom_general)),
            ("Puesto en\nel Grupo",
             f"{datos.puesto_grupo}°" if datos.puesto_grupo else "—",
             INDIGO_CLARO),
            ("Total\nEstudiantes",
             str(datos.total_estudiantes_grupo) if datos.total_estudiantes_grupo else "—",
             GRIS_FILA),
            ("Nivel de\nDesempeño", _nivel_desempeno(prom_general), _color_nota(prom_general)),
        ]

        ancho_stat = (ancho_util - 3 * mm) / len(stats)

        filas_stat = []
        filas_color = []
        for texto, valor, color in stats:
            filas_stat.append([
                Paragraph(texto, ParagraphStyle(
                    "stat_label", fontName="Helvetica", fontSize=7,
                    textColor=GRIS, alignment=TA_CENTER, leading=9,
                )),
                Paragraph(valor, ParagraphStyle(
                    "stat_valor", fontName="Helvetica-Bold", fontSize=13,
                    textColor=GRIS_OSCURO, alignment=TA_CENTER, leading=16,
                )),
            ])
            filas_color.append(color)

        # Una sola fila con 4 celdas de estadística
        fila_labels = [Paragraph(stats[i][0], ParagraphStyle(
            f"sl_{i}", fontName="Helvetica", fontSize=7,
            textColor=GRIS, alignment=TA_CENTER, leading=9,
        )) for i in range(len(stats))]

        fila_valores = [Paragraph(stats[i][1], ParagraphStyle(
            f"sv_{i}", fontName="Helvetica-Bold", fontSize=14,
            textColor=_color_texto_nota(prom_general) if i in [0, 3] else INDIGO_OSCURO,
            alignment=TA_CENTER, leading=17,
        )) for i in range(len(stats))]

        tabla_stats = Table(
            [fila_labels, fila_valores],
            colWidths=[ancho_stat] * len(stats),
        )
        tabla_stats.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), GRIS_FILA),
            ("TOPPADDING",    (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING",   (0, 0), (-1, -1), 4),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("GRID",          (0, 0), (-1, -1), 0.5, GRIS_BORDE),
            ("BACKGROUND",    (0, 0), (0, -1), _color_nota(prom_general)),
            ("BACKGROUND",    (3, 0), (3, -1), _color_nota(prom_general)),
            ("BACKGROUND",    (1, 0), (1, -1), INDIGO_CLARO),
            ("LINEABOVE",     (0, 0), (-1, 0), 2, INDIGO),
        ]))

        return [encabezado, Spacer(1, 2 * mm), tabla_stats]

    # ── BLOQUE 5: ASISTENCIA ─────────────────────
    def _bloque_asistencia(self, datos: DatosBoletin) -> list:
        if datos.dias_totales is None:
            return []

        ancho_util = self.ANCHO_PAGINA - 2 * self.MARGEN
        encabezado = self._encabezado_seccion("📅  ASISTENCIA", ancho_util)
        es = self._estilos

        asistidos = datos.dias_asistidos or 0
        ausentes  = datos.dias_ausentes or 0
        totales   = datos.dias_totales or 1
        pct = round((asistidos / totales) * 100, 1)

        conceptos = [
            ("Días hábiles", str(totales), INDIGO_CLARO),
            ("Días asistidos", str(asistidos), VERDE_CLARO),
            ("Días ausentes", str(ausentes), ROJO_CLARO if ausentes > 0 else GRIS_FILA),
            ("% Asistencia", f"{pct}%", VERDE_CLARO if pct >= 80 else ROJO_CLARO),
        ]

        ancho_col = (ancho_util - 3 * mm) / len(conceptos)

        fila_lab = [Paragraph(c[0], ParagraphStyle(
            f"al_{i}", fontName="Helvetica", fontSize=7, textColor=GRIS,
            alignment=TA_CENTER, leading=9,
        )) for i, c in enumerate(conceptos)]

        fila_val = [Paragraph(c[1], ParagraphStyle(
            f"av_{i}", fontName="Helvetica-Bold", fontSize=13, textColor=GRIS_OSCURO,
            alignment=TA_CENTER, leading=16,
        )) for i, c in enumerate(conceptos)]

        tabla_asis = Table(
            [fila_lab, fila_val],
            colWidths=[ancho_col] * len(conceptos),
        )
        tabla_asis.setStyle(TableStyle([
            *[("BACKGROUND", (i, 0), (i, -1), c[2]) for i, c in enumerate(conceptos)],
            ("TOPPADDING",    (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING",   (0, 0), (-1, -1), 4),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("GRID",          (0, 0), (-1, -1), 0.5, GRIS_BORDE),
            ("LINEABOVE",     (0, 0), (-1, 0), 2, EMERALD),
        ]))

        return [encabezado, Spacer(1, 2 * mm), tabla_asis]

    # ── BLOQUE 6: OBSERVACIONES ──────────────────
    def _bloque_observaciones(self, datos: DatosBoletin) -> list:
        es = self._estilos
        ancho_util = self.ANCHO_PAGINA - 2 * self.MARGEN
        elementos = []

        encabezado = self._encabezado_seccion("📝  OBSERVACIONES Y RECOMENDACIONES", ancho_util)
        elementos.append(encabezado)
        elementos.append(Spacer(1, 2 * mm))

        ancho_col = (ancho_util - 3 * mm) / 2

        def caja_observacion(titulo: str, texto: str, color_borde: colors.Color) -> Table:
            contenido = texto.strip() if texto.strip() else "Sin observaciones en este período."
            t = Table(
                [[
                    Paragraph(titulo, ParagraphStyle(
                        "obs_tit", fontName="Helvetica-Bold", fontSize=7.5,
                        textColor=BLANCO, leading=10,
                    )),
                    Paragraph(contenido, ParagraphStyle(
                        "obs_txt", fontName="Helvetica", fontSize=8,
                        textColor=GRIS_OSCURO, alignment=TA_JUSTIFY,
                        leading=12, spaceAfter=2,
                    )),
                ]],
                colWidths=[3 * cm, ancho_col - 3 * cm],
            )
            t.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (0, -1), color_borde),
                ("BACKGROUND",    (1, 0), (1, -1), GRIS_FILA),
                ("VALIGN",        (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING",    (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING",   (0, 0), (-1, -1), 8),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
                ("BOX",           (0, 0), (-1, -1), 0.5, GRIS_BORDE),
            ]))
            return t

        director_box = caja_observacion(
            "Observaciones\nDirector / Rector",
            datos.observaciones_director,
            INDIGO,
        )
        docente_box = caja_observacion(
            "Observaciones\nDirector de Grupo",
            datos.observaciones_docente,
            EMERALD,
        )

        tabla_obs = Table(
            [[director_box, docente_box]],
            colWidths=[ancho_col, ancho_col],
        )
        tabla_obs.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (1, 0), (1, -1), 0),
            ("RIGHTPADDING", (0, 0), (0, -1), 2 * mm),
        ]))
        elementos.append(tabla_obs)

        return elementos

    # ── BLOQUE 7: ESCALA DE VALORACIÓN ───────────
    def _bloque_escala_valoracion(self) -> list:
        ancho_util = self.ANCHO_PAGINA - 2 * self.MARGEN
        es = self._estilos

        niveles = [
            ("Superior",  "4.6 – 5.0", VERDE_CLARO,    VERDE),
            ("Alto",      "4.0 – 4.5", VERDE_CLARO,    VERDE),
            ("Básico",    "3.0 – 3.9", AMARILLO_CLARO, AMARILLO),
            ("Bajo",      "0.0 – 2.9", ROJO_CLARO,     ROJO),
        ]

        ancho_nivel = (ancho_util - 3 * mm) / len(niveles)

        encabezado_txt = Paragraph(
            "ESCALA DE VALORACIÓN — Decreto 1290 MEN Colombia",
            ParagraphStyle(
                "esc_enc", fontName="Helvetica-Bold", fontSize=7,
                textColor=GRIS, alignment=TA_LEFT, leading=9,
            ),
        )

        fila_nombres = []
        fila_rangos  = []
        for nombre, rango, fondo, borde in niveles:
            fila_nombres.append(Paragraph(nombre, ParagraphStyle(
                f"niv_nom_{nombre}", fontName="Helvetica-Bold", fontSize=8,
                textColor=borde, alignment=TA_CENTER, leading=10,
            )))
            fila_rangos.append(Paragraph(rango, ParagraphStyle(
                f"niv_rng_{nombre}", fontName="Helvetica", fontSize=7.5,
                textColor=GRIS, alignment=TA_CENTER, leading=9,
            )))

        tabla_escala = Table(
            [fila_nombres, fila_rangos],
            colWidths=[ancho_nivel] * len(niveles),
        )
        tabla_escala.setStyle(TableStyle([
            *[("BACKGROUND", (i, 0), (i, -1), n[2]) for i, n in enumerate(niveles)],
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 4),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("GRID",          (0, 0), (-1, -1), 0.5, GRIS_BORDE),
            ("LINEABOVE",     (0, 0), (-1, 0), 1, GRIS),
        ]))

        return [encabezado_txt, Spacer(1, 1.5 * mm), tabla_escala]

    # ── BLOQUE 8: FIRMAS ─────────────────────────
    def _bloque_firmas(self, datos: DatosBoletin) -> list:
        ancho_util = self.ANCHO_PAGINA - 2 * self.MARGEN
        es = self._estilos

        encabezado = self._encabezado_seccion("✍  FIRMAS Y CONSTANCIAS", ancho_util)

        ancho_firma = (ancho_util - 4 * mm) / 3

        def celda_firma(nombre: str, cargo: str) -> list:
            linea = HRFlowable(
                width=ancho_firma - 16,
                thickness=0.8,
                color=GRIS_OSCURO,
                spaceAfter=3,
            )
            return [
                Spacer(1, 1.5 * cm),
                linea,
                Paragraph(nombre, es["firma_titulo"]),
                Paragraph(cargo, es["firma_subtitulo"]),
            ]

        col1 = celda_firma(datos.institucion.rector, "Rector(a)")
        col2 = celda_firma("____________________________", "Director(a) de Grupo")
        col3 = celda_firma(datos.estudiante.acudiente or "____________________________", "Padre / Acudiente")

        tabla_firmas = Table(
            [[col1, col2, col3]],
            colWidths=[ancho_firma, ancho_firma, ancho_firma],
        )
        tabla_firmas.setStyle(TableStyle([
            ("VALIGN",        (0, 0), (-1, -1), "BOTTOM"),
            ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
            ("TOPPADDING",    (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LINEAFTER",     (0, 0), (1, -1), 0.5, GRIS_BORDE),
        ]))

        nota_legal = Paragraph(
            f"Este boletín es un documento oficial de la {datos.institucion.nombre}. "
            "Conserve este documento para sus registros. "
            f"Generado el {datos.fecha_entrega.strftime('%d de %B de %Y')} "
            f"— Matrícula N° {datos.estudiante.numero_matricula}.",
            ParagraphStyle(
                "nota_legal", fontName="Helvetica", fontSize=6.5,
                textColor=GRIS, alignment=TA_CENTER, leading=9,
            ),
        )

        return [
            encabezado,
            Spacer(1, 2 * mm),
            tabla_firmas,
            Spacer(1, 5 * mm),
            HRFlowable(width=ancho_util, thickness=0.5, color=GRIS_BORDE),
            Spacer(1, 2 * mm),
            nota_legal,
        ]

    # ── DECORACIONES DE PÁGINA ───────────────────
    def _dibujar_decoraciones_pagina(self, canvas, doc):
        """Dibuja la barra lateral izquierda decorativa y el borde superior."""
        canvas.saveState()
        # Barra lateral izquierda (decorativa)
        canvas.setFillColor(INDIGO)
        canvas.rect(0, 0, 5, self.ALTO_PAGINA, fill=1, stroke=0)
        # Barra lateral derecha
        canvas.setFillColor(EMERALD)
        canvas.rect(self.ANCHO_PAGINA - 5, 0, 5, self.ALTO_PAGINA, fill=1, stroke=0)
        canvas.restoreState()

    def _dibujar_footer(self, canvas, doc):
        """Pie de página con numeración."""
        canvas.saveState()
        canvas.setFont("Helvetica", 6.5)
        canvas.setFillColor(GRIS)
        canvas.drawCentredString(
            self.ANCHO_PAGINA / 2,
            8 * mm,
            f"{self._datos_actuales.institucion.nombre}  |  Boletín Académico {self._datos_actuales.año_lectivo}  |  Página {doc.page}",
        )
        canvas.restoreState()

    # ── UTILIDADES ───────────────────────────────
    def _encabezado_seccion(self, titulo: str, ancho: float) -> Table:
        """Retorna una barra de sección con fondo indigo."""
        t = Table(
            [[Paragraph(titulo, self._estilos["encabezado_seccion"])]],
            colWidths=[ancho],
        )
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), INDIGO),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ]))
        return t

    def _logo_placeholder(self, ancho: float, alto: float) -> Table:
        """Placeholder SVG cuando no hay logo disponible."""
        t = Table(
            [[Paragraph("🏫\nLOGO", ParagraphStyle(
                "logo_ph", fontName="Helvetica-Bold", fontSize=9,
                textColor=INDIGO, alignment=TA_CENTER, leading=14,
            ))]],
            colWidths=[ancho],
            rowHeights=[alto],
        )
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), INDIGO_CLARO),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
            ("BOX",           (0, 0), (-1, -1), 1.5, INDIGO),
        ]))
        return t
