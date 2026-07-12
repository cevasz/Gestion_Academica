// ============================================
// CONFIGURACIÓN DE MÓDULOS POR PLAN
// ============================================

export const PLANES = {
  ESENCIAL: 'esencial',
  SMART: 'smart',
  CAMPUS_IA: 'campus_ia',
  ENTERPRISE: 'enterprise'
};

export const MODULOS = {
  // Plan Esencial - Módulos base
  MATRICULA: {
    id: 'matricula',
    nombre: 'Matrícula Digital',
    descripcion: 'Inscripción, renovación y actualización de matrículas',
    icono: 'document',
    planMinimo: PLANES.ESENCIAL,
    ruta: '/matricula',
    categoria: 'Gestión Básica'
  },
  PERFIL_ESTUDIANTE: {
    id: 'perfil',
    nombre: 'Perfil Estudiante',
    descripcion: 'Vista integral del estudiante',
    icono: 'user',
    planMinimo: PLANES.ESENCIAL,
    ruta: '/perfil',
    categoria: 'Gestión Básica'
  },
  GESTION_DOCUMENTAL: {
    id: 'documentos',
    nombre: 'Gestión Documental',
    descripcion: 'Subida y gestión de documentos',
    icono: 'folder',
    planMinimo: PLANES.ESENCIAL,
    ruta: '/documentos',
    categoria: 'Gestión Básica'
  },
  ASISTENCIA: {
    id: 'asistencia',
    nombre: 'Control de Asistencia',
    descripcion: 'Registro diario de asistencia por grupo',
    icono: 'calendar',
    planMinimo: PLANES.ESENCIAL,
    ruta: '/asistencia',
    categoria: 'Gestión Básica'
  },
  CALIFICACIONES: {
    id: 'calificaciones',
    nombre: 'Registro de Calificaciones',
    descripcion: 'Notas por período y materia',
    icono: 'chart',
    planMinimo: PLANES.ESENCIAL,
    ruta: '/calificaciones',
    categoria: 'Gestión Básica'
  },
  COMUNICADOS: {
    id: 'comunicados',
    nombre: 'Comunicados',
    descripcion: 'Envío de comunicados institucionales',
    icono: 'mail',
    planMinimo: PLANES.ESENCIAL,
    ruta: '/comunicados',
    categoria: 'Gestión Básica'
  },
  BIBLIOTECA: {
    id: 'biblioteca',
    nombre: 'Biblioteca Digital',
    descripcion: 'Repositorio de recursos académicos',
    icono: 'book',
    planMinimo: PLANES.ESENCIAL,
    ruta: '/biblioteca',
    categoria: 'Gestión Básica'
  },

  // Plan Smart - Módulos adicionales
  ENCUESTAS: {
    id: 'encuestas',
    nombre: 'Encuestas',
    descripcion: 'Encuestas institucionales con resultados gráficos',
    icono: 'clipboard',
    planMinimo: PLANES.SMART,
    ruta: '/encuestas',
    categoria: 'Campus Conectado'
  },
  GOBIERNO_ESCOLAR: {
    id: 'gobierno',
    nombre: 'Gobierno Escolar',
    descripcion: 'Candidatos, votación y resultados digitales',
    icono: 'users',
    planMinimo: PLANES.SMART,
    ruta: '/gobierno',
    categoria: 'Campus Conectado'
  },
  RECONOCIMIENTOS: {
    id: 'reconocimientos',
    nombre: 'Reconocimientos',
    descripcion: 'Insignias digitales para estudiantes',
    icono: 'award',
    planMinimo: PLANES.SMART,
    ruta: '/reconocimientos',
    categoria: 'Campus Conectado'
  },
  EVENTOS: {
    id: 'eventos',
    nombre: 'Gestión de Eventos',
    descripcion: 'Inscripciones y confirmación QR',
    icono: 'calendar-event',
    planMinimo: PLANES.SMART,
    ruta: '/eventos',
    categoria: 'Campus Conectado'
  },
  PQRS: {
    id: 'pqrs',
    nombre: 'Sistema PQRS',
    descripcion: 'Peticiones, quejas y reclamos',
    icono: 'message',
    planMinimo: PLANES.SMART,
    ruta: '/pqrs',
    categoria: 'Campus Conectado'
  },
  CHATBOT: {
    id: 'chatbot',
    nombre: 'Chatbot',
    descripcion: 'Asistente virtual de preguntas frecuentes',
    icono: 'robot',
    planMinimo: PLANES.SMART,
    ruta: '/chatbot',
    categoria: 'Campus Conectado'
  },

  // Plan Campus IA - Inteligencia Artificial
  ASISTENTE_IA: {
    id: 'asistente-ia',
    nombre: 'Asistente con IA',
    descripcion: 'Asistente inteligente para estudiantes y docentes',
    icono: 'ai',
    planMinimo: PLANES.CAMPUS_IA,
    ruta: '/asistente-ia',
    categoria: 'Inteligencia Artificial'
  },
  OVAS_IA: {
    id: 'ovas',
    nombre: 'OVAs Inteligentes',
    descripcion: 'Contenido educativo generado por IA',
    icono: 'brain',
    planMinimo: PLANES.CAMPUS_IA,
    ruta: '/ovas',
    categoria: 'Inteligencia Artificial'
  },
  ANALITICA_AVANZADA: {
    id: 'analitica',
    nombre: 'Analítica Avanzada',
    descripcion: 'Visualizaciones interactivas e informes',
    icono: 'graph',
    planMinimo: PLANES.CAMPUS_IA,
    ruta: '/analitica',
    categoria: 'Inteligencia Artificial'
  },
  INFORMES_IA: {
    id: 'informes-ia',
    nombre: 'Informes con IA',
    descripcion: 'Informes narrativos automáticos',
    icono: 'document-report',
    planMinimo: PLANES.CAMPUS_IA,
    ruta: '/informes-ia',
    categoria: 'Inteligencia Artificial'
  },

  // Plan Enterprise - Ecosistema completo
  AGENTE_WHATSAPP: {
    id: 'whatsapp',
    nombre: 'Agente WhatsApp',
    descripcion: 'Atención automatizada por WhatsApp',
    icono: 'whatsapp',
    planMinimo: PLANES.ENTERPRISE,
    ruta: '/whatsapp',
    categoria: 'Ecosistema Autónomo'
  },
  AGENTE_VOZ: {
    id: 'voz',
    nombre: 'Agente de Voz',
    descripción: 'Consultas telefónicas automáticas',
    icono: 'phone',
    planMinimo: PLANES.ENTERPRISE,
    ruta: '/voz',
    categoria: 'Ecosistema Autónomo'
  },
  ANALITICA_PREDICTIVA: {
    id: 'predictiva',
    nombre: 'Analítica Predictiva',
    descripcion: 'Predicción de rendimiento y deserción',
    icono: 'trending',
    planMinimo: PLANES.ENTERPRISE,
    ruta: '/predictiva',
    categoria: 'Ecosistema Autónomo'
  },
  AUTOMATIZACION: {
    id: 'automatizacion',
    nombre: 'Automatización',
    descripcion: 'Flujos institucionales automatizados',
    icono: 'lightning',
    planMinimo: PLANES.ENTERPRISE,
    ruta: '/automatizacion',
    categoria: 'Ecosistema Autónomo'
  },
  FIRMA_DIGITAL: {
    id: 'firma',
    nombre: 'Firma Digital',
    descripcion: 'Documentos oficiales con firma digital',
    icono: 'signature',
    planMinimo: PLANES.ENTERPRISE,
    ruta: '/firma',
    categoria: 'Ecosistema Autónomo'
  },
  API_INTEGRACIONES: {
    id: 'api',
    nombre: 'API e Integraciones',
    descripcion: 'Integraciones con plataformas externas',
    icono: 'code',
    planMinimo: PLANES.ENTERPRISE,
    ruta: '/api',
    categoria: 'Ecosistema Autónomo'
  }
};

// Obtener módulos disponibles según el plan
export const obtenerModulosDisponibles = (planActual) => {
  const jerarquiaPlanes = {
    [PLANES.ESENCIAL]: 1,
    [PLANES.SMART]: 2,
    [PLANES.CAMPUS_IA]: 3,
    [PLANES.ENTERPRISE]: 4
  };

  const nivelPlanActual = jerarquiaPlanes[planActual] || 0;

  return Object.values(MODULOS).filter(modulo => {
    const nivelPlanMinimo = jerarquiaPlanes[modulo.planMinimo];
    return nivelPlanActual >= nivelPlanMinimo;
  });
};

// Verificar si un módulo está disponible
export const esModuloDisponible = (moduloId, planActual) => {
  const modulo = Object.values(MODULOS).find(m => m.id === moduloId);
  if (!modulo) return false;

  const modulosDisponibles = obtenerModulosDisponibles(planActual);
  return modulosDisponibles.some(m => m.id === moduloId);
};

// Obtener plan requerido para un módulo bloqueado
export const obtenerPlanRequerido = (moduloId, planActual) => {
  const modulo = Object.values(MODULOS).find(m => m.id === moduloId);
  if (!modulo) return null;

  if (esModuloDisponible(moduloId, planActual)) return null;

  return modulo.planMinimo;
};

// Obtener nombre legible del plan
export const obtenerNombrePlan = (plan) => {
  const nombres = {
    [PLANES.ESENCIAL]: 'Plan Esencial',
    [PLANES.SMART]: 'Plan Smart',
    [PLANES.CAMPUS_IA]: 'Plan Campus IA',
    [PLANES.ENTERPRISE]: 'Plan Enterprise'
  };
  return nombres[plan] || 'Plan Desconocido';
};

// Agrupar módulos por categoría
export const agruparModulosPorCategoria = (planActual) => {
  const modulosDisponibles = obtenerModulosDisponibles(planActual);
  const todosBloqueados = Object.values(MODULOS).filter(
    m => !modulosDisponibles.some(md => md.id === m.id)
  );

  const agrupados = {};

  [...modulosDisponibles, ...todosBloqueados].forEach(modulo => {
    const categoria = modulo.categoria;
    if (!agrupados[categoria]) {
      agrupados[categoria] = {
        disponibles: [],
        bloqueados: []
      };
    }

    const disponible = modulosDisponibles.some(m => m.id === modulo.id);
    if (disponible) {
      agrupados[categoria].disponibles.push(modulo);
    } else {
      agrupados[categoria].bloqueados.push(modulo);
    }
  });

  return agrupados;
};

// Información de precios (para mostrar en upgrade)
export const PRECIOS_PLANES = {
  [PLANES.ESENCIAL]: {
    precio: 'Contactar',
    descripcion: 'Digitalización básica completa',
    caracteristicas: [
      'Matrículas digitales',
      'Gestión de documentos',
      'Control de asistencia',
      'Registro de calificaciones',
      'Comunicados institucionales',
      'Biblioteca digital',
      'App móvil incluida'
    ]
  },
  [PLANES.SMART]: {
    precio: '$4.000.000/mes',
    descripcion: 'Campus conectado con herramientas sociales',
    caracteristicas: [
      'Todo lo del Plan Esencial',
      'Encuestas institucionales',
      'Gobierno escolar digital',
      'Sistema de reconocimientos',
      'Gestión de eventos con QR',
      'Sistema PQRS',
      'Chatbot de FAQ'
    ]
  },
  [PLANES.CAMPUS_IA]: {
    precio: '$5.500.000/mes',
    descripcion: 'Inteligencia institucional con IA',
    caracteristicas: [
      'Todo lo del Plan Smart',
      'Asistente con IA personalizado',
      'OVAs generados por IA',
      'Analítica avanzada',
      'Informes narrativos automáticos',
      'IA entrenada con docs propios'
    ]
  },
  [PLANES.ENTERPRISE]: {
    precio: '$7.000.000/mes',
    descripcion: 'Ecosistema educativo autónomo',
    caracteristicas: [
      'Todo lo del Plan Campus IA',
      'Agente de WhatsApp con IA',
      'Agente de voz telefónico',
      'Analítica predictiva',
      'Automatización de flujos',
      'Firma digital',
      'API e integraciones',
      'Desarrollo personalizado'
    ]
  }
};
