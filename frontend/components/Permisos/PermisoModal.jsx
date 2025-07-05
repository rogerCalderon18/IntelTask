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
import { getLocalTimeZone, now, parseZonedDateTime } from "@internationalized/date";

const PermisoModal = ({ isOpen, onOpenChange, onClose, onSave, permiso }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [timeValidationErrors, setTimeValidationErrors] = useState({});
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

    // Función para convertir ISO string a ZonedDateTime
    const parseToZonedDateTime = (isoString) => {
        if (!isoString) return null;
        try {
            const date = new Date(isoString);
            const localTimeZone = getLocalTimeZone();

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            const zonedDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}[${localTimeZone}]`;
            return parseZonedDateTime(zonedDateTimeString);
        } catch (error) {
            console.error('Error parsing date:', error);
            return null;
        }
    };

    // Función para validar horarios de trabajo
    const validateWorkingHours = (date, fieldName) => {
        if (!date) return;

        const hour = date.hour;
        const minute = date.minute;

        // Validar horas de trabajo (7:00 AM - 4:30 PM)
        if (hour < 7 || hour > 16 || (hour === 16 && minute > 30)) {
            setTimeValidationErrors(prev => ({
                ...prev,
                [fieldName]: "Horario permitido: 7:00 AM - 4:30 PM"
            }));
            return false;
        } else {
            setTimeValidationErrors(prev => ({
                ...prev,
                [fieldName]: null
            }));
            return true;
        }
    };

    // Manejar cambio en fecha de inicio
    const handleFechaInicioChange = (date) => {
        if (date) {
            // Validar que no sea fin de semana
            if (isDateUnavailable(date)) {
                setTimeValidationErrors(prev => ({
                    ...prev,
                    fechaInicio: "No se pueden seleccionar fines de semana"
                }));
                return;
            }

            const isoString = date.toDate().toISOString();
            
            // Actualizar fecha de inicio
            setPermisoLocal(prev => ({
                ...prev,
                cF_Fecha_hora_inicio_permiso: isoString
            }));

            // Validar horario
            validateWorkingHours(date, 'fechaInicio');

            // Si hay fecha de fin, actualizarla para que sea el mismo día
            if (permisoLocal.cF_Fecha_hora_fin_permiso) {
                const fechaFinActual = parseToZonedDateTime(permisoLocal.cF_Fecha_hora_fin_permiso);
                if (fechaFinActual) {
                    // Mantener la hora de la fecha de fin pero cambiar el día
                    const nuevaFechaFin = date.set({ 
                        hour: fechaFinActual.hour, 
                        minute: fechaFinActual.minute 
                    });
                    const nuevaFechaFinISO = nuevaFechaFin.toDate().toISOString();
                    
                    setPermisoLocal(prev => ({
                        ...prev,
                        cF_Fecha_hora_fin_permiso: nuevaFechaFinISO
                    }));

                    // Validar la nueva fecha de fin
                    validateWorkingHours(nuevaFechaFin, 'fechaFin');
                    validateFechaOrder(date, nuevaFechaFin);
                }
            } else {
                // Si no hay fecha de fin, establecer una hora por defecto (por ejemplo, 1 hora después)
                const fechaFinPorDefecto = date.add({ hours: 1 });
                // Asegurar que no exceda el horario laboral
                if (fechaFinPorDefecto.hour > 16 || (fechaFinPorDefecto.hour === 16 && fechaFinPorDefecto.minute > 30)) {
                    // Si excede, poner 4:30 PM
                    const fechaFinLimite = date.set({ hour: 16, minute: 30 });
                    const fechaFinLimiteISO = fechaFinLimite.toDate().toISOString();
                    setPermisoLocal(prev => ({
                        ...prev,
                        cF_Fecha_hora_fin_permiso: fechaFinLimiteISO
                    }));
                    validateWorkingHours(fechaFinLimite, 'fechaFin');
                    validateFechaOrder(date, fechaFinLimite);
                } else {
                    const fechaFinPorDefectoISO = fechaFinPorDefecto.toDate().toISOString();
                    setPermisoLocal(prev => ({
                        ...prev,
                        cF_Fecha_hora_fin_permiso: fechaFinPorDefectoISO
                    }));
                    validateWorkingHours(fechaFinPorDefecto, 'fechaFin');
                    validateFechaOrder(date, fechaFinPorDefecto);
                }
            }
        } else {
            setPermisoLocal(prev => ({
                ...prev,
                cF_Fecha_hora_inicio_permiso: ""
            }));
            setTimeValidationErrors(prev => ({
                ...prev,
                fechaInicio: null
            }));
        }
    };

    // Manejar cambio en fecha de fin
    const handleFechaFinChange = (date) => {
        if (date && permisoLocal.cF_Fecha_hora_inicio_permiso) {
            const fechaInicio = parseToZonedDateTime(permisoLocal.cF_Fecha_hora_inicio_permiso);
            
            if (fechaInicio) {
                // Forzar que sea el mismo día que la fecha de inicio, solo cambiar la hora
                const fechaFinMismoDia = fechaInicio.set({ 
                    hour: date.hour, 
                    minute: date.minute 
                });
                
                const isoString = fechaFinMismoDia.toDate().toISOString();
                
                setPermisoLocal(prev => ({
                    ...prev,
                    cF_Fecha_hora_fin_permiso: isoString
                }));

                // Validar horario y orden
                validateWorkingHours(fechaFinMismoDia, 'fechaFin');
                validateFechaOrder(fechaInicio, fechaFinMismoDia);
            }
        } else if (date) {
            // Si no hay fecha de inicio, usar la fecha seleccionada
            const isoString = date.toDate().toISOString();
            setPermisoLocal(prev => ({
                ...prev,
                cF_Fecha_hora_fin_permiso: isoString
            }));
            validateWorkingHours(date, 'fechaFin');
        } else {
            setPermisoLocal(prev => ({
                ...prev,
                cF_Fecha_hora_fin_permiso: ""
            }));
            setTimeValidationErrors(prev => ({
                ...prev,
                fechaFin: null
            }));
        }
    };

  // Validar que fecha de fin sea posterior a fecha de inicio
  const validateFechaOrder = (fechaInicio, fechaFin) => {
    if (fechaInicio && fechaFin) {
      const inicioTime = fechaInicio.hour * 60 + fechaInicio.minute;
      const finTime = fechaFin.hour * 60 + fechaFin.minute;

      if (finTime <= inicioTime) {
        setTimeValidationErrors(prev => ({
          ...prev,
          fechaFin: "La hora de fin debe ser posterior a la hora de inicio"
        }));
        return false;
      } else {
        setTimeValidationErrors(prev => ({
          ...prev,
          fechaFin: prev.fechaFin === "La hora de fin debe ser posterior a la hora de inicio" ? null : prev.fechaFin
        }));
        return true;
      }
    }
    return true;
  };

  // Función para deshabilitar fines de semana
  const isDateUnavailable = (date) => {
    // Deshabilitar fines de semana (sábado = 6, domingo = 0)
    const dayOfWeek = date.toDate(getLocalTimeZone()).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

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
                            <ModalBody className="px-6 pt-6 w-full">
                                {/* Título */}
                                <Input
                                    name="titulo"
                                    label="Título del Permiso"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    placeholder="Ej: Permiso médico, etc."
                                    value={permisoLocal.cT_Titulo_permiso}
                                    onChange={(e) => setPermisoLocal(prev => ({
                                        ...prev,
                                        cT_Titulo_permiso: e.target.value
                                    }))}
                                    isRequired
                                    isDisabled={isLoading}
                                    validate={(value) => {
                                        if (!value || !value.trim()) {
                                            return "El título es requerido";
                                        }
                                    }}
                                />
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-sm font-medium text-foreground">
                                        Descripción del Permiso <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        placeholder="Describa el motivo y detalles del permiso"
                                        defaultValue={permisoLocal.cT_Descripcion_permiso || ""}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-medium border-2 border-default-200 hover:border-default-300 focus:border-black transition-all duration-150 ease-in-out focus:outline-none resize-none text-sm overflow-hidden"
                                        disabled={isLoading}
                                        required
                                        style={{ minHeight: '80px', maxHeight: '120px' }}
                                    />
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <DatePicker
                                            isRequired
                                            label="Fecha y Hora de Inicio"
                                            labelPlacement="outside"
                                            showMonthAndYearPickers
                                            hideTimeZone
                                            variant="bordered"
                                            hourCycle={12}
                                            granularity="minute"
                                            value={parseToZonedDateTime(permisoLocal.cF_Fecha_hora_inicio_permiso)}
                                            onChange={handleFechaInicioChange}
                                            isDateUnavailable={isDateUnavailable}
                                            minValue={now(getLocalTimeZone())}
                                            errorMessage={timeValidationErrors.fechaInicio || "La fecha de inicio es requerida (Lunes a Viernes, 7:00 AM - 4:30 PM)"}
                                            isInvalid={!!timeValidationErrors.fechaInicio}
                                            isDisabled={isLoading}
                                        />
                                    </div>

                                    <div>
                                        <DatePicker
                                            isRequired
                                            label="Fecha y Hora de Fin"
                                            labelPlacement="outside"
                                            showMonthAndYearPickers={!permisoLocal.cF_Fecha_hora_inicio_permiso}
                                            hideTimeZone
                                            hourCycle={12}
                                            variant="bordered"
                                            granularity="minute"
                                            value={parseToZonedDateTime(permisoLocal.cF_Fecha_hora_fin_permiso)}
                                            onChange={handleFechaFinChange}
                                            isDateUnavailable={isDateUnavailable}
                                            minValue={permisoLocal.cF_Fecha_hora_inicio_permiso ? 
                                                parseToZonedDateTime(permisoLocal.cF_Fecha_hora_inicio_permiso)?.set({ hour: 7, minute: 0 }) : 
                                                now(getLocalTimeZone())
                                            }
                                            maxValue={permisoLocal.cF_Fecha_hora_inicio_permiso ? 
                                                parseToZonedDateTime(permisoLocal.cF_Fecha_hora_inicio_permiso)?.set({ hour: 16, minute: 30 }) : 
                                                undefined
                                            }
                                            errorMessage={timeValidationErrors.fechaFin || "La fecha de fin es requerida (Lunes a Viernes, 7:00 AM - 4:30 PM)"}
                                            isInvalid={!!timeValidationErrors.fechaFin}
                                            isDisabled={isLoading || !permisoLocal.cF_Fecha_hora_inicio_permiso}
                                            placeholder={!permisoLocal.cF_Fecha_hora_inicio_permiso ? "Seleccione primero la fecha de inicio" : "Seleccione la hora de fin"}
                                        />
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter className="px-6 pb-6 items-center justify-end w-full">
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        color="danger"
                                        className="bg-danger text-white"
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
