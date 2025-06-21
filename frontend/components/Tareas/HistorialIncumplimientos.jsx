import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { getIncumplimientos } from "../../services/incumplimientoService";
import { FiAlertCircle, FiClock } from "react-icons/fi";

const HistorialIncumplimientos = forwardRef(({ tareaId }, ref) => {
    const [incumplimientos, setIncumplimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const cargarIncumplimientos = async () => {
        if (tareaId) {
            setLoading(true);
            try {
                const data = await getIncumplimientos(tareaId);
                console.log("Incumplimientos obtenidos:", data);
                setIncumplimientos(data);
            } catch (error) {
                console.error("Error al obtener el historial de incumplimientos:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useImperativeHandle(ref, () => ({
        recargar: cargarIncumplimientos
    }));

    useEffect(() => {
        cargarIncumplimientos();
    }, [tareaId]);

    return (
        <div className="mt-6">
            <div className="flex items-center mb-4">
                <FiAlertCircle className="text-yellow-500 mr-2" size={18} />
                <h3 className="text-sm text-gray-800">
                    Historial de incumplimientos {incumplimientos.length > 0 && 
                        <span className="text-yellow-600 ml-1">({incumplimientos.length})</span>
                    }
                </h3>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                    <span className="ml-3 text-sm text-gray-600">Cargando incumplimientos...</span>
                </div>
            ) : incumplimientos.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-gray-400 mb-2">
                        <FiAlertCircle size={24} className="mx-auto opacity-50" />
                    </div>
                    <p className="text-sm text-gray-500">No hay incumplimientos registrados</p>
                </div>
            ) : (
                <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {incumplimientos.map((incumplimiento, index) => (
                        <li 
                            key={incumplimiento.CN_Id_incumplimiento ?? incumplimiento.cN_Id_incumplimiento ?? index} 
                            className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center mb-2 text-xs text-yellow-800 font-medium">
                                <FiClock className="mr-1" size={12} />
                                <span>{new Date(incumplimiento.CF_Fecha_incumplimiento ?? incumplimiento.cF_Fecha_incumplimiento).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{incumplimiento.CT_Justificacion_incumplimiento ?? incumplimiento.cT_Justificacion_incumplimiento}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

HistorialIncumplimientos.displayName = "HistorialIncumplimientos";

export default HistorialIncumplimientos;
