import { useMemo, useState } from 'react';

const CATEGORIAS = [
  { id: 'todos', label: 'Todas las Categorías', color: 'var(--navy)' },
  { id: 'urgente', label: 'Urgente', color: 'var(--danger)', bg: 'var(--danger-bg)', border: '#fca5a5' },
  { id: 'academico', label: 'Académico', color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' },
  { id: 'general', label: 'General', color: 'var(--success)', bg: 'var(--success-bg)', border: '#86efac' },
  { id: 'evento', label: 'Eventos', color: 'var(--warning)', bg: 'var(--warning-bg)', border: '#fcd34d' },
];

const GRUPOS = ['Todos', '6A', '7B', '8A', '9C', '10A', '11B'];

const COMUNICADOS_INICIALES = [
  {
    id: 'com-1',
    titulo: 'Suspensión de clases por jornada de mantenimiento',
    categoria: 'urgente',
    emisor: 'Rectoría',
    fecha: '2026-07-09T08:30:00.000Z',
    destinatarios: 'Todos',
    mensaje: 'Estimada comunidad educativa, les informamos que el día de mañana no habrá clases presenciales debido a labores de fumigación y mantenimiento preventivo de las instalaciones. Las actividades académicas se reanudarán con normalidad el próximo lunes. Agradecemos su comprensión.',
    leido: false,
  },
  {
    id: 'com-2',
    titulo: 'Calendario de evaluaciones finales - Segundo Período',
    categoria: 'academico',
    emisor: 'Coordinación Académica',
    fecha: '2026-07-08T14:15:00.000Z',
    destinatarios: 'Todos',
    mensaje: 'Se encuentra disponible el cronograma oficial para las evaluaciones correspondientes al cierre del segundo período académico. Les solicitamos revisar las fechas asignadas para cada asignatura y asegurar que los estudiantes cuenten con los materiales necesarios. ¡Muchos éxitos!',
    leido: true,
  },
  {
    id: 'com-3',
    titulo: 'Reunión presencial de Padres de Familia',
    categoria: 'general',
    emisor: 'Coordinación de Convivencia',
    fecha: '2026-07-05T10:00:00.000Z',
    destinatarios: '8A',
    mensaje: 'Invitamos cordialmente a los acudientes del grado 8A a la reunión bimestral de seguimiento socio-afectivo y entrega parcial de notas que tendrá lugar en el auditorio principal. Su asistencia y participación activa son fundamentales para el desarrollo integral de los alumnos.',
    leido: true,
  },
  {
    id: 'com-4',
    titulo: 'Gran Bazar Institucional y Festival de Talentos 2026',
    categoria: 'evento',
    emisor: 'Consejo Directivo',
    fecha: '2026-07-01T16:00:00.000Z',
    destinatarios: 'Todos',
    mensaje: '¡Ya viene nuestro evento más esperado del año! Contaremos con presentaciones artísticas, juegos, gastronomía típica y rifas. Los fondos recaudados se destinarán a la mejora del laboratorio de ciencias. Los boleto de ingreso se pueden adquirir con los directores de grupo.',
    leido: true,
  },
];

const StatCard = ({ label, value, color, bg }) => (
  <div className="rounded-lg border bg-white px-4 py-3" style={{ borderColor: 'var(--border)' }}>
    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
      {label}
    </p>
    <div className="mt-2 flex items-end justify-between gap-3">
      <p className="text-3xl font-extrabold leading-none" style={{ color: 'var(--navy)' }}>
        {value}
      </p>
      <span className="h-3 w-3 rounded-full" style={{ background: color || bg }} />
    </div>
  </div>
);

const Comunicados = () => {
  const [comunicados, setComunicados] = useState(COMUNICADOS_INICIALES);
  const [buscar, setBuscar] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [selectedComunicado, setSelectedComunicado] = useState(null);

  // Estados para el formulario de creación
  const [showCrearForm, setShowCrearForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'general',
    mensaje: '',
    destinatarios: 'Todos',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = comunicados.length;
    const noLeidos = comunicados.filter(c => !c.leido).length;
    const urgentes = comunicados.filter(c => c.categoria === 'urgente').length;
    const academicos = comunicados.filter(c => c.categoria === 'academico').length;
    return { total, noLeidos, urgentes, academicos };
  }, [comunicados]);

  // Filtrado de comunicados
  const listaFiltrada = useMemo(() => {
    return comunicados
      .filter((c) => {
        const matchesBuscar = c.titulo.toLowerCase().includes(buscar.toLowerCase()) ||
                              c.mensaje.toLowerCase().includes(buscar.toLowerCase()) ||
                              c.emisor.toLowerCase().includes(buscar.toLowerCase());
        const matchesCategoria = categoriaFiltro === 'todos' || c.categoria === categoriaFiltro;
        return matchesBuscar && matchesCategoria;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [comunicados, buscar, categoriaFiltro]);

  const handleMarcarLeido = (id) => {
    setComunicados(prev => prev.map(c => c.id === id ? { ...c, leido: true } : c));
  };

  const handleCrearComunicado = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.titulo.trim()) {
      setFormError('El título es requerido.');
      return;
    }
    if (!formData.mensaje.trim()) {
      setFormError('El contenido del mensaje es requerido.');
      return;
    }

    const nuevoComunicado = {
      id: `com-${Date.now()}`,
      titulo: formData.titulo.trim(),
      categoria: formData.categoria,
      emisor: 'Coordinador Demo',
      fecha: new Date().toISOString(),
      destinatarios: formData.destinatarios,
      mensaje: formData.mensaje.trim(),
      leido: false,
    };

    setComunicados(prev => [nuevoComunicado, ...prev]);
    setFormData({
      titulo: '',
      categoria: 'general',
      mensaje: '',
      destinatarios: 'Todos',
    });
    setFormSuccess('Comunicado enviado y registrado exitosamente');
    setTimeout(() => {
      setShowCrearForm(false);
      setFormSuccess('');
    }, 1500);
  };

  const formatFechaLong = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFechaShort = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoriaDetails = (catId) => {
    return CATEGORIAS.find(cat => cat.id === catId) || CATEGORIAS[3];
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="card anim-fade-in">
        <div className="card-body">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                Comunicación Escolar
              </p>
              <h2 className="mt-1 text-2xl font-extrabold" style={{ color: 'var(--navy)' }}>
                Comunicados y Avisos
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--brown)' }}>
                Envía y gestiona las notificaciones oficiales dirigidas a la comunidad.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCrearForm(!showCrearForm);
                setFormError('');
                setFormSuccess('');
              }}
              className="btn btn-primary self-start sm:self-auto"
            >
              {showCrearForm ? 'Ver Comunicados' : 'Redactar Comunicado'}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Publicados" value={stats.total} color="var(--navy)" />
        <StatCard label="Sin Leer" value={stats.noLeidos} color="var(--warning)" />
        <StatCard label="Urgentes" value={stats.urgentes} color="var(--danger)" />
        <StatCard label="Académicos" value={stats.academicos} color="#1d4ed8" />
      </section>

      {showCrearForm ? (
        /* Redactar Comunicado Form */
        <section className="card anim-slide-down">
          <div className="card-header">
            <h3 className="text-base font-bold" style={{ color: 'var(--navy)' }}>
              Redactar nuevo comunicado institucional
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCrearComunicado} className="space-y-4">
              {formError && (
                <div className="rounded-md p-3 text-sm font-semibold" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                  ⚠️ {formError}
                </div>
              )}
              {formSuccess && (
                <div className="rounded-md p-3 text-sm font-semibold" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                  ✅ {formSuccess}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                    Título del aviso
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                    className="input-base"
                    placeholder="Ej. Cambio de horario para evaluaciones bimestrales..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                    className="input-base"
                  >
                    {CATEGORIAS.filter(c => c.id !== 'todos').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                    Destinatarios
                  </label>
                  <select
                    value={formData.destinatarios}
                    onChange={e => setFormData({ ...formData, destinatarios: e.target.value })}
                    className="input-base"
                  >
                    {GRUPOS.map(grupo => (
                      <option key={grupo} value={grupo}>{grupo === 'Todos' ? 'Toda la Institución' : `Grado ${grupo}`}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs mt-6" style={{ color: 'var(--brown)' }}>
                    El emisor de este comunicado aparecerá automáticamente registrado como <strong>Coordinador Demo</strong>.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                  Mensaje / Contenido
                </label>
                <textarea
                  value={formData.mensaje}
                  onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                  rows="6"
                  className="input-base"
                  placeholder="Escribe el cuerpo del comunicado con todos los detalles importantes para los estudiantes y padres de familia..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCrearForm(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Enviar Comunicado
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : (
        /* Listado de Comunicados */
        <div className="grid gap-5 lg:grid-cols-[1.8fr_1.2fr]">
          {/* Main List */}
          <section className="card anim-fade-in flex flex-col">
            {/* Filter and Search Bar */}
            <div className="card-body border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar comunicados por título, contenido o emisor..."
                    className="input-base"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoriaFiltro(cat.id)}
                      className="px-3 py-1.5 rounded-md text-xs font-bold transition border"
                      style={{
                        background: categoriaFiltro === cat.id ? 'var(--navy)' : '#fff',
                        color: categoriaFiltro === cat.id ? '#fff' : 'var(--navy)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-[var(--border)] overflow-y-auto max-h-[500px]" style={{ flex: 1 }}>
              {listaFiltrada.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-48">
                  <span className="text-3xl mb-2">✉️</span>
                  <p className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>No se encontraron comunicados</p>
                  <p className="text-xs" style={{ color: 'var(--brown)' }}>Prueba a cambiar tus términos de búsqueda o filtros.</p>
                </div>
              ) : (
                listaFiltrada.map((item) => {
                  const cat = getCategoriaDetails(item.categoria);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedComunicado(item);
                        handleMarcarLeido(item.id);
                      }}
                      className="p-4 transition hover:bg-[var(--cream-light)] cursor-pointer flex items-start gap-3"
                      style={{ background: selectedComunicado?.id === item.id ? 'var(--cream-light)' : 'transparent' }}
                    >
                      {/* Read status dot */}
                      <span
                        className="mt-2.5 h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: item.leido ? 'transparent' : 'var(--warning)' }}
                        title={item.leido ? 'Leído' : 'No leído'}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider"
                            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                          >
                            {cat.label}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--brown)' }}>
                            Por {item.emisor}
                          </span>
                          <span className="text-[11px] ml-auto font-medium" style={{ color: 'var(--brown)' }}>
                            {formatFechaShort(item.fecha)}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold mb-1 leading-tight truncate" style={{ color: 'var(--navy)' }}>
                          {item.titulo}
                        </h4>
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--brown)' }}>
                          {item.mensaje}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Detailed View Panel */}
          <section className="card anim-fade-in">
            {selectedComunicado ? (
              <div className="card-body h-full flex flex-col">
                <div className="border-b pb-3 mb-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider"
                      style={{
                        background: getCategoriaDetails(selectedComunicado.categoria).bg,
                        color: getCategoriaDetails(selectedComunicado.categoria).color,
                        border: `1px solid ${getCategoriaDetails(selectedComunicado.categoria).border}`,
                      }}
                    >
                      {getCategoriaDetails(selectedComunicado.categoria).label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: 'var(--brown)' }}>
                      Destinado a: Grado {selectedComunicado.destinatarios}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold leading-snug" style={{ color: 'var(--navy)' }}>
                    {selectedComunicado.titulo}
                  </h3>
                  <div className="mt-3 flex flex-col gap-1 text-[11px]" style={{ color: 'var(--brown)' }}>
                    <p><strong>Emisor:</strong> {selectedComunicado.emisor}</p>
                    <p><strong>Enviado el:</strong> {formatFechaLong(selectedComunicado.fecha)}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto text-sm leading-relaxed" style={{ color: 'var(--navy)', whiteSpace: 'pre-line' }}>
                  {selectedComunicado.mensaje}
                </div>

                <div className="border-t pt-3 mt-4 text-center" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => setSelectedComunicado(null)}
                    className="btn btn-secondary w-full"
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-body h-full flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--cream-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 16
                }}>
                  <svg width="24" height="24" fill="none" stroke="var(--brown)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25V18A2.25 2.25 0 005.25 20.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H15M9 3.75A1.125 1.125 0 0110.125 2.5h3.75A1.125 1.125 0 0115 3.75M9 3.75h6v1.5H9v-1.5z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold" style={{ color: 'var(--navy)' }}>Ningún comunicado seleccionado</h4>
                <p className="mt-1 text-xs" style={{ color: 'var(--brown)', maxWidth: 200 }}>
                  Haz clic en un comunicado de la lista de la izquierda para ver su contenido completo.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Comunicados;
