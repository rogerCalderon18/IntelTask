import React, { useState, useEffect } from "react";
import Container from "../Layout/Container";
import { Tabs, Tab, Select, Button, SelectItem, useDisclosure, Spinner } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import TareaAccordion from "./TareaAccordion";
import TareaModal from "./TareaModal";
import EditarTareaModal from "./EditarTareaModal";
import EmptyState from "./EmptyState";
import { tareasService } from "../../services/tareasService";
import { catalogosService } from "../../services/catalogosService";

const Tareas = () => {
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [estados, setEstados] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

    // Definir tabs dinámicamente basado en los estados
    const [tabs, setTabs] = useState([
        {
            id: "misTareas",
            label: "Mis Tareas",
            filter: (tareas) => tareas.filter((tarea) => (tarea.estado || tarea.cN_Id_estado) === 1),
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
    ]);

    // Cargar datos al montar el componente
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Cargar tareas y estados en paralelo
            const [tareasData, estadosData] = await Promise.all([
                tareasService.obtenerTareas(),
                catalogosService.obtenerEstados()
            ]);
            
            // Normalizar tareas
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
            
            console.log('Tareas normalizadas:', tareasNormalizadas);
            console.log('Estados obtenidos:', estadosData);
            
            setTareas(tareasNormalizadas);
            setEstados(estadosData);
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setError('Error al cargar los datos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };    const handleOpenModal = (tarea = null) => {
        setSelectedTarea(tarea);
        setIsEditing(false);
        onOpen();
    };

    const handleOpenEditModal = (tarea) => {
        setSelectedTarea(tarea);
        setIsEditing(true);
        onEditOpen();
    };

    const handleCloseModal = () => {
        setSelectedTarea(null);
        setIsEditing(false);
    };

    const handleCloseEditModal = () => {
        setSelectedTarea(null);
        setIsEditing(false);
    };

    const handleSubmit = async (tareaData) => {
        try {
            setError(null);
            
            // Crear nueva tarea (solo desde el modal de crear)
            await tareasService.crearTarea(tareaData);
            
            // Recargar la lista de tareas
            await cargarDatos();
            
            // Cerrar modal
            setSelectedTarea(null);
            onOpenChange(false);
        } catch (error) {
            console.error('Error al guardar tarea:', error);
            setError('Error al guardar la tarea: ' + error.message);
        }
    };

    const handleEditSubmit = async (tareaData) => {
        try {
            setError(null);
            
            // Actualizar tarea existente
            await tareasService.actualizarTarea(selectedTarea.cN_Id_tarea, tareaData);
            
            // Recargar la lista de tareas
            await cargarDatos();
            
            // Cerrar modal
            setSelectedTarea(null);
            onEditOpenChange(false);
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            setError('Error al actualizar la tarea: ' + error.message);
        }
    };

    const filtrarTareasPorEstado = (tareas, filtroEstado) => {
        if (!filtroEstado) return tareas;
        return tareas.filter(tarea => (tarea.estado || tarea.cN_Id_estado) === parseInt(filtroEstado));
    };

    return (
        <Container className="max-w-4xl mx-auto mt-10">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
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
                <Tabs
                    aria-label="Categorías de tareas"
                    className="mb-4"
                    variant="underlined"
                    items={tabs}
                    color="primary"
                    classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-[#22d3ee]",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-[#06b6d4]",
                    }}
                >
                    {(tab) => {
                        let tareasFiltradas = tab.filter(tareas);
                        
                        // Aplicar filtro adicional por estado si está seleccionado
                        tareasFiltradas = filtrarTareasPorEstado(tareasFiltradas, filtroEstado);
                        
                        console.log(`Tareas en tab ${tab.id}:`, tareasFiltradas);
                        
                        return (
                            <Tab key={tab.id} title={tab.label}>
                                <div className="flex justify-between items-center mb-4 ml-2">
                                    <Select 
                                        placeholder="Filtrar por estado" 
                                        className="w-1/4" 
                                        onSelectionChange={(keys) => {
                                            const selectedKey = Array.from(keys)[0];
                                            setFiltroEstado(selectedKey || null);
                                        }}
                                    >
                                        {estados.map((estado) => (
                                            <SelectItem 
                                                key={estado.cN_Id_estado} 
                                                value={estado.cN_Id_estado.toString()}
                                            >
                                                {estado.cT_Nombre_estado}
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
                                
                                {tareasFiltradas.length === 0 ? (
                                    <EmptyState 
                                        tabId={tab.id} 
                                        onAddTask={() => handleOpenModal()} 
                                    />                                ) : (
                                    <TareaAccordion tareas={tareasFiltradas} onEdit={handleOpenEditModal} />
                                )}
                            </Tab>
                        );
                    }}
                </Tabs>
            )}

            <TareaModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                tarea={null} // Solo para crear nuevas tareas
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
