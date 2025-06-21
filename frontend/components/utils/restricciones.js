export const RESTRICCIONES_CONFIG = {
    misTareas: {
        1: { // Estado Registrado
            titulo: false,
            descripcion: false,
            adjuntos: false,
            complejidad: false,
            prioridad: false,
            usuarioAsignado: false,
            descripcionEspera: true,
            estado: true,
            numeroGIS: true,
            fechaLimite: true
        },
        2: { // Estado Asignado
            titulo: true,
            descripcion: true,
            adjuntos: false,
            complejidad: true,
            prioridad: true,
            usuarioAsignado: true,
            descripcionEspera: false,
            estado: false,
            numeroGIS: true,
            fechaLimite: true
        },
        3: { // Estado En proceso
            titulo: true,
            descripcion: true,
            adjuntos: false,
            complejidad: true,
            prioridad: true,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: true,
            numeroGIS: true,
            fechaLimite: true
        },
        4: { // Estado En espera
            titulo: true,
            descripcion: true,
            adjuntos: false,
            complejidad: true,
            prioridad: true,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: true,
            numeroGIS: true,
            fechaLimite: true
        },
        5: { // Estado Terminado
            titulo: true,
            descripcion: true,
            adjuntos: false,
            complejidad: true,
            prioridad: true,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: true,
            numeroGIS: true,
            fechaLimite: true
        },
        14: { // Estado Incumplido
            titulo: true,
            descripcion: true,
            adjuntos: false,
            complejidad: true,
            prioridad: true,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: true,
            numeroGIS: true,
            fechaLimite: true
        },
        15: { // Estado Rechazada
            titulo: true,
            descripcion: true,
            adjuntos: false,
            complejidad: true,
            prioridad: true,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: true,
            numeroGIS: true,
            fechaLimite: true
        },
        17: { // Estado En revision
            titulo: true,
            descripcion: true,
            adjuntos: false,
            complejidad: true,
            prioridad: true,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: true,
            numeroGIS: true,
            fechaLimite: true
        }
    },
    seguimiento: {
        // Estados típicos: 2 (Asignado), 3 (En proceso), 4 (En espera)
        2: {
            titulo: false,
            descripcion: false,
            adjuntos: false,
            complejidad: false,
            prioridad: false,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: false,
            numeroGIS: false,
            fechaLimite: false
        },
        3: {
            titulo: false,
            descripcion: false,
            adjuntos: false,
            complejidad: false,
            prioridad: false,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: false,
            numeroGIS: false,
            fechaLimite: false
        },
        4: {
            titulo: false,
            descripcion: false,
            adjuntos: false,
            complejidad: false,
            prioridad: false,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: false,
            numeroGIS: false,
            fechaLimite: false
        }
    },
    revision: {
        17: {
            titulo: false,
            descripcion: false,
            adjuntos: false,
            complejidad: false,
            prioridad: false,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: false,
            numeroGIS: false,
            fechaLimite: false
        }
    },
    incumplimiento: {
        // Estados típicos: 14 (Incumplido)
        14: {
            titulo: false,
            descripcion: false,
            adjuntos: false,
            complejidad: false,
            prioridad: false,
            usuarioAsignado: false,
            descripcionEspera: false,
            estado: false,
            numeroGIS: false,
            fechaLimite: false
        }
    }
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

// Función para obtener restricciones
export const obtenerRestricciones = (tarea, tipoSeccion) => {
    console.log("obtenerRestricciones del formulario desde el archivo", tarea, tipoSeccion);

    if (!tarea) return RESTRICCIONES_DEFAULT;

    const estadoId = tarea.estadoId || tarea.cN_Id_estado;

    // Buscar configuración específica
    const restriccionesSeccion = RESTRICCIONES_CONFIG[tipoSeccion];
    if (restriccionesSeccion && restriccionesSeccion[estadoId]) {
        console.log("obtenerRestricciones del formulario desde el archivo", tarea, tipoSeccion, "restriccionesSeccion", restriccionesSeccion[estadoId], estadoId);
        return restriccionesSeccion[estadoId];
    }

    // Retornar restricciones por defecto si no se encuentra configuración
    return RESTRICCIONES_DEFAULT;
};

// Configuración de restricciones de acciones por estado y tipo de sección
export const RESTRICCIONES_ACCIONES_CONFIG = {
    misTareas: {
        1: { // Estado Registrado
            eliminar: true,
            editar: true,
            asignar: false,
            cambiarEstado: true,
            agregarComentarios: true,
            subirAdjuntos: true,
            verDetalles: true
        },
        2: { // Estado Asignado
            eliminar: false, // No se puede eliminar tarea en estado asignado
            editar: true,
            asignar: false,
            cambiarEstado: true,
            agregarComentarios: true,
            subirAdjuntos: true,
            verDetalles: true
        },
        3: { // Estado En proceso
            eliminar: false,
            editar: true,
            asignar: false,
            cambiarEstado: true,
            agregarComentarios: true,
            subirAdjuntos: true,
            verDetalles: true
        },
        4: { // Estado En espera
            eliminar: false,
            editar: true,
            asignar: false,
            cambiarEstado: true,
            agregarComentarios: true,
            subirAdjuntos: true,
            verDetalles: true
        },
        5: { // Estado Terminado
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: false,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        },
        14: { // Estado Incumplido
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: true,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        },
        15: { // Estado Rechazada
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: false,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        },
        17: { // Estado En revision
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: true,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        }
    },
    seguimiento: {
        2: {
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: false,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        },
        3: {
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: false,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        },
        4: {
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: false,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        }
    },
    revision: {
        17: {
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: false,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        }
    },
    incumplimiento: {
        14: {
            eliminar: false,
            editar: false,
            asignar: false,
            cambiarEstado: false,
            agregarComentarios: true,
            subirAdjuntos: false,
            verDetalles: true
        }
    }
};

// Restricciones de acciones por defecto (todas las acciones permitidas)
export const RESTRICCIONES_ACCIONES_DEFAULT = {
    eliminar: true,
    editar: true,
    asignar: true,
    cambiarEstado: true,
    agregarComentarios: true,
    subirAdjuntos: true,
    verDetalles: true
};

// Función para obtener restricciones de acciones
export const obtenerRestriccionesAcciones = (tarea, tipoSeccion) => {
    console.log("obtenerRestriccionesAcciones desde el archivo", tarea, tipoSeccion);
    if (!tarea) return RESTRICCIONES_ACCIONES_DEFAULT;

    const estadoId = tarea.estadoId || tarea.cN_Id_estado;

    // Buscar configuración específica
    const restriccionesSeccion = RESTRICCIONES_ACCIONES_CONFIG[tipoSeccion];
    if (restriccionesSeccion && restriccionesSeccion[estadoId]) {
        console.log("obtenerRestriccionesAcciones desde el archivo", tarea, tipoSeccion, "restriccionesSeccion", restriccionesSeccion[estadoId], estadoId);
        return restriccionesSeccion[estadoId];

    }


    // Retornar restricciones por defecto si no se encuentra configuración
    return RESTRICCIONES_ACCIONES_DEFAULT;
};

// Función para verificar si una acción específica está permitida
export const puedeEjecutarAccion = (tarea, accion, tipoSeccion) => {
    if (!tarea || !accion || !tipoSeccion) return false;

    const restricciones = obtenerRestriccionesAcciones(tarea, tipoSeccion);
    return restricciones[accion] === true;
};

// Función para obtener todas las acciones permitidas para una tarea
export const obtenerAccionesPermitidas = (tarea, tipoSeccion) => {
    if (!tarea || !tipoSeccion) return [];

    const restricciones = obtenerRestriccionesAcciones(tarea, tipoSeccion);
    return Object.keys(restricciones).filter(accion => restricciones[accion] === true);
};

// Función para verificar múltiples acciones a la vez
export const verificarAccionesMultiples = (tarea, acciones, tipoSeccion) => {
    if (!tarea || !acciones || !Array.isArray(acciones) || !tipoSeccion) return {};

    const restricciones = obtenerRestriccionesAcciones(tarea, tipoSeccion);
    const resultado = {};
    acciones.forEach(accion => {
        resultado[accion] = restricciones[accion] === true;
    });
    return resultado;
};

// Configuración de restricciones por rol de usuario
export const RESTRICCIONES_POR_ROL = {
    1: { // Director
        crearTareas: true,
        crearSubtareas: true,
        eliminarTareas: true,
        editarTareas: true,
        asignarTareas: true
    },
    2: { // Subdirector
        crearTareas: true,
        crearSubtareas: true,
        eliminarTareas: true,
        editarTareas: true,
        asignarTareas: true
    },
    3: { // Jefe
        crearTareas: true,
        crearSubtareas: true,
        eliminarTareas: true,
        editarTareas: true,
        asignarTareas: true
    },
    4: { // Coordinador
        crearTareas: true,
        crearSubtareas: true,
        eliminarTareas: true,
        editarTareas: true,
        asignarTareas: true
    },
    5: { // Profesional 3
        crearTareas: true,
        crearSubtareas: true,
        eliminarTareas: true,
        editarTareas: true,
        asignarTareas: true
    },
    6: { // Profesional 2
        crearTareas: false,
        crearSubtareas: false,
        eliminarTareas: true,
        editarTareas: true,
        asignarTareas: false
    },
    7: { // Profesional 1
        crearTareas: false,
        crearSubtareas: false,
        eliminarTareas: true,
        editarTareas: true,
        asignarTareas: false
    },
    8: { // Técnico
        crearTareas: false,
        crearSubtareas: false,
        eliminarTareas: true,
        editarTareas: true,
        asignarTareas: false
    }
};

// Restricciones por rol por defecto (todos los permisos habilitados)
export const RESTRICCIONES_ROL_DEFAULT = {
    crearTareas: true,
    crearSubtareas: true,
    eliminarTareas: true,
    editarTareas: true,
    asignarTareas: true
};

export const obtenerRestriccionesPorRol = (rolId) => {
    if (!rolId) return RESTRICCIONES_ROL_DEFAULT;

    const restricciones = RESTRICCIONES_POR_ROL[rolId];
    if (restricciones) {
        return restricciones;
    }

    // Retornar restricciones por defecto si no se encuentra el rol
    return RESTRICCIONES_ROL_DEFAULT;
};

// Función para verificar si un usuario puede realizar una acción según su rol
export const puedeEjecutarAccionPorRol = (accion, rolId) => {
    if (!accion || !rolId) return false;

    const restricciones = obtenerRestriccionesPorRol(rolId);
    return restricciones[accion] === true;
};

// Función combinada que verifica tanto restricciones de estado como de rol
export const puedeEjecutarAccionCompleta = (tarea, accion, userId, rolId) => {
    // Verificar restricciones por rol primero
    if (!puedeEjecutarAccionPorRol(accion, rolId)) {
        return false;
    }

    // Si el rol permite la acción, verificar restricciones por estado
    if (accion === 'crearTareas' || accion === 'crearSubtareas') {
        // Para crear tareas/subtareas, solo verificamos el rol
        return true;
    }

    // Para otras acciones, usar la función existente
    return puedeEjecutarAccion(tarea, accion, userId);
};
