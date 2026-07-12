/**
 * Aplicación Principal
 * Punto de entrada de la aplicación con routing y estado global
 */

import { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';

// Componentes
import MenuLateral from './components/MenuLateral';
import MatriculaForm from './components/MatriculaForm';
import GestionDocumental from './components/GestionDocumental';
import PerfilEstudiante from './components/PerfilEstudiante';
import RegistroCalificaciones from './components/RegistroCalificaciones';
import ControlAsistencia from './components/ControlAsistencia';
import Comunicados from './components/Comunicados';
import Biblioteca from './components/Biblioteca';

// Páginas
import HomePage from './pages/HomePage';

// Mapa de títulos por vista
const TITULOS = {
  home:            'Panel Principal',
  matricula:       'Matrícula Digital',
  documentos:      'Gestión Documental',
  perfil:          'Perfil del Estudiante',
  calificaciones:  'Registro de Calificaciones',
  asistencia:       'Control de Asistencia',
  comunicados:      'Comunicados',
  biblioteca:       'Biblioteca Digital',
};

/**
 * Componente principal con lógica de navegación
 */
const AppContent = () => {
  const { planActual, setPlanActual } = useApp();
  const [vistaActual, setVistaActual] = useState('home');
  const [mostrarSelectorPlan, setMostrarSelectorPlan] = useState(false);

  const handleNavegar = (moduloId) => {
    setVistaActual(moduloId);
  };

  const handleSolicitarUpgrade = (planSolicitado = null) => {
    if (planSolicitado) {
      alert(
        `Solicitud de upgrade a ${planSolicitado} enviada.\n` +
        `Un asesor se pondrá en contacto pronto.`
      );
    } else {
      setMostrarSelectorPlan(true);
    }
  };

  const renderContenido = () => {
    switch (vistaActual) {
      case 'home':           return <HomePage onNavegar={handleNavegar} />;
      case 'matricula':      return <MatriculaForm />;
      case 'documentos':     return <GestionDocumental />;
      case 'perfil':         return <PerfilEstudiante />;
      case 'calificaciones': return <RegistroCalificaciones />;
      case 'asistencia':     return <ControlAsistencia />;
      case 'comunicados':    return <Comunicados />;
      case 'biblioteca':     return <Biblioteca />;
      default:
        return (
          <div className="flex items-center justify-center h-full anim-fade-in" style={{ padding: '4rem 1.5rem' }}>
            <div className="text-center">
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--cream)', margin: '0 auto 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="32" height="32" fill="none" stroke="var(--brown)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                Módulo en Desarrollo
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--brown)' }}>
                Este módulo estará disponible próximamente
              </p>
            </div>
          </div>
        );
    }
  };

  const tituloActual = TITULOS[vistaActual] || 'Módulo en Desarrollo';

  const planes = [
    { value: 'esencial',   label: 'Esencial' },
    { value: 'smart',      label: 'Smart' },
    { value: 'campus_ia',  label: 'Campus IA' },
    { value: 'enterprise', label: 'Enterprise' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* Menú Lateral */}
      <MenuLateral
        planActual={planActual}
        onNavegar={handleNavegar}
        vistaActual={vistaActual}
        onSolicitarUpgrade={handleSolicitarUpgrade}
      />

      {/* Área principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          padding: '0 1.5rem',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 30,
          position: 'sticky',
          top: 0,
        }}>
          <h1 style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--navy)',
            letterSpacing: '-0.01em',
          }}>
            {tituloActual}
          </h1>

          {/* Selector de plan demo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--brown)',
              fontWeight: 500,
            }}>
              Demo:
            </span>
            <select
              value={planActual}
              onChange={(e) => setPlanActual(e.target.value)}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--navy)',
                background: 'var(--cream-light)',
                border: '1px solid var(--cream-dark)',
                borderRadius: 6,
                padding: '0.3rem 0.625rem',
                cursor: 'pointer',
              }}
            >
              {planes.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Contenido scrolleable */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderContenido()}
        </main>
      </div>

      {/* Modal selector de planes */}
      {mostrarSelectorPlan && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10,41,71,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMostrarSelectorPlan(false); }}
        >
          <div className="anim-scale-in" style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: 860,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Header modal */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)' }}>
                  Planes Disponibles
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--brown)', marginTop: 2 }}>
                  Selecciona el plan que mejor se ajuste a tu institución
                </p>
              </div>
              <button
                onClick={() => setMostrarSelectorPlan(false)}
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '50%', padding: '0.4rem' }}
                aria-label="Cerrar"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Grid de planes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              padding: '1.5rem 2rem 2rem',
            }}>
              {[
                { value: 'esencial',  nombre: 'Esencial',   precio: 'Base',   desc: 'Digitalización básica completa' },
                { value: 'smart',     nombre: 'Smart',      precio: '$4M/mes', desc: 'Campus conectado' },
                { value: 'campus_ia', nombre: 'Campus IA',  precio: '$5.5M/mes', desc: 'Inteligencia institucional' },
                { value: 'enterprise',nombre: 'Enterprise', precio: '$7M/mes', desc: 'Ecosistema autónomo' },
              ].map((plan) => {
                const activo = planActual === plan.value;
                return (
                  <div
                    key={plan.value}
                    className="anim-fade-in"
                    style={{
                      border: activo ? '2px solid var(--navy)' : '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '1.25rem',
                      background: activo ? 'rgba(10,41,71,0.04)' : '#fff',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                    }}
                  >
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                      {plan.nombre}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--brown)', marginBottom: 8 }}>
                      {plan.desc}
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 16 }}>
                      {plan.precio}
                    </p>
                    <button
                      onClick={() => { setPlanActual(plan.value); setMostrarSelectorPlan(false); }}
                      className={activo ? 'btn btn-primary' : 'btn btn-ghost'}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    >
                      {activo ? 'Plan actual' : 'Seleccionar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * App Principal con Provider
 */
const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
