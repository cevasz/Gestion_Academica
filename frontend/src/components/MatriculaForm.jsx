import { useState } from 'react';
import matriculaService from '../services/matricula.service';

/* ─── Constantes ─────────────────────────────────────────── */
const GRADOS = ['Preescolar','1°','2°','3°','4°','5°','6°','7°','8°','9°','10°','11°'];
const PARENTESCOS = ['Padre','Madre','Abuelo/a','Tío/a','Hermano/a','Otro'];
const TIPOS_DOC = [
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'CE', label: 'Cédula de Extranjería' },
];
const TIPOS_OPERACION = [
  { value: 'inscripcion',   label: 'Inscripción nueva' },
  { value: 'renovacion',    label: 'Renovación' },
  { value: 'actualizacion', label: 'Actualización de datos' },
];

/* ─── Campo de formulario ────────────────────────────────── */
const Campo = ({ id, label, error, required, children }) => (
  <div>
    <label htmlFor={id} style={{
      display: 'block',
      fontSize: '0.8125rem',
      fontWeight: 500,
      color: 'var(--navy)',
      marginBottom: 5,
    }}>
      {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
  borderRadius: 7,
  background: hasError ? 'var(--danger-bg)' : '#fff',
  color: 'var(--navy)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'var(--font-sans)',
});

/* ─── Sección de formulario ──────────────────────────────── */
const Seccion = ({ titulo, icono, children }) => (
  <div className="anim-fade-in" style={{
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 10,
    overflow: 'hidden',
  }}>
    <div style={{
      padding: '0.875rem 1.25rem',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'var(--cream-light)',
    }}>
      <span style={{ color: 'var(--brown)' }}>{icono}</span>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy)' }}>{titulo}</h3>
    </div>
    <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      {children}
    </div>
  </div>
);

/* ─── Matrícula Form ─────────────────────────────────────── */
const MatriculaForm = () => {
  const [tipoOperacion, setTipoOperacion] = useState('inscripcion');
  const [loading, setLoading] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [numeroMatricula, setNumeroMatricula] = useState('');
  const [formData, setFormData] = useState({
    nombreEstudiante: '',
    tipoDocumento: 'TI',
    numeroDocumento: '',
    fechaNacimiento: '',
    grado: '',
    nombreAcudiente: '',
    documentoAcudiente: '',
    parentesco: '',
    telefonoAcudiente: '',
    correoAcudiente: '',
    numeroMatriculaAnterior: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addFocusStyle = (e) => {
    e.target.style.borderColor = 'var(--navy)';
    e.target.style.boxShadow = '0 0 0 3px rgba(10,41,71,0.1)';
  };
  const removeFocusStyle = (e, hasError) => {
    e.target.style.borderColor = hasError ? 'var(--danger)' : 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  const validar = () => {
    const e = {};
    if (!formData.nombreEstudiante.trim()) e.nombreEstudiante = 'El nombre es obligatorio';
    else if (formData.nombreEstudiante.trim().length < 3) e.nombreEstudiante = 'Mínimo 3 caracteres';
    if (!formData.numeroDocumento.trim()) e.numeroDocumento = 'El documento es obligatorio';
    else if (!/^\d{7,11}$/.test(formData.numeroDocumento)) e.numeroDocumento = 'Debe tener entre 7 y 11 dígitos';
    if (!formData.fechaNacimiento) e.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    else {
      const edad = new Date().getFullYear() - new Date(formData.fechaNacimiento).getFullYear();
      if (edad < 3 || edad > 20) e.fechaNacimiento = 'La edad debe estar entre 3 y 20 años';
    }
    if (!formData.grado) e.grado = 'Seleccione un grado';
    if (!formData.nombreAcudiente.trim()) e.nombreAcudiente = 'El nombre del acudiente es obligatorio';
    if (!formData.documentoAcudiente.trim()) e.documentoAcudiente = 'El documento del acudiente es obligatorio';
    else if (!/^\d{7,11}$/.test(formData.documentoAcudiente)) e.documentoAcudiente = 'Debe tener entre 7 y 11 dígitos';
    if (!formData.parentesco) e.parentesco = 'Seleccione el parentesco';
    if (!formData.telefonoAcudiente.trim()) e.telefonoAcudiente = 'El teléfono es obligatorio';
    else if (!/^3\d{9}$/.test(formData.telefonoAcudiente)) e.telefonoAcudiente = 'Celular válido: 10 dígitos, inicia con 3';
    if (!formData.correoAcudiente.trim()) e.correoAcudiente = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoAcudiente)) e.correoAcudiente = 'Correo no válido';
    if (tipoOperacion === 'renovacion' && !formData.numeroMatriculaAnterior.trim()) {
      e.numeroMatriculaAnterior = 'El número de matrícula anterior es obligatorio';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validar();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setLoading(true);
    setErrorServidor('');
    try {
      const res = await matriculaService.crear(formData, tipoOperacion, 'demo-institucion-id');
      if (res.success) { setNumeroMatricula(res.numeroMatricula); setSubmitted(true); }
      else setErrorServidor(res.error || 'Error al procesar la matrícula');
    } catch {
      setErrorServidor('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetear = () => {
    setFormData({ nombreEstudiante:'',tipoDocumento:'TI',numeroDocumento:'',fechaNacimiento:'',grado:'',nombreAcudiente:'',documentoAcudiente:'',parentesco:'',telefonoAcudiente:'',correoAcudiente:'',numeroMatriculaAnterior:'' });
    setErrors({}); setSubmitted(false); setNumeroMatricula(''); setErrorServidor(''); setLoading(false);
  };

  /* ── Pantalla de éxito ── */
  if (submitted) {
    return (
      <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
        <div className="anim-scale-in card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--success-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <svg width="32" height="32" fill="none" stroke="var(--success)" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
            Matrícula {tipoOperacion === 'inscripcion' ? 'Registrada' : tipoOperacion === 'renovacion' ? 'Renovada' : 'Actualizada'} con Éxito
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--brown)', marginBottom: 24 }}>
            Los datos han sido procesados correctamente
          </p>

          <div style={{
            background: 'var(--cream-light)',
            border: '1px solid var(--cream-dark)',
            borderRadius: 10,
            padding: '1.25rem',
            marginBottom: 20,
            borderLeft: '4px solid var(--navy)',
          }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brown)', marginBottom: 6 }}>Número de Matrícula</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              {numeroMatricula}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 20, textAlign: 'left' }}>
            {[
              { titulo: 'Datos del Estudiante', items: [
                ['Nombre', formData.nombreEstudiante],
                ['Documento', `${formData.tipoDocumento} ${formData.numeroDocumento}`],
                ['Grado', formData.grado],
              ]},
              { titulo: 'Datos del Acudiente', items: [
                ['Nombre', formData.nombreAcudiente],
                ['Parentesco', formData.parentesco],
                ['Teléfono', formData.telefonoAcudiente],
              ]},
            ].map(({ titulo, items }) => (
              <div key={titulo} style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '1rem',
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  {titulo}
                </p>
                {items.map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--brown)' }}>{k}: </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--navy)' }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: 1 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Se enviará confirmación a <strong>{formData.correoAcudiente}</strong></span>
          </div>

          <button onClick={resetear} className="btn btn-primary btn-lg" style={{ borderRadius: 8 }}>
            Registrar Otra Matrícula
          </button>
        </div>
      </div>
    );
  }

  /* ── Formulario principal ── */
  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 860, margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Tipo de operación */}
        <div className="anim-fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto', minWidth: 220 }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--navy)', marginBottom: 5 }}>
              Tipo de operación <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              value={tipoOperacion}
              onChange={e => setTipoOperacion(e.target.value)}
              style={{ ...inputStyle(false), width: 'auto', minWidth: 220 }}
              onFocus={addFocusStyle}
              onBlur={e => removeFocusStyle(e, false)}
            >
              {TIPOS_OPERACION.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {tipoOperacion === 'renovacion' && (
            <div className="anim-slide-down" style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="numeroMatriculaAnterior" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--navy)', marginBottom: 5 }}>
                N° Matrícula Anterior <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="numeroMatriculaAnterior"
                name="numeroMatriculaAnterior"
                type="text"
                value={formData.numeroMatriculaAnterior}
                onChange={handleChange}
                placeholder="Ej: 2025-1234"
                style={inputStyle(!!errors.numeroMatriculaAnterior)}
                onFocus={addFocusStyle}
                onBlur={e => removeFocusStyle(e, !!errors.numeroMatriculaAnterior)}
              />
              {errors.numeroMatriculaAnterior && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>{errors.numeroMatriculaAnterior}</p>
              )}
            </div>
          )}
        </div>

        {/* Sección: Estudiante */}
        <Seccion
          titulo="Datos del Estudiante"
          icono={
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        >
          <Campo id="nombreEstudiante" label="Nombre Completo" error={errors.nombreEstudiante} required style={{ gridColumn: '1/-1' }}>
            <input id="nombreEstudiante" name="nombreEstudiante" type="text"
              value={formData.nombreEstudiante} onChange={handleChange}
              placeholder="Nombre completo del estudiante"
              style={{ ...inputStyle(!!errors.nombreEstudiante), gridColumn: '1/-1' }}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.nombreEstudiante)}
            />
          </Campo>

          <Campo id="tipoDocumento" label="Tipo de Documento" required>
            <select id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento}
              onChange={handleChange} style={inputStyle(false)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, false)}
            >
              {TIPOS_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Campo>

          <Campo id="numeroDocumento" label="Número de Documento" error={errors.numeroDocumento} required>
            <input id="numeroDocumento" name="numeroDocumento" type="text"
              value={formData.numeroDocumento} onChange={handleChange}
              placeholder="Sin puntos ni comas"
              style={inputStyle(!!errors.numeroDocumento)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.numeroDocumento)}
            />
          </Campo>

          <Campo id="fechaNacimiento" label="Fecha de Nacimiento" error={errors.fechaNacimiento} required>
            <input id="fechaNacimiento" name="fechaNacimiento" type="date"
              value={formData.fechaNacimiento} onChange={handleChange}
              style={inputStyle(!!errors.fechaNacimiento)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.fechaNacimiento)}
            />
          </Campo>

          <Campo id="grado" label="Grado a Cursar" error={errors.grado} required>
            <select id="grado" name="grado" value={formData.grado} onChange={handleChange}
              style={inputStyle(!!errors.grado)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.grado)}
            >
              <option value="">Seleccione un grado</option>
              {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Campo>
        </Seccion>

        {/* Sección: Acudiente */}
        <Seccion
          titulo="Datos del Acudiente"
          icono={
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <Campo id="nombreAcudiente" label="Nombre Completo" error={errors.nombreAcudiente} required>
            <input id="nombreAcudiente" name="nombreAcudiente" type="text"
              value={formData.nombreAcudiente} onChange={handleChange}
              placeholder="Nombre completo del acudiente"
              style={inputStyle(!!errors.nombreAcudiente)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.nombreAcudiente)}
            />
          </Campo>

          <Campo id="documentoAcudiente" label="Número de Documento" error={errors.documentoAcudiente} required>
            <input id="documentoAcudiente" name="documentoAcudiente" type="text"
              value={formData.documentoAcudiente} onChange={handleChange}
              placeholder="Cédula sin puntos"
              style={inputStyle(!!errors.documentoAcudiente)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.documentoAcudiente)}
            />
          </Campo>

          <Campo id="parentesco" label="Parentesco" error={errors.parentesco} required>
            <select id="parentesco" name="parentesco" value={formData.parentesco} onChange={handleChange}
              style={inputStyle(!!errors.parentesco)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.parentesco)}
            >
              <option value="">Seleccione parentesco</option>
              {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Campo>

          <Campo id="telefonoAcudiente" label="Teléfono Celular" error={errors.telefonoAcudiente} required>
            <input id="telefonoAcudiente" name="telefonoAcudiente" type="tel"
              value={formData.telefonoAcudiente} onChange={handleChange}
              placeholder="3001234567"
              style={inputStyle(!!errors.telefonoAcudiente)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.telefonoAcudiente)}
            />
          </Campo>

          <Campo id="correoAcudiente" label="Correo Electrónico" error={errors.correoAcudiente} required>
            <input id="correoAcudiente" name="correoAcudiente" type="email"
              value={formData.correoAcudiente} onChange={handleChange}
              placeholder="correo@ejemplo.com"
              style={inputStyle(!!errors.correoAcudiente)}
              onFocus={addFocusStyle} onBlur={e => removeFocusStyle(e, !!errors.correoAcudiente)}
            />
          </Campo>
        </Seccion>

        {/* Error servidor */}
        {errorServidor && (
          <div className="alert alert-error anim-slide-down">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Error:</strong> {errorServidor}
            </div>
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--brown)' }}>
            Los campos marcados con <span style={{ color: 'var(--danger)', fontWeight: 700 }}>*</span> son obligatorios
          </p>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ minWidth: 180, borderRadius: 8 }}
          >
            {loading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.25" />
                  <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando…
              </>
            ) : (
              tipoOperacion === 'inscripcion' ? 'Registrar Matrícula'
              : tipoOperacion === 'renovacion' ? 'Renovar Matrícula'
              : 'Actualizar Datos'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatriculaForm;
