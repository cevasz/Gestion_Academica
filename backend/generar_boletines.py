#!/usr/bin/env python3
"""
generar_boletines.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Script de ejecución principal para el generador de boletines.

Uso:
    python3 generar_boletines.py              # Genera todos los ejemplos
    python3 generar_boletines.py --uno        # Solo el primer estudiante
    python3 generar_boletines.py --lote       # Lote completo en carpeta

Los PDFs se guardan en: ./boletines_generados/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import os
import sys
import argparse
import time

# ── Agregar raíz del proyecto al path ───────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.boletines.generador_boletin import GeneradorBoletin
from backend.boletines.datos_ejemplo import (
    ESTUDIANTE_ANA_SOFIA,
    ESTUDIANTE_CARLOS_ANDRES,
    TODOS_LOS_BOLETINES,
)

CARPETA_SALIDA = os.path.join(os.path.dirname(__file__), "boletines_generados")


def banner():
    print()
    print("━" * 58)
    print("  🎓 GENERADOR DE BOLETINES ACADÉMICOS PDF")
    print("  Proyecto: Digitalización Institucional")
    print("  Librería: ReportLab 5.x  |  Escala: 0.0 – 5.0 (MEN)")
    print("━" * 58)
    print()


def generar_uno(nombre_archivo: str = "boletin_ana_sofia.pdf"):
    """Genera el boletín de Ana Sofía como demostración."""
    ruta = os.path.join(CARPETA_SALIDA, nombre_archivo)
    gen = GeneradorBoletin()

    print(f"  📄 Generando boletín individual...")
    inicio = time.time()
    gen.generar(ESTUDIANTE_ANA_SOFIA, ruta)
    elapsed = time.time() - inicio

    print(f"  ✅ Generado en {elapsed:.2f}s")
    print(f"  📁 Ruta: {os.path.abspath(ruta)}")
    return ruta


def generar_lote():
    """Genera todos los boletines de ejemplo en lote."""
    gen = GeneradorBoletin()

    print(f"  📦 Generando lote de {len(TODOS_LOS_BOLETINES)} boletines...")
    inicio = time.time()
    rutas = gen.generar_lote(TODOS_LOS_BOLETINES, CARPETA_SALIDA)
    elapsed = time.time() - inicio

    print()
    print(f"  ✅ {len(rutas)} boletines generados en {elapsed:.2f}s")
    print(f"  📁 Carpeta: {os.path.abspath(CARPETA_SALIDA)}")
    return rutas


def main():
    banner()

    parser = argparse.ArgumentParser(
        description="Generador de boletines académicos PDF",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "--uno",
        action="store_true",
        help="Genera solo el boletín de demostración (Ana Sofía)",
    )
    parser.add_argument(
        "--lote",
        action="store_true",
        help="Genera todos los boletines de ejemplo",
    )
    parser.add_argument(
        "--salida",
        type=str,
        default=CARPETA_SALIDA,
        help=f"Carpeta de salida (por defecto: {CARPETA_SALIDA})",
    )
    args = parser.parse_args()

    os.makedirs(args.salida, exist_ok=True)

    if args.lote:
        generar_lote()
    else:
        # Por defecto: genera ambos ejemplos
        print("  Generando boletín con desempeño ALTO (Ana Sofía)...")
        r1 = os.path.join(args.salida, "boletin_ana_sofia_martinez_p4_2026.pdf")
        GeneradorBoletin().generar(ESTUDIANTE_ANA_SOFIA, r1)
        print(f"  ✅ {r1}")

        print()
        print("  Generando boletín con desempeño BAJO (Carlos Andrés)...")
        r2 = os.path.join(args.salida, "boletin_carlos_andres_rojas_p4_2026.pdf")
        GeneradorBoletin().generar(ESTUDIANTE_CARLOS_ANDRES, r2)
        print(f"  ✅ {r2}")

    print()
    print("━" * 58)
    print("  Listo. Abre los PDFs con cualquier visor.")
    print("━" * 58)
    print()


if __name__ == "__main__":
    main()
