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

const EditarPermisoModal = ({ isOpen, onOpenChange, onClose, onSave, permiso, estados, tipoSeccion }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(
    String(permiso?.cN_Id_estado || permiso?.estado || "1")
  );
  const [mostrarJustificacionRechazo, setMostrarJustificacionRechazo] = useState(false);
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
      await onSave(permisoData);
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
                            isDisabled={isLoading || esSoloRevision}
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
                            isDisabled={isLoading || esSoloRevision}
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
