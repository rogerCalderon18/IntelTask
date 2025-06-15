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
import { FaPaperclip } from "react-icons/fa";
import { catalogosService } from "../../services/catalogosService";
import {useSession} from "next-auth/react";

const TareaModal = ({ isOpen, onClose, onOpenChange, onSubmit, tarea }) => {
    const { data: session } = useSession();
    const [tareaLocal, setTareaLocal] = useState(tarea || {});
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

    // Actualizar tarea local cuando cambia la prop tarea
    useEffect(() => {
        setTareaLocal(tarea || {});
    }, [tarea]);

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

            // Mapear los datos del formulario a la estructura esperada por el backend
            const tareaData = {
                cT_Titulo_tarea: formData.get('titulo'),
                cT_Descripcion_tarea: formData.get('descripcion'),
                cN_Id_complejidad: parseInt(formData.get('complejidad')),
                cN_Id_prioridad: parseInt(formData.get('prioridad')),
                cN_Id_estado: tarea ? parseInt(formData.get('estado')) : 1, // Estado inicial para nuevas tareas
                cF_Fecha_limite: formData.get('fechaLimite'),
                cN_Numero_GIS: formData.get('numeroGIS'),
                cN_Usuario_creador: session?.user?.id, // Usuario actual (esto debería venir del contexto de autenticación)
                cN_Usuario_asignado: tareaLocal.cN_Usuario_asignado || parseInt(formData.get('responsable')),
                cT_Descripcion_espera: formData.get('descripcionEspera') || null,
                cN_Tarea_origen: null // Para subtareas
            };

            console.log('Datos a enviar:', tareaData);
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <Form onSubmit={handleSubmit} className="w-full">
                            <ModalBody className="px-6 pt-6 w-full">
                                <h2 className="text-xl font-bold mb-4">
                                    {tarea ? "Editar tarea" : "Nueva tarea"}
                                </h2>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <Input
                                        isRequired
                                        name="titulo"
                                        label="Título de la tarea"
                                        labelPlacement="outside"
                                        placeholder="Título de la tarea"
                                        defaultValue={tarea?.cT_Titulo_tarea || ""}
                                        variant="bordered"
                                        errorMessage="El título es obligatorio"
                                        className="col-span-2"
                                        isDisabled={isSubmitting}
                                    />

                                    <Textarea
                                        isRequired
                                        name="descripcion"
                                        label="Descripción de la tarea"
                                        labelPlacement="outside"
                                        placeholder="Descripción de la tarea..."
                                        defaultValue={tarea?.cT_Descripcion_tarea || ""}
                                        minRows={3}
                                        variant="bordered"
                                        errorMessage="La descripción es obligatoria"
                                        className="col-span-2"
                                        isDisabled={isSubmitting}
                                    />

                                    <Input
                                        name="numeroGIS"
                                        label="Número GIS"
                                        labelPlacement="outside"
                                        placeholder="Número GIS"
                                        defaultValue={tarea?.cN_Numero_GIS || ""}
                                        variant="bordered"
                                        isDisabled={isSubmitting}
                                    />

                                    <Input
                                        isRequired
                                        name="fechaLimite"
                                        label="Fecha límite"
                                        labelPlacement="outside"
                                        type="date"
                                        defaultValue={tarea?.cF_Fecha_limite ? new Date(tarea.cF_Fecha_limite).toISOString().split('T')[0] : ""}
                                        variant="bordered"
                                        errorMessage="La fecha límite es obligatoria"
                                        isDisabled={isSubmitting}
                                    />

                                    <Select
                                        isRequired
                                        name="prioridad"
                                        label="Prioridad"
                                        labelPlacement="outside"
                                        placeholder="Selecciona prioridad"
                                        defaultSelectedKeys={tarea?.cN_Id_prioridad ? [tarea.cN_Id_prioridad.toString()] : []}
                                        variant="bordered"
                                        errorMessage="La prioridad es obligatoria"
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

                                    <Select
                                        isRequired
                                        name="complejidad"
                                        label="Complejidad"
                                        labelPlacement="outside"
                                        placeholder="Selecciona complejidad"
                                        defaultSelectedKeys={tarea?.cN_Id_complejidad ? [tarea.cN_Id_complejidad.toString()] : []}
                                        variant="bordered"
                                        errorMessage="La complejidad es obligatoria"
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

                                    <Select
                                        name="responsable"
                                        label="Responsable"
                                        labelPlacement="outside"
                                        placeholder="Selecciona un usuario"
                                        defaultSelectedKeys={tarea?.cN_Usuario_asignado ? [tarea.cN_Usuario_asignado.toString()] : []}
                                        onSelectionChange={(selectedKeys) => {
                                            const selectedValue = Array.from(selectedKeys)[0];
                                            if (selectedValue && !isSubmitting) {
                                                setTareaLocal(prev => ({
                                                    ...prev,
                                                    cN_Usuario_asignado: parseInt(selectedValue)
                                                }));
                                            }
                                        }}
                                        variant="bordered"
                                        errorMessage="El responsable es obligatorio"
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

                                    <Select
                                        isRequired
                                        name="estado"
                                        label="Estado"
                                        labelPlacement="outside"
                                        placeholder="Selecciona estado"
                                        defaultSelectedKeys={tarea?.cN_Id_estado ? [tarea.cN_Id_estado.toString()] : []}
                                        variant="bordered"
                                        errorMessage="El estado es obligatorio"
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

                                    <Textarea
                                        name="descripcionEspera"
                                        label="Descripción de espera (Opcional)"
                                        labelPlacement="outside"
                                        placeholder="Descripción de espera..."
                                        defaultValue={tarea?.cT_Descripcion_espera || ""}
                                        minRows={2}
                                        variant="bordered"
                                        className="col-span-2"
                                        isDisabled={isSubmitting}
                                    />

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
                                                <FaPaperclip className="mr-2" />
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
                                        {isSubmitting ? "Guardando..." : (tarea ? "Guardar" : "Crear")}
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

export default TareaModal;
