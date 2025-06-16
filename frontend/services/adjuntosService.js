const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5185/api';

export const adjuntosService = {
    async subirArchivo(archivo, usuarioId, idTarea) {
        if (!idTarea) {
            throw new Error('Se requiere el ID de la tarea para subir adjuntos');
        }

        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('usuarioId', usuarioId.toString());
        formData.append('idTarea', idTarea.toString());

        const response = await fetch(`${API_BASE_URL}/api/Adjuntos/subir`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al subir archivo');
        }

        return await response.json();
    },

    async obtenerPorTarea(idTarea) {
        const response = await fetch(`${API_BASE_URL}/api/Adjuntos/tarea/${idTarea}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al obtener adjuntos');
        }

        return await response.json();
    },

    async eliminarArchivo(id) {
        const response = await fetch(`${API_BASE_URL}/api/Adjuntos/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar archivo');
        }
    },    obtenerUrlDescarga(id) {
        return `${API_BASE_URL}/api/Adjuntos/descargar/${id}`;
    }
};
