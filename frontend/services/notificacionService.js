const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const notificacionService = {
  /**
   * Envía una notificación por email
   * @param {Object} notificacionData - Datos de la notificación
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async enviarNotificacion(notificacionData) {
    try {
      const response = await fetch(`${API_URL}/api/Email/enviar-notificacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificacionData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al enviar la notificación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      throw error;
    }
  },

  async enviarNotificacionAsignacion(usuario, tarea, tipoNotificacion = 'NUEVA_ASIGNACION') {
    const campos = {
      'ID Tarea': tarea.cN_Id_tarea?.toString() || tarea.id?.toString() || 'N/A',
      'Título': tarea.cT_Titulo_tarea || tarea.titulo || 'Sin título',
      'Descripción': tarea.cT_Descripcion_tarea || tarea.descripcion || 'Sin descripción',
      'Fecha Límite': tarea.cF_Fecha_limite 
        ? new Date(tarea.cF_Fecha_limite).toLocaleDateString('es-ES')
        : tarea.fechaEntrega 
        ? new Date(tarea.fechaEntrega).toLocaleDateString('es-ES')
        : 'No especificada',
      'Fecha de Asignación': new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Agregar información adicional si está disponible
    if (tarea.complejidad?.cT_Nombre) {
      campos['Complejidad'] = tarea.complejidad.cT_Nombre;
    }
    if (tarea.prioridad?.cT_Nombre_prioridad) {
      campos['Prioridad'] = tarea.prioridad.cT_Nombre_prioridad;
    }
    if (tarea.estado?.cT_Estado) {
      campos['Estado'] = tarea.estado.cT_Estado;
    }

    const notificacionData = {
      cT_Email_destino: usuario.cT_Correo_usuario || usuario.email,
      cT_Asunto: tipoNotificacion === 'NUEVA_ASIGNACION' 
        ? `📋 Nueva tarea asignada: ${tarea.cT_Titulo_tarea || tarea.titulo}`
        : `🔄 Tarea reasignada: ${tarea.cT_Titulo_tarea || tarea.titulo}`,
      cT_Titulo: tipoNotificacion === 'NUEVA_ASIGNACION'
        ? '¡Te han asignado una nueva tarea!'
        : '¡Te han reasignado una tarea!',
      cT_Tipo_notificacion: 'info',
      cT_Mensaje_adicional: tipoNotificacion === 'NUEVA_ASIGNACION'
        ? 'Se te ha asignado una nueva tarea en IntelTask. Por favor, revisa los detalles y comienza a trabajar en ella.'
        : 'Se te ha reasignado una tarea en IntelTask. Por favor, revisa los detalles actualizados.',
      campos: campos
    };

    return await this.enviarNotificacion(notificacionData);
  }
};
