const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5185/api';

export const adjuntosService = {
    async subirArchivo(formData) {
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

    async obtenerPorPermiso(idPermiso) {
        const response = await fetch(`${API_BASE_URL}/api/Adjuntos/permiso/${idPermiso}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al obtener adjuntos del permiso');
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
    },

    async descargarArchivo(id) {
        const response = await fetch(`${API_BASE_URL}/api/Adjuntos/descargar/${id}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al descargar archivo');
        }

        // Crear un blob del archivo y descargarlo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Intentar obtener el nombre del archivo del header
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match) {
                a.download = match[1];
            }
        } else {
            a.download = `archivo_${id}`;
        }
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    obtenerUrlDescarga(id) {
        return `${API_BASE_URL}/api/Adjuntos/descargar/${id}`;
    }
};
