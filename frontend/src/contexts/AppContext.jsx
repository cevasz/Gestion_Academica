/**
 * Contexto Global de la Aplicación
 * Maneja el estado compartido entre componentes
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { PLANES } from '../constants/planes.constants';
import institucionService from '../services/institucion.service';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Estado de la institución actual
  const [institucion, setInstitucion] = useState(null);
  const [planActual, setPlanActual] = useState(PLANES.ESENCIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado de sesión (simulado - en producción vendría de auth)
  const [usuario, setUsuario] = useState(null);
  const [institucionId, setInstitucionId] = useState(null);

  /**
   * Cargar información de la institución
   */
  const cargarInstitucion = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await institucionService.obtenerInstitucionActual(id);
      setInstitucion(data);
      setPlanActual(data.plan);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar institución:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar plan de la institución
   */
  const actualizarPlan = async (nuevoPlan) => {
    if (!institucionId) {
      setPlanActual(nuevoPlan); // Modo demo
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await institucionService.actualizarPlan(institucionId, nuevoPlan);
      setInstitucion(data);
      setPlanActual(data.plan);
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar plan:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicializar aplicación
   */
  useEffect(() => {
    // En producción, obtener institucionId del usuario autenticado
    // Por ahora, usamos modo demo
    if (institucionId) {
      cargarInstitucion(institucionId);
    }
  }, [institucionId]);

  const value = {
    // Estado
    institucion,
    planActual,
    loading,
    error,
    usuario,
    institucionId,

    // Acciones
    setInstitucionId,
    cargarInstitucion,
    actualizarPlan,
    setPlanActual, // Para modo demo
    setUsuario
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
