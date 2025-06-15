const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const catalogosService = {
  // Obtener todos los estados
  async obtenerEstados() {
    try {
      const response = await fetch(`${API_URL}/api/Estados`);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Error al obtener los estados');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener estados:', error);
      throw error;
    }
  },

  // Obtener todas las prioridades
  async obtenerPrioridades() {
    try {
      const response = await fetch(`${API_URL}/api/Prioridades`);
      if (!response.ok) {
        throw new Error('Error al obtener las prioridades');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener prioridades:', error);
      throw error;
    }
  },

  // Obtener todas las complejidades
  async obtenerComplejidades() {
    try {
      const response = await fetch(`${API_URL}/api/Complejidades`);
      if (!response.ok) {
        throw new Error('Error al obtener las complejidades');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener complejidades:', error);
      throw error;
    }
  },

  // Obtener todos los usuarios
  async obtenerUsuarios() {
    try {
      const response = await fetch(`${API_URL}/api/Usuarios`);
      if (!response.ok) {
        throw new Error('Error al obtener los usuarios');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener todos los catálogos de una vez
  async obtenerTodosCatalogos() {
    try {
      const [estados, prioridades, complejidades, usuarios] = await Promise.all([
        this.obtenerEstados(),
        this.obtenerPrioridades(),
        this.obtenerComplejidades(),
        this.obtenerUsuarios()
      ]);

      return {
        estados,
        prioridades,
        complejidades,
        usuarios
      };
    } catch (error) {
      console.error('Error al obtener catálogos:', error);
      throw error;
    }
  }
};