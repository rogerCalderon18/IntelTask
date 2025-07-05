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
            console.log('Cargando datos de permisos para el usuario:', session.user);
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
        { key: "6", label: "Aprobado" },
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
        onEditOpen();
    };

    const handleCloseModal = () => {
        setSelectedPermiso(null);
        setIsEditing(false);
        onOpenChange(false);
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
                handleCloseEditModal(); // Solo cerrar modal de editar
            } else {
                await permisosService.crearPermiso({
                    ...permisoData,
                    cN_Usuario_creador: session.user.id
                });
                toast.success('Permiso creado exitosamente');
                handleCloseModal(); // Solo cerrar modal de crear
            }
            
            await cargarDatos();
            
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
        <Container className="max-w-6xl mx-auto mt-6 h-[calc(100vh-120px)] flex flex-col">
            {loading ? (
                <div className="flex justify-center items-center h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg">
                    <div className="text-center">
                        <Spinner
                            size="lg"
                            color="primary"
                            classNames={{
                                circle1: "border-b-primary",
                                circle2: "border-b-secondary",
                            }}
                        />
                        <p className="mt-4 text-lg font-medium text-gray-700 animate-pulse">
                            Cargando permisos...
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 mb-6">
                        <Tabs
                            aria-label="Categorías de permisos"
                            variant="underlined"
                            color="primary"
                            selectedKey={tabActivo}
                            onSelectionChange={(key) => {
                                setTabActivo(key);
                            }}
                        >
                            {tabs.map(tab => (
                                <Tab key={tab.id} title={
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${tab.id === 'misSolicitudes' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                                        <span className="text-sm font-medium">{tab.label}</span>
                                    </div>
                                }>
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6 sticky top-0 z-10">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-4 items-center flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-700">Filtrar:</span>
                                                    <Select
                                                        placeholder="Todos los estados"
                                                        className="w-48"
                                                        size="md"
                                                        variant="bordered"
                                                        onSelectionChange={(keys) => {
                                                            const selectedKey = Array.from(keys)[0];
                                                            setFiltroEstado(selectedKey || 'todos');
                                                        }}
                                                        selectionMode="single"
                                                        selectedKeys={[filtroEstado]}
                                                        classNames={{
                                                            trigger: "bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors",
                                                        }}
                                                    >
                                                        {estadosPermiso.map((estado) => (
                                                            <SelectItem key={estado.key} value={estado.key}>
                                                                {estado.label}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                </div>
                                                
                                                <div className="hidden lg:flex items-center gap-4 ml-6">
                                                    <div className="bg-blue-50 px-3 py-1 rounded-full">
                                                        <span className="text-xs font-medium text-blue-700">
                                                            Total: {permisosFiltrados.length}
                                                        </span>
                                                    </div>
                                                    {tabActivo === "misSolicitudes" && (
                                                        <div className="bg-green-50 px-3 py-1 rounded-full">
                                                            <span className="text-xs font-medium text-green-700">
                                                                Aprobados: {permisosFiltrados.filter(p => (p.cN_Id_estado || p.estado) === 6).length}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Solo mostrar botón si el usuario NO es Director (rol 1) */}
                                            {parseInt(session?.user?.role) !== 1 && (
                                                <Button
                                                    color="primary"
                                                    endContent={<FiPlus className="w-4 h-4" />}
                                                    className="hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                                    onPress={() => handleOpenModal()}
                                                    size="md"
                                                >
                                                    <span className="hidden sm:inline">Nuevo Permiso</span>
                                                    <span className="sm:hidden">Agregar</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)] pr-2">
                                        {permisosFiltrados.length === 0 ? (
                                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
                                                <EmptyStatePermisos 
                                                    tabActivo={tabActivo}
                                                    onNuevoPermiso={() => handleOpenModal()}
                                                    userRole={parseInt(session?.user?.role)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <PermisoAccordion
                                                    permisos={permisosFiltrados}
                                                    onEdit={handleOpenEditModal}
                                                    onDelete={handleDeletePermiso}
                                                    tipoSeccion={tabActivo}
                                                    currentUserId={session?.user?.id}
                                                />
                                            </div>
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
