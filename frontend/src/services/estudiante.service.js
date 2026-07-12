/**
 * Servicio de Estudiantes
 * Maneja todas las operaciones relacionadas con estudiantes
 */

import supabase from '../config/supabase.config';

class EstudianteService {
  /**
   * Obtener todos los estudiantes de una institución
   * @param {string} institucionId - ID de la institución
   * @returns {Promise<Array>} Lista de estudiantes
   */
  async obtenerTodos(institucionId) {
    if (!supabase) return [];

    const { data, error} = await supabase
      .from('estudiantes')
      .select('id, nombre_completo, numero_documento, grado, estado')
      .eq('institucion_id', institucionId)
      .eq('estado', 'activo')
      .order('nombre_completo', { ascending: true });

    if (error) throw new Error(`Error al obtener estudiantes: ${error.message}`);
    return data || [];
  }

  /**
   * Obtener perfil completo de un estudiante
   * @param {string} estudianteId - ID del estudiante
   * @returns {Promise<Object>} Perfil completo
   */
  async obtenerPerfil(estudianteId) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('vista_matriculas_completas')
      .select('*')
      .eq('estudiante_id', estudianteId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener perfil: ${error.message}`);
    }
    return data;
  }

  /**
   * Actualizar información del estudiante
   * @param {string} estudianteId - ID del estudiante
   * @param {Object} cambios - Datos a actualizar
   * @returns {Promise<Object>} Estudiante actualizado
   */
  async actualizar(estudianteId, cambios) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('estudiantes')
      .update({ ...cambios, updated_at: new Date().toISOString() })
      .eq('id', estudianteId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar estudiante: ${error.message}`);
    return data;
  }

  /**
   * Crear nuevo estudiante
   * @param {Object} datosEstudiante - Datos del nuevo estudiante
   * @returns {Promise<Object>} Estudiante creado
   */
  async crear(datosEstudiante) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('estudiantes')
      .insert(datosEstudiante)
      .select()
      .single();

    if (error) throw new Error(`Error al crear estudiante: ${error.message}`);
    return data;
  }
}

// Exportar instancia única (Singleton)
export default new EstudianteService();
