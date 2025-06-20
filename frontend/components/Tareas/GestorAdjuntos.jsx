import React, { useState, useEffect } from 'react';
import { Button, Spinner } from '@heroui/react';
import { FaPaperclip, FaDownload, FaTrash } from 'react-icons/fa';
import { adjuntosService } from '../../services/adjuntosService';
import { useSession } from 'next-auth/react';
import useConfirmation from '@/hooks/useConfirmation';

const GestorAdjuntos = ({ idTarea, adjuntos: adjuntosIniciales = [], onAdjuntosChange }) => {
    const { data: session } = useSession();
    const [adjuntos, setAdjuntos] = useState(adjuntosIniciales);
    const [cargando, setCargando] = useState(false);
    const [subiendo, setSubiendo] = useState(false);
    const { showConfirmation } = useConfirmation();

   
    useEffect(() => {
        if (idTarea) {
            cargarAdjuntos();
        }
    }, [idTarea]);

    const cargarAdjuntos = async () => {
        if (!idTarea) return;

        try {
            setCargando(true);
            const adjuntosData = await adjuntosService.obtenerPorTarea(idTarea);
            setAdjuntos(adjuntosData);
            onAdjuntosChange?.(adjuntosData);
        } catch (error) {
            console.error('Error al cargar adjuntos:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleFileSelect = async (event) => {
        const archivo = event.target.files[0];
        if (!archivo || !session?.user?.id || !idTarea) {
            if (!idTarea) {
                alert('Debe guardar la tarea antes de poder adjuntar archivos');
            }
            event.target.value = ''; // Limpiar input
            return;
        }

        try {
            setSubiendo(true);
            const resultado = await adjuntosService.subirArchivo(
                archivo,
                session.user.id,
                idTarea
            );

            // Recargar adjuntos
            await cargarAdjuntos();
        } catch (error) {
            console.error('Error al subir archivo:', error);
            alert('Error al subir el archivo');
        } finally {
            setSubiendo(false);
            event.target.value = ''; // Limpiar input
        }
    };

    const handleEliminar = (id) => {
        showConfirmation({
            title: "¿Está seguro de eliminar este archivo?",
            description: "Esta acción no se puede deshacer.",
            type: "danger",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            onConfirm: async () => {
                try {
                    await adjuntosService.eliminarArchivo(id);
                    await cargarAdjuntos();
                } catch (error) {
                    console.error('Error al eliminar archivo:', error);
                    alert('Error al eliminar el archivo');
                }
            }
        });
    };

    const handleDescargar = (id) => {
        const url = adjuntosService.obtenerUrlDescarga(id);
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Adjuntos:</label>
                <div className="flex items-center gap-2">`
                    <input
                        type="file"
                        id="file-input"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        disabled={subiendo}
                    />                    <Button
                        type="button"
                        variant="flat"
                        size="sm"
                        className="bg-sky-100 text-sky-700"
                        onPress={() => document.getElementById('file-input').click()}
                        isLoading={subiendo}
                        isDisabled={!idTarea || subiendo}
                        spinner={<Spinner size="sm" />}
                    >
                        <FaPaperclip className="mr-1" />
                        {subiendo ? 'Subiendo...' : 'Adjuntar'}
                    </Button>
                </div>
            </div>

            {cargando ? (
                <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                </div>
            ) : (
                <div className="space-y-2">
                    {adjuntos.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay adjuntos...</p>
                    ) : (
                        adjuntos.map((adjunto) => (
                            <div key={adjunto.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm truncate flex-1">{adjunto.nombre}</span>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant="light"
                                        size="sm"
                                        className="text-blue-600 min-w-unit-8 h-unit-8"
                                        onPress={() => handleDescargar(adjunto.id)}
                                    >
                                        <FaDownload />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="light"
                                        size="sm"
                                        className="text-red-600 min-w-unit-8 h-unit-8"
                                        onPress={() => handleEliminar(adjunto.id)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default GestorAdjuntos;
