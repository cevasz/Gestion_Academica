import { useMemo, useState } from 'react';

/* ─── Datos de demo ──────────────────────────────────────── */
const periodos = ['1', '2', '3', '4'];

const materiasBase = [
  'Matemáticas',
  'Español',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Inglés',
];

const GRUPOS = ['6A', '7B', '8A', '9C', '10A', '11B'];

const estudiantesBase = [
  { id: 'est-001', codigo: '2026001', nombre: 'Ana Sofia Martinez' },
  { id: 'est-002', codigo: '2026002', nombre: 'Carlos Andres Rojas' },
  { id: 'est-003', codigo: '2026003', nombre: 'Valentina Gomez Ruiz' },
  { id: 'est-004', codigo: '2026004', nombre: 'Juan David Torres' },
  { id: 'est-005', codigo: '2026005', nombre: 'Isabella Castro Peña' },
  { id: 'est-006', codigo: '2026006', nombre: 'Miguel Angel Cardenas' },
  { id: 'est-007', codigo: '2026007', nombre: 'Laura Camila Vargas' },
  { id: 'est-008', codigo: '2026008', nombre: 'Samuel Ortega Mora' },
];

/* ─── Helpers ────────────────────────────────────────────── */
const crearNotasIniciales = () =>
  estudiantesBase.reduce((acc, est) => {
    acc[est.id] = materiasBase.reduce((mat, m) => {
      mat[m] = periodos.reduce((per, p) => { per[p] = ''; return per; }, {});
      return mat;
    }, {});
    return acc;
  }, {});

const normalizarNota = (v) => {
  if (v === '') return '';
  const n = Number(v);
  if (Number.isNaN(n) || n < 0 || n > 5) return null;
  return v;
};

const calcularPromedio = (notasEst, materias) => {
  const notas = materias.flatMap(m =>
    periodos.map(p => Number(notasEst?.[m]?.[p])).filter(n => !Number.isNaN(n) && n > 0)
  );
  if (!notas.length) return 0;
  return Math.round(notas.reduce((a, b) => a + b, 0) / notas.length * 100) / 100;
};

const claseNota = (nota) => {
  const v = Number(nota);
  if (nota === '' || Number.isNaN(v)) return {
    border: '1px solid var(--border)', background: '#fff', color: 'var(--navy)',
  };
  if (v < 3) return {
    border: '1px solid #fca5a5', background: 'var(--danger-bg)', color: 'var(--danger)',
  };
  if (v < 4) return {
    border: '1px solid #fcd34d', background: 'var(--warning-bg)', color: 'var(--warning)',
  };
  return {
    border: '1px solid #86efac', background: 'var(--success-bg)', color: 'var(--success)',
  };
};

const clasePromedio = (p) => {
  if (p === 0) return { background: 'var(--sage-light)', color: 'var(--brown)' };
  if (p < 3)   return { background: 'var(--danger-bg)',  color: 'var(--danger)' };
  if (p < 4)   return { background: 'var(--warning-bg)', color: 'var(--warning)' };
  return { background: 'var(--success-bg)', color: 'var(--success)' };
};

/* ─── Selector de materias (dropdown) ───────────────────── */
const SelectorMaterias = ({ seleccionadas, onChange }) => {
  const [open, setOpen] = useState(false);

  const toggle = (m) => {
    if (seleccionadas.includes(m) && seleccionadas.length === 1) return; // al menos una
    onChange(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.4rem 0.75rem',
          border: '1px solid var(--border)',
          borderRadius: 7,
          background: '#fff',
          color: 'var(--navy)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          minWidth: 180,
          justifyContent: 'space-between',
        }}
      >
        <span>
          {seleccionadas.length === materiasBase.length
            ? 'Todas las materias'
            : `${seleccionadas.length} materia${seleccionadas.length > 1 ? 's' : ''}`}
        </span>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
        </svg>
      </button>

      {open && (
        <div className="anim-slide-down" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 20,
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: 'var(--shadow-md)',
          minWidth: 200,
          overflow: 'hidden',
        }}>
          {materiasBase.map(m => {
            const activa = seleccionadas.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggle(m)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%',
                  padding: '0.5rem 0.875rem',
                  background: activa ? 'var(--cream-light)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.8125rem',
                  color: 'var(--navy)',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!activa) e.currentTarget.style.background = 'var(--cream-light)'; }}
                onMouseLeave={e => { if (!activa) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: activa ? 'none' : '1.5px solid var(--border)',
                  background: activa ? 'var(--navy)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {activa && <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>}
                </span>
                {m}
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid var(--border)', padding: '0.375rem 0.875rem' }}>
            <button
              type="button"
              onClick={() => onChange(seleccionadas.length === materiasBase.length ? [materiasBase[0]] : [...materiasBase])}
              style={{ fontSize: '0.75rem', color: 'var(--brown)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)' }}
            >
              {seleccionadas.length === materiasBase.length ? 'Seleccionar menos' : 'Seleccionar todas'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── RegistroCalificaciones ─────────────────────────────── */
const RegistroCalificaciones = () => {
  const [grupo, setGrupo] = useState('8A');
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState(materiasBase.slice(0, 3));
  const [calificaciones, setCalificaciones] = useState(crearNotasIniciales);
  const [errores, setErrores] = useState({});
  const [filasGuardadas, setFilasGuardadas] = useState({});

  const estadisticas = useMemo(() => {
    const promedios = estudiantesBase.map(e => calcularPromedio(calificaciones[e.id], materiasSeleccionadas));
    return {
      alto:     promedios.filter(p => p >= 4).length,
      basico:   promedios.filter(p => p >= 3 && p < 4).length,
      bajo:     promedios.filter(p => p > 0 && p < 3).length,
      sinNotas: promedios.filter(p => p === 0).length,
    };
  }, [calificaciones, materiasSeleccionadas]);

  const actualizarNota = (estId, materia, periodo, valor) => {
    const nota = normalizarNota(valor);
    const key = `${estId}-${materia}-${periodo}`;
    if (nota === null) { setErrores(p => ({ ...p, [key]: 'Debe ser entre 0 y 5' })); return; }
    setErrores(p => { const n = { ...p }; delete n[key]; return n; });
    setFilasGuardadas(p => ({ ...p, [estId]: false }));
    setCalificaciones(p => ({
      ...p,
      [estId]: { ...p[estId], [materia]: { ...p[estId][materia], [periodo]: nota } },
    }));
  };

  const guardarFila = (estId) => setFilasGuardadas(p => ({ ...p, [estId]: true }));

  /* ── Render ── */
  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Controles */}
      <div className="anim-fade-in card" style={{ padding: '1.125rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          {/* Selector grupo */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
              Grupo
            </label>
            <select
              value={grupo}
              onChange={e => setGrupo(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 7,
                background: '#fff',
                color: 'var(--navy)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                minWidth: 120,
                outline: 'none',
              }}
            >
              {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Selector materias */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
              Materias visibles
            </label>
            <SelectorMaterias seleccionadas={materiasSeleccionadas} onChange={setMateriasSeleccionadas} />
          </div>

          {/* Info */}
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--navy)', fontWeight: 600 }}>Grupo {grupo}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--brown)' }}>
              {estudiantesBase.length} est. · {materiasSeleccionadas.length} mat. · 4 períodos
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas semáforo */}
      <div className="anim-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Alto (≥4.0)', value: estadisticas.alto,     bg: 'var(--success-bg)', color: 'var(--success)',  border: '#86efac' },
          { label: 'Básico (3–3.9)', value: estadisticas.basico, bg: 'var(--warning-bg)', color: 'var(--warning)', border: '#fcd34d' },
          { label: 'Bajo (<3.0)',  value: estadisticas.bajo,     bg: 'var(--danger-bg)',  color: 'var(--danger)',  border: '#fca5a5' },
          { label: 'Sin calificar', value: estadisticas.sinNotas, bg: 'var(--sage-light)', color: 'var(--brown)',  border: 'var(--sage-dark)' },
        ].map(({ label, value, bg, color, border }) => (
          <div key={label} className="anim-fade-in" style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 9,
            padding: '0.875rem 1rem',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {label}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla de calificaciones */}
      <div className="anim-fade-in card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{
          padding: '0.75rem 1.25rem',
          background: 'var(--cream-light)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy)', flex: 1 }}>
            Calificaciones — Grupo {grupo}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'Alto', bg: 'var(--success-bg)', color: 'var(--success)' },
              { label: 'Básico', bg: 'var(--warning-bg)', color: 'var(--warning)' },
              { label: 'Bajo', bg: 'var(--danger-bg)', color: 'var(--danger)' },
            ].map(({ label, bg, color }) => (
              <span key={label} className="badge" style={{ background: bg, color, fontWeight: 600 }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0,
            fontSize: '0.8125rem',
          }}>
            <thead>
              <tr>
                <th style={{
                  position: 'sticky', left: 0, zIndex: 10,
                  background: 'var(--cream-light)',
                  padding: '0.625rem 1rem',
                  textAlign: 'left',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--brown)',
                  borderBottom: '2px solid var(--cream-dark)',
                  borderRight: '1px solid var(--border)',
                  minWidth: 200,
                }}>
                  Estudiante
                </th>
                {materiasSeleccionadas.map(m => (
                  <th key={m} colSpan={periodos.length} style={{
                    background: 'var(--cream-light)',
                    padding: '0.625rem 0.5rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--navy)',
                    borderBottom: '2px solid var(--cream-dark)',
                    borderRight: '1px solid var(--border)',
                  }}>
                    {m}
                  </th>
                ))}
                <th style={{
                  background: 'var(--cream-light)',
                  padding: '0.625rem 0.75rem',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--brown)',
                  borderBottom: '2px solid var(--cream-dark)',
                  borderRight: '1px solid var(--border)',
                  textAlign: 'center',
                  minWidth: 80,
                }}>
                  Prom.
                </th>
                <th style={{
                  background: 'var(--cream-light)',
                  padding: '0.625rem 0.75rem',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--brown)',
                  borderBottom: '2px solid var(--cream-dark)',
                  textAlign: 'center',
                  minWidth: 90,
                }}>
                  Guardar
                </th>
              </tr>
              <tr style={{ background: '#fff' }}>
                <td style={{
                  position: 'sticky', left: 0, zIndex: 10,
                  background: '#fff',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  padding: '0.375rem 1rem',
                  fontSize: '0.7rem',
                  color: 'var(--brown)',
                  fontWeight: 600,
                }} />
                {materiasSeleccionadas.flatMap(m =>
                  periodos.map(p => (
                    <td key={`${m}-${p}`} style={{
                      textAlign: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--brown)',
                      borderBottom: '1px solid var(--border)',
                      borderRight: '1px solid var(--border)',
                      padding: '0.375rem 0.25rem',
                    }}>
                      P{p}
                    </td>
                  ))
                )}
                <td style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }} />
                <td style={{ borderBottom: '1px solid var(--border)' }} />
              </tr>
            </thead>
            <tbody>
              {estudiantesBase.map((est, rowIdx) => {
                const promedio = calcularPromedio(calificaciones[est.id], materiasSeleccionadas);
                return (
                  <tr key={est.id} style={{
                    background: rowIdx % 2 === 0 ? '#fff' : 'var(--cream-light)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,41,71,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = rowIdx % 2 === 0 ? '#fff' : 'var(--cream-light)'}
                  >
                    <td style={{
                      position: 'sticky', left: 0, zIndex: 5,
                      background: 'inherit',
                      padding: '0.625rem 1rem',
                      borderBottom: '1px solid var(--border)',
                      borderRight: '1px solid var(--border)',
                    }}>
                      <p style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 1 }}>{est.nombre}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--brown)' }}>#{est.codigo}</p>
                    </td>

                    {materiasSeleccionadas.flatMap(m =>
                      periodos.map(p => {
                        const valor = calificaciones[est.id]?.[m]?.[p] ?? '';
                        const key = `${est.id}-${m}-${p}`;
                        return (
                          <td key={key} style={{
                            textAlign: 'center',
                            padding: '0.5rem 0.375rem',
                            borderBottom: '1px solid var(--border)',
                            borderRight: '1px solid var(--border)',
                          }}>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0" max="5" step="0.1"
                              value={valor}
                              aria-label={`${est.nombre} ${m} P${p}`}
                              onChange={e => actualizarNota(est.id, m, p, e.target.value)}
                              style={{
                                width: 60, height: 36,
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                borderRadius: 6,
                                outline: 'none',
                                fontFamily: 'var(--font-sans)',
                                cursor: 'text',
                                transition: 'border-color 0.2s, background 0.2s',
                                ...claseNota(valor),
                              }}
                              placeholder="—"
                              onFocus={e => { e.target.style.outline = '2px solid var(--navy)'; e.target.style.outlineOffset = '1px'; }}
                              onBlur={e => { e.target.style.outline = 'none'; }}
                            />
                            {errores[key] && (
                              <p style={{ fontSize: '0.65rem', color: 'var(--danger)', marginTop: 2, lineHeight: 1.3, maxWidth: 60 }}>
                                {errores[key]}
                              </p>
                            )}
                          </td>
                        );
                      })
                    )}

                    {/* Promedio */}
                    <td style={{ textAlign: 'center', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: 56, padding: '0.25rem 0.5rem',
                        borderRadius: 7,
                        fontSize: '0.9375rem', fontWeight: 800,
                        ...clasePromedio(promedio),
                      }}>
                        {promedio.toFixed(2)}
                      </span>
                    </td>

                    {/* Botón guardar */}
                    <td style={{ textAlign: 'center', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                      <button
                        type="button"
                        onClick={() => guardarFila(est.id)}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          fontFamily: 'var(--font-sans)',
                          transition: 'background 0.2s, transform 0.15s',
                          background: filasGuardadas[est.id] ? 'var(--success-bg)' : 'var(--navy)',
                          color: filasGuardadas[est.id] ? 'var(--success)' : '#fff',
                        }}
                        onMouseEnter={e => { if (!filasGuardadas[est.id]) e.currentTarget.style.background = 'var(--navy-light)'; }}
                        onMouseLeave={e => { if (!filasGuardadas[est.id]) e.currentTarget.style.background = 'var(--navy)'; }}
                      >
                        {filasGuardadas[est.id] ? '✓ Guardado' : 'Guardar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistroCalificaciones;
