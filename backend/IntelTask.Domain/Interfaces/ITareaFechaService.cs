using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface ITareaFechaService
    {
        /// <summary>
        /// Verifica y actualiza automáticamente la fecha límite de la tarea principal
        /// cuando se modifica una subtarea según la Opción A
        /// </summary>
        /// <param name="subtareaId">ID de la subtarea que se está modificando</param>
        /// <param name="nuevaFechaLimite">Nueva fecha límite de la subtarea</param>
        /// <param name="usuarioEditor">ID del usuario que está editando</param>
        /// <returns>True si se actualizó la tarea principal, False si no fue necesario</returns>
        Task<bool> M_PUB_ActualizarFechaPrincipalSiEsNecesarioAsync(int subtareaId, DateTime nuevaFechaLimite, int usuarioEditor);

        /// <summary>
        /// Obtiene todas las subtareas de una tarea principal
        /// </summary>
        /// <param name="tareaId">ID de la tarea principal</param>
        /// <returns>Lista de subtareas</returns>
        Task<IEnumerable<ETareas>> F_PUB_ObtenerSubtareasAsync(int tareaId);

        /// <summary>
        /// Calcula la nueva fecha límite para la tarea principal basada en sus subtareas
        /// </summary>
        /// <param name="subtareas">Lista de subtareas</param>
        /// <param name="bufferDias">Días de buffer a agregar (por defecto 1)</param>
        /// <returns>Nueva fecha límite calculada</returns>
        DateTime F_PUB_CalcularNuevaFechaPrincipal(IEnumerable<ETareas> subtareas, int bufferDias = 1);
    }
}
