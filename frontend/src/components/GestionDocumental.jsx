import { useState, useEffect } from 'react';
import documentoService from '../services/documento.service';
import estudianteService from '../services/estudiante.service';

/* ─── Constantes ─────────────────────────────────────────── */
const TIPOS_DOCUMENTO = [
  { value: 'admision',   label: 'Admisión' },
  { value: 'paz_y_salvo', label: 'Paz y Salvo' },
  { value: 'carnet',     label: 'Carnet' },
  { value: 'certificado', label: 'Certificado' },
  { value: 'boletin',    label: 'Boletín' },
  { value: 'otro',       label: 'Otro' },
];

const ESTADOS = [
  { value: 'pendiente',  label: 'Pendiente',  badgeClass: 'badge-warning' },
  { value: 'aprobado',   label: 'Aprobado',   badgeClass: 'badge-success' },
  { value: 'rechazado',  label: 'Rechazado',  badgeClass: 'badge-danger' },
];

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  border: '1px solid var(--border)',
  borderRadius: 7,
  background: '#fff',
  color: 'var(--navy)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
};

/* ─── Helpers ────────────────────────────────────────────── */
const labelTipo = (tipo) => TIPOS_DOCUMENTO.find(t => t.value === tipo)?.label || tipo;
const claseBadgeEstado = (estado) => ESTADOS.find(e => e.value === estado)?.badgeClass || 'badge-navy';
const formatFecha = (f) => new Date(f).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
const formatTam = (b) => !b ? 'N/A' : b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;

/* ─── Mini StatCard ──────────────────────────────────────── */
const StatCard = ({ label, value, accent }) => (
  <div style={{
    background: '#fff', border: '1px solid var(--border)',
    borderTop: `3px solid ${accent}`,
    borderRadius: 9, padding: '0.875rem 1.125rem',
  }}>
    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
      {label}
    </p>
    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>{value}</p>
  </div>
);

/* ─── GestionDocumental ──────────────────────────────────── */
const GestionDocumental = () => {
  const [documentos, setDocumentos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);
  const [formData, setFormData] = useState({ estudianteId: '', tipoDocumento: '', archivo: null });
  const [filtros, setFiltros] = useState({ estudiante: '', tipoDocumento: '', estado: '', fechaInicio: '', fechaFin: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [docs, ests] = await Promise.all([
        documentoService.obtenerTodos(),
        estudianteService.obtenerTodos('demo-institucion-id'),
      ]);
      setDocumentos(docs || []);
      setEstudiantes(ests || []);
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('El archivo no debe superar los 10MB'); return; }
    setFormData(prev => ({ ...prev, archivo: file }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.estudianteId || !formData.tipoDocumento || !formData.archivo) {
      setError('Todos los campos son obligatorios'); return;
    }
    setUploading(true); setError(''); setSuccess('');
    try {
      await documentoService.subir(formData.archivo, formData.estudianteId, formData.tipoDocumento);
      setSuccess('Documento subido exitosamente');
      setShowUploadForm(false);
      setFormData({ estudianteId: '', tipoDocumento: '', archivo: null });
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al subir: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEliminar = async (id, url) => {
    if (!confirm('¿Eliminar este documento?')) return;
    try {
      await documentoService.eliminar(id, url);
      setSuccess('Documento eliminado');
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Error al eliminar: ' + err.message); }
  };

  const handleCambiarEstado = async (id, estado) => {
    try {
      await documentoService.actualizarEstado(id, estado);
      setSuccess('Estado actualizado');
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Error: ' + err.message); }
  };

  const limpiarFiltros = () =>
    setFiltros({ estudiante: '', tipoDocumento: '', estado: '', fechaInicio: '', fechaFin: '' });

  const hayFiltrosActivos = Object.values(filtros).some(v => v !== '');

  const documentosFiltrados = documentos.filter(doc => {
    if (filtros.estudiante && !doc.nombre_estudiante?.toLowerCase().includes(filtros.estudiante.toLowerCase()) && !doc.documento_estudiante?.includes(filtros.estudiante)) return false;
    if (filtros.tipoDocumento && doc.tipo_documento !== filtros.tipoDocumento) return false;
    if (filtros.estado && doc.estado !== filtros.estado) return false;
    if (filtros.fechaInicio && new Date(doc.fecha_carga) < new Date(filtros.fechaInicio)) return false;
    if (filtros.fechaFin && new Date(doc.fecha_carga) > new Date(filtros.fechaFin + 'T23:59:59')) return false;
    return true;
  });

  const focusStyle = (e) => { e.target.style.borderColor = 'var(--navy)'; e.target.style.boxShadow = '0 0 0 3px rgba(10,41,71,0.1)'; };
  const blurStyle = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Estadísticas */}
      <div className="anim-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
        <StatCard label="Total" value={documentos.length} accent="var(--navy)" />
        <StatCard label="Pendientes" value={documentos.filter(d => d.estado === 'pendiente').length} accent="var(--warning)" />
        <StatCard label="Aprobados"  value={documentos.filter(d => d.estado === 'aprobado').length}  accent="var(--success)" />
        <StatCard label="Rechazados" value={documentos.filter(d => d.estado === 'rechazado').length} accent="var(--danger)" />
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-error anim-slide-down">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>✕</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success anim-slide-down">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span style={{ flex: 1 }}>{success}</span>
        </div>
      )}

      {/* Barra de acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {showUploadForm ? 'Cancelar subida' : 'Subir Documento'}
        </button>

        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className="btn btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {hayFiltrosActivos && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 10, height: 10, borderRadius: '50%',
              background: 'var(--brown)', border: '2px solid #fff',
            }} />
          )}
        </button>

        {hayFiltrosActivos && (
          <button onClick={limpiarFiltros} className="btn btn-sm" style={{
            background: 'var(--cream)', color: 'var(--brown)', border: '1px solid var(--cream-dark)', fontSize: '0.8125rem'
          }}>
            Limpiar filtros
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--brown)', fontWeight: 500 }}>
          {documentosFiltrados.length} de {documentos.length} documentos
        </span>
      </div>

      {/* Panel de subida */}
      {showUploadForm && (
        <div className="anim-slide-down card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
            Subir Nuevo Documento
          </h2>
          <form onSubmit={handleUploadSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--navy)', marginBottom: 5 }}>
                  Estudiante <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select value={formData.estudianteId}
                  onChange={e => setFormData(p => ({ ...p, estudianteId: e.target.value }))}
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} required
                >
                  <option value="">Seleccionar estudiante</option>
                  {estudiantes.map(est => (
                    <option key={est.id} value={est.id}>{est.nombre_completo} — {est.numero_documento}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--navy)', marginBottom: 5 }}>
                  Tipo de Documento <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select value={formData.tipoDocumento}
                  onChange={e => setFormData(p => ({ ...p, tipoDocumento: e.target.value }))}
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} required
                >
                  <option value="">Seleccionar tipo</option>
                  {TIPOS_DOCUMENTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--navy)', marginBottom: 5 }}>
                  Archivo <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="file" onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ ...inputStyle, padding: '0.4rem 0.75rem' }}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--brown)', marginTop: 4 }}>
                  Máx. 10MB — PDF, Word, Imágenes
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={uploading} className="btn btn-primary">
                {uploading ? 'Subiendo…' : 'Subir Documento'}
              </button>
              <button type="button" onClick={() => { setShowUploadForm(false); setFormData({ estudianteId: '', tipoDocumento: '', archivo: null }); }} className="btn btn-ghost">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Panel de filtros */}
      {showFiltros && (
        <div className="anim-slide-down card" style={{ padding: '1.125rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estudiante</label>
              <input type="text" name="estudiante" value={filtros.estudiante}
                onChange={e => setFiltros(p => ({ ...p, estudiante: e.target.value }))}
                placeholder="Nombre o documento" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</label>
              <select name="tipoDocumento" value={filtros.tipoDocumento}
                onChange={e => setFiltros(p => ({ ...p, tipoDocumento: e.target.value }))}
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              >
                <option value="">Todos</option>
                {TIPOS_DOCUMENTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
              <select name="estado" value={filtros.estado}
                onChange={e => setFiltros(p => ({ ...p, estado: e.target.value }))}
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              >
                <option value="">Todos</option>
                {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Desde</label>
              <input type="date" value={filtros.fechaInicio}
                onChange={e => setFiltros(p => ({ ...p, fechaInicio: e.target.value }))}
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hasta</label>
              <input type="date" value={filtros.fechaFin}
                onChange={e => setFiltros(p => ({ ...p, fechaFin: e.target.value }))}
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabla de documentos */}
      <div className="anim-fade-in card" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--navy)' }}>
            <svg style={{ animation: 'spin 1s linear infinite' }} width="36" height="36" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="var(--sage)" strokeWidth="4" />
              <path fill="var(--navy)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : documentosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <svg width="48" height="48" fill="none" stroke="var(--sage-dark)" strokeWidth="1.25" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>Sin documentos</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--brown)', marginBottom: 16 }}>
              {hayFiltrosActivos ? 'Ningún resultado con los filtros actuales.' : 'Aún no hay documentos cargados.'}
            </p>
            {!hayFiltrosActivos && (
              <button onClick={() => setShowUploadForm(true)} className="btn btn-primary btn-sm">
                Subir primer documento
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-base" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Tipo</th>
                  <th>Archivo</th>
                  <th>Tamaño</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentosFiltrados.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <p style={{ fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>{doc.nombre_estudiante}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--brown)' }}>{doc.documento_estudiante} · {doc.grado}</p>
                    </td>
                    <td>
                      <span className="badge badge-navy">{labelTipo(doc.tipo_documento)}</span>
                    </td>
                    <td>
                      <p style={{ fontSize: '0.8125rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.nombre_archivo}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--brown)' }}>{doc.mime_type}</p>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--brown)', whiteSpace: 'nowrap' }}>
                      {formatTam(doc.tamanio_bytes)}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--brown)', whiteSpace: 'nowrap' }}>
                      {formatFecha(doc.fecha_carga)}
                    </td>
                    <td>
                      <select
                        value={doc.estado}
                        onChange={e => handleCambiarEstado(doc.id, e.target.value)}
                        className={`badge ${claseBadgeEstado(doc.estado)}`}
                        style={{ border: 'none', cursor: 'pointer', fontWeight: 600, background: 'transparent' }}
                      >
                        {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <a href={doc.url_archivo} target="_blank" rel="noopener noreferrer"
                          title="Ver documento"
                          style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 5, transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        <a href={doc.url_archivo} download={doc.nombre_archivo}
                          title="Descargar"
                          style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 5, transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--success-bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        <button onClick={() => handleEliminar(doc.id, doc.url_archivo)}
                          title="Eliminar"
                          style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 5, transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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

export default GestionDocumental;
