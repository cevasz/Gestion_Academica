/**
 * Servicio de Acudientes
 * Maneja todas las operaciones relacionadas con los acudientes de los estudiantes
 */

import supabase from '../config/supabase.config';

class AcudienteService {
  /**
   * Obtener datos de un acudiente por su ID
   * @param {string} acudienteId - ID del acudiente
   * @returns {Promise<Object>} Datos del acudiente
   */
  async obtenerPorId(acudienteId) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('acudientes')
      .select('*')
      .eq('id', acudienteId)
      .single();

    if (error) throw new Error(`Error al obtener acudiente: ${error.message}`);
    return data;
  }

  /**
   * Actualizar datos de un acudiente
   * @param {string} acudienteId - ID del acudiente
   * @param {Object} cambios - Datos a actualizar
   * @returns {Promise<Object>} Acudiente actualizado
   */
  async actualizar(acudienteId, cambios) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('acudientes')
      .update({ ...cambios, updated_at: new Date().toISOString() })
      .eq('id', acudienteId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar acudiente: ${error.message}`);
    return data;
  }
}

export default new AcudienteService();
