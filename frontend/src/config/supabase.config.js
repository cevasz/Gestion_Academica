/**
 * Configuración de Supabase
 * Centraliza la configuración del cliente de Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Validar variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Advertencia: Credenciales de Supabase no configuradas');
  console.warn('El sistema funcionará en modo demo limitado');
}

// Crear cliente de Supabase
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Verificar conexión
export const verificarConexion = async () => {
  if (!supabase) {
    return { conectado: false, mensaje: 'Cliente no inicializado' };
  }

  try {
    const { error } = await supabase.from('instituciones').select('count').limit(1);
    return {
      conectado: !error,
      mensaje: error ? error.message : 'Conexión exitosa'
    };
  } catch (err) {
    return { conectado: false, mensaje: err.message };
  }
};

export default supabase;
