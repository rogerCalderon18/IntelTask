import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalBody,
    ModalFooter,
    Input,
    Select,
    SelectItem,
    Button,
    ModalContent,
    Textarea,
    Form,
    Spinner
} from "@heroui/react";
import { catalogosService } from "../../services/catalogosService";

const EditarTareaModal = ({ isOpen, onClose, onOpenChange, onSubmit, tarea }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [catalogos, setCatalogos] = useState({
        estados: [],
        prioridades: [],
        complejidades: [],
        usuarios: []
    });
    const [loadingCatalogos, setLoadingCatalogos] = useState(true);

    // Cargar catálogos cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            cargarCatalogos();
        }
    }, [isOpen]);

    const cargarCatalogos = async () => {
        try {
            setLoadingCatalogos(true);
            const catalogosData = await catalogosService.obtenerTodosCatalogos();
            setCatalogos(catalogosData);
        } catch (error) {
            console.error('Error al cargar catálogos:', error);
            // Usar datos por defecto en caso de error
            setCatalogos({
                estados: [
                    { cN_Id_estado: 1, cT_Nombre_estado: 'Completada' },
                    { cN_Id_estado: 2, cT_Nombre_estado: 'En progreso' },
                    { cN_Id_estado: 3, cT_Nombre_estado: 'Pendiente' }
                ],
                prioridades: [
                    { cN_Id_prioridad: 1, cT_Nombre_prioridad: 'Baja' },
                    { cN_Id_prioridad: 2, cT_Nombre_prioridad: 'Moderada' },
                    { cN_Id_prioridad: 3, cT_Nombre_prioridad: 'Media' },
                    { cN_Id_prioridad: 4, cT_Nombre_prioridad: 'Alta' },
                    { cN_Id_prioridad: 5, cT_Nombre_prioridad: 'Crítica' }
                ],
                complejidades: [
                    { cN_Id_complejidad: 1, cT_Nombre_complejidad: 'Baja' },
                    { cN_Id_complejidad: 2, cT_Nombre_complejidad: 'Media' },
                    { cN_Id_complejidad: 3, cT_Nombre_complejidad: 'Alta' }
                ],
                usuarios: [
                    { cN_Id_usuario: 702990350, cT_Nombre_usuario: 'Usuario 1' },
                    { cN_Id_usuario: 702990351, cT_Nombre_usuario: 'Usuario 2' },
                    { cN_Id_usuario: 702990352, cT_Nombre_usuario: 'Usuario 3' }
                ]
            });
        } finally {
            setLoadingCatalogos(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
          try {
            const formData = new FormData(e.currentTarget);        // Mapear los datos del formulario a la estructura esperada por el backend
        const responsableValue = formData.get('responsable');
        const tareaData = {
            CT_Titulo_tarea: formData.get('titulo'),
            CT_Descripcion_tarea: formData.get('descripcion'),
            CN_Id_complejidad: parseInt(formData.get('complejidad')),
            CN_Id_prioridad: parseInt(formData.get('prioridad')),
            CN_Id_estado: parseInt(formData.get('estado')),
            CF_Fecha_limite: formData.get('fechaLimite'),
            CN_Numero_GIS: formData.get('numeroGIS'),            CN_Usuario_asignado: responsableValue ? parseInt(responsableValue) : null
        };

            console.log('Datos a actualizar:', tareaData);
            await onSubmit(tareaData);
        } catch (error) {
            console.error('Error en el formulario:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingCatalogos) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    <ModalBody className="flex justify-center items-center p-8">
                        <Spinner 
                            size="lg" 
                            color="primary" 
                            label="Cargando formulario..." 
                            labelColor="primary"
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    // Formatear fecha para el input de fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        return date.toISOString().split('T')[0];
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <Form onSubmit={handleSubmit} className="w-full">
                            <ModalBody className="px-6 pt-6 w-full">
                                <h2 className="text-xl font-bold mb-4">
                                    Editar tarea - {tarea?.cN_Id_tarea ? String(tarea.cN_Id_tarea).padStart(2, '0') : '00'}
                                </h2>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-700 mb-1 block">Título:</label>
                                        <Input
                                            isRequired
                                            name="titulo"
                                            placeholder="Título de la tarea"
                                            defaultValue={tarea?.cT_Titulo_tarea || ""}
                                            variant="bordered"
                                            isDisabled={isSubmitting}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-700 mb-1 block">Descripción:</label>
                                        <Textarea
                                            isRequired
                                            name="descripcion"
                                            placeholder="Descripción de la tarea..."
                                            defaultValue={tarea?.cT_Descripcion_tarea || ""}
                                            minRows={4}
                                            variant="bordered"
                                            isDisabled={isSubmitting}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-700 mb-1 block">Número GIS:</label>
                                        <Input
                                            name="numeroGIS"
                                            placeholder="Número GIS"
                                            defaultValue={tarea?.cN_Numero_GIS || ""}
                                            variant="bordered"
                                            isDisabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-700 mb-1 block">Fecha límite:</label>
                                        <Input
                                            isRequired
                                            name="fechaLimite"
                                            type="date"
                                            defaultValue={formatearFecha(tarea?.cF_Fecha_limite)}
                                            variant="bordered"
                                            isDisabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-700 mb-1 block">Prioridad:</label>
                                        <Select
                                            isRequired
                                            name="prioridad"
                                            placeholder="Selecciona prioridad"
                                            defaultSelectedKeys={tarea?.cN_Id_prioridad ? [tarea.cN_Id_prioridad.toString()] : []}
                                            variant="bordered"
                                            isDisabled={isSubmitting}
                                        >
                                            {catalogos.prioridades.map((prioridad) => (
                                                <SelectItem 
                                                    key={prioridad.cN_Id_prioridad} 
                                                    value={prioridad.cN_Id_prioridad.toString()}
                                                >
                                                    {prioridad.cT_Nombre_prioridad}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-700 mb-1 block">Complejidad:</label>
                                        <Select
                                            isRequired
                                            name="complejidad"
                                            placeholder="Selecciona complejidad"
                                            defaultSelectedKeys={tarea?.cN_Id_complejidad ? [tarea.cN_Id_complejidad.toString()] : []}
                                            variant="bordered"
                                            isDisabled={isSubmitting}
                                        >
                                            {catalogos.complejidades.map((complejidad) => (
                                                <SelectItem 
                                                    key={complejidad.cN_Id_complejidad} 
                                                    value={complejidad.cN_Id_complejidad.toString()}
                                                >
                                                    {complejidad.cT_Nombre_complejidad}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>                                    <div>
                                        <label className="text-sm text-gray-700 mb-1 block">Responsable (Opcional):</label>
                                        <Select
                                            name="responsable"
                                            placeholder="Selecciona un usuario"
                                            defaultSelectedKeys={tarea?.cN_Usuario_asignado ? [tarea.cN_Usuario_asignado.toString()] : []}
                                            variant="bordered"
                                            isDisabled={isSubmitting}
                                        >
                                            {catalogos.usuarios.map((usuario) => (
                                                <SelectItem 
                                                    key={usuario.cN_Id_usuario} 
                                                    value={usuario.cN_Id_usuario.toString()}
                                                >
                                                    {usuario.cT_Nombre_usuario}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-700 mb-1 block">Estado:</label>
                                        <Select
                                            isRequired
                                            name="estado"
                                            placeholder="Selecciona estado"
                                            defaultSelectedKeys={tarea?.cN_Id_estado ? [tarea.cN_Id_estado.toString()] : []}
                                            variant="bordered"
                                            isDisabled={isSubmitting}
                                        >
                                            {catalogos.estados.map((estado) => (
                                                <SelectItem 
                                                    key={estado.cN_Id_estado} 
                                                    value={estado.cN_Id_estado.toString()}
                                                >
                                                    {estado.cT_Estado}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-800">Adjuntos:</label>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm text-gray-500">
                                                {tarea?.adjuntos?.length > 0
                                                    ? `${tarea.adjuntos.length} adjunto(s)`
                                                    : "No hay adjuntos..."}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="flat"
                                                size="sm"
                                                className="bg-sky-100 text-sky-700 rounded-lg px-3 py-1 ml-auto"
                                                isDisabled={isSubmitting}
                                            >
                                                <span className="mr-2">📎</span>
                                                Adjuntar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter className="px-6 pb-6 items-center justify-end w-full">
                                <div className="flex items-center">
                                    <Button 
                                        type="button"
                                        color="danger" 
                                        variant="flat"
                                        className="rounded-md px-6 mr-2" 
                                        onPress={onClose}
                                        isDisabled={isSubmitting}
                                    >
                                        Cerrar
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        color="primary" 
                                        className="text-white rounded-md px-6"
                                        isLoading={isSubmitting}
                                        spinner={<Spinner size="sm" color="current" />}
                                    >
                                        {isSubmitting ? "Actualizando..." : "Editar"}
                                    </Button>
                                </div>
                            </ModalFooter>
                        </Form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default EditarTareaModal;
