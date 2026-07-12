import { useState } from 'react';
import {
  agruparModulosPorCategoria,
  obtenerNombrePlan,
  PRECIOS_PLANES
} from '../constants/planes.constants';

/* ─── Iconos SVG ─────────────────────────────────────────── */
const PATHS = {
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  folder: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  award: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  message: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  ai: 'M13 10V3L4 14h7v7l9-11h-7z',
  brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  graph: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
  'document-report': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  whatsapp: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
  signature: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  'calendar-event': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  robot: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

const Icon = ({ name, size = 18 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={PATHS[name] || PATHS.document} />
  </svg>
);

/* ─── Item de menú ───────────────────────────────────────── */
const ItemMenu = ({ modulo, disponible, activo, expandido, onNavegar, onMostrarUpgrade }) => {
  if (!disponible) {
    return (
      <button
        onClick={() => onMostrarUpgrade(modulo.planMinimo)}
        title={`${modulo.nombre} — Requiere ${obtenerNombrePlan(modulo.planMinimo)}`}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: expandido ? '0.5rem 0.75rem' : '0.5rem',
          borderRadius: 8,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: 'rgba(243,228,201,0.3)',
          textAlign: 'left',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(243,228,201,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{
          width: 32, height: 32, borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(243,228,201,0.06)', flexShrink: 0
        }}>
          <Icon name={modulo.icono} size={16} />
        </span>
        {expandido && (
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              display: 'block', fontSize: '0.8125rem', fontWeight: 500,
              textDecoration: 'line-through', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {modulo.nombre}
            </span>
            <span style={{ display: 'block', fontSize: '0.6875rem', color: 'rgba(211,212,192,0.5)', marginTop: 1 }}>
              Plan {obtenerNombrePlan(modulo.planMinimo)}
            </span>
          </span>
        )}
        {expandido && (
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0, opacity: 0.4 }}>
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => onNavegar(modulo.id)}
      title={!expandido ? modulo.nombre : undefined}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: expandido ? '0.5rem 0.75rem' : '0.5rem',
        borderRadius: 8,
        border: 'none',
        background: activo ? 'rgba(243,228,201,0.14)' : 'transparent',
        cursor: 'pointer',
        color: activo ? 'var(--cream)' : 'rgba(243,228,201,0.65)',
        textAlign: 'left',
        transition: 'background 0.2s, color 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!activo) {
          e.currentTarget.style.background = 'rgba(243,228,201,0.08)';
          e.currentTarget.style.color = 'var(--cream)';
        }
      }}
      onMouseLeave={e => {
        if (!activo) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(243,228,201,0.65)';
        }
      }}
    >
      {/* Indicador activo */}
      {activo && (
        <span style={{
          position: 'absolute',
          left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 20, borderRadius: '0 3px 3px 0',
          background: 'var(--cream)',
        }} />
      )}

      <span style={{
        width: 32, height: 32, borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: activo ? 'rgba(243,228,201,0.18)' : 'rgba(243,228,201,0.07)',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}>
        <Icon name={modulo.icono} size={16} />
      </span>

      {expandido && (
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block', fontSize: '0.8125rem', fontWeight: activo ? 600 : 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {modulo.nombre}
          </span>
        </span>
      )}
    </button>
  );
};

/* ─── Menú Lateral ───────────────────────────────────────── */
const MenuLateral = ({ planActual, onNavegar, vistaActual, onSolicitarUpgrade }) => {
  const [expandido, setExpandido] = useState(true);
  const [mostrarUpgrade, setMostrarUpgrade] = useState(null);
  const modulosAgrupados = agruparModulosPorCategoria(planActual);

  return (
    <>
      <aside
        className="anim-fade-in-left"
        style={{
          width: expandido ? 240 : 68,
          background: 'var(--navy)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          zIndex: 40,
        }}
      >
        {/* Logo / Header */}
        <div style={{
          padding: '0 0.75rem',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(243,228,201,0.1)',
          flexShrink: 0,
        }}>
          {expandido && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <span style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--cream)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}>
                SistemaEdu
              </span>
              <span style={{
                display: 'block',
                fontSize: '0.6875rem',
                color: 'rgba(211,212,192,0.6)',
                marginTop: 1,
              }}>
                {obtenerNombrePlan(planActual)}
              </span>
            </div>
          )}
          <button
            onClick={() => setExpandido(!expandido)}
            style={{
              width: 32, height: 32, borderRadius: 7,
              background: 'rgba(243,228,201,0.08)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(243,228,201,0.7)',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(243,228,201,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(243,228,201,0.08)'}
            aria-label={expandido ? 'Colapsar menú' : 'Expandir menú'}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {expandido
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              }
            </svg>
          </button>
        </div>

        {/* Módulos */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0.75rem 0.625rem' }}>
          {Object.entries(modulosAgrupados).map(([categoria, { disponibles, bloqueados }]) => (
            <div key={categoria} style={{ marginBottom: '1.25rem' }}>
              {expandido && (
                <span style={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(211,212,192,0.4)',
                  padding: '0 0.5rem',
                  marginBottom: '0.375rem',
                }}>
                  {categoria}
                </span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {disponibles.map(modulo => (
                  <ItemMenu
                    key={modulo.id}
                    modulo={modulo}
                    disponible={true}
                    activo={vistaActual === modulo.id}
                    expandido={expandido}
                    onNavegar={onNavegar}
                    onMostrarUpgrade={setMostrarUpgrade}
                  />
                ))}
                {bloqueados.map(modulo => (
                  <ItemMenu
                    key={modulo.id}
                    modulo={modulo}
                    disponible={false}
                    activo={false}
                    expandido={expandido}
                    onNavegar={onNavegar}
                    onMostrarUpgrade={setMostrarUpgrade}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer upgrade */}
        {expandido && (
          <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(243,228,201,0.1)', flexShrink: 0 }}>
            <div style={{
              background: 'rgba(243,228,201,0.07)',
              border: '1px solid rgba(243,228,201,0.12)',
              borderRadius: 9,
              padding: '0.875rem',
            }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cream)', marginBottom: 3 }}>
                ¿Necesitas más módulos?
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(211,212,192,0.55)', marginBottom: 10 }}>
                Mejora tu plan y desbloquea funcionalidades
              </p>
              <button
                onClick={() => onSolicitarUpgrade()}
                style={{
                  width: '100%',
                  padding: '0.4375rem 0.75rem',
                  borderRadius: 7,
                  border: '1px solid rgba(243,228,201,0.25)',
                  background: 'rgba(243,228,201,0.1)',
                  color: 'var(--cream)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(243,228,201,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(243,228,201,0.1)'}
              >
                Ver planes
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Modal de upgrade */}
      {mostrarUpgrade && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10,41,71,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMostrarUpgrade(null); }}
        >
          <div className="anim-scale-in" style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: 460,
            width: '100%',
            overflow: 'hidden',
          }}>
            {/* Banner del plan */}
            <div style={{
              background: 'var(--navy)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Requiere plan
                </p>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--cream)', marginTop: 4 }}>
                  {obtenerNombrePlan(mostrarUpgrade)}
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cream)', marginTop: 8 }}>
                  {PRECIOS_PLANES[mostrarUpgrade]?.precio}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--sage)', marginTop: 4 }}>
                  {PRECIOS_PLANES[mostrarUpgrade]?.descripcion}
                </p>
              </div>
              <button
                onClick={() => setMostrarUpgrade(null)}
                style={{
                  width: 32, height: 32, borderRadius: 7,
                  background: 'rgba(243,228,201,0.1)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(243,228,201,0.7)',
                }}
                aria-label="Cerrar"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Características */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 10 }}>
                Este plan incluye:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PRECIOS_PLANES[mostrarUpgrade]?.caracteristicas?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg width="16" height="16" fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--navy)' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acción */}
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              <button
                onClick={() => {
                  onSolicitarUpgrade(mostrarUpgrade);
                  setMostrarUpgrade(null);
                }}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', borderRadius: 8 }}
              >
                Solicitar Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuLateral;
