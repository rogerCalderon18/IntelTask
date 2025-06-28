import React from "react";
import { Spinner, Chip } from "@heroui/react";
import { FiEdit, FiTrash2, FiClock, FiUser, FiEye } from "react-icons/fi";
import getColorClass from "../utils/getColorClass";

const ListaSubtareas = ({ subtareas, loading, onEdit, onDelete, onDetalle }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-4">
                <Spinner size="sm" color="primary" />
            </div>
        );
    }

    if (subtareas.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 text-sm">
                <p>No hay subtareas creadas</p>
                <p className="text-xs mt-1">Haz clic en &quot;Agregar&quot; para crear la primera subtarea</p>
            </div>
        );
    }

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getEstadoColor = (estadoId) => {
        switch (estadoId) {
            case 1: return 'success'; // Completado
            case 2: return 'warning'; // En progreso
            case 3: return 'primary'; // En revisión
            case 4: return 'danger';  // Incumplimiento
            default: return 'default';
        }
    };

    const getEstadoTexto = (estadoId) => {
        switch (estadoId) {
            case 1: return 'Completado';
            case 2: return 'En progreso';
            case 3: return 'En revisión';
            case 4: return 'Incumplimiento';
            default: return 'Desconocido';
        }
    };

    return (
        <div className="space-y-2">
            {subtareas.map((subtarea) => (
                <div
                    key={subtarea.cN_Id_tarea}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${getColorClass(subtarea.cN_Id_prioridad)}`}></span>
                                <span className="font-medium text-sm text-gray-800">
                                    #{String(subtarea.cN_Id_tarea).padStart(2, '0')} - {subtarea.cT_Titulo_tarea}
                                </span>
                                <Chip
                                    size="sm"
                                    color={getEstadoColor(subtarea.cN_Id_estado)}
                                    variant="flat"
                                    className="text-xs"
                                >
                                    {getEstadoTexto(subtarea.cN_Id_estado)}
                                </Chip>
                            </div>
                            
                            {subtarea.cT_Descripcion_tarea && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    {subtarea.cT_Descripcion_tarea}
                                </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                {subtarea.cF_Fecha_limite && (
                                    <div className="flex items-center gap-1">
                                        <FiClock className="w-3 h-3" />
                                        <span>{formatearFecha(subtarea.cF_Fecha_limite)}</span>
                                    </div>
                                )}
                                {subtarea.usuarioAsignado && (
                                    <div className="flex items-center gap-1">
                                        <FiUser className="w-3 h-3" />
                                        <span>{subtarea.usuarioAsignado.cT_Nombre_usuario}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                                onClick={() => onDetalle && onDetalle(subtarea)}
                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Ver detalle"
                            >
                                <FiEye className="w-4 h-4" />
                            </button>
                            {/* Mostrar el icono de editar solo si está permitido */}
                            {subtarea.restriccionesAcciones?.editar && (
                                <button
                                    onClick={() => onEdit(subtarea)}
                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Editar subtarea"
                                >
                                    <FiEdit className="w-4 h-4" />
                                </button>
                            )}
                            {/* Mostrar el icono de eliminar solo si está permitido */}
                            {subtarea.restriccionesAcciones?.eliminar && (
                                <button
                                    onClick={() => onDelete(subtarea)}
                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Eliminar subtarea"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ListaSubtareas;
