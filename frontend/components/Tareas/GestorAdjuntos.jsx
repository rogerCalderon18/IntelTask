import React, { useState, useEffect } from 'react';
import { Button, Spinner } from '@heroui/react';
import { FaPaperclip, FaDownload, FaTrash } from 'react-icons/fa';
import { adjuntosService } from '../../services/adjuntosService';
import { useSession } from 'next-auth/react';
import useConfirmation from '@/hooks/useConfirmation';

const GestorAdjuntos = ({ idTarea, adjuntos: adjuntosIniciales = [], onAdjuntosChange, tarea, isDisabled = false }) => {
    const { data: session } = useSession();
    const [adjuntos, setAdjuntos] = useState(adjuntosIniciales);
    const [cargando, setCargando] = useState(false);
    const [subiendo, setSubiendo] = useState(false);
    const { showConfirmation } = useConfirmation();

    // Estados permitidos para eliminar adjuntos: solo registrado
    const estadosPermitidosEliminar = [1];
    
    // Estados permitidos para subir adjuntos: registrado, asignado, en proceso, en espera
    const estadosPermitidosSubir = [1, 2, 3, 4];

    // Función para validar si se puede subir archivos
    const puedeSubirArchivos = () => {
        if (!tarea) return true; // Si no hay tarea, permitir (para casos de creación)
        
        const estadoTarea = tarea.cN_Id_estado || tarea.estado;
        return estadosPermitidosSubir.includes(estadoTarea);
    };

    // Función para validar si se puede eliminar un adjunto
    const puedeEliminarAdjunto = (adjunto) => {
        if (!session?.user?.id || !tarea) {
            return false;
        }

        const usuarioActual = parseInt(session.user.id);
        const estadoTarea = tarea.cN_Id_estado || tarea.estado;
        
        // Validar estado de la tarea
        if (!estadosPermitidosEliminar.includes(estadoTarea)) {
            return false;
        }

        // Validar que el usuario actual sea quien subió el archivo
        if (adjunto.usuarioId && adjunto.usuarioId !== usuarioActual) {
            return false;
        }

        return true;
    };

   
    useEffect(() => {
        if (idTarea) {
            cargarAdjuntos();
        }
    }, [idTarea]);

    const cargarAdjuntos = async () => {
        if (!idTarea) return;

        try {
            setCargando(true);
            const adjuntosData = await adjuntosService.obtenerPorTarea(idTarea);
            console.log('Adjuntos cargados:', adjuntosData);
            setAdjuntos(adjuntosData);
            onAdjuntosChange?.(adjuntosData);
        } catch (error) {
            console.error('Error al cargar adjuntos:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleFileSelect = async (event) => {
        const archivo = event.target.files[0];
        if (!archivo || !session?.user?.id || !idTarea) {
            if (!idTarea) {
                showConfirmation({
                    title: "Error",
                    description: "Debe guardar la tarea antes de poder adjuntar archivos",
                    type: "warning",
                    confirmText: "Entendido",
                    showCancelButton: false,
                    onConfirm: () => {}
                });
            }
            event.target.value = ''; // Limpiar input
            return;
        }

        // Validar si se puede subir archivos en el estado actual
        if (!puedeSubirArchivos()) {
            const estadoTarea = tarea?.cN_Id_estado || tarea?.estado;
            const nombresEstados = {
                1: "Registrado", 2: "Asignado", 3: "En Proceso", 4: "En Espera",
                5: "Terminado", 14: "Incumplido", 15: "Rechazado", 17: "En Revisión"
            };
            showConfirmation({
                title: "No se pueden subir archivos",
                description: `Solo se pueden subir adjuntos cuando la tarea está en estado: Registrado, Asignado, En Proceso o En Espera.\n\nEstado actual: ${nombresEstados[estadoTarea] || `Estado ${estadoTarea}`}`,
                type: "warning",
                confirmText: "Entendido",
                showCancelButton: false,
                onConfirm: () => {}
            });
            event.target.value = ''; // Limpiar input
            return;
        }

        try {
            setSubiendo(true);
            
            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('archivo', archivo);
            formData.append('idTarea', idTarea);
            formData.append('usuarioId', session.user.id);

            const resultado = await adjuntosService.subirArchivo(formData);

            // Recargar adjuntos
            await cargarAdjuntos();
        } catch (error) {
            console.error('Error al subir archivo:', error);
            showConfirmation({
                title: "Error al subir archivo",
                description: "Ocurrió un error al subir el archivo. Por favor, inténtalo de nuevo.",
                type: "danger",
                confirmText: "Entendido",
                showCancelButton: false,
                onConfirm: () => {}
            });
        } finally {
            setSubiendo(false);
            event.target.value = ''; // Limpiar input
        }
    };

    const handleEliminar = (adjunto) => {
        // Validar si puede eliminar el adjunto
        if (!puedeEliminarAdjunto(adjunto)) {
            const estadoTarea = tarea?.cN_Id_estado || tarea?.estado;
            const usuarioActual = parseInt(session?.user?.id);
            
            let titulo = "No se puede eliminar el adjunto";
            let mensaje = "";
            
            if (!estadosPermitidosEliminar.includes(estadoTarea)) {
                const nombresEstados = {
                    1: "Registrado",
                    2: "Asignado", 
                    3: "En Proceso",
                    4: "En Espera",
                    5: "Terminado",
                    14: "Incumplido",
                    15: "Rechazado",
                    17: "En Revisión"
                };
                mensaje = `Solo se pueden eliminar adjuntos cuando la tarea está en estado: Registrado.\n\nEstado actual: ${nombresEstados[estadoTarea] || `Estado ${estadoTarea}`}`;
            } else if (adjunto.usuarioId && adjunto.usuarioId !== usuarioActual) {
                mensaje = "Solo puedes eliminar adjuntos que tú hayas subido.";
            } else {
                mensaje = "No tienes permisos para eliminar este adjunto.";
            }
            
            showConfirmation({
                title: titulo,
                description: mensaje,
                type: "warning",
                confirmText: "Entendido",
                showCancelButton: false,
                onConfirm: () => {}
            });
            return;
        }

        showConfirmation({
            title: "¿Está seguro de eliminar este archivo?",
            description: "Esta acción no se puede deshacer.",
            type: "danger",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            onConfirm: async () => {
                try {
                    await adjuntosService.eliminarArchivo(adjunto.id);
                    await cargarAdjuntos();
                } catch (error) {
                    console.error('Error al eliminar archivo:', error);
                    showConfirmation({
                        title: "Error al eliminar",
                        description: "Ocurrió un error al eliminar el archivo. Por favor, inténtalo de nuevo.",
                        type: "danger",
                        confirmText: "Entendido",
                        showCancelButton: false,
                        onConfirm: () => {}
                    });
                }
            }
        });
    };

    const handleDescargar = (id) => {
        const url = adjuntosService.obtenerUrlDescarga(id);
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Adjuntos:</label>
                <div className="flex items-center gap-2">`
                    <input
                        type="file"
                        id="file-input"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        disabled={subiendo}
                    />                    <div
                        className={`flex items-center gap-2 px-3 py-2 rounded transition-colors cursor-pointer ${
                            !idTarea || subiendo || !puedeSubirArchivos() 
                                ? "text-gray-400 bg-gray-100 cursor-not-allowed" 
                                : "text-sky-700 bg-sky-100 hover:bg-sky-200"
                        }`}
                        onClick={() => {
                            if (!puedeSubirArchivos()) {
                                const estadoTarea = tarea?.cN_Id_estado || tarea?.estado;
                                const nombresEstados = {
                                    1: "Registrado", 2: "Asignado", 3: "En Proceso", 4: "En Espera",
                                    5: "Terminado", 14: "Incumplido", 15: "Rechazado", 17: "En Revisión"
                                };
                                showConfirmation({
                                    title: "No se pueden subir archivos",
                                    description: `Solo se pueden subir adjuntos cuando la tarea está en estado: Registrado, Asignado, En Proceso o En Espera.\n\nEstado actual: ${nombresEstados[estadoTarea] || `Estado ${estadoTarea}`}`,
                                    type: "warning",
                                    confirmText: "Entendido",
                                    showCancelButton: false,
                                    onConfirm: () => {}
                                });
                                return;
                            }
                            
                            if (!idTarea || subiendo) return;
                            document.getElementById('file-input').click();
                        }}
                        title={
                            !idTarea 
                                ? "Debe guardar la tarea antes de adjuntar archivos"
                                : !puedeSubirArchivos()
                                    ? "No se pueden subir archivos en el estado actual de la tarea"
                                    : "Adjuntar archivo"
                        }
                    >
                        <FaPaperclip className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {subiendo ? 'Subiendo...' : 'Adjuntar'}
                        </span>
                        {subiendo && <Spinner size="sm" />}
                    </div>
                </div>
            </div>

            {cargando ? (
                <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                </div>
            ) : (
                <div className="space-y-2">
                    {adjuntos.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay adjuntos...</p>
                    ) : (
                        adjuntos.map((adjunto) => {
                            const puedeEliminar = puedeEliminarAdjunto(adjunto);
                            const esPropio = adjunto.usuarioId && adjunto.usuarioId === parseInt(session?.user?.id);
                            
                            return (
                                <div key={adjunto.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-sm truncate">{adjunto.nombre}</span>
                                        {esPropio && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                Tuyo
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <div
                                            className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer group"
                                            onClick={() => handleDescargar(adjunto.id)}
                                            title="Descargar archivo"
                                        >
                                            <FaDownload className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium group-hover:text-blue-700 transition-colors">Descargar</span>
                                        </div>
                                        {puedeEliminar && (
                                            <div
                                                className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer group"
                                                onClick={() => handleEliminar(adjunto)}
                                                title="Eliminar adjunto"
                                            >
                                                <FaTrash className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium group-hover:text-red-700 transition-colors">Eliminar</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default GestorAdjuntos;
