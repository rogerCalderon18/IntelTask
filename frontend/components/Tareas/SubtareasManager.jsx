import React, { useState, useEffect, useMemo } from "react";
import { Button, useDisclosure } from "@heroui/react";
import { FiPlus, FiList } from "react-icons/fi";
import { tareasService } from "../../services/tareasService";
import { catalogosService } from "../../services/catalogosService";
import { notificacionService } from "../../services/notificacionService";
import { toast } from "react-toastify";
import TareaModal from "./TareaModal";
import EditarTareaModal from "./EditarTareaModal";
import ListaSubtareas from "./ListaSubtareas";
import DetalleModal from "./DetalleModal";
import useConfirmation from '@/hooks/useConfirmation';
import { useSession } from "next-auth/react";
import { obtenerRestricciones, obtenerRestriccionesAcciones } from "../utils/restricciones";

const SubtareasManager = ({ tareaId, tareaPadre, tipoSeccion, onSubtareasChange }) => {
    const { data: session } = useSession();
    const [subtareas, setSubtareas] = useState([]);
    const [selectedSubtarea, setSelectedSubtarea] = useState(null);
    const [originalUsuarioAsignado, setOriginalUsuarioAsignado] = useState(null); // Guardar el usuario original
    const [loading, setLoading] = useState(false);
    const [mostrarSubtareas, setMostrarSubtareas] = useState(false);
    
    // Modales
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDetalleOpen, onOpen: onDetalleOpen, onOpenChange: onDetalleOpenChange } = useDisclosure();
    const { showConfirmation } = useConfirmation();
    
    useEffect(() => {
        if (tareaId) {
            cargarSubtareas();
        }
    }, [tareaId]);

    const cargarSubtareas = async () => {
        try {
            setLoading(true);
            const subtareasData = await tareasService.obtenerSubtareas(tareaId);
            setSubtareas(subtareasData);
            
            if (onSubtareasChange) {
                onSubtareasChange(subtareasData);
            }
        } catch (error) {
            console.error('Error al cargar subtareas:', error);
            toast.error('Error al cargar las subtareas');
        } finally {
            setLoading(false);        }
    };    
    
    const enviarNotificacionAsignacion = async (usuarioAsignadoId, subtareaCreada, tipoNotificacion = 'NUEVA_ASIGNACION') => {
        try {
            console.log('📧 Iniciando envío de notificación de subtarea:', { usuarioAsignadoId, tipoNotificacion });

            if (!usuarioAsignadoId) {
                console.log('❌ No hay usuario asignado ID para subtarea');
                return;
            }

            // Obtener información del usuario asignado
            console.log('🔍 Obteniendo usuarios para subtarea...');
            const usuarios = await catalogosService.obtenerUsuarios();
            console.log('👥 Usuarios obtenidos:', usuarios.length);

            const usuarioAsignado = usuarios.find(u => u.cN_Id_usuario === usuarioAsignadoId);
            console.log('👤 Usuario encontrado para subtarea:', usuarioAsignado);

            if (!usuarioAsignado) {
                console.warn('❌ No se encontró el usuario asignado para enviar notificación de subtarea');
                return;
            }

            console.log('📤 Enviando notificación de subtarea al servicio...', {
                email: usuarioAsignado.cT_Correo_usuario,
                subtarea: subtareaCreada.cT_Titulo_tarea || subtareaCreada.titulo
            });

            await notificacionService.enviarNotificacionAsignacion(
                usuarioAsignado,
                subtareaCreada,
                tipoNotificacion
            );

            console.log('✅ Notificación de subtarea enviada exitosamente');
            toast.success('📧 Notificación enviada al usuario asignado', {
                position: "top-right",
                autoClose: 2000,
            });

        } catch (error) {
            console.error('❌ Error al enviar notificación de subtarea:', error);
            // No mostramos error al usuario para que no interfiera con el flujo principal
            toast.warning('⚠️ Subtarea guardada, pero no se pudo enviar la notificación', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };    
    
    const handleCrearSubtarea = async (subtareaData) => {
        try {
            const subtareaCreada = await tareasService.crearSubtarea(subtareaData);

            toast.success('¡Subtarea creada exitosamente!', {
                position: "top-right",
                autoClose: 3000,
            });

            // Enviar notificación si hay usuario asignado
            if (subtareaData.cN_Usuario_asignado) {
                await enviarNotificacionAsignacion(
                    subtareaData.cN_Usuario_asignado,
                    subtareaCreada,
                    'NUEVA_ASIGNACION'
                );
            }
            
            await cargarSubtareas();
            onCreateOpenChange(false);
        } catch (error) {
            console.error('Error al crear subtarea:', error);
            toast.error(`Error al crear la subtarea: ${error.message}`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };    
    
    const handleEditarSubtarea = async (subtareaData) => {
        try {
            const usuarioAnterior = originalUsuarioAsignado; // Usar el usuario original guardado
            const usuarioNuevo = subtareaData.cN_Usuario_asignado;

            console.log('🔄 Editando subtarea - Usuario anterior:', usuarioAnterior, 'Usuario nuevo:', usuarioNuevo);
            console.log('📋 Datos de subtarea a actualizar:', subtareaData);

            const subtareaActualizada = await tareasService.actualizarSubtarea(selectedSubtarea.cN_Id_tarea, subtareaData);

            toast.success('¡Subtarea actualizada exitosamente!', {
                position: "top-right",
                autoClose: 3000,
            });

            console.log('✅ Subtarea actualizada:', subtareaActualizada);
            console.log('subtareaData enviada:', subtareaData);
            
            // Enviar notificación si se asignó un usuario nuevo o cambió el usuario asignado
            if (usuarioNuevo) {
                // Si no tenía usuario asignado antes, o cambió el usuario asignado
                if (!usuarioAnterior || usuarioAnterior !== usuarioNuevo) {
                    const tipoNotificacion = !usuarioAnterior ? 'NUEVA_ASIGNACION' : 'REASIGNACION';
                    console.log('📧 Enviando notificación de subtarea:', tipoNotificacion, 'al usuario:', usuarioNuevo);
                    await enviarNotificacionAsignacion(usuarioNuevo, subtareaActualizada, tipoNotificacion);
                } else {
                    console.log('ℹ️ No se envía notificación - mismo usuario asignado en subtarea');
                }
            } else {
                console.log('ℹ️ No se envía notificación - no hay usuario asignado en subtarea');
            }
            
            await cargarSubtareas();
            setSelectedSubtarea(null);
            setOriginalUsuarioAsignado(null); // Limpiar el usuario original
            onEditOpenChange(false);
        } catch (error) {
            console.error('Error al editar subtarea:', error);
            toast.error(`Error al actualizar la subtarea: ${error.message}`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleEliminarSubtarea = async (subtarea) => {
        const subtareaId = subtarea.cN_Id_tarea;

        showConfirmation({
            title: "Eliminar subtarea",
            message: `"${subtarea.cT_Titulo_tarea}"`,
            description: "Esta acción no se puede deshacer.",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            type: "danger",
            onConfirm: async () => {
                const toastId = toast.loading('Eliminando subtarea...');

                try {
                    const resultado = await tareasService.eliminarSubtarea(subtareaId);

                    if (resultado.success) {
                        toast.update(toastId, {
                            render: '¡Subtarea eliminada exitosamente!',
                            type: 'success',
                            isLoading: false,
                            autoClose: 3000,
                        });
                        await cargarSubtareas();
                    } else {
                        toast.dismiss(toastId);
                        toast.error(resultado.error, { autoClose: 5000 });
                    }
                } catch (error) {
                    toast.dismiss(toastId);
                    toast.error('Error inesperado al eliminar');
                }
            }
        });
    };    
    
    const handleEditSubtarea = (subtarea) => {
        setSelectedSubtarea(subtarea);
        setOriginalUsuarioAsignado(subtarea.cN_Usuario_asignado); // Guardar el usuario original
        onEditOpen();
    };

    const handleDetalleSubtarea = (subtarea) => {
        setSelectedSubtarea(subtarea);
        onDetalleOpen();
    };    
    
    const handleEditFromDetalle = () => {
        // Cerrar modal de detalle y abrir modal de edición
        onDetalleOpenChange(false);
        setOriginalUsuarioAsignado(selectedSubtarea.cN_Usuario_asignado);
        // selectedSubtarea ya está establecida desde handleDetalleSubtarea
        onEditOpen();
    };

    const toggleMostrarSubtareas = () => {
        setMostrarSubtareas(!mostrarSubtareas);
    };

    // Restricciones para el modal de creación de subtareas
    const restriccionesCrearSubtarea = useMemo(() => {
        if (!tareaPadre || !session?.user) return {};
        
        return obtenerRestricciones(tareaPadre, tipoSeccion, session.user);
    }, [tareaPadre, tipoSeccion, session]);

    // Restricciones para el modal de edición de subtareas
    const restriccionesEditarSubtarea = useMemo(() => {
        if (!selectedSubtarea || !session?.user) return {};
        
        return obtenerRestricciones(selectedSubtarea, tipoSeccion, session.user);
    }, [selectedSubtarea, tipoSeccion, session]);

    // Restricciones de acciones para edición de subtareas
    const restriccionesAccionesEditarSubtarea = useMemo(() => {
        if (!selectedSubtarea || !session?.user) return {};
        
        return obtenerRestriccionesAcciones(selectedSubtarea, tipoSeccion, session.user);
    }, [selectedSubtarea, tipoSeccion, session]);

    // Subtareas con restricciones aplicadas
    const subtareasConRestricciones = useMemo(() => {
        if (!session?.user || !subtareas.length) return subtareas;

        return subtareas.map(subtarea => ({
            ...subtarea,
            restriccionesAcciones: obtenerRestriccionesAcciones(subtarea, tipoSeccion, session.user)
        }));
    }, [subtareas, tipoSeccion, session]);

    return (
        <div className="mt-3 pt-3 border-t border-gray-200 my-5">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="light"
                        startContent={<FiList className="w-4 h-4" />}
                        onClick={toggleMostrarSubtareas}
                        className="text-gray-600 hover:text-blue-600"
                    >
                        Subtareas ({subtareas.length})
                    </Button>
                </div>
                
                {/* Solo mostrar botón si el usuario NO es Profesional 2, 1 o Técnico (roles 6, 7, 8) */}
                {![6, 7, 8].includes(parseInt(session?.user?.role)) && (
                    <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<FiPlus className="w-4 h-4" />}
                        onClick={onCreateOpen}
                        className="text-blue-600 hover:bg-blue-50"
                    >
                        Agregar
                    </Button>
                )}
            </div>            {/* Lista de subtareas */}
            {mostrarSubtareas && (
                <ListaSubtareas
                    subtareas={subtareasConRestricciones}
                    loading={loading}
                    onEdit={handleEditSubtarea}
                    onDelete={handleEliminarSubtarea}
                    onDetalle={handleDetalleSubtarea}
                />
            )}

            {/* Modal para crear subtarea */}
            <TareaModal
                isOpen={isCreateOpen}
                onOpenChange={onCreateOpenChange}
                onClose={() => onCreateOpenChange(false)}
                onSubmit={handleCrearSubtarea}
                tarea={null}
                tareaPadre={tareaPadre}
                restricciones={restriccionesCrearSubtarea}
            />            {/* Modal para editar subtarea */}
            <EditarTareaModal
                isOpen={isEditOpen}
                onOpenChange={onEditOpenChange}
                onClose={() => {
                    setSelectedSubtarea(null);
                    setOriginalUsuarioAsignado(null); // Limpiar el usuario original
                    onEditOpenChange(false);
                }}
                onSubmit={handleEditarSubtarea}
                tarea={selectedSubtarea}
                tareaPadre={tareaPadre}
                restricciones={restriccionesEditarSubtarea}
                restriccionesAcciones={restriccionesAccionesEditarSubtarea}
            />

            {/* Modal de detalle de subtarea */}
            <DetalleModal 
                isOpen={isDetalleOpen}
                onOpenChange={onDetalleOpenChange}
                onClose={() => {
                    setSelectedSubtarea(null);
                    onDetalleOpenChange(false);
                }}
                tarea={selectedSubtarea}
                onEdit={handleEditFromDetalle}
                esSubtarea={true}
            />
        </div>
    );
};

export default SubtareasManager;
