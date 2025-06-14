import React from "react";
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
    Form
} from "@heroui/react";
import { FaPaperclip } from "react-icons/fa";

const TareaModal = ({ isOpen, onClose, onOpenChange, onSubmit, tarea }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        onSubmit({ ...data, adjuntos: [] }); // Puedes manejar los adjuntos por separado si necesitas
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <Form onSubmit={handleSubmit} className="w-full">
                            <ModalBody className="px-6 pt-6 w-full">
                                <h2 className="text-xl font-bold mb-4">Nueva tarea</h2>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <Input
                                        isRequired
                                        name="titulo"
                                        label="Título de la tarea"
                                        labelPlacement="outside"
                                        placeholder="Título de la tarea"
                                        defaultValue={tarea?.titulo}
                                        variant="bordered"
                                        errorMessage="El título es obligatorio"
                                        className="col-span-2"
                                    />

                                    <Textarea
                                        isRequired
                                        name="descripcion"
                                        label="Descripción de la tarea"
                                        labelPlacement="outside"
                                        placeholder="Texto de notificación …"
                                        defaultValue={tarea?.descripcion}
                                        minRows={3}
                                        variant="bordered"
                                        errorMessage="La descripción es obligatoria"
                                        className="col-span-2"
                                    />

                                    <Input
                                        name="numeroGIS"
                                        label="Número GIS"
                                        labelPlacement="outside"
                                        placeholder="Número GIS"
                                        defaultValue={tarea?.numeroGIS}
                                        variant="bordered"
                                    />

                                    <Input
                                        isRequired
                                        name="fechaLimite"
                                        label="Fecha límite"
                                        labelPlacement="outside"
                                        type="date"
                                        defaultValue={tarea?.fechaLimite}
                                        variant="bordered"
                                    />

                                    <Select
                                        isRequired
                                        name="prioridad"
                                        label="Prioridad"
                                        labelPlacement="outside"
                                        placeholder="Prioridad"
                                        defaultSelectedKeys={[tarea?.prioridad]}
                                        variant="bordered"
                                        errorMessage="La prioridad es obligatoria"
                                    >
                                        <SelectItem value="1">Baja</SelectItem>
                                        <SelectItem value="2">Moderada</SelectItem>
                                        <SelectItem value="3">Media</SelectItem>
                                        <SelectItem value="4">Alta</SelectItem>
                                        <SelectItem value="5">Crítica</SelectItem>
                                    </Select>

                                    <Select
                                        isRequired
                                        name="complejidad"
                                        label="Complejidad"
                                        labelPlacement="outside"
                                        placeholder="Complejidad"
                                        defaultSelectedKeys={[tarea?.complejidad]}
                                        variant="bordered"
                                        errorMessage="La complejidad es obligatoria"
                                    >
                                        <SelectItem value="Baja">Baja</SelectItem>
                                        <SelectItem value="Media">Media</SelectItem>
                                        <SelectItem value="Alta">Alta</SelectItem>
                                    </Select>

                                    <Select
                                        isRequired
                                        name="responsable"
                                        label="Responsable"
                                        labelPlacement="outside"
                                        placeholder="Usuarios"
                                        defaultSelectedKeys={[tarea?.responsable]}
                                        variant="bordered"
                                        errorMessage="El responsable es obligatorio"
                                    >
                                        <SelectItem value="Usuario 1">Usuario 1</SelectItem>
                                        <SelectItem value="Usuario 2">Usuario 2</SelectItem>
                                        <SelectItem value="Usuario 3">Usuario 3</SelectItem>
                                    </Select>

                                    <Input
                                        isRequired
                                        name="fechaFinalizacion"
                                        label="Fecha de finalización"
                                        labelPlacement="outside"
                                        type="date"
                                        defaultValue={tarea?.fechaFinalizacion}
                                        variant="bordered"
                                        errorMessage="La fecha de finalización es obligatoria"
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
                                                variant="flat"
                                                size="sm"
                                                className="bg-sky-100 text-sky-700 rounded-lg px-3 py-1 ml-auto"
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
                                    <Button color="danger" className="rounded-md px-6 mr-2" onPress={onClose}>
                                        Cerrar
                                    </Button>
                                    <Button type="submit" color="primary" className="text-white rounded-md px-6">
                                        {tarea ? "Guardar" : "Crear"}
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
