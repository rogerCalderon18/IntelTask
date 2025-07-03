import React, { useState, useEffect, useMemo } from "react";
import Container from "../Layout/Container";
import { Tabs, Tab, Select, Button, SelectItem, useDisclosure, Spinner } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import PermisoAccordion from "./PermisoAccordion";
import PermisoModal from "./PermisoModal";
import EditarPermisoModal from "./EditarPermisoModal";
import EmptyStatePermisos from "./EmptyStatePermisos";
import { permisosService } from "../../services/permisosService";
import { catalogosService } from "../../services/catalogosService";
import { toast } from "react-toastify";
import useConfirmation from '@/hooks/useConfirmation';
import { useSession } from 'next-auth/react';

const Permisos = () => {
    const { data: session, status } = useSession();
    const [misSolicitudes, setMisSolicitudes] = useState([]);
    const [solicitudesParaRevisar, setSolicitudesParaRevisar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPermiso, setSelectedPermiso] = useState(null);
    const [estados, setEstados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [tabActivo, setTabActivo] = useState("misSolicitudes");
    const [filtroEstado, setFiltroEstado] = useState("todos");
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
            id: "misSolicitudes",
            label: "Mis Solicitudes",
            description: "Permisos que he solicitado",
        },
        {
            id: "solicitudes",
            label: "Solicitudes",
            description: "Permisos para revisar",
        }
    ], []);

    const estadosPermiso = [
        { key: "todos", label: "Todos los estados" },
        { key: "1", label: "Registrado" },
        { key: "2", label: "Aprobado" },
        { key: "15", label: "Rechazado" }
    ];

    const cargarDatos = async () => {
        try {
            setLoading(true);
            if (!session?.user?.id || status !== 'authenticated') {
                console.warn('No hay sesión de usuario activa');
                return;
            }

            const usuarioId = session.user.id;

            const [misSolicitudesData, solicitudesRevisarData, estadosData, usuariosData] = await Promise.all([
                permisosService.obtenerPermisosPorUsuario(usuarioId),
                permisosService.obtenerPermisosParaRevisar(usuarioId),
                catalogosService.obtenerEstados(),
                catalogosService.obtenerUsuarios()
            ]);

            const normalizarPermisos = (permisosData) => {
                return permisosData.map(permiso => ({
                    ...permiso,
                    id: permiso.cN_Id_permiso || permiso.id,
                    titulo: permiso.cT_Titulo_permiso || permiso.titulo,
                    descripcion: permiso.cT_Descripcion_permiso || permiso.descripcion,
                    estado: permiso.cN_Id_estado || permiso.estado,
                    fechaInicio: permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio,
                    fechaFin: permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin,
                    fechaRegistro: permiso.cF_Fecha_hora_registro || permiso.fechaRegistro,
                    descripcionRechazo: permiso.cT_Descripcion_rechazo || permiso.descripcionRechazo,
                    usuarioCreador: permiso.cN_Usuario_creador || permiso.usuarioCreador
                }));
            };

            setMisSolicitudes(normalizarPermisos(misSolicitudesData));
            setSolicitudesParaRevisar(normalizarPermisos(solicitudesRevisarData));
            setEstados(estadosData);
            setUsuarios(usuariosData);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos', { autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const permisosFiltrados = useMemo(() => {
        // Seleccionar la fuente de datos según el tab activo
        let filtered = tabActivo === "misSolicitudes" ? misSolicitudes : solicitudesParaRevisar;

        // Filtrar por estado
        if (filtroEstado !== "todos") {
            const estadoId = parseInt(filtroEstado);
            filtered = filtered.filter(permiso => 
                (permiso.cN_Id_estado || permiso.estado) === estadoId
            );
        }

        return filtered;
    }, [misSolicitudes, solicitudesParaRevisar, tabActivo, filtroEstado]);

    const handleOpenModal = (permiso = null) => {
        setSelectedPermiso(permiso);
        setIsEditing(false);
        onOpen();
    };

    const handleOpenEditModal = (permiso) => {
        setSelectedPermiso(permiso);
        setIsEditing(true);
        onEditOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedPermiso(null);
        setIsEditing(false);
    };

    const handleCloseEditModal = () => {
        setSelectedPermiso(null);
        setIsEditing(false);
        onEditOpenChange(false);
    };

    const handleSavePermiso = async (permisoData) => {
        try {
            if (isEditing && selectedPermiso) {
                await permisosService.actualizarPermiso(selectedPermiso.id, {
                    ...permisoData,
                    cN_Usuario_editor: session.user.id
                });
                toast.success('Permiso actualizado exitosamente');
            } else {
                await permisosService.crearPermiso({
                    ...permisoData,
                    cN_Usuario_creador: session.user.id
                });
                toast.success('Permiso creado exitosamente');
            }
            
            await cargarDatos();
            handleCloseModal();
            handleCloseEditModal();
            
        } catch (error) {
            console.error('Error al guardar permiso:', error);
            toast.error('Error al guardar el permiso');
        }
    };

    const handleDeletePermiso = async (permisoId) => {
        const confirmed = await showConfirmation({
            title: '¿Eliminar permiso?',
            message: '¿Estás seguro de que deseas eliminar este permiso? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            try {
                await permisosService.eliminarPermiso(permisoId);
                toast.success('Permiso eliminado exitosamente');
                await cargarDatos();
            } catch (error) {
                console.error('Error al eliminar permiso:', error);
                toast.error('Error al eliminar el permiso');
            }
        }
    };

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="max-w-4xl mx-auto mt-10 h-[calc(100vh-120px)] flex flex-col">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner
                        size="lg"
                        color="primary"
                        label="Cargando permisos..."
                        labelColor="primary"
                    />
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 mb-4">
                        <Tabs
                            aria-label="Categorías de permisos"
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
                                                placeholder="Filtrar por estado"
                                                className="w-1/2"
                                                onSelectionChange={(keys) => {
                                                    const selectedKey = Array.from(keys)[0];
                                                    setFiltroEstado(selectedKey || 'todos');
                                                }}
                                                selectionMode="single"
                                                selectedKeys={[filtroEstado]}
                                            >
                                                {estadosPermiso.map((estado) => (
                                                    <SelectItem key={estado.key} value={estado.key}>
                                                        {estado.label}
                                                    </SelectItem>
                                                ))}
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
                                        {permisosFiltrados.length === 0 ? (
                                            <EmptyStatePermisos 
                                                tabActivo={tabActivo}
                                                onNuevoPermiso={() => handleOpenModal()}
                                            />
                                        ) : (
                                            <PermisoAccordion
                                                permisos={permisosFiltrados}
                                                onEdit={handleOpenEditModal}
                                                onDelete={handleDeletePermiso}
                                                tipoSeccion={tabActivo}
                                                currentUserId={session?.user?.id}
                                            />
                                        )}
                                    </div>
                                </Tab>
                            ))}
                        </Tabs>
                    </div>
                </div>
            )}

            {/* Modales */}
            <PermisoModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={handleCloseModal}
                onSave={handleSavePermiso}
                permiso={selectedPermiso}
                estados={estados}
                usuarios={usuarios}
            />

            <EditarPermisoModal
                isOpen={isEditOpen}
                onOpenChange={onEditOpenChange}
                onClose={handleCloseEditModal}
                onSave={handleSavePermiso}
                permiso={selectedPermiso}
                estados={estados}
                usuarios={usuarios}
                tipoSeccion={tabActivo}
            />
        </Container>
    );
};

export default Permisos;
