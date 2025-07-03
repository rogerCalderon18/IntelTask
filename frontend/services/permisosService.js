const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const permisosService = {
  // Obtener todos los permisos
  async obtenerTodosLosPermisos() {
    try {
      const response = await fetch(`${API_URL}/api/Permisos`);
      if (!response.ok) {
        throw new Error('Error al obtener los permisos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  },

  // Obtener permisos por usuario
  async obtenerPermisosPorUsuario(usuarioId) {
    try {
      const response = await fetch(`${API_URL}/api/Permisos/usuario/${usuarioId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los permisos del usuario');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      throw error;
    }
  },

  // Obtener permiso por ID
  async obtenerPermisoPorId(id) {
    try {
      const response = await fetch(`${API_URL}/api/Permisos/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener el permiso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener permiso por ID:', error);
      throw error;
    }
  },

  // Crear nuevo permiso
  async crearPermiso(permisoData) {
    try {
      const response = await fetch(`${API_URL}/api/Permisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permisoData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al crear el permiso');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear permiso:', error);
      throw error;
    }
  },

  // Actualizar permiso
  async actualizarPermiso(id, permisoData) {
    try {
      const response = await fetch(`${API_URL}/api/Permisos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permisoData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al actualizar el permiso');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar permiso:', error);
      throw error;
    }
  },

  // Eliminar permiso
  async eliminarPermiso(id) {
    try {
      const response = await fetch(`${API_URL}/api/Permisos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al eliminar el permiso');
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('Error al eliminar permiso:', error);
      throw error;
    }
  },

  // Obtener adjuntos de un permiso
  async obtenerAdjuntosPermiso(permisoId) {
    try {
      const response = await fetch(`${API_URL}/api/Adjuntos/permiso/${permisoId}`);
      if (!response.ok) {
        throw new Error('Error al obtener adjuntos del permiso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener adjuntos del permiso:', error);
      throw error;
    }
  },

  // Subir adjunto para un permiso
  async subirAdjuntoPermiso(permisoId, archivo) {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('permisoId', permisoId.toString());

      const response = await fetch(`${API_URL}/api/Adjuntos/permiso`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al subir el archivo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al subir adjunto del permiso:', error);
      throw error;
    }
  },

  // Descargar adjunto de un permiso
  async descargarAdjuntoPermiso(adjuntoId) {
    try {
      const response = await fetch(`${API_URL}/api/Adjuntos/permiso/${adjuntoId}/descargar`);
      
      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      return response;
    } catch (error) {
      console.error('Error al descargar adjunto del permiso:', error);
      throw error;
    }
  },

  // Eliminar adjunto de un permiso
  async eliminarAdjuntoPermiso(adjuntoId) {
    try {
      const response = await fetch(`${API_URL}/api/Adjuntos/permiso/${adjuntoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al eliminar el adjunto');
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('Error al eliminar adjunto del permiso:', error);
      throw error;
    }
  },

  // Obtener permisos para revisar según jerarquía organizacional
  async obtenerPermisosParaRevisar(usuarioId) {
    try {
      const response = await fetch(`${API_URL}/api/Permisos/revisar/${usuarioId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los permisos para revisar');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener permisos para revisar:', error);
      throw error;
    }
  }
}
