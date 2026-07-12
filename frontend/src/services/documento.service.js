/**
 * Servicio de Documentos
 * Maneja todas las operaciones relacionadas con gestión documental
 */

import supabase from '../config/supabase.config';

class DocumentoService {
  /**
   * Obtener todos los documentos
   * @returns {Promise<Array>} Lista de documentos
   */
  async obtenerTodos() {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('vista_documentos_completos')
      .select('*')
      .order('fecha_carga', { ascending: false });

    if (error) throw new Error(`Error al obtener documentos: ${error.message}`);
    return data || [];
  }

  /**
   * Obtener documentos de un estudiante
   * @param {string} estudianteId - ID del estudiante
   * @returns {Promise<Array>} Documentos del estudiante
   */
  async obtenerPorEstudiante(estudianteId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('estudiante_id', estudianteId)
      .order('fecha_carga', { ascending: false });

    if (error) throw new Error(`Error al obtener documentos: ${error.message}`);
    return data || [];
  }

  /**
   * Subir documento
   * @param {File} archivo - Archivo a subir
   * @param {string} estudianteId - ID del estudiante
   * @param {string} tipoDocumento - Tipo de documento
   * @returns {Promise<Object>} Documento creado
   */
  async subir(archivo, estudianteId, tipoDocumento) {
    if (!supabase) {
      throw new Error('Supabase no está configurado. No se pueden subir archivos en modo demo.');
    }

    try {
      // Generar nombre único
      const timestamp = Date.now();
      const nombreOriginal = archivo.name;
      const extension = nombreOriginal.split('.').pop();
      const nombreArchivo = `${estudianteId}/${tipoDocumento}_${timestamp}.${extension}`;

      // Subir archivo a Storage
      const { error: uploadError } = await supabase.storage
        .from('documentos-estudiantes')
        .upload(nombreArchivo, archivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('documentos-estudiantes')
        .getPublicUrl(nombreArchivo);

      // Guardar referencia en BD
      const { data: docData, error: docError } = await supabase
        .from('documentos')
        .insert({
          estudiante_id: estudianteId,
          tipo_documento: tipoDocumento,
          nombre_archivo: nombreOriginal,
          url_archivo: urlData.publicUrl,
          tamanio_bytes: archivo.size,
          mime_type: archivo.type,
          estado: 'pendiente'
        })
        .select()
        .single();

      if (docError) throw docError;

      return {
        success: true,
        documento: docData
      };
    } catch (error) {
      console.error('Error al subir documento:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de documento
   * @param {string} documentoId - ID del documento
   * @param {string} nuevoEstado - Nuevo estado
   * @param {string} observaciones - Observaciones opcionales
   * @returns {Promise<Object>} Documento actualizado
   */
  async actualizarEstado(documentoId, nuevoEstado, observaciones = null) {
    if (!supabase) throw new Error('Supabase no está configurado');

    const updateData = {
      estado: nuevoEstado,
      fecha_revision: new Date().toISOString()
    };

    if (observaciones) {
      updateData.observaciones = observaciones;
    }

    const { data, error } = await supabase
      .from('documentos')
      .update(updateData)
      .eq('id', documentoId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar estado: ${error.message}`);
    return data;
  }

  /**
   * Eliminar documento
   * @param {string} documentoId - ID del documento
   * @param {string} urlArchivo - URL del archivo
   * @returns {Promise<Object>} Resultado
   */
  async eliminar(documentoId, urlArchivo) {
    if (!supabase) throw new Error('Supabase no está configurado');

    try {
      // Extraer ruta del archivo
      const url = new URL(urlArchivo);
      const pathParts = url.pathname.split('/');
      const fileName = decodeURIComponent(pathParts[pathParts.length - 1]);

      // Eliminar de Storage
      const { error: storageError } = await supabase.storage
        .from('documentos-estudiantes')
        .remove([fileName]);

      if (storageError) console.error('Error al eliminar de storage:', storageError);

      // Eliminar de BD
      const { error: dbError } = await supabase
        .from('documentos')
        .delete()
        .eq('id', documentoId);

      if (dbError) throw dbError;

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de documentos
   * @returns {Promise<Array>} Estadísticas
   */
  async obtenerEstadisticas() {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('vista_estadisticas_documentos')
      .select('*');

    if (error) throw new Error(`Error al obtener estadísticas: ${error.message}`);
    return data || [];
  }
}

// Exportar instancia única (Singleton)
export default new DocumentoService();
