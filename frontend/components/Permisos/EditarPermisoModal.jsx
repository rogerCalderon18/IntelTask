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
  Select,
  SelectItem,
  Form,
} from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import {datePickerUtils} from "../../utils/datePickerUtils";
import { notificacionService } from "../../services/notificacionService";
import { toast } from "react-toastify";
import { getLocalTimeZone, now, parseZonedDateTime } from "@internationalized/date";

const EditarPermisoModal = ({ isOpen, onOpenChange, onClose, onSave, permiso, estados, tipoSeccion }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(
    String(permiso?.cN_Id_estado || permiso?.estado || "1")
  );
  const [mostrarJustificacionRechazo, setMostrarJustificacionRechazo] = useState(false);
  const [timeValidationErrors, setTimeValidationErrors] = useState({});
  const [permisoLocal, setPermisoLocal] = useState({
    cT_Titulo_permiso: "",
    cT_Descripcion_permiso: "",
    cF_Fecha_hora_inicio_permiso: "",
    cF_Fecha_hora_fin_permiso: "",
    cT_Descripcion_rechazo: "",
  });

  // Estados permitidos para permisos
  const estadosPermiso = [
    { key: "1", label: "Registrado" },
    { key: "6", label: "Aprobado" },
    { key: "15", label: "Rechazado" }
  ];

  // Determinar si es solo revisión (solo puede cambiar estado)
  const esSoloRevision = tipoSeccion === "solicitudes";

  // Actualizar estado seleccionado y datos locales cuando cambie el permiso
  useEffect(() => {
    if (isOpen && permiso) {
      const estadoActual = String(permiso?.cN_Id_estado || permiso?.estado || "1");
      setEstadoSeleccionado(estadoActual);
      setMostrarJustificacionRechazo(estadoActual === "15");
      
      setPermisoLocal({
        cT_Titulo_permiso: permiso?.cT_Titulo_permiso || permiso?.titulo || "",
        cT_Descripcion_permiso: permiso?.cT_Descripcion_permiso || permiso?.descripcion || "",
        cF_Fecha_hora_inicio_permiso: permiso?.cF_Fecha_hora_inicio_permiso || permiso?.fechaInicio || "",
        cF_Fecha_hora_fin_permiso: permiso?.cF_Fecha_hora_fin_permiso || permiso?.fechaFin || "",
        cT_Descripcion_rechazo: permiso?.cT_Descripcion_rechazo || permiso?.descripcionRechazo || "",
      });
    }
  }, [isOpen, permiso]);

  // Manejar cambio de estado
  const handleEstadoChange = (keys) => {
    const nuevoEstado = Array.from(keys)[0];
    setEstadoSeleccionado(nuevoEstado);
    setMostrarJustificacionRechazo(nuevoEstado === "15");
  };

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
        cT_Titulo_permiso: esSoloRevision ? permisoLocal.cT_Titulo_permiso : (data.titulo?.trim() || permisoLocal.cT_Titulo_permiso),
        cT_Descripcion_permiso: esSoloRevision ? permisoLocal.cT_Descripcion_permiso : (data.descripcion?.trim() || permisoLocal.cT_Descripcion_permiso),
        cN_Id_estado: parseInt(data.estado),
        cT_Descripcion_rechazo: data.estado === "15" ? data.descripcionRechazo?.trim() : null,
        cF_Fecha_hora_inicio_permiso: esSoloRevision ? permisoLocal.cF_Fecha_hora_inicio_permiso : fechaInicio,
        cF_Fecha_hora_fin_permiso: esSoloRevision ? permisoLocal.cF_Fecha_hora_fin_permiso : fechaFin,
      };

      console.log('Datos del permiso a enviar:', permisoData);
      
      // Guardar el permiso
      await onSave(permisoData);

      // Enviar notificación si hay cambio de estado y es una revisión
      const estadoOriginal = permiso?.cN_Id_estado || permiso?.estado;
      const nuevoEstado = parseInt(data.estado);
      
      if (esSoloRevision && estadoOriginal !== nuevoEstado) {
        // Solo notificar si el estado cambió a Aprobado (6) o Rechazado (15)
        if (nuevoEstado === 6 || nuevoEstado === 15) {
          try {
            // Obtener información del usuario creador
            const usuarioCreador = permiso.usuarioCreador || {
              cT_Correo_usuario: permiso.correoCreador,
              cT_Nombre_usuario: permiso.nombreCreador
            };

            if (usuarioCreador && usuarioCreador.cT_Correo_usuario) {
              const motivoRechazo = nuevoEstado === 15 ? data.descripcionRechazo?.trim() : null;
              
              await notificacionService.enviarNotificacionCambioEstadoPermiso(
                usuarioCreador,
                permiso,
                nuevoEstado,
                motivoRechazo
              );
              
              // Mostrar toast de éxito
              const estadoTexto = nuevoEstado === 6 ? 'aprobado' : 'rechazado';
              toast.success(`✉️ Notificación enviada: Permiso ${estadoTexto}`, {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              
              console.log('Notificación de cambio de estado enviada correctamente');
            } else {
              console.warn('No se pudo enviar la notificación: información del usuario creador incompleta');
              toast.warning('⚠️ Permiso actualizado, pero no se pudo enviar la notificación', {
                position: "top-right",
                autoClose: 4000,
              });
            }
          } catch (notificationError) {
            console.error('Error al enviar la notificación de cambio de estado:', notificationError);
            toast.warning('⚠️ Permiso actualizado, pero falló el envío de la notificación', {
              position: "top-right",
              autoClose: 4000,
            });
            // No interrumpir el flujo principal si falla la notificación
          }
        }
      }

    } catch (error) {
      console.error("Error al actualizar permiso:", error);
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
                {tipoSeccion === "solicitudes" ? "Revisar Permiso" : "Editar Permiso"}
              </h2>
              <p className="text-sm text-gray-600">
                {tipoSeccion === "solicitudes" 
                  ? "Aprueba o rechaza esta solicitud de permiso"
                  : "Modifica los datos del permiso"
                }
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
                    isDisabled={isLoading || esSoloRevision}
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
                        disabled={isLoading || esSoloRevision}
                        required
                        readOnly={esSoloRevision}
                        style={{ minHeight: '80px', maxHeight: '120px' }}
                    />
                </div>

                {/* Estado */}
                <Select
                    name="estado"
                    label="Estado del Permiso"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="Selecciona el estado del permiso"
                    selectedKeys={[estadoSeleccionado]}
                    onSelectionChange={handleEstadoChange}
                    isRequired
                    isDisabled={isLoading}
                    validate={(value) => {
                        if (!value) {
                            return "El estado es requerido";
                        }
                    }}
                >
                    {estadosPermiso.map((estado) => (
                        <SelectItem key={estado.key} value={estado.key}>
                            {estado.label}
                        </SelectItem>
                    ))}
                </Select>

                {/* Descripción de Rechazo - Solo cuando estado es rechazado */}
                {mostrarJustificacionRechazo && (
                    <div className="col-span-2 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
                        <label className="text-sm font-medium text-foreground">
                            Motivo de Rechazo <span className="text-danger">*</span>
                        </label>
                        <textarea
                            name="descripcionRechazo"
                            placeholder="Explica el motivo por el cual se rechaza el permiso"
                            defaultValue={permisoLocal.cT_Descripcion_rechazo || ""}
                            rows={3}
                            className="w-full px-3 py-2 rounded-medium border-2 border-red-200 hover:border-red-300 focus:border-red-500 transition-all duration-150 ease-in-out focus:outline-none resize-none text-sm overflow-hidden bg-red-50"
                            disabled={isLoading}
                            required
                            style={{ minHeight: '80px', maxHeight: '120px' }}
                        />
                    </div>
                )}

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <DatePicker
                            isRequired
                            label="Fecha y Hora de Inicio"
                            labelPlacement="outside"
                            showMonthAndYearPickers
                            hideTimeZone
                            hourCycle={12}
                            variant="bordered"
                            granularity="minute"
                            value={parseToZonedDateTime(permisoLocal.cF_Fecha_hora_inicio_permiso)}
                            onChange={esSoloRevision ? undefined : handleFechaInicioChange}
                            isDateUnavailable={isDateUnavailable}
                            minValue={now(getLocalTimeZone())}
                            errorMessage={timeValidationErrors.fechaInicio || "La fecha de inicio es requerida (Lunes a Viernes, 7:00 AM - 4:30 PM)"}
                            isInvalid={!!timeValidationErrors.fechaInicio}
                            isDisabled={isLoading || esSoloRevision}
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
                            onChange={esSoloRevision ? undefined : handleFechaFinChange}
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
                            isDisabled={isLoading || esSoloRevision || !permisoLocal.cF_Fecha_hora_inicio_permiso}
                            placeholder={!permisoLocal.cF_Fecha_hora_inicio_permiso ? "Seleccione primero la fecha de inicio" : "Seleccione la hora de fin"}
                        />
                    </div>
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
                        {esSoloRevision ? "Guardar Decisión" : "Actualizar Permiso"}
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

export default EditarPermisoModal;
