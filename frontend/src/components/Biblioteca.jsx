import { useMemo, useState } from 'react';

const MATERIAS = ['Todas', 'Matemáticas', 'Español', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Otros'];

const TIPOS_RECURSO = [
  { id: 'todos', label: 'Todos los formatos' },
  { id: 'pdf', label: 'Documento PDF', icono: '📄' },
  { id: 'libro', label: 'Libro Digital', icono: '📚' },
  { id: 'video', label: 'Video Clase', icono: '🎥' },
  { id: 'enlace', label: 'Enlace Educativo', icono: '🔗' },
];

const RECURSOS_INICIALES = [
  {
    id: 'rec-1',
    titulo: 'Álgebra de Baldor (Edición Completa)',
    materia: 'Matemáticas',
    tipo: 'libro',
    grado: '8°',
    descripcion: 'Texto clásico con explicaciones detalladas y más de 6,000 ejercicios resueltos de álgebra elemental.',
    tamano: '48.5 MB',
    enlace: '#',
  },
  {
    id: 'rec-2',
    titulo: 'Guía de Lectura Crítica y Análisis Literario',
    materia: 'Español',
    tipo: 'pdf',
    grado: '11°',
    descripcion: 'Compilado de técnicas y ejercicios para fortalecer la comprensión lectora y preparación para las pruebas Saber 11.',
    tamano: '2.3 MB',
    enlace: '#',
  },
  {
    id: 'rec-3',
    titulo: 'Simulador Interactivo de Enlaces Químicos',
    materia: 'Ciencias Naturales',
    tipo: 'enlace',
    grado: '9°',
    descripcion: 'Herramienta virtual para construir moléculas y observar el comportamiento de enlaces iónicos, covalentes y metálicos.',
    tamano: 'Enlace Web',
    enlace: 'https://phet.colorado.edu/',
  },
  {
    id: 'rec-4',
    titulo: 'Banco de Preguntas de Historia de Colombia',
    materia: 'Ciencias Sociales',
    tipo: 'pdf',
    grado: '10°',
    descripcion: 'Material de estudio complementario con cuestionarios interactivos acerca de la independencia y el siglo XX colombiano.',
    tamano: '1.7 MB',
    enlace: '#',
  },
  {
    id: 'rec-5',
    titulo: 'Videotutorial: Tiempos Verbales Perfectos en Inglés',
    materia: 'Inglés',
    tipo: 'video',
    grado: 'Todos',
    descripcion: 'Explicación dinámica en video sobre el uso correcto del Present Perfect y Past Perfect en conversaciones formales.',
    tamano: '18 Minutos',
    enlace: '#',
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

const Biblioteca = () => {
  const [recursos, setRecursos] = useState(RECURSOS_INICIALES);
  const [buscar, setBuscar] = useState('');
  const [materiaFiltro, setMateriaFiltro] = useState('Todas');
  const [tipoFiltro, setTipoFiltro] = useState('todos');

  // Estados para formulario de adición
  const [showSubirForm, setShowSubirForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    materia: 'Matemáticas',
    tipo: 'pdf',
    grado: 'Todos',
    descripcion: '',
    tamano: '',
    enlace: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Estadísticas
  const stats = useMemo(() => {
    const total = recursos.length;
    const pdfs = recursos.filter(r => r.tipo === 'pdf').length;
    const libros = recursos.filter(r => r.tipo === 'libro').length;
    const enlaces = recursos.filter(r => r.tipo === 'enlace').length;
    return { total, pdfs, libros, enlaces };
  }, [recursos]);

  // Lista filtrada
  const listaFiltrada = useMemo(() => {
    return recursos.filter((r) => {
      const matchesBuscar = r.titulo.toLowerCase().includes(buscar.toLowerCase()) ||
                            r.descripcion.toLowerCase().includes(buscar.toLowerCase());
      const matchesMateria = materiaFiltro === 'Todas' || r.materia === materiaFiltro;
      const matchesTipo = tipoFiltro === 'todos' || r.tipo === tipoFiltro;
      return matchesBuscar && matchesMateria && matchesTipo;
    });
  }, [recursos, buscar, materiaFiltro, tipoFiltro]);

  const handleDescargar = (titulo) => {
    alert(`Descarga iniciada para el recurso:\n"${titulo}" (Simulación)`);
  };

  const handleAgregarRecurso = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.titulo.trim()) {
      setFormError('El título del recurso es requerido.');
      return;
    }
    if (!formData.descripcion.trim()) {
      setFormError('La descripción es requerida.');
      return;
    }

    const nuevoRecurso = {
      id: `rec-${Date.now()}`,
      titulo: formData.titulo.trim(),
      materia: formData.materia,
      tipo: formData.tipo,
      grado: formData.grado,
      descripcion: formData.descripcion.trim(),
      tamano: formData.tamano.trim() || (formData.tipo === 'enlace' ? 'Enlace Web' : '1.5 MB'),
      enlace: formData.enlace.trim() || '#',
    };

    setRecursos(prev => [...prev, nuevoRecurso]);
    setFormData({
      titulo: '',
      materia: 'Matemáticas',
      tipo: 'pdf',
      grado: 'Todos',
      descripcion: '',
      tamano: '',
      enlace: '',
    });
    setFormSuccess('Recurso añadido a la biblioteca exitosamente');
    setTimeout(() => {
      setShowSubirForm(false);
      setFormSuccess('');
    }, 1500);
  };

  const formatBadgeMateria = (materia) => {
    const colores = {
      'Matemáticas': { color: '#b45309', bg: '#fef3c7' }, // Amber
      'Español': { color: '#0369a1', bg: '#e0f2fe' }, // Sky
      'Ciencias Naturales': { color: '#15803d', bg: '#dcfce7' }, // Green
      'Ciencias Sociales': { color: '#7c3aed', bg: '#f5f3ff' }, // Violet
      'Inglés': { color: '#be123c', bg: '#ffe4e6' }, // Rose
    };
    const c = colores[materia] || { color: 'var(--navy)', bg: 'var(--cream)' };
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider" style={{ background: c.bg, color: c.color }}>
        {materia}
      </span>
    );
  };

  const getIconFormat = (tipo) => {
    return TIPOS_RECURSO.find(t => t.id === tipo)?.icono || '📄';
  };

  const getLabelFormat = (tipo) => {
    return TIPOS_RECURSO.find(t => t.id === tipo)?.label || 'Documento';
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Card */}
      <section className="card anim-fade-in">
        <div className="card-body">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                Recursos Académicos
              </p>
              <h2 className="mt-1 text-2xl font-extrabold" style={{ color: 'var(--navy)' }}>
                Biblioteca Digital
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--brown)' }}>
                Explora libros de texto, guías de estudio, simuladores y recursos pedagógicos.
              </p>
            </div>

            <button
              onClick={() => {
                setShowSubirForm(!showSubirForm);
                setFormError('');
                setFormSuccess('');
              }}
              className="btn btn-primary self-start sm:self-auto"
            >
              {showSubirForm ? 'Explorar Biblioteca' : 'Agregar Recurso'}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recursos Totales" value={stats.total} color="var(--navy)" />
        <StatCard label="Documentos PDF" value={stats.pdfs} color="var(--navy-light)" />
        <StatCard label="Libros Digitales" value={stats.libros} color="var(--brown)" />
        <StatCard label="Enlaces Externos" value={stats.enlaces} color="var(--success)" />
      </section>

      {showSubirForm ? (
        /* Formulario para agregar recurso */
        <section className="card anim-slide-down">
          <div className="card-header">
            <h3 className="text-base font-bold" style={{ color: 'var(--navy)' }}>
              Registrar nuevo recurso en la biblioteca
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleAgregarRecurso} className="space-y-4">
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
                    Nombre del recurso
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                    className="input-base"
                    placeholder="Ej. Taller Preparatorio Examen Final de Álgebra..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                    Asignatura / Materia
                  </label>
                  <select
                    value={formData.materia}
                    onChange={e => setFormData({ ...formData, materia: e.target.value })}
                    className="input-base"
                  >
                    {MATERIAS.filter(m => m !== 'Todas').map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                    Formato
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    className="input-base"
                  >
                    {TIPOS_RECURSO.filter(t => t.id !== 'todos').map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                    Grado Destinatario
                  </label>
                  <select
                    value={formData.grado}
                    onChange={e => setFormData({ ...formData, grado: e.target.value })}
                    className="input-base"
                  >
                    <option value="Todos">Todos los Grados</option>
                    <option value="6°">Grado 6°</option>
                    <option value="7°">Grado 7°</option>
                    <option value="8°">Grado 8°</option>
                    <option value="9°">Grado 9°</option>
                    <option value="10°">Grado 10°</option>
                    <option value="11°">Grado 11°</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                    Tamaño o Duración
                  </label>
                  <input
                    type="text"
                    value={formData.tamano}
                    onChange={e => setFormData({ ...formData, tamano: e.target.value })}
                    className="input-base"
                    placeholder="Ej. 1.2 MB / 15 Mins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                    URL Enlace (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.enlace}
                    onChange={e => setFormData({ ...formData, enlace: e.target.value })}
                    className="input-base"
                    placeholder="Ej. https://url.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                  Descripción breve del material
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="4"
                  className="input-base"
                  placeholder="Explica detalladamente el contenido de este recurso y cómo puede ser aprovechado por los estudiantes..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubirForm(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Agregar Recurso
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : (
        /* Explorador y Listado de Recursos */
        <div className="flex flex-col gap-4">
          {/* Barra de Filtros */}
          <section className="card anim-fade-in">
            <div className="card-body">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar recursos por título o descripción..."
                    className="input-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-2">
                  <label className="block sm:min-w-[160px]">
                    <select
                      value={materiaFiltro}
                      onChange={e => setMateriaFiltro(e.target.value)}
                      className="input-base"
                    >
                      {MATERIAS.map(m => (
                        <option key={m} value={m}>{m === 'Todas' ? 'Todas las materias' : m}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block sm:min-w-[160px]">
                    <select
                      value={tipoFiltro}
                      onChange={e => setTipoFiltro(e.target.value)}
                      className="input-base"
                    >
                      {TIPOS_RECURSO.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Grid de Recursos */}
          {listaFiltrada.length === 0 ? (
            <div className="card p-12 text-center anim-fade-in">
              <span className="text-4xl mb-2">📚</span>
              <h4 className="font-extrabold text-sm" style={{ color: 'var(--navy)' }}>No se encontraron recursos</h4>
              <p className="text-xs" style={{ color: 'var(--brown)', marginTop: 4 }}>
                Prueba a modificar los filtros o el texto de tu búsqueda para ver otros materiales.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 anim-stagger">
              {listaFiltrada.map((item) => (
                <div
                  key={item.id}
                  className="card transition hover:shadow-md flex flex-col h-full anim-fade-in"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="card-body flex-1 flex flex-col gap-3 p-5">
                    {/* Header: Format and Subject */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{getIconFormat(item.tipo)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                          {getLabelFormat(item.tipo)}
                        </span>
                      </div>
                      {formatBadgeMateria(item.materia)}
                    </div>

                    {/* Title & Grade */}
                    <div>
                      <h4 className="text-sm font-extrabold line-clamp-1" style={{ color: 'var(--navy)' }} title={item.titulo}>
                        {item.titulo}
                      </h4>
                      <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--brown)' }}>
                        Dirigido a: Grado {item.grado}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs line-clamp-3 leading-relaxed flex-1" style={{ color: 'var(--navy)', opacity: 0.85 }}>
                      {item.descripcion}
                    </p>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between border-t pt-3 mt-1" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--brown)' }}>
                        Tamaño: {item.tamano}
                      </span>
                      {item.tipo === 'enlace' ? (
                        <a
                          href={item.enlace}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary px-3.5 py-1 text-xs"
                          style={{ minHeight: 28 }}
                        >
                          Ir al enlace ↗
                        </a>
                      ) : (
                        <button
                          onClick={() => handleDescargar(item.titulo)}
                          className="btn btn-secondary px-3.5 py-1 text-xs"
                          style={{ minHeight: 28 }}
                        >
                          Descargar 📥
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Biblioteca;
