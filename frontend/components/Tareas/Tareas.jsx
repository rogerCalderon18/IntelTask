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
    const [originalUsuarioAsignado, setOriginalUsuarioAsignado] = useState(null);
    const [estados, setEstados] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState('all');
    const [tabActivo, setTabActivo] = useState("misTareas");
    const [isEditing, setIsEditing] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { showConfirmation } = useConfirmation();

    useEffect(() => {
        if (session?.user?.id && status === 'authenticated') {
            cargarDatos();
        }
    }, [session, status]);

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
        }, {
            id: "seguimiento",
            label: "En seguimiento",
            filter: (tareas) => {
                const usuarioId = parseInt(session?.user?.id);
                if (!usuarioId) {
                    return [];
                }

                return tareas.filter((tarea) => {
                    const esCreador = tarea.cN_Usuario_creador === usuarioId;
                    const tieneAsignado = tarea.cN_Usuario_asignado && tarea.cN_Usuario_asignado !== usuarioId;
                    const estadoValido = [2, 3, 4].includes(tarea.estado || tarea.cN_Id_estado); // Asignado, En proceso, En espera

                    return esCreador && tieneAsignado && estadoValido;
                });
            },
        },        {
            id: "revision",
            label: "En revisión",
            filter: (tareas) => {
                const usuarioId = parseInt(session?.user?.id);
                if (!usuarioId) {
                    return [];
                }

                return tareas.filter((tarea) => {
                    const estadoEnRevision = (tarea.estado || tarea.cN_Id_estado) === 17;
                    const esCreador = tarea.cN_Usuario_creador === usuarioId; // Tareas que debo revisar
                    const esAsignado = tarea.cN_Usuario_asignado === usuarioId; // Tareas que envié a revisión
                    
                    return estadoEnRevision && (esCreador || esAsignado);
                });
            },
        },        {
            id: "incumplimiento",
            label: "Incumplimiento",
            filter: (tareas) => {
                const usuarioId = parseInt(session?.user?.id);
                if (!usuarioId) {
                    return [];
                }

                return tareas.filter((tarea) => {
                    const estadoIncumplida = (tarea.estado || tarea.cN_Id_estado) === 14;
                    const esCreador = tarea.cN_Usuario_creador === usuarioId; // Tareas incumplidas que debo revisar
                    const esAsignado = tarea.cN_Usuario_asignado === usuarioId; // Mis tareas incumplidas
                    
                    return estadoIncumplida && (esCreador || esAsignado);
                });
            },
        },
    ], [session?.user?.id]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
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
    };

    const handleOpenEditModal = (tarea) => {
        setSelectedTarea(tarea);
        setOriginalUsuarioAsignado(tarea.cN_Usuario_asignado);
        setIsEditing(true);
        onEditOpenChange(true);
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

            if (!usuarioAsignadoId) {
                console.log('❌ No hay usuario asignado ID');
                return;
            }

            const usuarios = await catalogosService.obtenerUsuarios();

            const usuarioAsignado = usuarios.find(u => u.cN_Id_usuario === usuarioAsignadoId);

            if (!usuarioAsignado) {
                console.warn('❌ No se encontró el usuario asignado para enviar notificación');
                return;
            }

            await notificacionService.enviarNotificacionAsignacion(
                usuarioAsignado,
                tareaCreada,
                tipoNotificacion
            );

            toast.success('Notificación enviada al usuario asignado', {
                position: "top-right",
                autoClose: 2000,
            });

        } catch (error) {
            console.error('Error al enviar notificación:', error);
            toast.warning('Tarea guardada, pero no se pudo enviar la notificación', {
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
            const usuarioAnterior = originalUsuarioAsignado;
            const usuarioNuevo = tareaData.cN_Usuario_asignado;

            const tareaActualizada = await tareasService.actualizarTarea(selectedTarea.cN_Id_tarea, tareaData);

            toast.success('¡Tarea actualizada exitosamente!', {
                position: "top-right",
                autoClose: 3000,
            });
            // Enviar notificación si se asignó un usuario nuevo o cambió el usuario asignado
            if (usuarioNuevo) {
                // Si no tenía usuario asignado antes, o cambió el usuario asignado
                if (!usuarioAnterior || usuarioAnterior !== usuarioNuevo) {
                    const tipoNotificacion = !usuarioAnterior ? 'NUEVA_ASIGNACION' : 'REASIGNACION';
                    await enviarNotificacionAsignacion(usuarioNuevo, tareaActualizada, tipoNotificacion);
                } else {
                    console.log('ℹ️ No se envía notificación - mismo usuario asignado');
                }
            } else {
                console.log('ℹ️ No se envía notificación - no hay usuario asignado');
            }
            await cargarDatos();
            setSelectedTarea(null);
            setOriginalUsuarioAsignado(null);
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
    };    const filtrarTareasPorEstado = (tareas, estadoId) => {
        if (!estadoId || estadoId === 'all') return tareas;

        // Filtros especiales para el tab de revisión
        if (tabActivo === "revision") {
            const usuarioId = parseInt(session?.user?.id);
            if (!usuarioId) return tareas;

            if (estadoId === 'para_revisar') {
                // Tareas que debo revisar (soy creador)
                return tareas.filter((tarea) => tarea.cN_Usuario_creador === usuarioId);
            } else if (estadoId === 'mis_en_revision') {
                // Mis tareas en revisión (soy asignado)
                return tareas.filter((tarea) => tarea.cN_Usuario_asignado === usuarioId);
            }
        }

        // Filtros especiales para el tab de incumplimiento
        if (tabActivo === "incumplimiento") {
            const usuarioId = parseInt(session?.user?.id);
            if (!usuarioId) return tareas;

            if (estadoId === 'para_revisar_incumplimiento') {
                // Tareas incumplidas que debo revisar (soy creador)
                return tareas.filter((tarea) => tarea.cN_Usuario_creador === usuarioId);
            } else if (estadoId === 'mis_incumplidas') {
                // Mis tareas incumplidas (soy asignado)
                return tareas.filter((tarea) => tarea.cN_Usuario_asignado === usuarioId);
            }
        }

        // Lógica normal para otros tabs
        const estadoIdNumerico = parseInt(estadoId);

        return tareas.filter((tarea) => {
            const tareaEstadoId = tarea.estado || tarea.cN_Id_estado;
            console.log('Comparando:', estadoIdNumerico, 'con', tareaEstadoId);
            return tareaEstadoId === estadoIdNumerico;
        });
    };// Función para obtener los estados disponibles según el tab activo
    const getEstadosDisponibles = () => {
        if (tabActivo === "misTareas") {
            // En "Mis Tareas" solo mostrar Registrado (1) y Asignado (2)
            return estados.filter(estado =>
                estado.cN_Id_estado === 1 || estado.cN_Id_estado === 2
            );
        } else if (tabActivo === "seguimiento") {
            // En "Seguimiento" mostrar Asignado (2), En proceso (3) y En espera (4)
            return estados.filter(estado =>
                estado.cN_Id_estado === 2 || estado.cN_Id_estado === 3 || estado.cN_Id_estado === 4
            );
        } else if (tabActivo === "revision") {
            // En "Revisión" mostrar opciones personalizadas
            return [
                { cN_Id_estado: 'para_revisar', cT_Estado: 'Para revisar' },
                { cN_Id_estado: 'mis_en_revision', cT_Estado: 'Mis tareas en revisión' }
            ];
        } else if (tabActivo === "incumplimiento") {
            // En "Incumplimiento" mostrar opciones personalizadas
            return [
                { cN_Id_estado: 'para_revisar_incumplimiento', cT_Estado: 'Para revisar incumplimiento' },
                { cN_Id_estado: 'mis_incumplidas', cT_Estado: 'Mis tareas incumplidas' }
            ];
        }
        return estados;
    };

    const tareasFiltradas = useMemo(() => {
        // 1) aplico filtro de pestaña
        const tabActual = tabs.find(t => t.id === tabActivo);
        let list = tabActual ? tabActual.filter(tareas) : [];
        // 2) aplico filtroEstado
        if (filtroEstado && filtroEstado !== 'all') {
            list = filtrarTareasPorEstado(list, filtroEstado);
        }
        return list;
    }, [tareas, tabActivo, filtroEstado, tabs]);

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
                            color="primary"
                            selectedKey={tabActivo}
                            onSelectionChange={(key) => {
                                setTabActivo(key);
                                setFiltroEstado('all');
                            }}
                            classNames={{
                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-[#22d3ee]",
                                tab: "max-w-fit px-0 h-12",
                                tabContent: "group-data-[selected=true]:text-[#06b6d4]",
                            }}
                        >
                            {tabs.map(tab => (
                                <Tab key={tab.id} title={tab.label}>
                                    <div className="flex justify-between items-center mb-4 ml-2 bg-white sticky top-0 z-10 py-2">
                                        <Select
                                            placeholder="Filtrar por estado"
                                            className="w-1/4"
                                            onSelectionChange={(keys) => {
                                                const selectedKey = Array.from(keys)[0];
                                                console.log('Estado ID seleccionado:', selectedKey);
                                                setFiltroEstado(selectedKey || 'all');
                                            }}
                                            selectionMode="single"
                                            selectedKeys={filtroEstado ? [filtroEstado.toString()] : ['all']}
                                        >
                                            <SelectItem key="all" value="all">
                                                Todos los estados
                                            </SelectItem>
                                            {getEstadosDisponibles().map((estado) => (
                                                <SelectItem
                                                    key={estado.cN_Id_estado}
                                                    value={estado.cN_Id_estado.toString()}
                                                >
                                                    {estado.cT_Estado || 'Estado'}
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
                                            <TareaAccordion
                                                key={`${tabActivo}-${filtroEstado}`}
                                                tareas={tareasFiltradas}
                                                onEdit={handleOpenEditModal}
                                                onDelete={handleEliminarTarea}
                                            />
                                        )}
                                    </div>
                                </Tab>
                            ))}
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
