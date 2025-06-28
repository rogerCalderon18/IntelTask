import { useState } from "react";
import { FiMessageCircle, FiSend } from "react-icons/fi";
import { agregarSeguimiento } from "../../services/seguimientoService";
import { useSession } from "next-auth/react";

export default function SeguimientoInput({ tareaId, tarea, onAgregado }) {
    const [comentario, setComentario] = useState("");
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [justAdded, setJustAdded] = useState(false);
    const estadosPermitidos = [2, 3, 4, 17];

    const usuarioAsignado = tarea?.cN_Usuario_asignado ?? tarea?.CN_Usuario_asignado;
    const usuarioActual = parseInt(session.user?.id);
    const estadoTarea = tarea?.cN_Id_estado ?? tarea?.CN_Id_estado;

    const handleAgregar = async () => {
        if (!comentario.trim()) return;
        setLoading(true);
        try {
            await agregarSeguimiento(tareaId, comentario);
            setComentario("");
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
            if (onAgregado) onAgregado();
        } catch (error) {
            console.error("Error al agregar seguimiento:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!estadosPermitidos.includes(estadoTarea)) {
        return null;
    }

    if (usuarioAsignado !== usuarioActual) {
        return (
            <div className="mt-5">
                <div className="flex items-center mb-3">
                    <FiMessageCircle className="text-red-500 mr-2" size={16} />
                    <h4 className="text-sm font-medium text-gray-700">No tienes permiso para agregar comentarios</h4>
                </div>
                <p className="text-sm text-gray-500">Solo el usuario asignado puede realizar comentarios de seguimiento.</p>
            </div>
        );
    }

    return (
        <div className="mt-5">
            <div className="flex items-center mb-3">
                <FiMessageCircle className="text-blue-500 mr-2" size={16} />
                <h4 className="text-sm font-medium text-gray-700">Agregar comentario de seguimiento</h4>

                {justAdded && (
                    <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                        ¡Comentario agregado!
                    </span>
                )}
            </div>

            <div className={`bg-blue-50 rounded-lg p-4 border transition-all ${justAdded ? 'border-green-200' : 'border-blue-100'} shadow-sm`}>
                <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Escribe aquí tu comentario de seguimiento..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 outline-none text-sm resize-none bg-white"
                    disabled={loading}
                />

                <div className="flex justify-end mt-3">
                    <button
                        onClick={handleAgregar}
                        className={`
                            flex items-center px-4 py-2 rounded-md text-sm font-medium
                            ${loading || !comentario.trim()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                            }
                            transition-all duration-200 shadow-sm
                        `}
                        disabled={loading || !comentario.trim()}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                <span>Agregando...</span>
                            </>
                        ) : (
                            <>
                                <FiSend className="mr-2" size={14} />
                                <span>Agregar comentario</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
