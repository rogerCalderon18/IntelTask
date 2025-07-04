const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const notificacionService = {
  /**
   * Envía una notificación por email
   * @param {Object} notificacionData - Datos de la notificación
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async enviarNotificacion(notificacionData) {
    console.log('Enviando notificación:', notificacionData);
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
  },

  async enviarNotificacionCambioEstadoPermiso(usuario, permiso, nuevoEstado, motivoRechazo = null) {
    const estadosMap = {
      6: 'Aprobado',
      15: 'Rechazado'
    };

    const estadoTexto = estadosMap[nuevoEstado] || 'Actualizado';
    const esAprobado = nuevoEstado === 6;
    const esRechazado = nuevoEstado === 15;

    const campos = {
      'ID Permiso': permiso.cN_Id_permiso?.toString() || permiso.id?.toString() || 'N/A',
      'Título': permiso.cT_Titulo_permiso || permiso.titulo || 'Sin título',
      'Descripción': permiso.cT_Descripcion_permiso || permiso.descripcion || 'Sin descripción',
      'Fecha de Inicio': permiso.cF_Fecha_hora_inicio_permiso 
        ? new Date(permiso.cF_Fecha_hora_inicio_permiso).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : permiso.fechaInicio 
        ? new Date(permiso.fechaInicio).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'No especificada',
      'Fecha de Fin': permiso.cF_Fecha_hora_fin_permiso 
        ? new Date(permiso.cF_Fecha_hora_fin_permiso).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : permiso.fechaFin 
        ? new Date(permiso.fechaFin).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'No especificada',
      'Nuevo Estado': estadoTexto,
      'Fecha de Decisión': new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Agregar motivo de rechazo si es aplicable
    if (esRechazado && motivoRechazo) {
      campos['Motivo de Rechazo'] = motivoRechazo;
    }

    const iconos = {
      6: '✅',
      15: '❌'
    };

    const colores = {
      6: 'success',
      15: 'error'
    };

    const mensajes = {
      6: 'Tu solicitud de permiso ha sido aprobada. Ya puedes proceder según lo solicitado.',
      15: 'Tu solicitud de permiso ha sido rechazada. Revisa los comentarios y consideraciones mencionadas.'
    };

    const notificacionData = {
      cT_Email_destino: usuario.cT_Correo_usuario || usuario.email,
      cT_Asunto: `${iconos[nuevoEstado]} Permiso ${estadoTexto.toLowerCase()}: ${permiso.cT_Titulo_permiso || permiso.titulo}`,
      cT_Titulo: `${iconos[nuevoEstado]} Tu permiso ha sido ${estadoTexto.toLowerCase()}`,
      cT_Tipo_notificacion: colores[nuevoEstado] || 'info',
      cT_Mensaje_adicional: mensajes[nuevoEstado] || 'El estado de tu permiso ha sido actualizado.',
      campos: campos
    };

    return await this.enviarNotificacion(notificacionData);
  }
};
