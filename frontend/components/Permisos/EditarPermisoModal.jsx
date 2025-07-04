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
    { key: "2", label: "Aprobado" },
    { key: "15", label: "Rechazado" }
  ];

  // Actualizar estado seleccionado y datos locales cuando cambie el permiso
  useEffect(() => {
    if (isOpen && permiso) {
      setEstadoSeleccionado(String(permiso?.cN_Id_estado || permiso?.estado || "1"));
      setPermisoLocal({
        cT_Titulo_permiso: permiso?.cT_Titulo_permiso || permiso?.titulo || "",
        cT_Descripcion_permiso: permiso?.cT_Descripcion_permiso || permiso?.descripcion || "",
        cF_Fecha_hora_inicio_permiso: permiso?.cF_Fecha_hora_inicio_permiso || permiso?.fechaInicio || "",
        cF_Fecha_hora_fin_permiso: permiso?.cF_Fecha_hora_fin_permiso || permiso?.fechaFin || "",
        cT_Descripcion_rechazo: permiso?.cT_Descripcion_rechazo || permiso?.descripcionRechazo || "",
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
        cN_Id_estado: parseInt(data.estado),
        cT_Descripcion_rechazo: data.estado === "15" ? data.descripcionRechazo?.trim() : null,
        cF_Fecha_hora_inicio_permiso: fechaInicio,
        cF_Fecha_hora_fin_permiso: fechaFin,
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
            
            <ModalBody>
              <Form 
                id="editarPermisoForm"
                className="space-y-4"
                validationBehavior="native"
                onSubmit={handleSubmit}
              >
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

                {/* Estado */}
                <Select
                  name="estado"
                  label="Estado"
                  placeholder="Selecciona el estado del permiso"
                  defaultSelectedKeys={[String(permiso?.cN_Id_estado || permiso?.estado || "1")]}
                  isRequired
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

                {/* Descripción de Rechazo - Se mostrará condicionalmente */}
                <Textarea
                  name="descripcionRechazo"
                  label="Motivo de Rechazo"
                  placeholder="Explica el motivo por el cual se rechaza el permiso"
                  defaultValue={permiso?.cT_Descripcion_rechazo || permiso?.descripcionRechazo || ""}
                  minRows={2}
                  maxRows={4}
                  className="[&]:data-[state=rejected]:block hidden"
                  validate={(value) => {
                    // Esta validación se aplicará solo cuando sea visible
                    const estadoSelect = document.querySelector('select[name="estado"]');
                    if (estadoSelect?.value === "15" && (!value || !value.trim())) {
                      return "La descripción de rechazo es requerida cuando el estado es 'Rechazado'";
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
              </Form>
            </ModalBody>
            
            <ModalFooter>
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
                form="editarPermisoForm"
                type="submit"
                isLoading={isLoading}
              >
                Actualizar Permiso
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditarPermisoModal;
