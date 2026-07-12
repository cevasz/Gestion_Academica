/**
 * Página Principal (Home / Dashboard)
 */

import { useApp } from '../contexts/AppContext';
import { obtenerNombrePlan } from '../constants/planes.constants';

/* ─── Tarjeta de estadística ─────────────────────────────── */
const StatCard = ({ label, value, icon, delay = 0 }) => (
  <div
    className="anim-fade-in card"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem',
      animationDelay: `${delay}s`,
    }}
  >
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>
        {value}
      </p>
    </div>
    <div style={{
      width: 48, height: 48,
      background: 'var(--cream)',
      borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--navy)',
      flexShrink: 0,
    }}>
      {icon}
    </div>
  </div>
);

/* ─── Tarjeta de acceso rápido ───────────────────────────── */
const QuickCard = ({ title, desc, icon, onClick, delay = 0 }) => (
  <button
    onClick={onClick}
    className="anim-fade-in card"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      padding: '1rem 1.25rem',
      textAlign: 'left',
      cursor: 'pointer',
      border: '1px solid var(--border)',
      background: '#fff',
      borderRadius: 10,
      width: '100%',
      animationDelay: `${delay}s`,
      transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.borderColor = 'var(--navy)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{
      width: 40, height: 40,
      background: 'var(--cream)',
      borderRadius: 9,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--navy)',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 2 }}>{title}</p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--brown)' }}>{desc}</p>
    </div>
    <svg width="16" height="16" fill="none" stroke="var(--sage-dark)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

/* ─── Homepage ───────────────────────────────────────────── */
const HomePage = ({ onNavegar }) => {
  const { institucion, planActual } = useApp();
  const ahora = new Date();
  const hora = ahora.getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1200, margin: '0 auto' }}>

      {/* Bienvenida */}
      <div className="anim-fade-in" style={{ marginBottom: '1.75rem' }}>
        <div style={{
          background: 'var(--navy)',
          borderRadius: 12,
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--sage)', fontWeight: 500, marginBottom: 4 }}>
              {saludo}
            </p>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--cream)', marginBottom: 6 }}>
              {institucion ? institucion.nombre : 'Modo Demostración'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(211,212,192,0.7)' }}>
              Panel de control — <strong style={{ color: 'var(--cream)' }}>{obtenerNombrePlan(planActual)}</strong>
            </p>
          </div>
          {/* Decoración */}
          <div style={{
            display: 'flex', gap: 6, opacity: 0.18,
          }}>
            {[48, 36, 24].map((s, i) => (
              <div key={i} style={{
                width: s, height: s,
                borderRadius: 8,
                background: 'var(--cream)',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="anim-stagger" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        <StatCard
          label="Estudiantes"
          value="—"
          delay={0.04}
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          label="Matrículas"
          value="—"
          delay={0.08}
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Documentos"
          value="—"
          delay={0.12}
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Módulos"
          value="7+"
          delay={0.16}
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
      </div>

      {/* Accesos rápidos */}
      <div className="anim-fade-in" style={{ animationDelay: '0.2s' }}>
        <p className="section-title">Accesos rápidos</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.875rem',
        }}>
          <QuickCard
            title="Nueva Matrícula"
            desc="Registrar o renovar un estudiante"
            delay={0.22}
            onClick={() => onNavegar?.('matricula')}
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          />
          <QuickCard
            title="Subir Documento"
            desc="Gestión documental institucional"
            delay={0.26}
            onClick={() => onNavegar?.('documentos')}
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
          />
          <QuickCard
            title="Buscar Estudiante"
            desc="Ver perfil integral del estudiante"
            delay={0.30}
            onClick={() => onNavegar?.('perfil')}
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <QuickCard
            title="Registrar Notas"
            desc="Calificaciones por período y materia"
            delay={0.34}
            onClick={() => onNavegar?.('calificaciones')}
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
