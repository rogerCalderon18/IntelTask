import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    DatePicker,
    Form,
} from "@heroui/react";
import { now, getLocalTimeZone, parseAbsoluteToLocal } from "@internationalized/date";

const PermisoModal = ({ isOpen, onOpenChange, onClose, onSave, permiso }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            const permisoData = {
                cT_Titulo_permiso: data.titulo?.trim(),
                cT_Descripcion_permiso: data.descripcion?.trim(),
                cF_Fecha_hora_inicio_permiso: data.fechaInicio,
                cF_Fecha_hora_fin_permiso: data.fechaFin,
            };

            await onSave(permisoData);
        } catch (error) {
            console.error("Error al guardar permiso:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-semibold">
                                {permiso ? "Editar Permiso" : "Nuevo Permiso"}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {permiso ? "Modifica los datos del permiso" : "Complete la información para solicitar un permiso"}
                            </p>
                        </ModalHeader>
                        <Form
                            className="w-full space-y-4"
                            validationBehavior="native"
                            onSubmit={handleSubmit}
                        >
                            <ModalBody  className="px-6 pt-6 w-full">
                                {/* Título */}
                                <Input
                                    name="titulo"
                                    label="Título del Permiso"
                                    placeholder="Ej: Permiso médico, Vacaciones, etc."
                                    defaultValue={permiso?.cT_Titulo_permiso || permiso?.titulo || ""}
                                    isRequired
                                    validate={(value) => {
                                        if (!value || !value.trim()) {
                                            return "El título es requerido";
                                        }
                                    }}
                                />

                                {/* Descripción */}
                                <Textarea
                                    name="descripcion"
                                    label="Descripción"
                                    placeholder="Describe el motivo y detalles del permiso"
                                    defaultValue={permiso?.cT_Descripcion_permiso || permiso?.descripcion || ""}
                                    minRows={3}
                                    maxRows={6}
                                    isRequired
                                    validate={(value) => {
                                        if (!value || !value.trim()) {
                                            return "La descripción es requerida";
                                        }
                                    }}
                                />

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DatePicker
                                        name="fechaInicio"
                                        label="Fecha y Hora de Inicio"
                                        defaultValue={
                                            permiso?.cF_Fecha_hora_inicio_permiso
                                                ? parseAbsoluteToLocal(new Date(permiso.cF_Fecha_hora_inicio_permiso).toISOString())
                                                : null
                                        }
                                        showTimeField
                                        isRequired
                                        validate={(value) => {
                                            if (!value) {
                                                return "La fecha de inicio es requerida";
                                            }
                                        }}
                                    />

                                    <DatePicker
                                        name="fechaFin"
                                        label="Fecha y Hora de Fin"
                                        defaultValue={
                                            permiso?.cF_Fecha_hora_fin_permiso
                                                ? parseAbsoluteToLocal(new Date(permiso.cF_Fecha_hora_fin_permiso).toISOString())
                                                : null
                                        }
                                        showTimeField
                                        isRequired
                                        validate={(value) => {
                                            if (!value) {
                                                return "La fecha de fin es requerida";
                                            }
                                            // Validar que la fecha de fin sea posterior a la de inicio
                                            const fechaInicioInput = document.querySelector('input[name="fechaInicio"]');
                                            if (fechaInicioInput?.value && value) {
                                                const fechaInicio = new Date(fechaInicioInput.value);
                                                const fechaFin = new Date(value.toDate());
                                                if (fechaFin <= fechaInicio) {
                                                    return "La fecha de fin debe ser posterior a la fecha de inicio";
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </ModalBody>

                            <ModalFooter className="px-6 pb-6 items-center justify-end w-full">
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={handleClose}
                                        isDisabled={isLoading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        color="primary"
                                        type="submit"
                                        isLoading={isLoading}
                                    >
                                        {permiso ? "Actualizar" : "Crear"} Permiso
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

export default PermisoModal;
