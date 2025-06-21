import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { getSeguimientos } from "../../services/seguimientoService";
import { FiMessageCircle, FiClock } from "react-icons/fi";

const Seguimientos = forwardRef(({ tarea }, ref) => {
    const [seguimientos, setSeguimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const ESTADOS_SEGUIMIENTO = [2, 3, 4];
    const estadoId = tarea?.CN_Id_estado ?? tarea?.cN_Id_estado;
    const puedeVerSeguimientos = ESTADOS_SEGUIMIENTO.includes(estadoId);
    
    const cargarSeguimientos = async () => {
        if (tarea?.CN_Id_tarea || tarea?.cN_Id_tarea) {
            setLoading(true);
            const id = tarea?.CN_Id_tarea ?? tarea?.cN_Id_tarea;
            try {
                const data = await getSeguimientos(id);
                setSeguimientos(data);
            } catch (error) {
                console.error("Error al cargar seguimientos:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useImperativeHandle(ref, () => ({
        recargar: cargarSeguimientos
    }));

    useEffect(() => {
        cargarSeguimientos();
    }, [tarea?.CN_Id_tarea, tarea?.cN_Id_tarea]);

    if (!puedeVerSeguimientos) return null;

    return (
        <div className="mt-6">
            <div className="flex items-center mb-4">
                <FiMessageCircle className="text-blue-500 mr-2" size={18} />
                <h3 className="text-sm text-gray-800">
                    Historial de seguimientos {seguimientos.length > 0 && <span className="text-blue-600 ml-1">({seguimientos.length})</span>}
                </h3>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-sm text-gray-600">Cargando seguimientos...</span>
                </div>
            ) : seguimientos.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-gray-400 mb-2">
                        <FiMessageCircle size={24} className="mx-auto opacity-50" />
                    </div>
                    <p className="text-sm text-gray-500">No hay seguimientos registrados</p>
                </div>
            ) : (
                <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {seguimientos.map((s, index) => (
                        <li 
                            key={s.CN_Id_seguimiento ?? s.cN_Id_seguimiento ?? index} 
                            className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center mb-2 text-xs text-blue-800 font-medium">
                                <FiClock className="mr-1" size={12} />
                                <span>{new Date(s.CF_Fecha_seguimiento ?? s.cF_Fecha_seguimiento).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{s.CT_Comentario ?? s.cT_Comentario}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

Seguimientos.displayName = "Seguimientos";
export default Seguimientos;
