const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const tareasService = {
  // Obtener todas las tareas
  async obtenerTareas() {
    try {
      const response = await fetch(`${API_URL}/api/Tareas`);
      if (!response.ok) {
        throw new Error('Error al obtener las tareas');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      throw error;
    }
  },

  // Crear una nueva tarea
  async crearTarea(tareaData) {
    try {
      const response = await fetch(`${API_URL}/api/Tareas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tareaData),
      });

      console.log('Response status:', response);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al crear la tarea');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear tarea:', error);
      throw error;
    }
  },

  // Obtener una tarea por ID
  async obtenerTareaPorId(id) {
    try {
      const response = await fetch(`${API_URL}/api/Tareas/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener la tarea');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener tarea:', error);
      throw error;
    }
  },
  // Actualizar una tarea
  async actualizarTarea(id, tareaData) {
    try {
      console.log(`Actualizando tarea ${id}:`, JSON.stringify(tareaData, null, 2));

      const response = await fetch(`${API_URL}/api/Tareas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(tareaData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        throw new Error(errorData || 'Error al actualizar la tarea');
      } 
      
      const data = await response.json();
      console.log('Tarea actualizada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      throw error;
    }
  },

  // Eliminar una tarea
  async eliminarTarea(id) {
    try {
      const response = await fetch(`${API_URL}/api/Tareas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || 'Error al eliminar la tarea'
        };
      }

      return { success: true };
      
    } catch (error) {
      return {
        success: false,        error: error.name === 'TypeError' ? 'Error de conexión' : 'Error inesperado'
      };
    }
  },

  // Obtener subtareas de una tarea específica
  async obtenerSubtareas(tareaId) {
    try {
      const todasLasTareas = await this.obtenerTareas();
      const subtareas = todasLasTareas.filter(tarea => tarea.cN_Tarea_origen === tareaId);
      return subtareas;
    } catch (error) {
      console.error('Error al obtener subtareas:', error);
      throw error;
    }
  },

  // Crear una nueva subtarea
  async crearSubtarea(subtareaData) {
    try {
      // Usar el mismo método de crear tarea, pero con cN_Tarea_origen
      return await this.crearTarea(subtareaData);
    } catch (error) {
      console.error('Error al crear subtarea:', error);
      throw error;
    }
  },

  // Actualizar una subtarea
  async actualizarSubtarea(id, subtareaData) {
    try {
      // Usar el mismo método de actualizar tarea
      return await this.actualizarTarea(id, subtareaData);
    } catch (error) {
      console.error('Error al actualizar subtarea:', error);
      throw error;
    }
  },

  // Eliminar una subtarea
  async eliminarSubtarea(id) {
    try {
      // Usar el mismo método de eliminar tarea
      return await this.eliminarTarea(id);
    } catch (error) {
      console.error('Error al eliminar subtarea:', error);
      throw error;
    }
  }
};
