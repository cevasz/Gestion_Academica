import { useMemo, useState } from 'react';

const GRUPOS = ['6A', '7B', '8A', '9C', '10A', '11B'];

const ESTUDIANTES_POR_GRUPO = {
  '6A': [
    { id: '6a-001', codigo: '2026101', nombre: 'Mariana Lopez Pardo' },
    { id: '6a-002', codigo: '2026102', nombre: 'Nicolas Herrera Ruiz' },
    { id: '6a-003', codigo: '2026103', nombre: 'Sofia Valentina Diaz' },
    { id: '6a-004', codigo: '2026104', nombre: 'Emmanuel Castro Mora' },
  ],
  '7B': [
    { id: '7b-001', codigo: '2026201', nombre: 'Daniela Torres Gil' },
    { id: '7b-002', codigo: '2026202', nombre: 'Samuel Restrepo Cano' },
    { id: '7b-003', codigo: '2026203', nombre: 'Maria Jose Rivas' },
    { id: '7b-004', codigo: '2026204', nombre: 'Tomas Cardenas Leon' },
  ],
  '8A': [
    { id: '8a-001', codigo: '2026001', nombre: 'Ana Sofia Martinez' },
    { id: '8a-002', codigo: '2026002', nombre: 'Carlos Andres Rojas' },
    { id: '8a-003', codigo: '2026003', nombre: 'Valentina Gomez Ruiz' },
    { id: '8a-004', codigo: '2026004', nombre: 'Juan David Torres' },
    { id: '8a-005', codigo: '2026005', nombre: 'Isabella Castro Pena' },
    { id: '8a-006', codigo: '2026006', nombre: 'Miguel Angel Cardenas' },
    { id: '8a-007', codigo: '2026007', nombre: 'Laura Camila Vargas' },
    { id: '8a-008', codigo: '2026008', nombre: 'Samuel Ortega Mora' },
  ],
  '9C': [
    { id: '9c-001', codigo: '2026301', nombre: 'Gabriela Molina Arias' },
    { id: '9c-002', codigo: '2026302', nombre: 'Andres Felipe Pabon' },
    { id: '9c-003', codigo: '2026303', nombre: 'Luciana Marin Ortiz' },
    { id: '9c-004', codigo: '2026304', nombre: 'Martin Valencia Soto' },
  ],
  '10A': [
    { id: '10a-001', codigo: '2026401', nombre: 'Camila Alejandra Reyes' },
    { id: '10a-002', codigo: '2026402', nombre: 'Sebastian Gomez Luna' },
    { id: '10a-003', codigo: '2026403', nombre: 'Manuela Rojas Pena' },
    { id: '10a-004', codigo: '2026404', nombre: 'Jeronimo Vargas Soler' },
  ],
  '11B': [
    { id: '11b-001', codigo: '2026501', nombre: 'Paula Andrea Serrano' },
    { id: '11b-002', codigo: '2026502', nombre: 'David Alejandro Mesa' },
    { id: '11b-003', codigo: '2026503', nombre: 'Natalia Giraldo Vera' },
    { id: '11b-004', codigo: '2026504', nombre: 'Felipe Arango Rios' },
  ],
};

const ESTADOS = [
  {
    id: 'presente',
    label: 'Presente',
    short: 'P',
    color: 'var(--success)',
    bg: 'var(--success-bg)',
    border: '#86efac',
  },
  {
    id: 'ausente',
    label: 'Ausente',
    short: 'A',
    color: 'var(--danger)',
    bg: 'var(--danger-bg)',
    border: '#fca5a5',
  },
  {
    id: 'tardanza',
    label: 'Tardanza',
    short: 'T',
    color: 'var(--warning)',
    bg: 'var(--warning-bg)',
    border: '#fcd34d',
  },
  {
    id: 'excusa',
    label: 'Excusa',
    short: 'E',
    color: '#1d4ed8',
    bg: '#dbeafe',
    border: '#93c5fd',
  },
];

const hoyISO = () => new Date().toISOString().slice(0, 10);

const crearRegistroInicial = (estudiantes) =>
  estudiantes.reduce((acc, estudiante) => {
    acc[estudiante.id] = 'presente';
    return acc;
  }, {});

const formatearFecha = (fecha) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

const EstadoButton = ({ estado, activo, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="h-9 min-w-[96px] rounded-md border px-3 text-sm font-semibold transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
    style={{
      background: activo ? estado.bg : '#fff',
      borderColor: activo ? estado.border : 'var(--border)',
      color: activo ? estado.color : 'var(--brown)',
      boxShadow: activo ? 'inset 0 0 0 1px rgba(255,255,255,0.65)' : 'none',
    }}
    aria-pressed={activo}
  >
    <span className="hidden sm:inline">{estado.label}</span>
    <span className="sm:hidden">{estado.short}</span>
  </button>
);

const ControlAsistencia = () => {
  const [grupo, setGrupo] = useState('8A');
  const [fecha, setFecha] = useState(hoyISO());
  const [registrosPorGrupo, setRegistrosPorGrupo] = useState(() => ({
    '8A': crearRegistroInicial(ESTUDIANTES_POR_GRUPO['8A']),
  }));
  const [reporte, setReporte] = useState(null);

  const estudiantes = useMemo(() => ESTUDIANTES_POR_GRUPO[grupo] || [], [grupo]);
  const registros = useMemo(
    () => registrosPorGrupo[grupo] || crearRegistroInicial(estudiantes),
    [estudiantes, grupo, registrosPorGrupo]
  );

  const resumen = useMemo(() => {
    const base = ESTADOS.reduce((acc, estado) => ({ ...acc, [estado.id]: 0 }), {});
    estudiantes.forEach((estudiante) => {
      const estado = registros[estudiante.id] || 'presente';
      base[estado] += 1;
    });

    return {
      ...base,
      total: estudiantes.length,
      marcados: Object.values(registros).filter(Boolean).length,
    };
  }, [estudiantes, registros]);

  const cambiarGrupo = (nuevoGrupo) => {
    setGrupo(nuevoGrupo);
    setReporte(null);
    setRegistrosPorGrupo((prev) => {
      if (prev[nuevoGrupo]) return prev;
      return {
        ...prev,
        [nuevoGrupo]: crearRegistroInicial(ESTUDIANTES_POR_GRUPO[nuevoGrupo] || []),
      };
    });
  };

  const actualizarEstado = (estudianteId, estado) => {
    setReporte(null);
    setRegistrosPorGrupo((prev) => ({
      ...prev,
      [grupo]: {
        ...(prev[grupo] || crearRegistroInicial(estudiantes)),
        [estudianteId]: estado,
      },
    }));
  };

  const marcarTodosPresentes = () => {
    setReporte(null);
    setRegistrosPorGrupo((prev) => ({
      ...prev,
      [grupo]: crearRegistroInicial(estudiantes),
    }));
  };

  const guardarRegistro = () => {
    const estudiantesPorEstado = ESTADOS.reduce((acc, estado) => {
      acc[estado.id] = estudiantes
        .filter((estudiante) => (registros[estudiante.id] || 'presente') === estado.id)
        .map((estudiante) => estudiante.nombre);
      return acc;
    }, {});

    setReporte({
      id: `ASI-${fecha.replaceAll('-', '')}-${grupo}`,
      fecha,
      grupo,
      generadoEn: new Date().toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      resumen,
      estudiantesPorEstado,
    });
  };

  const noPresentes = estudiantes.filter((estudiante) => {
    const estado = registros[estudiante.id] || 'presente';
    return estado !== 'presente';
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="card anim-fade-in">
        <div className="card-body">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                Control diario
              </p>
              <h2 className="mt-1 text-2xl font-extrabold" style={{ color: 'var(--navy)' }}>
                Asistencia por grupo
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--brown)' }}>
                {formatearFecha(fecha)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                  Grupo
                </span>
                <select
                  value={grupo}
                  onChange={(event) => cambiarGrupo(event.target.value)}
                  className="input-base"
                >
                  {GRUPOS.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                  Fecha
                </span>
                <input
                  type="date"
                  value={fecha}
                  onChange={(event) => {
                    setFecha(event.target.value);
                    setReporte(null);
                  }}
                  className="input-base"
                />
              </label>

              <button type="button" onClick={marcarTodosPresentes} className="btn btn-secondary self-end">
                Marcar presentes
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Estudiantes" value={resumen.total} color="var(--navy)" />
        <StatCard label="Presentes" value={resumen.presente} color="var(--success)" />
        <StatCard label="Ausentes" value={resumen.ausente} color="var(--danger)" />
        <StatCard label="Tardanzas" value={resumen.tardanza} color="var(--warning)" />
        <StatCard label="Excusas" value={resumen.excusa} color="#1d4ed8" />
      </section>

      <section className="card anim-fade-in">
        <div className="card-header flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--navy)' }}>
              Lista del grupo {grupo}
            </h3>
            <p className="text-sm" style={{ color: 'var(--brown)' }}>
              Selecciona el estado de asistencia de cada estudiante.
            </p>
          </div>
          <button type="button" onClick={guardarRegistro} className="btn btn-primary">
            Guardar registro
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr style={{ background: 'var(--cream-light)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                  Estudiante
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                  Codigo
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                  Estado del dia
                </th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((estudiante) => {
                const estadoActual = registros[estudiante.id] || 'presente';
                return (
                  <tr key={estudiante.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'var(--cream)', color: 'var(--navy)' }}>
                          {estudiante.nombre.split(' ').slice(0, 2).map((parte) => parte[0]).join('')}
                        </span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                            {estudiante.nombre}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--brown)' }}>
                            Grupo {grupo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--brown)' }}>
                      {estudiante.codigo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[420px] flex-wrap gap-2">
                        {ESTADOS.map((estado) => (
                          <EstadoButton
                            key={estado.id}
                            estado={estado}
                            activo={estadoActual === estado.id}
                            onClick={() => actualizarEstado(estudiante.id, estado.id)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {reporte && (
        <section className="card anim-slide-down">
          <div className="card-header flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--navy)' }}>
                Reporte generado
              </h3>
              <p className="text-sm" style={{ color: 'var(--brown)' }}>
                Registro {reporte.id} guardado el {reporte.generadoEn}
              </p>
            </div>
            <span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              Guardado
            </span>
          </div>

          <div className="card-body grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <dt className="font-semibold" style={{ color: 'var(--brown)' }}>Fecha</dt>
                  <dd className="mt-1 font-bold" style={{ color: 'var(--navy)' }}>{formatearFecha(reporte.fecha)}</dd>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <dt className="font-semibold" style={{ color: 'var(--brown)' }}>Grupo</dt>
                  <dd className="mt-1 font-bold" style={{ color: 'var(--navy)' }}>{reporte.grupo}</dd>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <dt className="font-semibold" style={{ color: 'var(--brown)' }}>Presentes</dt>
                  <dd className="mt-1 font-bold" style={{ color: 'var(--success)' }}>{reporte.resumen.presente}</dd>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <dt className="font-semibold" style={{ color: 'var(--brown)' }}>Ausentes</dt>
                  <dd className="mt-1 font-bold" style={{ color: 'var(--danger)' }}>{reporte.resumen.ausente}</dd>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <dt className="font-semibold" style={{ color: 'var(--brown)' }}>Tardanzas</dt>
                  <dd className="mt-1 font-bold" style={{ color: 'var(--warning)' }}>{reporte.resumen.tardanza}</dd>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <dt className="font-semibold" style={{ color: 'var(--brown)' }}>Excusas</dt>
                  <dd className="mt-1 font-bold" style={{ color: '#1d4ed8' }}>{reporte.resumen.excusa}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--cream-light)' }}>
              <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--brown)' }}>
                Novedades del dia
              </h4>
              {noPresentes.length === 0 ? (
                <p className="mt-3 text-sm font-medium" style={{ color: 'var(--success)' }}>
                  Todos los estudiantes quedaron marcados como presentes.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {noPresentes.map((estudiante) => {
                    const estado = ESTADOS.find((item) => item.id === registros[estudiante.id]);
                    return (
                      <li key={estudiante.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm">
                        <span className="font-medium" style={{ color: 'var(--navy)' }}>{estudiante.nombre}</span>
                        <span className="badge" style={{ background: estado.bg, color: estado.color }}>{estado.label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ControlAsistencia;
