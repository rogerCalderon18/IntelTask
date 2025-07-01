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
    DatePicker,
    Form,
    Spinner
} from "@heroui/react";
import { catalogosService } from "../../services/catalogosService";
import { useSession } from "next-auth/react";
import { parseZonedDateTime, getLocalTimeZone, now } from "@internationalized/date";

const TareaModal = ({ isOpen, onClose, onOpenChange, onSubmit, tarea, tareaPadre = null }) => {
    console.log("tarea", tarea);
    const { data: session, status } = useSession();
    const [tareaLocal, setTareaLocal] = useState(tarea || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [catalogos, setCatalogos] = useState({
        estados: [],
        prioridades: [],
        complejidades: [],
        usuarios: []
    });
    const [loadingCatalogos, setLoadingCatalogos] = useState(true);

    useEffect(() => {
        if (isOpen && session?.user?.id && status === 'authenticated') {
            cargarCatalogos();
        }
    }, [isOpen]);

    useEffect(() => {
        setTareaLocal(tarea || {});
        console.log("Tarea local actualizada:", tareaLocal);
    }, [tarea]);

    console.log("tareas Padre", tareaPadre);


    const cargarCatalogos = async () => {
        try {
            setLoadingCatalogos(true);
            const catalogosData = await catalogosService.obtenerTodosCatalogos(session?.user?.id);
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
                cN_Id_estado: tarea ? parseInt(formData.get('estado')) : 1,
                cF_Fecha_limite: tareaLocal.cF_Fecha_limite || formData.get('fechaLimite'),
                cN_Numero_GIS: formData.get('numeroGIS'),
                cN_Usuario_creador: session?.user?.id,
                cN_Usuario_asignado: responsableValue ? parseInt(responsableValue) : null,
                cN_Tarea_origen: tareaPadre ? (tareaPadre.cN_Id_tarea || tareaPadre.id) : null
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
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange} size="2xl" isDismissable={false}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <Form onSubmit={handleSubmit} className="w-full">
                            <ModalBody className="px-6 pt-6 w-full">
                                <h2 className="text-xl font-bold mb-4">
                                    {tareaPadre ? (tarea ? "Editar subtarea" : "Nueva subtarea") : (tarea ? "Editar tarea" : "Nueva tarea")}
                                </h2>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    {tareaPadre && (
                                        <div className="col-span-2">
                                            <Input
                                                name="tareaPadre"
                                                label="Tarea Padre"
                                                labelPlacement="outside"
                                                value={`Tarea #${String(tareaPadre.cN_Id_tarea).padStart(2, '0')}`}
                                                variant="bordered"
                                                isDisabled={true}
                                                className="bg-gray-50"
                                                startContent={
                                                    <span className="text-gray-500 text-sm">📋</span>
                                                }
                                            />
                                        </div>
                                    )}

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

                                    <Input
                                        name="numeroGIS"
                                        label="Número GIS"
                                        labelPlacement="outside"
                                        placeholder="Número GIS"
                                        defaultValue={tarea?.cN_Numero_GIS || ""}
                                        variant="bordered"
                                        isDisabled={isSubmitting}
                                    />

                                    <DatePicker
                                        isRequired
                                        label="Fecha y hora límite"
                                        labelPlacement="outside"
                                        showMonthAndYearPickers
                                        hideTimeZone
                                        variant="bordered"
                                        granularity="minute"
                                        value={
                                            tareaLocal.cF_Fecha_limite
                                                ? parseZonedDateTime(tareaLocal.cF_Fecha_limite.replace('.000Z', '') + `[${getLocalTimeZone()}]`)
                                                : tarea?.cF_Fecha_limite
                                                    ? parseZonedDateTime(tarea.cF_Fecha_limite.replace('.000Z', '') + `[${getLocalTimeZone()}]`)
                                                    : null
                                        }
                                        onChange={(date) => {
                                            if (date) {
                                                const isoString = date.toDate().toISOString();
                                                setTareaLocal(prev => ({
                                                    ...prev,
                                                    cF_Fecha_limite: isoString
                                                }));
                                            } else {
                                                setTareaLocal(prev => ({
                                                    ...prev,
                                                    cF_Fecha_limite: ""
                                                }));
                                            }
                                        }}
                                        minValue={now(getLocalTimeZone())}
                                        maxValue={tareaPadre?.cF_Fecha_limite ? parseZonedDateTime(tareaPadre.cF_Fecha_limite.replace('.000Z', '') + `[${getLocalTimeZone()}]`) : undefined}
                                        errorMessage="La fecha y hora límite son requeridas"
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
                                        label="Responsable (Opcional)"
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
