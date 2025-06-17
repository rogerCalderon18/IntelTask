import React, { useState, useEffect, useMemo } from "react";
import Container from "../Layout/Container";
import { Tabs, Tab, Select, Button, SelectItem, useDisclosure, Spinner } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import TareaAccordion from "./TareaAccordion";
import TareaModal from "./TareaModal";
import EditarTareaModal from "./EditarTareaModal";
import EmptyState from "./EmptyState";
import { tareasService } from "../../services/tareasService";
import { catalogosService } from "../../services/catalogosService";
import { notificacionService } from "../../services/notificacionService";
import { toast } from "react-toastify";
import useConfirmation from '@/hooks/useConfirmation';
import { useSession } from 'next-auth/react';

const Tareas = () => {
    const { data: session, status } = useSession();
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [originalUsuarioAsignado, setOriginalUsuarioAsignado] = useState(null); // Guardar el usuario original
    const [estados, setEstados] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState(null);
    const [tabActivo, setTabActivo] = useState("misTareas"); // Nuevo estado para el tab activo
    const [isEditing, setIsEditing] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { showConfirmation } = useConfirmation();    // Cargar datos al montar el componente
    useEffect(() => {
        if (session?.user?.id && status === 'authenticated') {
            cargarDatos();
        }
    }, [session, status]);

    // Definir tabs dinámicamente basado en la sesión
    const tabs = useMemo(() => [
        {
            id: "misTareas",
            label: "Mis Tareas",
            filter: (tareas) => {
                const usuarioId = parseInt(session?.user?.id);
                if (!usuarioId) {
                    return;
                }

                const tareasFiltradas = tareas.filter((tarea) => {
                    const esCreador = tarea.cN_Usuario_creador === usuarioId;
                    const esAsignado = tarea.cN_Usuario_asignado === usuarioId;
                    const cumpleCondicion = esCreador || esAsignado;
                    return cumpleCondicion;
                });
                return tareasFiltradas;
            },
        },
        {
            id: "seguimiento",
            label: "En seguimiento",
            filter: (tareas) => tareas.filter((tarea) => (tarea.estado || tarea.cN_Id_estado) === 2),
        },
        {
            id: "revision",
            label: "En revisión",
            filter: (tareas) => tareas.filter((tarea) => (tarea.estado || tarea.cN_Id_estado) === 3),
        },
        {
            id: "incumplimiento",
            label: "Incumplimiento",
            filter: (tareas) => tareas.filter((tarea) => (tarea.estado || tarea.cN_Id_estado) === 4),
        },
    ], [session?.user?.id]);

    const cargarDatos = async () => {
        try {
            console.log('🔄 Cargando tareas y estados...');
            setLoading(true);
            console.log('🔄 Cargando tareas y estados...');

            // Verificar que hay sesión activa
            if (!session?.user?.id || status !== 'authenticated') {
                console.warn('No hay sesión de usuario activa');
                return;
            }

            const [tareasData, estadosData] = await Promise.all([
                tareasService.obtenerTareasPorUsuario(session.user.id),
                catalogosService.obtenerEstados()
            ]);

            const tareasNormalizadas = tareasData.map(tarea => ({
                ...tarea,
                id: tarea.cN_Id_tarea || tarea.id,
                titulo: tarea.cT_Titulo_tarea || tarea.titulo,
                descripcion: tarea.cT_Descripcion_tarea || tarea.descripcion,
                estado: tarea.cN_Id_estado || tarea.estado,
                fechaEntrega: tarea.cF_Fecha_limite || tarea.fechaEntrega,
                prioridad: tarea.cN_Id_prioridad || tarea.prioridad,
                subtareas: tarea.subtareas || []
            }));

            console.log('Tareas del usuario normalizadas:', tareasNormalizadas);
            console.log('Estados obtenidos:', estadosData);

            setTareas(tareasNormalizadas);
            setEstados(estadosData);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos', { autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (tarea = null) => {
        setSelectedTarea(tarea);
        setIsEditing(false);
        onOpen();
    }; const handleOpenEditModal = (tarea) => {
        setSelectedTarea(tarea);
        setOriginalUsuarioAsignado(tarea.cN_Usuario_asignado); // Guardar el usuario original
        setIsEditing(true);
        onEditOpen();
    };

    const handleCloseModal = () => {
        setSelectedTarea(null);
        setIsEditing(false);
    };

    const handleCloseEditModal = () => {
        setSelectedTarea(null);
        setOriginalUsuarioAsignado(null);
        setIsEditing(false);
        onEditOpenChange(false);
    };

    const enviarNotificacionAsignacion = async (usuarioAsignadoId, tareaCreada, tipoNotificacion = 'NUEVA_ASIGNACION') => {
        try {
            console.log('📧 Iniciando envío de notificación:', { usuarioAsignadoId, tipoNotificacion });

            if (!usuarioAsignadoId) {
                console.log('❌ No hay usuario asignado ID');
                return;
            }

            // Obtener información del usuario asignado
            console.log('🔍 Obteniendo usuarios...');
            const usuarios = await catalogosService.obtenerUsuarios();
            console.log('👥 Usuarios obtenidos:', usuarios.length);

            const usuarioAsignado = usuarios.find(u => u.cN_Id_usuario === usuarioAsignadoId);
            console.log('👤 Usuario encontrado:', usuarioAsignado);

            if (!usuarioAsignado) {
                console.warn('❌ No se encontró el usuario asignado para enviar notificación');
                return;
            }

            console.log('📤 Enviando notificación al servicio...', {
                email: usuarioAsignado.cT_Correo_usuario,
                tarea: tareaCreada.cT_Titulo_tarea || tareaCreada.titulo
            });

            await notificacionService.enviarNotificacionAsignacion(
                usuarioAsignado,
                tareaCreada,
                tipoNotificacion
            );

            console.log('✅ Notificación enviada exitosamente');
            toast.success('📧 Notificación enviada al usuario asignado', {
                position: "top-right",
                autoClose: 2000,
            });

        } catch (error) {
            console.error('❌ Error al enviar notificación:', error);
            // No mostramos error al usuario para que no interfiera con el flujo principal
            toast.warning('⚠️ Tarea guardada, pero no se pudo enviar la notificación', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleSubmit = async (tareaData) => {
        try {
            const tareaCreada = await tareasService.crearTarea(tareaData);

            toast.success('¡Tarea creada exitosamente!', {
                position: "top-right",
                autoClose: 3000,
            });

            // Enviar notificación si hay usuario asignado
            if (tareaData.cN_Usuario_asignado) {
                await enviarNotificacionAsignacion(
                    tareaData.cN_Usuario_asignado,
                    tareaCreada,
                    'NUEVA_ASIGNACION'
                );
            }

            await cargarDatos();
            setSelectedTarea(null);
            onOpenChange(false);

        } catch (error) {
            console.error('Error al guardar tarea:', error);
            toast.error(`Error al crear la tarea: ${error.message}`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleEditSubmit = async (tareaData) => {
        try {
            const usuarioAnterior = originalUsuarioAsignado; // Usar el usuario original guardado
            const usuarioNuevo = tareaData.cN_Usuario_asignado;

            console.log('🔄 Editando tarea - Usuario anterior:', usuarioAnterior, 'Usuario nuevo:', usuarioNuevo);
            console.log('📋 Datos de tarea a actualizar:', tareaData);

            const tareaActualizada = await tareasService.actualizarTarea(selectedTarea.cN_Id_tarea, tareaData);

            toast.success('¡Tarea actualizada exitosamente!', {
                position: "top-right",
                autoClose: 3000,
            });

            console.log('✅ Tarea actualizada:', tareaActualizada);
            console.log('tareaData enviada:', tareaData);
            // Enviar notificación si se asignó un usuario nuevo o cambió el usuario asignado
            if (usuarioNuevo) {
                // Si no tenía usuario asignado antes, o cambió el usuario asignado
                if (!usuarioAnterior || usuarioAnterior !== usuarioNuevo) {
                    const tipoNotificacion = !usuarioAnterior ? 'NUEVA_ASIGNACION' : 'REASIGNACION';
                    console.log('📧 Enviando notificación:', tipoNotificacion, 'al usuario:', usuarioNuevo);
                    await enviarNotificacionAsignacion(usuarioNuevo, tareaActualizada, tipoNotificacion);
                } else {
                    console.log('ℹ️ No se envía notificación - mismo usuario asignado');
                }
            } else {
                console.log('ℹ️ No se envía notificación - no hay usuario asignado');
            } await cargarDatos();
            setSelectedTarea(null);
            setOriginalUsuarioAsignado(null); // Limpiar el usuario original
            onEditOpenChange(false);

        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            toast.error(`Error al actualizar la tarea: ${error.message}`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleEliminarTarea = async (tarea) => {
        const tareaId = tarea.id || tarea.cN_Id_tarea;

        if (!tareaId) {
            toast.error('No se pudo identificar la tarea');
            return;
        }

        showConfirmation({
            title: "Eliminar tarea",
            message: `"${tarea.cT_Titulo_tarea}"`,
            description: "Esta acción no se puede deshacer.",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            type: "danger",
            onConfirm: async () => {
                const toastId = toast.loading('Eliminando tarea...');

                try {
                    const resultado = await tareasService.eliminarTarea(tareaId);

                    if (resultado.success) {
                        toast.update(toastId, {
                            render: '¡Tarea eliminada exitosamente!',
                            type: 'success',
                            isLoading: false,
                            autoClose: 3000,
                        });
                        await cargarDatos();
                    } else {
                        toast.dismiss(toastId);
                        let mensaje = resultado.error;
                        if (mensaje.includes('SUBTAREAS_EXISTENTES')) {
                            mensaje = 'No se puede eliminar. Tiene subtareas asociadas.';
                        }
                        toast.error(mensaje, { autoClose: 5000 });
                    }

                } catch (error) {
                    toast.dismiss(toastId);
                    toast.error('Error inesperado al eliminar');
                }
            }
        });
    };

    const filtrarTareasPorEstado = (tareas, estadoId) => {
        if (!estadoId) return tareas;
        console.log('🔍 Filtrando tareas por estado:', estadoId, tareas);
        return tareas.filter((tarea) => {
            const tareaEstadoId = tarea.estado || tarea.cN_Id_estado;
            return tareaEstadoId === estadoId;
        });
    };

    // Función para obtener los estados disponibles según el tab activo
    const getEstadosDisponibles = () => {
        if (tabActivo === "misTareas") {
            // En "Mis Tareas" solo mostrar Registrado (1) y Asignado (2)
            return estados.filter(estado =>
                estado.cN_Id_estado === 1 || estado.cN_Id_estado === 2
            );
        }
        return estados;
    };

    return (
        <Container className="max-w-4xl mx-auto mt-10 h-[calc(100vh-120px)] flex flex-col">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner
                        size="lg"
                        color="primary"
                        label="Cargando tareas..."
                        labelColor="primary"
                    />
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 mb-4">
                        <Tabs
                            aria-label="Categorías de tareas"
                            variant="underlined"
                            items={tabs}
                            color="primary"
                            selectedKey={tabActivo}
                            onSelectionChange={(key) => {
                                setTabActivo(key);
                                setFiltroEstado(null);
                            }}
                            classNames={{
                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-[#22d3ee]",
                                tab: "max-w-fit px-0 h-12",
                                tabContent: "group-data-[selected=true]:text-[#06b6d4]",
                            }}
                        >
                            {(tab) => {
                                let tareasFiltradas = tab.filter(tareas);
                                tareasFiltradas = filtrarTareasPorEstado(tareasFiltradas, filtroEstado);

                                return (
                                    <Tab key={tab.id} title={tab.label}>
                                        <div className="flex justify-between items-center mb-4 ml-2 bg-white sticky top-0 z-10 py-2">
                                            <Select
                                                placeholder="Filtrar por estado"
                                                className="w-1/4"
                                                onSelectionChange={(keys) => {
                                                    const selectedKey = Array.from(keys)[0];
                                                    console.log('Estado ID seleccionado:', selectedKey);
                                                    setFiltroEstado(selectedKey || null);
                                                }}
                                                selectedKeys={filtroEstado ? [filtroEstado.toString()] : []}                                            >
                                                {getEstadosDisponibles().map((estado) => (
                                                    <SelectItem
                                                        key={estado.cN_Id_estado}
                                                        value={estado.cN_Id_estado.toString()}
                                                    >
                                                        {estado.cT_Nombre_estado || estado.cT_Estado || 'Estado'}
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            <Button
                                                color="primary"
                                                endContent={<FiPlus className="w-4 h-4" />}
                                                className="flex items-center mr-2"
                                                onPress={() => handleOpenModal()}
                                            >
                                                Agregar
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 py-10">
                                            {tareasFiltradas.length === 0 ? (
                                                <EmptyState
                                                    tabId={tab.id}
                                                    onAddTask={() => handleOpenModal()}
                                                />
                                            ) : (
                                                <TareaAccordion tareas={tareasFiltradas} onEdit={handleOpenEditModal} onDelete={handleEliminarTarea} />
                                            )}
                                        </div>
                                    </Tab>
                                );
                            }}
                        </Tabs>
                    </div>
                </div>
            )}

            <TareaModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                tarea={null}
            />

            <EditarTareaModal
                isOpen={isEditOpen}
                onOpenChange={onEditOpenChange}
                onClose={handleCloseEditModal}
                onSubmit={handleEditSubmit}
                tarea={selectedTarea}
            />
        </Container>
    );
};

export default Tareas;
