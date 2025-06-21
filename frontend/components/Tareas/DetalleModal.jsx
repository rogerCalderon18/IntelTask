import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Divider, Spinner } from "@heroui/react";
import { FiCalendar, FiUser, FiFlag, FiClock, FiFileText, FiPaperclip, FiHash, FiLayers, FiDownload } from "react-icons/fi";
import { adjuntosService } from "../../services/adjuntosService";
import { catalogosService } from "../../services/catalogosService";
import { toast } from "react-toastify";
import Seguimientos from "./Seguimientos";
import HistorialIncumplimientos from "./HistorialIncumplimientos";
import HistorialRechazos from "./HistorialRechazos";

const DetalleModal = ({ isOpen, onOpenChange, tarea, onEdit, onClose, esSubtarea = false }) => {
    const [adjuntos, setAdjuntos] = useState([]);
    const [cargandoAdjuntos, setCargandoAdjuntos] = useState(false);
    const [estados, setEstados] = useState([]);
    const [prioridades, setPrioridades] = useState([]);

    useEffect(() => {
        if (isOpen && tarea?.cN_Id_tarea) {
            cargarAdjuntos();
            cargarEstados();
            cargarPrioridades();
        }
    }, [isOpen, tarea?.cN_Id_tarea]);

    const cargarAdjuntos = async () => {
        try {
            setCargandoAdjuntos(true);
            const adjuntosData = await adjuntosService.obtenerPorTarea(tarea.cN_Id_tarea);
            setAdjuntos(adjuntosData);
        } catch (error) {
            console.error('Error al cargar adjuntos:', error);
            setAdjuntos([]);
        } finally {
            setCargandoAdjuntos(false);
        }
    };

    const cargarEstados = async () => {
        try {
            const estadosData = await catalogosService.obtenerEstados();
            setEstados(estadosData);
        } catch (error) {
            console.error('Error al cargar estados:', error);
            setEstados([]);
        }
    };

    const cargarPrioridades = async () => {
        try {
            const prioridadesData = await catalogosService.obtenerPrioridades();
            setPrioridades(prioridadesData);
        } catch (error) {
            console.error('Error al cargar prioridades:', error);
            setPrioridades([]);
        }
    };

    const descargarAdjunto = async (adjunto) => {
        try {
            await adjuntosService.descargar(adjunto.cN_Id_adjunto);
            toast.success(`Descargando ${adjunto.cT_Nombre_archivo}...`);
        } catch (error) {
            console.error('Error al descargar adjunto:', error);
            toast.error('Error al descargar el archivo');
        }
    };

    const obtenerNombreEstado = (estadoData) => {
        // Debug para entender qué tipo de dato estamos recibiendo
        console.log('Estado recibido:', estadoData, 'Tipo:', typeof estadoData);

        if (!estadoData) return 'No especificado';

        // Si ya es un objeto con el nombre, usarlo directamente
        if (typeof estadoData === 'object' && estadoData.CT_Estado) {
            return estadoData.CT_Estado;
        }

        if (typeof estadoData === 'object' && estadoData.cT_Nombre_estado) {
            return estadoData.cT_Nombre_estado;
        }

        if (typeof estadoData === 'object' && estadoData.cT_Estado) {
            return estadoData.cT_Estado;
        }

        // Si es un número (ID), buscar en el array de estados
        let estadoId = estadoData;
        if (typeof estadoData === 'object' && estadoData.cN_Id_estado) {
            estadoId = estadoData.cN_Id_estado;
        }
        if (typeof estadoData === 'object' && estadoData.CN_Id_estado) {
            estadoId = estadoData.CN_Id_estado;
        }

        if (!estados.length) return `Estado ${estadoId}`;

        const estado = estados.find(e =>
            e.cN_Id_estado === Number(estadoId) ||
            e.CN_Id_estado === Number(estadoId)
        );
        return estado?.CT_Estado || estado?.cT_Nombre_estado || estado?.cT_Estado || `Estado ${estadoId}`;
    };

    const obtenerNombrePrioridad = (prioridadData) => {
        // Debug para entender qué tipo de dato estamos recibiendo
        console.log('Prioridad recibida:', prioridadData, 'Tipo:', typeof prioridadData);

        if (!prioridadData) return 'No especificada';

        // Si ya es un objeto con el nombre, usarlo directamente
        if (typeof prioridadData === 'object' && prioridadData.CT_Nombre_prioridad) {
            return prioridadData.CT_Nombre_prioridad;
        }

        if (typeof prioridadData === 'object' && prioridadData.cT_Nombre_prioridad) {
            return prioridadData.cT_Nombre_prioridad;
        }

        if (typeof prioridadData === 'object' && prioridadData.cT_Prioridad) {
            return prioridadData.cT_Prioridad;
        }

        // Si es un número (ID), buscar en el array de prioridades
        let prioridadId = prioridadData;
        if (typeof prioridadData === 'object' && prioridadData.cN_Id_prioridad) {
            prioridadId = prioridadData.cN_Id_prioridad;
        }
        if (typeof prioridadData === 'object' && prioridadData.CN_Id_prioridad) {
            prioridadId = prioridadData.CN_Id_prioridad;
        }

        if (!prioridades.length) return `Prioridad ${prioridadId}`;

        const prioridad = prioridades.find(p =>
            p.cN_Id_prioridad === Number(prioridadId) ||
            p.CN_Id_prioridad === Number(prioridadId)
        );
        return prioridad?.CT_Nombre_prioridad || prioridad?.cT_Nombre_prioridad || prioridad?.cT_Prioridad || `Prioridad ${prioridadId}`;
    };

    if (!tarea) return null;    // Debug temporal para entender la estructura de la tarea/subtarea
    console.log('Tarea en detalle modal:', tarea);
    console.log('Estados cargados:', estados);
    console.log('Prioridades cargadas:', prioridades);
    console.log('Valor de prioridad de la tarea:', tarea.prioridad, tarea.cN_Id_prioridad, tarea.prioridadId);

    const formatearFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const obtenerColorPrioridad = (prioridad) => {
        const prioridadTexto = prioridad?.CT_Nombre_prioridad || prioridad?.cT_Nombre_prioridad || prioridad;
        const prioridadStr = typeof prioridadTexto === 'string' ? prioridadTexto.toLowerCase() : String(prioridadTexto || '').toLowerCase();

        switch (prioridadStr) {
            case 'alta': return 'danger';
            case 'media': return 'warning';
            case 'baja': return 'success';
            default: return 'default';
        }
    };

    const obtenerColorComplejidad = (complejidad) => {
        const complejidadTexto = complejidad?.cT_Nombre || complejidad;
        const complejidadStr = typeof complejidadTexto === 'string' ? complejidadTexto.toLowerCase() : String(complejidadTexto || '').toLowerCase();

        switch (complejidadStr) {
            case 'alta': return 'danger';
            case 'media': return 'warning';
            case 'baja': return 'success';
            default: return 'default';
        }
    };

    const CampoDetalle = ({ icono, label, valor, chip = false, chipColor = 'default' }) => (
        <div className="flex items-center gap-3 py-2">
            <div className="flex items-center gap-2 w-32 text-gray-600 flex-shrink-0">
                {icono}
                <span className="text-sm font-medium">{label}:</span>
            </div>
            <div className="flex-1 min-w-0 flex items-center">
                {chip ? (
                    <Chip color={chipColor} variant="flat" size="sm" className="text-xs">
                        {valor || 'No especificado'}
                    </Chip>
                ) : (
                    <span className="text-sm text-gray-800 break-words leading-relaxed">{valor || 'No especificado'}</span>
                )}
            </div>
        </div>
    );

    const handleDescargar = (id) => {
        console.log('Descargando adjunto con ID:', id);

        const url = adjuntosService.obtenerUrlDescarga(id);
        window.open(url, '_blank');
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="3xl"
            scrollBehavior="inside"
            backdrop="blur"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    {esSubtarea ? (
                                        <FiLayers className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <FiFileText className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {esSubtarea ? 'Subtarea' : 'Tarea'} #{tarea.cN_Id_tarea}
                                    </h2>
                                    <p className="text-sm text-gray-500">Información detallada de la tarea</p>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="gap-5 px-10">

                            <div>
                                <h3 className="text-sm font-medium text-gray-800 mb-3">Título:</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {tarea.cT_Titulo_tarea || tarea.titulo || 'Sin título'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-800 mb-3">Descripción:</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                                    {tarea.cT_Descripcion_tarea || tarea.descripcion || 'Sin descripción'}
                                </p>
                            </div>

                            <Divider />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <CampoDetalle
                                        icono={<FiHash className="w-3.5 h-3.5" />}
                                        label="Número GIS"
                                        valor={tarea.cN_Gis || 'No asignado'}
                                    />

                                    <CampoDetalle
                                        icono={<FiCalendar className="w-3.5 h-3.5" />}
                                        label="Fecha límite"
                                        valor={formatearFecha(tarea.cF_Fecha_limite || tarea.fechaEntrega)}
                                    />

                                    <CampoDetalle
                                        icono={<FiFlag className="w-3.5 h-3.5" />}
                                        label="Prioridad"
                                        valor={obtenerNombrePrioridad(tarea.prioridad || tarea.cN_Id_prioridad || tarea.prioridadId)}
                                        chip={true}
                                        chipColor={obtenerColorPrioridad(tarea.prioridad || tarea.cN_Id_prioridad || tarea.prioridadId)}
                                    />

                                    <CampoDetalle
                                        icono={<FiLayers className="w-3.5 h-3.5" />}
                                        label="Complejidad"
                                        valor={tarea.complejidad?.cT_Nombre || 'No especificada'}
                                        chip={true}
                                        chipColor={obtenerColorComplejidad(tarea.complejidad)}
                                    />

                                    {tarea.oficina && (
                                        <CampoDetalle
                                            icono={<FiFileText className="w-3.5 h-3.5" />}
                                            label="Oficina"
                                            valor={tarea.oficina?.cT_Nombre || tarea.oficina}
                                        />
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <CampoDetalle
                                        icono={<FiUser className="w-3.5 h-3.5" />}
                                        label="Responsable"
                                        valor={tarea.usuarioAsignado?.cT_Nombre_usuario ||
                                            tarea.responsable?.cT_Nombre_usuario ||
                                            'No asignado'}
                                    />
                                    <CampoDetalle
                                        icono={<FiCalendar className="w-3.5 h-3.5" />}
                                        label="Fecha de asignación"
                                        valor={formatearFecha(tarea.cF_Fecha_asignacion || tarea.fechaAsignacion) || 'No asignado'}
                                    />
                                    <CampoDetalle
                                        icono={<FiClock className="w-3.5 h-3.5" />}
                                        label="Fecha finalización"
                                        valor={formatearFecha(tarea.cF_Fecha_finalizacion)}
                                    />
                                    {(tarea.estado || tarea.cN_Id_estado || tarea.estadoId) && (
                                        <CampoDetalle
                                            icono={<FiClock className="w-3.5 h-3.5" />}
                                            label="Estado"
                                            valor={obtenerNombreEstado(tarea.estado || tarea.cN_Id_estado || tarea.estadoId)}
                                            chip={true}
                                            chipColor="primary"
                                        />
                                    )}
                                    {(tarea.cF_Fecha_creacion || tarea.fechaCreacion) && (
                                        <CampoDetalle
                                            icono={<FiCalendar className="w-3.5 h-3.5" />}
                                            label="Fecha creación"
                                            valor={formatearFecha(tarea.cF_Fecha_creacion || tarea.fechaCreacion)}
                                        />
                                    )}
                                </div>
                            </div>
                            {/* Adjuntos */}
                            <Divider />
                            <div>
                                <h3 className="text-sm font-medium text-gray-800 mb-4 flex items-center gap-2">
                                    <FiPaperclip className="w-4 h-4" />
                                    Adjuntos {adjuntos.length > 0 && `(${adjuntos.length})`}:
                                </h3>

                                {cargandoAdjuntos ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Spinner size="sm" />
                                        <span className="ml-2 text-sm text-gray-600">Cargando adjuntos...</span>
                                    </div>
                                ) : adjuntos.length > 0 ? (
                                    <div className="space-y-3">
                                        {adjuntos.map((adjunto, index) => (
                                            <div
                                                key={adjunto.cN_Id_adjunto || index}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                            >
                                                <FiPaperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {adjunto.cT_Nombre_archivo || `Archivo ${index + 1}`}
                                                    </p>
                                                    {adjunto.cT_Ruta_archivo && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {adjunto.cT_Ruta_archivo}
                                                        </p>
                                                    )}
                                                    {adjunto.cF_Fecha_subida && (
                                                        <p className="text-xs text-gray-400">
                                                            Subido: {formatearFecha(adjunto.cF_Fecha_subida)}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    onPress={() => handleDescargar(adjunto.id || adjunto.cN_Id_adjunto)}
                                                    className="flex-shrink-0"
                                                    title="Descargar archivo"
                                                >
                                                    <FiDownload className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>) : (
                                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                                        <FiPaperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No hay adjuntos</p>
                                    </div>
                                )}
                            </div>

                            {/* Descripción de rechazo */}
                            {tarea.cT_Descripcion_rechazo && (
                                <>
                                    <Divider />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-600 mb-3">Descripción rechazo:</h3>
                                        <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                            {tarea.cT_Descripcion_rechazo}
                                        </p>
                                    </div>
                                </>
                            )}
                            <div className="px-6 pb-2">
                                <Seguimientos tarea={tarea} />
                            </div>
                            <div className="col-span-2">
                                <HistorialIncumplimientos tareaId={tarea?.CN_Id_tarea ?? tarea?.cN_Id_tarea} />
                            </div>
                            <div className="col-span-2">
                                <HistorialRechazos tareaId={tarea?.CN_Id_tarea ?? tarea?.cN_Id_tarea} />
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                type="button"
                                color="danger"
                                className="rounded-md px-6 mr-2"
                                onPress={onClose}
                            >
                                Cerrar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default DetalleModal;

