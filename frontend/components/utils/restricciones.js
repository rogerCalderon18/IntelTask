// Definición de estados de tareas
export const ESTADOS = {
    REGISTRADO: 1,
    ASIGNADO: 2,
    EN_PROCESO: 3,
    EN_ESPERA: 4,
    TERMINADO: 5,
    INCUMPLIDO: 14,
    RECHAZADA: 15,
    EN_REVISION: 17
};

// CONFIGURACIÓN ULTRA SIMPLE: Solo Estado + Relación (creador/asignado)
export const RESTRICCIONES_CONFIG = {
    // REGISTRADO
    [ESTADOS.REGISTRADO]: {
        creador: {
            titulo: false, descripcion: false, adjuntos: false, complejidad: true,
            prioridad: true, usuarioAsignado: false, descripcionEspera: false,
            estado: true, numeroGIS: true, fechaLimite: true
        },
        asignado: {
            titulo: true, descripcion: true, adjuntos: false, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        }
    },
    // ASIGNADO - Caso especial: Director creador + Subdirector asignado
    [ESTADOS.ASIGNADO]: {
        creador: {
            titulo: true, descripcion: true, adjuntos: false, complejidad: true,
            prioridad: true, usuarioAsignado: false, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        },
        asignado: {
            titulo: true, descripcion: true, adjuntos: false, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: false, numeroGIS: true, fechaLimite: true
        }
    },
    // EN_PROCESO
    [ESTADOS.EN_PROCESO]: {
        creador: {
            titulo: true, descripcion: true, adjuntos: false, complejidad: true,
            prioridad: true, usuarioAsignado: false, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        },
        asignado: {
            titulo: true, descripcion: true, adjuntos: false, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: false, numeroGIS: true, fechaLimite: true
        }
    },
    // EN_ESPERA
    [ESTADOS.EN_ESPERA]: {
        creador: {
            titulo: true, descripcion: true, adjuntos: false, complejidad: true,
            prioridad: true, usuarioAsignado: false, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        },
        asignado: {
            titulo: true, descripcion: true, adjuntos: false, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: false, numeroGIS: true, fechaLimite: true
        }
    },
    // TERMINADO
    [ESTADOS.TERMINADO]: {
        creador: {
            titulo: true, descripcion: true, adjuntos: true, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        },
        asignado: {
            titulo: true, descripcion: true, adjuntos: true, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        }
    },
    // INCUMPLIDO
    [ESTADOS.INCUMPLIDO]: {
        creador: {
            titulo: false, descripcion: false, adjuntos: false, complejidad: false,
            prioridad: false, usuarioAsignado: false, descripcionEspera: false,
            estado: false, numeroGIS: false, fechaLimite: false
        },
        asignado: {
            titulo: true, descripcion: true, adjuntos: true, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        }
    },
    // RECHAZADA
    [ESTADOS.RECHAZADA]: {
        creador: {
            titulo: false, descripcion: false, adjuntos: false, complejidad: false,
            prioridad: false, usuarioAsignado: false, descripcionEspera: true,
            estado: false, numeroGIS: false, fechaLimite: false
        },
        asignado: {
            titulo: true, descripcion: true, adjuntos: true, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: false, numeroGIS: true, fechaLimite: true
        }
    },
    // EN_REVISION
    [ESTADOS.EN_REVISION]: {
        creador: {
            titulo: true, descripcion: true, adjuntos: true, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: false, numeroGIS: true, fechaLimite: true
        },
        asignado: {
            titulo: true, descripcion: true, adjuntos: true, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        }
    }
};

// CONFIGURACIÓN ULTRA SIMPLE DE ACCIONES: Solo Estado + Relación
export const RESTRICCIONES_ACCIONES_CONFIG = {
    // REGISTRADO
    [ESTADOS.REGISTRADO]: {
        creador: {
            eliminar: true, editar: true, asignar: true, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        },
        asignado: {
            eliminar: false, editar: false, asignar: false, cambiarEstado: false,
            agregarComentarios: true, subirAdjuntos: false, verDetalles: false
        }
    },
    // ASIGNADO
    [ESTADOS.ASIGNADO]: {
        creador: {
            eliminar: false, editar: true, asignar: true, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        },
        asignado: {
            eliminar: false, editar: true, asignar: false, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        }
    },
    // EN_PROCESO
    [ESTADOS.EN_PROCESO]: {
        creador: {
            eliminar: false, editar: true, asignar: true, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        },
        asignado: {
            eliminar: false, editar: true, asignar: false, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        }
    },
    // EN_ESPERA
    [ESTADOS.EN_ESPERA]: {
        creador: {
            eliminar: false, editar: true, asignar: true, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        },
        asignado: {
            eliminar: false, editar: true, asignar: false, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        }
    },
    // TERMINADO
    [ESTADOS.TERMINADO]: {
        creador: {
            eliminar: false, editar: false, asignar: false, cambiarEstado: false,
            agregarComentarios: true, subirAdjuntos: false, verDetalles: true
        },
        asignado: {
            eliminar: false, editar: false, asignar: false, cambiarEstado: false,
            agregarComentarios: true, subirAdjuntos: false, verDetalles: true
        }
    },
    // INCUMPLIDO
    [ESTADOS.INCUMPLIDO]: {
        creador: {
            eliminar: false, editar: true, asignar: true, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: false, verDetalles: true
        },
        asignado: {
            eliminar: false, editar: true, asignar: false, cambiarEstado: false,
            agregarComentarios: true, subirAdjuntos: false, verDetalles: true
        }
    },
    // RECHAZADA
    [ESTADOS.RECHAZADA]: {
        creador: {
            eliminar: false, editar: true, asignar: true, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        },
        asignado: {
            eliminar: false, editar: true, asignar: false, cambiarEstado: false,
            agregarComentarios: true, subirAdjuntos: false, verDetalles: true
        }
    },
    // EN_REVISION
    [ESTADOS.EN_REVISION]: {
        creador: {
            eliminar: false, editar: true, asignar: true, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        },
        asignado: {
            eliminar: false, editar: true, asignar: false, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: true
        }
    }
};

// Helper: Obtener relación del usuario con la tarea
const obtenerRelacionUsuarioTarea = (tarea, usuarioId) => {

    console.log("Obteniendo relación usuario-tarea:", { tarea, usuarioId });
    if (tarea.cN_Usuario_creador === usuarioId || tarea.creadoPorId === usuarioId) return 'creador';
    if (tarea.cN_Usuario_asignado === usuarioId || tarea.asignadoAId === usuarioId) return 'asignado';
    return 'ninguna';
};

// Restricciones por defecto (todos los campos editables)
export const RESTRICCIONES_DEFAULT = {
    titulo: false,
    descripcion: false,
    descripcionEspera: false,
    estado: false,
    prioridad: false,
    complejidad: false,
    numeroGIS: false,
    fechaLimite: false,
    usuarioAsignado: false,
    adjuntos: false
};

// Función principal para obtener restricciones de campos
export const obtenerRestricciones = (tarea, tipoSeccion, usuario) => {
    console.log("Obteniendo restricciones:", { tarea, tipoSeccion, usuario });

    // Validaciones básicas
    if (!tarea || !usuario) {
        console.warn("Parámetros insuficientes para determinar restricciones");
        return RESTRICCIONES_DEFAULT;
    }


    const { id: usuarioId } = usuario;
    const usuarioIdInt = parseInt(usuarioId, 10);
    const estadoId = tarea.cN_Id_estado || tarea.estadoId;
    console.log(`Estado de la tarea: ${estadoId}, Usuario ID: ${usuarioIdInt}`);

    // Obtener configuración para el estado actual
    const estadoConfig = RESTRICCIONES_CONFIG[estadoId];
    if (!estadoConfig) {
        console.warn(`No se encontró configuración para el estado: ${estadoId}`);
        return RESTRICCIONES_DEFAULT;
    }

    // Determinar relación usuario-tarea
    const relacion = obtenerRelacionUsuarioTarea(tarea, usuarioIdInt);
    if (relacion === 'ninguna') {
        // Si no es ni creador ni asignado, todas las restricciones
        console.log(`Usuario sin relación con la tarea - aplicando máximas restricciones`);
        return {
            titulo: true, descripcion: true, adjuntos: true, complejidad: true,
            prioridad: true, usuarioAsignado: true, descripcionEspera: true,
            estado: true, numeroGIS: true, fechaLimite: true
        };
    }

    const restricciones = estadoConfig[relacion];
    if (restricciones) {
        console.log(`Restricciones aplicadas: Estado ${estadoId} -> ${relacion}`);
        return restricciones;
    }

    console.warn(`No se encontró configuración específica. Usando restricciones por defecto.`);
    return RESTRICCIONES_DEFAULT;
};

// Restricciones de acciones por defecto
export const RESTRICCIONES_ACCIONES_DEFAULT = {
    eliminar: false,
    editar: false,
    asignar: false,
    cambiarEstado: false,
    agregarComentarios: true,
    subirAdjuntos: false,
    verDetalles: true
};

// Función para obtener restricciones de acciones
export const obtenerRestriccionesAcciones = (tarea, tipoSeccion, usuario) => {
    console.log("Obteniendo restricciones de acciones:", { tarea, tipoSeccion, usuario });

    if (!tarea || !usuario) {
        return RESTRICCIONES_ACCIONES_DEFAULT;
    }

    const { id: usuarioId } = usuario;
    const usuarioIdInt = parseInt(usuarioId, 10);
    const estadoId = tarea.cN_Id_estado || tarea.estadoId;

    // Obtener configuración para el estado actual
    const estadoConfig = RESTRICCIONES_ACCIONES_CONFIG[estadoId];
    if (!estadoConfig) {
        return RESTRICCIONES_ACCIONES_DEFAULT;
    }

    // Determinar relación usuario-tarea
    const relacion = obtenerRelacionUsuarioTarea(tarea, usuarioIdInt);
    if (relacion === 'ninguna') {
        // Si no es ni creador ni asignado, todas las acciones restringidas
        return {
            eliminar: true, editar: true, asignar: true, cambiarEstado: true,
            agregarComentarios: true, subirAdjuntos: true, verDetalles: false
        };
    }

    return estadoConfig[relacion] || RESTRICCIONES_ACCIONES_DEFAULT;
};

// Función para verificar si una acción específica está permitida
export const puedeEjecutarAccion = (tarea, accion, tipoSeccion, usuario) => {
    if (!tarea || !accion || !tipoSeccion || !usuario) return false;

    const restricciones = obtenerRestriccionesAcciones(tarea, tipoSeccion, usuario);
    return restricciones[accion] === true;
};

// Función para obtener todas las acciones permitidas para una tarea
export const obtenerAccionesPermitidas = (tarea, tipoSeccion, usuario) => {
    if (!tarea || !tipoSeccion || !usuario) return [];

    const restricciones = obtenerRestriccionesAcciones(tarea, tipoSeccion, usuario);
    return Object.keys(restricciones).filter(accion => restricciones[accion] === true);
};

// Función para verificar múltiples acciones a la vez
export const verificarAccionesMultiples = (tarea, acciones, tipoSeccion, usuario) => {
    if (!tarea || !acciones || !Array.isArray(acciones) || !tipoSeccion || !usuario) return {};

    const restricciones = obtenerRestriccionesAcciones(tarea, tipoSeccion, usuario);
    const resultado = {};
    acciones.forEach(accion => {
        resultado[accion] = restricciones[accion] === true;
    });
    return resultado;
};

// Función para verificar si un campo específico está restringido
export const esCampoRestringido = (tarea, campo, tipoSeccion, usuario) => {
    if (!tarea || !campo || !tipoSeccion || !usuario) return true;

    const restricciones = obtenerRestricciones(tarea, tipoSeccion, usuario);
    return restricciones[campo] === true;
};

// Función helper para obtener el nombre del estado
export const obtenerNombreEstado = (estadoId) => {
    const nombresEstados = {
        [ESTADOS.REGISTRADO]: 'Registrado',
        [ESTADOS.ASIGNADO]: 'Asignado',
        [ESTADOS.EN_PROCESO]: 'En Proceso',
        [ESTADOS.EN_ESPERA]: 'En Espera',
        [ESTADOS.TERMINADO]: 'Terminado',
        [ESTADOS.INCUMPLIDO]: 'Incumplido',
        [ESTADOS.RECHAZADA]: 'Rechazada',
        [ESTADOS.EN_REVISION]: 'En Revisión'
    };
    return nombresEstados[estadoId] || 'Desconocido';
};

// Función para debug - mostrar información de restricciones
export const debugRestricciones = (tarea, tipoSeccion, usuario) => {
    console.group('🔒 Debug de Restricciones');
    console.log('Tarea:', tarea);
    console.log('Usuario:', usuario);
    console.log('Estado:', tarea?.cN_Id_estado || tarea?.estadoId);
    const usuarioIdInt = parseInt(usuario?.id, 10);
    console.log('Relación con tarea:', obtenerRelacionUsuarioTarea(tarea, usuarioIdInt));

    const restriccionesCampos = obtenerRestricciones(tarea, tipoSeccion, usuario);
    console.log('Restricciones de campos:', restriccionesCampos);

    const restriccionesAcciones = obtenerRestriccionesAcciones(tarea, tipoSeccion, usuario);
    console.log('Restricciones de acciones:', restriccionesAcciones);

    console.groupEnd();
};
