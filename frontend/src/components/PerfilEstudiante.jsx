import { useCallback, useEffect, useState } from 'react';
import estudianteService from '../services/estudiante.service';
import documentoService from '../services/documento.service';
import acudienteService from '../services/acudiente.service';

/* ─── Helpers ────────────────────────────────────────────── */
const calcularEdad = (fecha) => {
  if (!fecha) return '—';
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

const formatFecha = (f) => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
};

const badgeEstado = (estado) => {
  const map = { activo: { bg: 'var(--success-bg)', color: 'var(--success)' }, inactivo: { bg: 'var(--warning-bg)', color: 'var(--warning)' } };
  return map[estado] || { bg: 'var(--sage-light)', color: 'var(--brown)' };
};

/* ─── Campo editable inline ──────────────────────────────── */
const CampoEditable = ({ seccion, campo, valor, tipo = 'text', placeholder, onGuardar, onEditar, onCancelar, editando }) => {
  const [valorTemp, setValorTemp] = useState(valor);
  useEffect(() => { setValorTemp(valor); }, [valor]);

  const baseInput = {
    padding: '0.375rem 0.625rem',
    fontSize: '0.875rem',
    border: '1px solid var(--navy)',
    borderRadius: 6,
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    color: 'var(--navy)',
    boxShadow: '0 0 0 3px rgba(10,41,71,0.1)',
    flex: 1,
  };

  if (editando) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {tipo === 'textarea' ? (
          <textarea
            value={valorTemp || ''}
            onChange={e => setValorTemp(e.target.value)}
            style={{ ...baseInput, resize: 'vertical', minHeight: 72 }}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            type={tipo}
            value={valorTemp || ''}
            onChange={e => setValorTemp(e.target.value)}
            style={baseInput}
            placeholder={placeholder}
          />
        )}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginTop: 2 }}>
          <button
            onClick={() => onGuardar(seccion, campo, valorTemp)}
            title="Guardar"
            style={{
              width: 30, height: 30, borderRadius: 6,
              background: 'var(--success-bg)', color: 'var(--success)',
              border: '1px solid #86efac', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={() => onCancelar(seccion, campo)}
            title="Cancelar"
            style={{
              width: 30, height: 30, borderRadius: 6,
              background: 'var(--sage-light)', color: 'var(--brown)',
              border: '1px solid var(--sage-dark)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}
      className="group"
    >
      <span style={{ fontSize: '0.875rem', color: valor ? 'var(--navy)' : 'var(--sage-dark)', fontStyle: valor ? 'normal' : 'italic' }}>
        {valor || 'No especificado'}
      </span>
      <button
        onClick={() => onEditar(seccion, campo)}
        title="Editar"
        style={{
          opacity: 0, transition: 'opacity 0.15s',
          width: 26, height: 26, borderRadius: 6,
          background: 'var(--cream)', color: 'var(--navy)',
          border: '1px solid var(--cream-dark)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.parentElement.querySelector('[title="Editar"]').style.opacity = '1'; }}
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
};

/* ─── Fila de detalle ────────────────────────────────────── */
const FilaDetalle = ({ label, children }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 3,
    padding: '0.625rem 0',
    borderBottom: '1px solid var(--sage-light)',
  }}>
    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
    <div style={{ color: 'var(--navy)', fontSize: '0.875rem' }}>
      {children}
    </div>
  </div>
);

/* ─── Card de sección ────────────────────────────────────── */
const SeccionCard = ({ titulo, icono, children, accent = 'var(--navy)' }) => (
  <div className="anim-fade-in card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{
      padding: '0.875rem 1.25rem',
      background: 'var(--cream-light)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 8,
      borderLeft: `4px solid ${accent}`,
    }}>
      <span style={{ color: accent }}>{icono}</span>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy)' }}>{titulo}</h3>
    </div>
    <div style={{ padding: '0.5rem 1.25rem 1.25rem' }}>
      {children}
    </div>
  </div>
);

/* ─── PerfilEstudiante ───────────────────────────────────── */
const PerfilEstudiante = ({ estudianteId: propEstudianteId }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editando, setEditando] = useState({});
  const [documentos, setDocumentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estudianteId, setEstudianteId] = useState(propEstudianteId || null);

  const cargarPerfil = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [perfilData, docsData] = await Promise.all([
        estudianteService.obtenerPerfil(estudianteId),
        documentoService.obtenerPorEstudiante(estudianteId),
      ]);
      if (perfilData) { setPerfil(perfilData); setDocumentos(docsData || []); }
      else setError('Estudiante no encontrado');
    } catch (err) {
      setError('Error al cargar el perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [estudianteId]);

  useEffect(() => { if (estudianteId) cargarPerfil(); }, [cargarPerfil, estudianteId]);

  const handleEditar = (sec, campo) => setEditando(p => ({ ...p, [`${sec}.${campo}`]: true }));
  const handleCancelar = (sec, campo) => setEditando(p => { const n = { ...p }; delete n[`${sec}.${campo}`]; return n; });
  const handleGuardar = async (sec, campo, valor) => {
    try {
      if (sec === 'estudiante') await estudianteService.actualizar(estudianteId, { [campo]: valor });
      else if (sec === 'acudiente') await acudienteService.actualizar(perfil.acudiente_id, { [campo]: valor });
      setSuccess('Cambios guardados');
      await cargarPerfil();
      handleCancelar(sec, campo);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Error al guardar: ' + err.message); }
  };

  const obtenerDocPendientes = () => {
    const requeridos = ['admision', 'carnet', 'certificado'];
    const subidos = documentos.map(d => d.tipo_documento);
    const pendientes = requeridos.filter(t => !subidos.includes(t));
    const rechazados = documentos.filter(d => d.estado === 'rechazado').map(d => d.tipo_documento);
    return [...pendientes, ...rechazados];
  };

  const campoProps = (sec, campo) => ({
    seccion: sec, campo,
    editando: !!editando[`${sec}.${campo}`],
    onEditar: handleEditar,
    onCancelar: handleCancelar,
    onGuardar: handleGuardar,
  });

  /* ── Sin estudiante seleccionado ── */
  if (!propEstudianteId && !estudianteId) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600, margin: '3rem auto' }}>
        <div className="anim-scale-in card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--cream)', margin: '0 auto 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" fill="none" stroke="var(--navy)" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>
            Buscar Estudiante
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--brown)', marginBottom: '1.5rem' }}>
            Ingresa el ID o número de documento del estudiante
          </p>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && busqueda && setEstudianteId(busqueda)}
              placeholder="Ej: est-001 o 1234567890"
              style={{
                flex: 1, padding: '0.5rem 0.875rem',
                border: '1px solid var(--border)', borderRadius: 7,
                fontSize: '0.875rem', color: 'var(--navy)',
                outline: 'none', fontFamily: 'var(--font-sans)',
              }}
              autoFocus
            />
            <button
              onClick={() => busqueda && setEstudianteId(busqueda)}
              className="btn btn-primary"
              disabled={!busqueda}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
        <div style={{ textAlign: 'center' }}>
          <svg style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} width="40" height="40" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="var(--sage)" strokeWidth="4" />
            <path fill="var(--navy)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--brown)' }}>Cargando perfil…</p>
        </div>
      </div>
    );
  }

  /* ── Error sin perfil ── */
  if (error && !perfil) {
    return (
      <div style={{ padding: '2rem', maxWidth: 560, margin: '2rem auto' }}>
        <div className="alert alert-error anim-fade-in" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
        <button onClick={() => setEstudianteId(null)} className="btn btn-ghost">
          ← Volver a buscar
        </button>
      </div>
    );
  }

  const docsPendientes = obtenerDocPendientes();
  const estadoStyle = badgeEstado(perfil?.estado);

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header del perfil */}
      <div className="anim-fade-in" style={{
        background: 'var(--navy)',
        borderRadius: 12,
        padding: '1.5rem 2rem',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--cream)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)',
          flexShrink: 0,
          border: '3px solid rgba(243,228,201,0.3)',
        }}>
          {perfil?.nombre_completo?.charAt(0).toUpperCase() || '?'}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Perfil del Estudiante
          </p>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--cream)', marginBottom: 4 }}>
            {perfil?.nombre_completo}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(211,212,192,0.7)' }}>
            {perfil?.tipo_documento} {perfil?.numero_documento}
            {perfil?.grado && <> · Grado <strong style={{ color: 'var(--cream)' }}>{perfil.grado}</strong></>}
            {perfil?.fecha_nacimiento && <> · {calcularEdad(perfil.fecha_nacimiento)} años</>}
          </p>
        </div>

        {/* Botón volver */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span className="badge" style={{ ...estadoStyle, fontWeight: 700, padding: '0.3rem 0.75rem' }}>
            {perfil?.estado?.toUpperCase() || 'SIN ESTADO'}
          </span>
          {!propEstudianteId && (
            <button
              onClick={() => { setEstudianteId(null); setPerfil(null); setDocumentos([]); setBusqueda(''); }}
              style={{
                fontSize: '0.8125rem', color: 'rgba(211,212,192,0.6)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              ← Buscar otro
            </button>
          )}
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-error anim-slide-down" style={{ marginBottom: 12 }}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success anim-slide-down" style={{ marginBottom: 12 }}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {/* Grid de secciones */}
      <div className="anim-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

        {/* Información Académica */}
        <SeccionCard
          titulo="Información Académica"
          accent="var(--navy)"
          icono={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        >
          <FilaDetalle label="Grado">
            <CampoEditable {...campoProps('estudiante', 'grado')} valor={perfil?.grado} placeholder="Ej: 8°" />
          </FilaDetalle>
          <FilaDetalle label="Grupo">
            <CampoEditable {...campoProps('estudiante', 'grupo')} valor={perfil?.grupo} placeholder="Ej: A, B, C" />
          </FilaDetalle>
          <FilaDetalle label="Director de Grupo">
            <CampoEditable {...campoProps('estudiante', 'director_grupo')} valor={perfil?.director_grupo} placeholder="Nombre del docente" />
          </FilaDetalle>
          <FilaDetalle label="Fecha de Nacimiento">
            <span>{formatFecha(perfil?.fecha_nacimiento)}</span>
          </FilaDetalle>
          <FilaDetalle label="Edad">
            <span>{calcularEdad(perfil?.fecha_nacimiento)} años</span>
          </FilaDetalle>
        </SeccionCard>

        {/* Información Familiar */}
        <SeccionCard
          titulo="Información Familiar"
          accent="var(--brown)"
          icono={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        >
          <FilaDetalle label="Nombre Acudiente">
            <CampoEditable {...campoProps('acudiente', 'nombre_completo')} valor={perfil?.nombre_acudiente} placeholder="Nombre completo" />
          </FilaDetalle>
          <FilaDetalle label="Documento">
            <span>{perfil?.documento_acudiente || '—'}</span>
          </FilaDetalle>
          <FilaDetalle label="Parentesco">
            <CampoEditable {...campoProps('acudiente', 'parentesco')} valor={perfil?.parentesco} placeholder="Padre, Madre, etc." />
          </FilaDetalle>
          <FilaDetalle label="Teléfono">
            <CampoEditable {...campoProps('acudiente', 'telefono')} valor={perfil?.telefono_acudiente} tipo="tel" placeholder="3001234567" />
          </FilaDetalle>
          <FilaDetalle label="Correo">
            <CampoEditable {...campoProps('acudiente', 'correo_electronico')} valor={perfil?.correo_acudiente} tipo="email" placeholder="correo@ejemplo.com" />
          </FilaDetalle>
        </SeccionCard>

        {/* Información Administrativa */}
        <SeccionCard
          titulo="Información Administrativa"
          accent="var(--success)"
          icono={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        >
          <FilaDetalle label="Estado de Matrícula">
            <span className="badge" style={{
              ...(perfil?.estado_matricula === 'activa' ? { background: 'var(--success-bg)', color: 'var(--success)' }
                : perfil?.estado_matricula === 'cancelada' ? { background: 'var(--danger-bg)', color: 'var(--danger)' }
                : { background: 'var(--sage-light)', color: 'var(--brown)' }),
              fontWeight: 700,
            }}>
              {perfil?.estado_matricula || 'Sin matrícula'}
            </span>
          </FilaDetalle>
          <FilaDetalle label="N° Matrícula">
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{perfil?.numero_matricula || 'N/A'}</span>
          </FilaDetalle>
          <FilaDetalle label="Año Lectivo">
            <span>{perfil?.ano_lectivo || 'N/A'}</span>
          </FilaDetalle>
          <FilaDetalle label="Documentos">
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Aprobados', value: documentos.filter(d => d.estado === 'aprobado').length, color: 'var(--success)' },
                { label: 'Pendientes', value: documentos.filter(d => d.estado === 'pendiente').length, color: 'var(--warning)' },
                { label: 'Rechazados', value: documentos.filter(d => d.estado === 'rechazado').length, color: 'var(--danger)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 800, color, display: 'block' }}>{value}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--brown)' }}>{label}</span>
                </div>
              ))}
            </div>
          </FilaDetalle>

          {docsPendientes.length > 0 && (
            <FilaDetalle label="Documentos requeridos">
              <div style={{
                background: 'var(--warning-bg)',
                border: '1px solid #fcd34d',
                borderRadius: 7,
                padding: '0.625rem 0.875rem',
                marginTop: 4,
              }}>
                {docsPendientes.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < docsPendientes.length - 1 ? 4 : 0 }}>
                    <svg width="12" height="12" fill="var(--warning)" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--warning)', fontWeight: 500 }}>{doc}</span>
                  </div>
                ))}
              </div>
            </FilaDetalle>
          )}

          <FilaDetalle label="Observaciones">
            <CampoEditable {...campoProps('estudiante', 'observaciones')} valor={perfil?.observaciones} tipo="textarea" placeholder="Notas administrativas o académicas" />
          </FilaDetalle>
        </SeccionCard>
      </div>

      {/* Historial de documentos */}
      <div className="anim-fade-in card" style={{ marginTop: '1.5rem', overflow: 'hidden', padding: 0 }}>
        <div style={{
          padding: '0.875rem 1.25rem',
          background: 'var(--cream-light)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" fill="none" stroke="var(--brown)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy)' }}>
            Historial de Documentos
          </h3>
        </div>

        {documentos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--brown)' }}>No hay documentos cargados para este estudiante</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-base">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Archivo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Ver</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <span className="badge badge-navy">{doc.tipo_documento}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.nombre_archivo}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--brown)', whiteSpace: 'nowrap' }}>
                      {new Date(doc.fecha_carga).toLocaleDateString('es-CO')}
                    </td>
                    <td>
                      <span className={`badge ${
                        doc.estado === 'aprobado' ? 'badge-success'
                        : doc.estado === 'pendiente' ? 'badge-warning'
                        : 'badge-danger'
                      }`}>
                        {doc.estado}
                      </span>
                    </td>
                    <td>
                      <a
                        href={doc.url_archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8125rem', color: 'var(--navy)', fontWeight: 500, textDecoration: 'underline' }}
                      >
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilEstudiante;
