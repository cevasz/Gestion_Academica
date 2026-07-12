/**
 * Servicio de Instituciones
 * Maneja todas las operaciones relacionadas con instituciones
 */

import supabase from '../config/supabase.config';

class InstitucionService {
  /**
   * Obtener información de la institución actual
   * @param {string} institucionId - ID de la institución
   * @returns {Promise<Object>} Datos de la institución
   */
  async obtenerInstitucionActual(institucionId) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .eq('id', institucionId)
      .single();

    if (error) throw new Error(`Error al obtener institución: ${error.message}`);
    return data;
  }

  /**
   * Actualizar plan de una institución
   * @param {string} institucionId - ID de la institución
   * @param {string} nuevoPlan - Nuevo plan a asignar
   * @returns {Promise<Object>} Institución actualizada
   */
  async actualizarPlan(institucionId, nuevoPlan) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('instituciones')
      .update({ plan: nuevoPlan, updated_at: new Date().toISOString() })
      .eq('id', institucionId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar plan: ${error.message}`);
    return data;
  }

  /**
   * Crear nueva institución
   * @param {Object} datosInstitucion - Datos de la nueva institución
   * @returns {Promise<Object>} Institución creada
   */
  async crear(datosInstitucion) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('instituciones')
      .insert(datosInstitucion)
      .select()
      .single();

    if (error) throw new Error(`Error al crear institución: ${error.message}`);
    return data;
  }

  /**
   * Obtener todas las instituciones (para superadmin)
   * @returns {Promise<Array>} Lista de instituciones
   */
  async obtenerTodas() {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw new Error(`Error al obtener instituciones: ${error.message}`);
    return data;
  }
}

// Exportar instancia única (Singleton)
export default new InstitucionService();
