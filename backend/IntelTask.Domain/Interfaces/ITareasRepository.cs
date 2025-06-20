using IntelTask.Domain.Entities;
using IntelTask.Domain.DTOs;

namespace IntelTask.Domain.Interfaces
{    public interface ITareasRepository
    {
        Task<IEnumerable<ETareas>> F_PUB_ObtenerTodasLasTareas();
        Task<IEnumerable<ETareas>> F_PUB_ObtenerTareasPorUsuario(int usuarioId);
        Task<ETareas?> F_PUB_ObtenerTareaPorId(int id);
        Task M_PUB_AgregarTarea(ETareas tarea);
        Task<ETareas> M_PUB_ActualizarTarea(int id, TareaUpdateRequest request);
        Task M_PUB_EliminarTarea(int id);
        Task<IEnumerable<ETareasSeguimiento>> F_PUB_ObtenerSeguimientosPorTarea(int tareaId);
        Task M_PUB_AgregarSeguimiento(ETareasSeguimiento seguimiento);
        Task<IEnumerable<ETareasIncumplimiento>> F_PUB_ObtenerIncumplimientosPorTarea(int tareaId);
        Task M_PUB_AgregarIncumplimiento(ETareasIncumplimiento incumplimiento);
        Task<IEnumerable<ETareasJustificacionRechazo>> F_PUB_ObtenerRechazosPorTarea(int tareaId);
        Task M_PUB_AgregarRechazo(ETareasJustificacionRechazo rechazo);
    }
}
