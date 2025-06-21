import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { getRechazos } from "../../services/rechazoService";
import { FiAlertTriangle, FiClock } from "react-icons/fi";

const HistorialRechazos = forwardRef(({ tareaId }, ref) => {
    const [rechazos, setRechazos] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarRechazos = async () => {
        if (tareaId) {
            setLoading(true);
            try {
                const data = await getRechazos(tareaId);
                setRechazos(data);
            } catch (error) {
                console.error("Error al obtener el historial de rechazos:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useImperativeHandle(ref, () => ({
        recargar: cargarRechazos
    }));

    useEffect(() => {
        cargarRechazos();
    }, [tareaId]);

    return (
        <div className="mt-6">
            <div className="flex items-center mb-4">
                <FiAlertTriangle className="text-red-500 mr-2" size={18} />
                <h3 className="text-sm text-gray-800">
                    Historial de rechazos {rechazos.length > 0 && 
                        <span className="text-red-600 ml-1">({rechazos.length})</span>
                    }
                </h3>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    <span className="ml-3 text-sm text-gray-600">Cargando rechazos...</span>
                </div>
            ) : rechazos.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-gray-400 mb-2">
                        <FiAlertTriangle size={24} className="mx-auto opacity-50" />
                    </div>
                    <p className="text-sm text-gray-500">No hay rechazos registrados</p>
                </div>
            ) : (
                <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {rechazos.map((rechazo, index) => (
                        <li 
                            key={rechazo.cN_Id_tarea_rechazo ?? index} 
                            className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center mb-2 text-xs text-red-800 font-medium">
                                <FiClock className="mr-1" size={12} />
                                <span>{new Date(rechazo.cF_Fecha_hora_rechazo).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{rechazo.cT_Descripcion_rechazo}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

HistorialRechazos.displayName = "HistorialRechazos";
export default HistorialRechazos;
