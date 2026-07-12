/**
 * Servicio de Matrículas
 * Maneja todas las operaciones relacionadas con matrículas
 */

import supabase from '../config/supabase.config';

class MatriculaService {
  /**
   * Generar número de matrícula único
   * @returns {Promise<string>} Número de matrícula generado
   */
  async generarNumero() {
    if (!supabase) {
      // Modo demo
      const año = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${año}-${random}`;
    }

    const año = new Date().getFullYear();
    let intentos = 0;
    const maxIntentos = 10;

    while (intentos < maxIntentos) {
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const numeroMatricula = `${año}-${random}`;

      const { data } = await supabase
        .from('matriculas')
        .select('numero_matricula')
        .eq('numero_matricula', numeroMatricula)
        .single();

      if (!data) return numeroMatricula;
      intentos++;
    }

    throw new Error('No se pudo generar un número de matrícula único');
  }

  /**
   * Crear matrícula completa
   * @param {Object} formData - Datos del formulario
   * @param {string} tipoOperacion - Tipo de operación
   * @param {string} institucionId - ID de la institución
   * @returns {Promise<Object>} Resultado de la operación
   */
  async crear(formData, tipoOperacion, institucionId) {
    if (!supabase) {
      // Modo demo
      const numeroMatricula = await this.generarNumero();
      return {
        success: true,
        numeroMatricula,
        message: 'Matrícula creada en modo demo'
      };
    }

    try {
      // 1. Crear/actualizar estudiante
      const estudiante = await this._upsertEstudiante(formData, institucionId);

      // 2. Crear/actualizar acudiente
      const acudiente = await this._upsertAcudiente(formData);

      // 3. Generar número de matrícula
      const numeroMatricula = await this.generarNumero();

      // 4. Crear matrícula
      const { data: matricula, error } = await supabase
        .from('matriculas')
        .insert({
          numero_matricula: numeroMatricula,
          estudiante_id: estudiante.id,
          acudiente_id: acudiente.id,
          tipo_operacion: tipoOperacion,
          numero_matricula_anterior: formData.numeroMatriculaAnterior || null,
          ano_lectivo: new Date().getFullYear(),
          estado: 'activa'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        numeroMatricula,
        matricula,
        estudiante,
        acudiente
      };
    } catch (error) {
      console.error('Error al crear matrícula:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crear o actualizar estudiante (método privado)
   */
  async _upsertEstudiante(formData, institucionId) {
    const { data, error } = await supabase
      .from('estudiantes')
      .upsert({
        institucion_id: institucionId,
        nombre_completo: formData.nombreEstudiante,
        tipo_documento: formData.tipoDocumento,
        numero_documento: formData.numeroDocumento,
        fecha_nacimiento: formData.fechaNacimiento,
        grado: formData.grado,
        estado: 'activo'
      }, {
        onConflict: 'institucion_id,numero_documento',
        returning: 'representation'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Crear o actualizar acudiente (método privado)
   */
  async _upsertAcudiente(formData) {
    const { data: existente } = await supabase
      .from('acudientes')
      .select('id')
      .eq('numero_documento', formData.documentoAcudiente)
      .single();

    if (existente) {
      const { data, error } = await supabase
        .from('acudientes')
        .update({
          nombre_completo: formData.nombreAcudiente,
          parentesco: formData.parentesco,
          telefono: formData.telefonoAcudiente,
          correo_electronico: formData.correoAcudiente
        })
        .eq('id', existente.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('acudientes')
        .insert({
          nombre_completo: formData.nombreAcudiente,
          numero_documento: formData.documentoAcudiente,
          parentesco: formData.parentesco,
          telefono: formData.telefonoAcudiente,
          correo_electronico: formData.correoAcudiente
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Obtener matrículas del año actual
   * @param {string} institucionId - ID de la institución
   * @returns {Promise<Array>} Lista de matrículas
   */
  async obtenerMatriculasAnoActual(institucionId) {
    if (!supabase) return [];

    const añoActual = new Date().getFullYear();

    let query = supabase
      .from('vista_matriculas_completas')
      .select('*')
      .eq('ano_lectivo', añoActual)
      .order('fecha_matricula', { ascending: false });

    if (institucionId) {
      query = query.eq('institucion_id', institucionId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Error al obtener matrículas: ${error.message}`);
    return data || [];
  }
}

// Exportar instancia única (Singleton)
export default new MatriculaService();
