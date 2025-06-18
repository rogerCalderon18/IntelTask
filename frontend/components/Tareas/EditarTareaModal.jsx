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
    Form,
    Spinner
} from "@heroui/react";
import { catalogosService } from "../../services/catalogosService";
import GestorAdjuntos from "./GestorAdjuntos";

const EditarTareaModal = ({ isOpen, onClose, onOpenChange, onSubmit, tarea, tareaOrigenId = null }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [catalogos, setCatalogos] = useState({
        estados: [],
        prioridades: [],
        complejidades: [],
        usuarios: []
    });
    const [loadingCatalogos, setLoadingCatalogos] = useState(true);

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
        } finally {
            setLoadingCatalogos(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            const responsableValue = formData.get('responsable');
            const tareaData = {
                cT_Titulo_tarea: formData.get('titulo'),
                cT_Descripcion_tarea: formData.get('descripcion'),
                cN_Id_complejidad: parseInt(formData.get('complejidad')),
                cN_Id_prioridad: parseInt(formData.get('prioridad')),
                cN_Id_estado: parseInt(formData.get('estado')),
                cF_Fecha_limite: formData.get('fechaLimite'),
                cN_Numero_GIS: formData.get('numeroGIS'),                
                cN_Usuario_asignado: responsableValue ? parseInt(responsableValue) : null,
                CN_Tarea_origen: tareaOrigenId // Incluir el ID de la tarea origen si es una subtarea
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
                                    {tareaOrigenId ? 'Editar subtarea' : 'Editar tarea'} - {tarea?.cN_Id_tarea ? String(tarea.cN_Id_tarea).padStart(2, '0') : '00'}
                                </h2>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    {/* Campo de Tarea Origen para subtareas */}
                                    {tareaOrigenId && (
                                        <div className="col-span-2">
                                            <label className="text-sm text-gray-700 mb-1 block">Tarea Origen:</label>
                                            <Input
                                                name="tareaOrigen"
                                                value={`Tarea #${String(tareaOrigenId).padStart(2, '0')}`}
                                                variant="bordered"
                                                isDisabled={true}
                                                className="w-full bg-gray-50"
                                                startContent={
                                                    <span className="text-gray-500 text-sm">📋</span>
                                                }
                                            />
                                        </div>
                                    )}

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


                                    <div className="col-span-2 flex flex-col gap-1">
                                        <label className="text-sm font-medium text-foreground">
                                            Descripción de la tarea <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            placeholder="Descripción de la tarea..."
                                            defaultValue={tarea?.cT_Descripcion_tarea || ""}
                                            rows={3}
                                            className="w-full px-3 py-2 rounded-medium border-2 border-default-200 hover:border-default-300 focus:border-black transition-all duration-150 ease-in-out focus:outline-none resize-none text-sm overflow-hidden"
                                            disabled={isSubmitting}
                                            required
                                            style={{ minHeight: '80px', maxHeight: '120px' }}
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
                                                    {complejidad.cT_Nombre}
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
                                        <GestorAdjuntos
                                            idTarea={tarea?.cN_Id_tarea}
                                            onAdjuntosChange={(adjuntos) => console.log('Adjuntos actualizados:', adjuntos)}
                                        />
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter className="px-6 pb-6 items-center justify-end w-full">
                                <div className="flex items-center">
                                    <Button
                                        type="button"
                                        color="danger"
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
