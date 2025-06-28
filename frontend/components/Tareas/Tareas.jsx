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

// Importar restricciones
import { obtenerRestricciones, obtenerRestriccionesAcciones } from '../utils/restricciones';

const Tareas = () => {
    const { data: session, status } = useSession();
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [originalUsuarioAsignado, setOriginalUsuarioAsignado] = useState(null);
    const [estados, setEstados] = useState([]);
    const [tabActivo, setTabActivo] = useState("pendientes");
    const [filtroRol, setFiltroRol] = useState("todos"); // filtro de rol: creador/asignado
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
            id: "pendientes",
            label: "Pendientes",
            description: "Tareas registradas y asignadas",
            estados: [1, 2], // Registrado, Asignado
        }, {
            id: "enProceso",
            label: "En Proceso",
            description: "Tareas en desarrollo",
            estados: [3], // En proceso
        }, {
            id: "enEspera",
            label: "En Espera",
            description: "Tareas pausadas o bloqueadas",
            estados: [4], // En espera
        }, {
            id: "enRevision",
            label: "En Revisión",
            description: "Tareas pendientes de revisión",
            estados: [17], // En revisión
        }, {
            id: "rechazadas",
            label: "Rechazadas",
            description: "Tareas rechazadas",
            estados: [15], // Rechazada
        }, {
            id: "incumplidas",
            label: "Incumplidas",
            description: "Tareas no completadas a tiempo",
            estados: [14], // Incumplido
        }, {
            id: "terminadas",
            label: "Terminadas",
            description: "Tareas completadas exitosamente",
            estados: [5], // Terminado
        },
    ], []);

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
        onEditOpen(true);
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
    };



    const tareasFiltradas = useMemo(() => {
        // 1) Filtrar por estado del tab
        const usuarioId = parseInt(session?.user?.id);
        if (!usuarioId) return [];

        const tabActual = tabs.find(t => t.id === tabActivo);
        if (!tabActual) return [];

        // Filtrar por estados del tab
        let list = tareas.filter((tarea) => {
            return tabActual.estados.includes(tarea.estado || tarea.cN_Id_estado);
        });

        // 2) Filtrar por rol del usuario
        list = list.filter((tarea) => {
            const esCreador = tarea.cN_Usuario_creador === usuarioId;
            const esAsignado = tarea.cN_Usuario_asignado === usuarioId;

            // Aplicar filtro de rol
            if (filtroRol === "creador") return esCreador;
            if (filtroRol === "asignado") return esAsignado;
            return esCreador || esAsignado; // "todos" - cualquier relación con la tarea
        });

        // 3) Evitar mostrar subtareas sueltas si su padre está en la lista
        const idsPadres = new Set(list.map(t => t.cN_Id_tarea));
        return list.filter(tarea => {
            // Si es subtarea y su padre está en la lista, no mostrarla suelta
            if (tarea.cN_Tarea_origen && idsPadres.has(tarea.cN_Tarea_origen)) {
                return false;
            }
            return true;
        });

    }, [tareas, tabActivo, filtroRol, tabs, session]);

    // Restricciones para el modal de creación
    const restriccionesCrear = useMemo(() => {
        if (!session?.user) return {};
        return obtenerRestricciones(null, tabActivo, session.user);
    }, [tabActivo, session]);

    // Restricciones para el modal de edición
    const restriccionesEditar = useMemo(() => {
        if (!session?.user || !selectedTarea) return {};
        const restricciones = obtenerRestricciones(selectedTarea, tabActivo, session.user);
        console.log('Restricciones de campos:', restricciones);
        return restricciones;
    }, [selectedTarea, tabActivo, session]);

    // Restricciones de acciones para edición
    const restriccionesAccionesEditar = useMemo(() => {
        if (!session?.user || !selectedTarea) return {};
        const restricciones = obtenerRestriccionesAcciones(selectedTarea, tabActivo, session.user);
        return restricciones;
    }, [selectedTarea, tabActivo, session]);

    // Restricciones para las tareas en las listas
    const tareasConRestricciones = useMemo(() => {
        if (!session?.user || !tareasFiltradas) return [];
        return tareasFiltradas.map(tarea => ({
            ...tarea,
            restriccionesAcciones: obtenerRestriccionesAcciones(tarea, tabActivo, session.user)
        }));
    }, [tareasFiltradas, tabActivo, session]);

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
                                        <div className="flex gap-4 w-1/2">
                                            <Select
                                                placeholder="Filtrar por perspectiva"
                                                className="w-1/2"
                                                onSelectionChange={(keys) => {
                                                    const selectedKey = Array.from(keys)[0];
                                                    setFiltroRol(selectedKey || 'todos');
                                                }}
                                                selectionMode="single"
                                                selectedKeys={[filtroRol]}
                                            >
                                                <SelectItem key="todos" value="todos">
                                                    Todas las tareas
                                                </SelectItem>
                                                <SelectItem key="creador" value="creador">
                                                    Tareas que creé
                                                </SelectItem>
                                                <SelectItem key="asignado" value="asignado">
                                                    Tareas asignadas a mí
                                                </SelectItem>
                                            </Select>
                                        </div>

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
                                        {tareasConRestricciones.length === 0 ? (
                                            <EmptyState
                                                tabId={tab.id}
                                                onAddTask={() => handleOpenModal()}
                                            />
                                        ) : (
                                            <TareaAccordion
                                                key={`${tabActivo}-${filtroRol}`}
                                                tareas={tareasConRestricciones}
                                                onEdit={handleOpenEditModal}
                                                onDelete={handleEliminarTarea}
                                                tipoSeccion={tabActivo}
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
                restricciones={restriccionesCrear}
            />

            <EditarTareaModal
                isOpen={isEditOpen}
                onOpenChange={onEditOpenChange}
                onClose={handleCloseEditModal}
                onSubmit={handleEditSubmit}
                tarea={selectedTarea}
                restricciones={restriccionesEditar}
                restriccionesAcciones={restriccionesAccionesEditar}
            />
        </Container>
    );
};

export default Tareas;
