import React, { useState, useEffect, useRef } from "react";
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
    Spinner,
    Textarea,
    DatePicker,
} from "@heroui/react";
import { catalogosService } from "../../services/catalogosService";
import { agregarRechazo } from "../../services/rechazoService";
import GestorAdjuntos from "./GestorAdjuntos";
import Seguimientos from "@/components/Tareas/Seguimientos";
import SeguimientoInput from "./SeguimientoInput";
import IncumplimientoInput from "./IncumplimientoInput";
import HistorialRechazos from "./HistorialRechazos";
import { useSession } from "next-auth/react";
import { I18nProvider } from "@react-aria/i18n";
import { datePickerUtils } from "../../utils/datePickerUtils";

const EditarTareaModal = ({ isOpen, onClose, onOpenChange, onSubmit, tarea, tareaPadre = null, restricciones = {}, restriccionesAcciones = {} }) => {
    const { data: session, status } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scrollBehavior, setScrollBehavior] = React.useState("inside");
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [mostrarJustificacionRechazo, setMostrarJustificacionRechazo] = useState(false);
    const [justificacionRechazo, setJustificacionRechazo] = useState("");
    const [tareaLocal, setTareaLocal] = useState(tarea || {});
    const [catalogos, setCatalogos] = useState({
        estados: [],
        prioridades: [],
        complejidades: [],
        usuarios: []
    });
    const [loadingCatalogos, setLoadingCatalogos] = useState(true);
    const seguimientosRef = useRef(null);

    useEffect(() => {
        if (isOpen && session?.user?.id && status === 'authenticated') {
            cargarCatalogos();
        }

        // Resetear estado cuando se abre el modal
        if (isOpen) {
            setMostrarJustificacionRechazo(false);
            setJustificacionRechazo("");
            setSelectedEstado(null);
        }
    }, [isOpen]);

    useEffect(() => {
        setTareaLocal(tarea || {});
    }, [tarea]);

    const cargarCatalogos = async () => {
        try {
            setLoadingCatalogos(true);
            const catalogosData = await catalogosService.obtenerTodosCatalogos(session.user.id);
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
            const estadoSeleccionado = parseInt(formData.get('estado'));

            // Si está rechazando (estado 15) y es una tarea en revisión, agregar justificación de rechazo
            if (estadoSeleccionado === 15 && tarea?.cN_Id_estado === 17 && justificacionRechazo.trim()) {
                await agregarRechazo(tarea.cN_Id_tarea, justificacionRechazo);
            }

            // Construir tareaData con los valores del formulario o, si el campo está restringido, con el valor original de la tarea
            const tareaData = {
                cT_Titulo_tarea: restricciones.titulo ? tarea?.cT_Titulo_tarea : formData.get('titulo'),
                cT_Descripcion_tarea: restricciones.descripcion ? tarea?.cT_Descripcion_tarea : formData.get('descripcion'),
                cN_Id_complejidad: restricciones.complejidad ? tarea?.cN_Id_complejidad : parseInt(formData.get('complejidad')),
                cN_Id_prioridad: restricciones.prioridad ? tarea?.cN_Id_prioridad : parseInt(formData.get('prioridad')),
                cN_Id_estado: restricciones.estado ? tarea?.cN_Id_estado : estadoSeleccionado,
                cF_Fecha_limite: restricciones.fechaLimite ? tarea?.cF_Fecha_limite : (tareaLocal.cF_Fecha_limite || formData.get('fechaLimite')),
                cN_Numero_GIS: restricciones.numeroGIS ? tarea?.cN_Numero_GIS : formData.get('numeroGIS'),
                cN_Usuario_asignado: restricciones.usuarioAsignado ? tarea?.cN_Usuario_asignado : (responsableValue ? parseInt(responsableValue) : null),
                cN_Tarea_origen: tareaPadre ? (tareaPadre.cN_Id_tarea || tareaPadre.id) : null,
                cN_Usuario_editor: session?.user?.id,
            };
            await onSubmit(tareaData);

            // Resetear estado del modal después de enviar exitosamente
            setMostrarJustificacionRechazo(false);
            setJustificacionRechazo("");
            setSelectedEstado(null);

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
    }    // Formatear fecha para el input de fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        return date.toISOString().split('T')[0];
    };

    // Mapa de transiciones de estados permitidas
    const obtenerEstadosPermitidos = (estadoActual, esCreador = false) => {
        const transiciones = {
            1: [2], // Registrado -> Asignado
            2: [3, 4], // Asignado -> En proceso, En espera
            3: [4, 17], // En proceso -> En espera, En revisión
            4: [3], // En espera -> En proceso
            5: [], // Terminado -> ninguno (final)
            14: [2, 3, 4], // Incumplido -> Asignado, En proceso, En espera
            15: [2], // Rechazado -> Asignado
            17: esCreador ? [5, 15] : [] // En revisión -> Solo el creador puede Terminar o Rechazar
        };

        return transiciones[estadoActual] || [];
    };
    const obtenerEstadosFiltrados = () => {
        if (!tarea?.cN_Id_estado || catalogos.estados.length === 0) {
            return catalogos.estados;
        }

        // Obtener estados permitidos basándose en el estado actual y si es el creador
        const esCreador = parseInt(session?.user?.id) === tarea?.cN_Usuario_creador;
        const estadosPermitidos = obtenerEstadosPermitidos(tarea.cN_Id_estado, esCreador);

        // Filtrar los estados del catálogo para mostrar solo los permitidos
        const estadosFiltrados = catalogos.estados.filter(estado =>
            estadosPermitidos.includes(estado.cN_Id_estado)
        );

        // Siempre incluir el estado actual al inicio de la lista (será no seleccionable)
        const estadoActual = catalogos.estados.find(estado =>
            estado.cN_Id_estado === tarea.cN_Id_estado
        );

        if (estadoActual) {
            // Si el estado actual no está en los filtrados, agregarlo al inicio
            if (!estadosFiltrados.some(estado => estado.cN_Id_estado === tarea.cN_Id_estado)) {
                return [estadoActual, ...estadosFiltrados];
            }
            // Si ya está en los filtrados, reorganizar para que esté al inicio
            const sinEstadoActual = estadosFiltrados.filter(estado => estado.cN_Id_estado !== tarea.cN_Id_estado);
            return [estadoActual, ...sinEstadoActual];
        }

        return estadosFiltrados;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange} size="3xl" isDismissable={false} scrollBehavior="outside" backdrop="blur" className="max-w-3xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <Form onSubmit={handleSubmit} className="w-full flex flex-col h-full">
                            <ModalBody className="px-6 pt-6 w-full">
                                <h2 className="text-xl font-bold mb-4">
                                    {tareaPadre ? 'Editar subtarea' : 'Editar tarea'} - {tarea?.cN_Id_tarea ? String(tarea.cN_Id_tarea).padStart(2, '0') : '00'}
                                </h2>

                                <div className="grid grid-cols-2 gap-4 w-full overflow-hidden">
                                    {tareaPadre && (
                                        <div className="col-span-2">
                                            <Input
                                                name="tareaPadre"
                                                label="Tarea Origen:"
                                                labelPlacement="outside"
                                                value={`Tarea #${String(tareaPadre.cN_Id_tarea || tareaPadre.id).padStart(2, '0')}: ${tareaPadre.cT_Titulo_tarea || tareaPadre.titulo || ''}`}
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
                                        <Input
                                            isRequired
                                            name="titulo"
                                            label="Título de la tarea:"
                                            labelPlacement="outside"
                                            placeholder="Título de la tarea"
                                            defaultValue={tarea?.cT_Titulo_tarea || ""}
                                            variant="bordered"
                                            readOnly={restricciones.titulo}
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
                                            className="w-full px-3 py-2 rounded-medium border-2 border-default-200 hover:border-default-300 focus:border-black transition-all duration-150 ease-in-out focus:outline-none resize-none text-sm overflow-hidden disabled:bg-gray-50"
                                            readOnly={restricciones.descripcion}
                                            disabled={isSubmitting}
                                            required
                                            style={{ minHeight: '80px', maxHeight: '120px' }}
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            label="Número GIS:"
                                            labelPlacement="outside"
                                            name="numeroGIS"
                                            placeholder="Número GIS"
                                            defaultValue={tarea?.cN_Numero_GIS || ""}
                                            variant="bordered"
                                            readOnly={restricciones.numeroGIS}
                                            isDisabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <I18nProvider locale="es">
                                            <DatePicker
                                                isRequired
                                                label="Fecha y hora límite:"
                                                name="fechaLimite"
                                                labelPlacement="outside"
                                                showMonthAndYearPickers
                                                hideTimeZone
                                                variant="bordered"
                                                granularity="minute"
                                                hourCycle={12}
                                                readOnly={restricciones.fechaLimite}
                                                {...datePickerUtils.getDatePickerProps({
                                                    currentValue: tareaLocal.cF_Fecha_limite || tarea?.cF_Fecha_limite,
                                                    onChange: (date) => {
                                                        if (!restricciones.fechaLimite) {
                                                            return datePickerUtils.handleDateChange(date, setTareaLocal, 'cF_Fecha_limite');
                                                        }
                                                    },
                                                    maxDateISO: tareaPadre?.cF_Fecha_limite,
                                                    fieldName: 'cF_Fecha_limite'
                                                })}
                                                isDisabled={isSubmitting || restricciones.fechaLimite}
                                            />
                                        </I18nProvider>
                                    </div>

                                    <div>
                                        <Select
                                            isRequired
                                            label="Prioridad:"
                                            labelPlacement="outside"
                                            name="prioridad"
                                            placeholder="Selecciona prioridad"
                                            defaultSelectedKeys={tarea?.cN_Id_prioridad ? [tarea.cN_Id_prioridad.toString()] : []}
                                            variant="bordered"
                                            isDisabled={isSubmitting || restricciones.prioridad}
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
                                        <Select
                                            isRequired
                                            label="Complejidad:"
                                            labelPlacement="outside"
                                            name="complejidad"
                                            placeholder="Selecciona complejidad"
                                            defaultSelectedKeys={tarea?.cN_Id_complejidad ? [tarea.cN_Id_complejidad.toString()] : []}
                                            variant="bordered"
                                            isDisabled={isSubmitting || restricciones.complejidad}
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
                                    </div>
                                    <div>
                                        <Select
                                            name="responsable"
                                            label="Responsable:"
                                            labelPlacement="outside"
                                            placeholder="Selecciona un usuario"
                                            defaultSelectedKeys={tarea?.cN_Usuario_asignado ? [tarea.cN_Usuario_asignado.toString()] : []}
                                            variant="bordered"
                                            isDisabled={isSubmitting || restricciones.usuarioAsignado}
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
                                        <Select
                                            isRequired
                                            label="Estado"
                                            labelPlacement="outside"
                                            name="estado"
                                            placeholder="Selecciona estado"
                                            defaultSelectedKeys={tarea?.cN_Id_estado ? [tarea.cN_Id_estado.toString()] : []}
                                            variant="bordered"
                                            isDisabled={isSubmitting || restricciones.estado}
                                            onSelectionChange={(keys) => {
                                                const selectedValue = Array.from(keys)[0];
                                                setSelectedEstado(selectedValue);
                                                // Si selecciona "Rechazar" (estado 15) y la tarea está en revisión (estado 17)
                                                if (selectedValue === "15" && tarea?.cN_Id_estado === 17) {
                                                    setMostrarJustificacionRechazo(true);
                                                } else {
                                                    setMostrarJustificacionRechazo(false);
                                                    setJustificacionRechazo("");
                                                }
                                            }}                                        >
                                            {obtenerEstadosFiltrados().map((estado) => (
                                                <SelectItem
                                                    key={estado.cN_Id_estado}
                                                    value={estado.cN_Id_estado.toString()}
                                                    isDisabled={estado.cN_Id_estado === tarea?.cN_Id_estado}
                                                    className={estado.cN_Id_estado === tarea?.cN_Id_estado ? "text-gray-500 bg-gray-100" : ""}
                                                >
                                                    {estado.cN_Id_estado === tarea?.cN_Id_estado
                                                        ? `${estado.cT_Estado}`
                                                        : estado.cT_Estado
                                                    }
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    {/* Campo de justificación de rechazo */}
                                    {mostrarJustificacionRechazo && (
                                        <div className="col-span-2">
                                            <Textarea
                                                label="Justificación de rechazo"
                                                labelPlacement="outside"
                                                value={justificacionRechazo}
                                                onChange={(e) => setJustificacionRechazo(e.target.value)}
                                                placeholder="Explica por qué se rechaza esta tarea..."
                                                variant="bordered"
                                                minRows={3}
                                                maxRows={5}
                                                isRequired
                                                className="w-full"
                                                classNames={{
                                                    input: "bg-red-50",
                                                    inputWrapper: "border-red-200 focus-within:border-red-500"
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <GestorAdjuntos
                                            idTarea={tarea?.cN_Id_tarea}
                                            tarea={tarea}
                                            onAdjuntosChange={(adjuntos) => console.log('Adjuntos actualizados:', adjuntos)}
                                            isDisabled={restricciones.adjuntos}
                                        />                                    </div>
                                    <div className="col-span-2">
                                        <Seguimientos tarea={tarea} ref={seguimientosRef} />
                                    </div>
                                    <div className="col-span-2">
                                        <SeguimientoInput
                                            tareaId={tarea?.CN_Id_tarea ?? tarea?.cN_Id_tarea}
                                            onAgregado={() => {
                                                if (seguimientosRef.current) {
                                                    seguimientosRef.current.recargar();
                                                }
                                            }}
                                            tarea={tarea}
                                        />
                                    </div>

                                    {tarea?.cN_Id_estado === 14 && (
                                        <>
                                            <div className="col-span-2">
                                                <IncumplimientoInput
                                                    tareaId={tarea?.CN_Id_tarea ?? tarea?.cN_Id_tarea}
                                                    tarea={tarea}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="col-span-2">
                                        <HistorialRechazos tareaId={tarea?.CN_Id_tarea ?? tarea?.cN_Id_tarea} />
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
                                        isDisabled={
                                            (restriccionesAcciones && restriccionesAcciones.editar !== true) ||
                                            (mostrarJustificacionRechazo && !justificacionRechazo.trim())
                                        }
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
