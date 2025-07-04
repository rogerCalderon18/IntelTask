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
import { I18nProvider } from "@react-aria/i18n";
import {datePickerUtils} from "../../utils/datePickerUtils";

const PermisoModal = ({ isOpen, onOpenChange, onClose, onSave, permiso }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [permisoLocal, setPermisoLocal] = useState({
        cT_Titulo_permiso: "",
        cT_Descripcion_permiso: "",
        cF_Fecha_hora_inicio_permiso: "",
        cF_Fecha_hora_fin_permiso: "",
    });

    // Inicializar datos del permiso cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setPermisoLocal({
                cT_Titulo_permiso: permiso?.cT_Titulo_permiso || "",
                cT_Descripcion_permiso: permiso?.cT_Descripcion_permiso || "",
                cF_Fecha_hora_inicio_permiso: permiso?.cF_Fecha_hora_inicio_permiso || "",
                cF_Fecha_hora_fin_permiso: permiso?.cF_Fecha_hora_fin_permiso || "",
            });
        }
    }, [isOpen, permiso]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            // Validar y convertir fechas a formato ISO string válido
            let fechaInicio = permisoLocal.cF_Fecha_hora_inicio_permiso;
            let fechaFin = permisoLocal.cF_Fecha_hora_fin_permiso;

            // Si las fechas son objetos Date o ZonedDateTime, convertirlas a ISO string
            if (fechaInicio && typeof fechaInicio === 'object') {
                fechaInicio = fechaInicio.toISOString ? fechaInicio.toISOString() : 
                             fechaInicio.toString ? fechaInicio.toString() : fechaInicio;
            }
            if (fechaFin && typeof fechaFin === 'object') {
                fechaFin = fechaFin.toISOString ? fechaFin.toISOString() : 
                          fechaFin.toString ? fechaFin.toString() : fechaFin;
            }

            // Asegurar que las fechas sean strings válidos
            if (fechaInicio && typeof fechaInicio === 'string' && !fechaInicio.includes('T')) {
                fechaInicio = fechaInicio + 'T00:00:00.000Z';
            }
            if (fechaFin && typeof fechaFin === 'string' && !fechaFin.includes('T')) {
                fechaFin = fechaFin + 'T00:00:00.000Z';
            }

            const permisoData = {
                cT_Titulo_permiso: data.titulo?.trim(),
                cT_Descripcion_permiso: data.descripcion?.trim(),
                cF_Fecha_hora_inicio_permiso: fechaInicio,
                cF_Fecha_hora_fin_permiso: fechaFin,
            };

            console.log('Datos del permiso a enviar:', permisoData);
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
                                    value={permisoLocal.cT_Titulo_permiso}
                                    onChange={(e) => setPermisoLocal(prev => ({
                                        ...prev,
                                        cT_Titulo_permiso: e.target.value
                                    }))}
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
                                    value={permisoLocal.cT_Descripcion_permiso}
                                    onChange={(e) => setPermisoLocal(prev => ({
                                        ...prev,
                                        cT_Descripcion_permiso: e.target.value
                                    }))}
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
                                    <I18nProvider locale="es-ES">
                                        <DatePicker
                                            isRequired
                                            label="Fecha y Hora de Inicio"
                                            labelPlacement="outside"
                                            showMonthAndYearPickers
                                            hideTimeZone
                                            variant="bordered"
                                            granularity="minute"
                                            hourCycle={12}
                                            {...datePickerUtils.getPermissionDatePickerPropsComplete({
                                                currentValue: permisoLocal.cF_Fecha_hora_inicio_permiso,
                                                onChange: setPermisoLocal,
                                                fieldName: 'cF_Fecha_hora_inicio_permiso'
                                            })}
                                            validate={(value) => {
                                                if (!value) {
                                                    return "La fecha de inicio es requerida";
                                                }
                                            }}
                                        />
                                    </I18nProvider>

                                    <I18nProvider locale="es-ES">
                                        <DatePicker
                                            isRequired
                                            label="Fecha y Hora de Fin"
                                            labelPlacement="outside"
                                            showMonthAndYearPickers
                                            hideTimeZone
                                            variant="bordered"
                                            granularity="minute"
                                            hourCycle={12}
                                            {...datePickerUtils.getPermissionDatePickerPropsComplete({
                                                currentValue: permisoLocal.cF_Fecha_hora_fin_permiso,
                                                onChange: setPermisoLocal,
                                                maxDateISO: permisoLocal.cF_Fecha_hora_inicio_permiso,
                                                fieldName: 'cF_Fecha_hora_fin_permiso'
                                            })}
                                            validate={(value) => {
                                                if (!value) {
                                                    return "La fecha de fin es requerida";
                                                }
                                                // Validar que la fecha de fin sea posterior a la de inicio
                                                if (permisoLocal.cF_Fecha_hora_inicio_permiso && value) {
                                                    const fechaInicio = new Date(permisoLocal.cF_Fecha_hora_inicio_permiso);
                                                    const fechaFin = new Date(value.toDate());
                                                    if (fechaFin <= fechaInicio) {
                                                        return "La fecha de fin debe ser posterior a la fecha de inicio";
                                                    }
                                                }
                                            }}
                                        />
                                    </I18nProvider>
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
