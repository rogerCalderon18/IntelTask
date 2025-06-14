using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IComplejidadesRepository
    {
        Task<IEnumerable<EComplejidades>> F_PUB_ObtenerTodasLasComplejidades();
        Task<EComplejidades?> F_PUB_ObtenerComplejidadPorId(byte id);
        Task M_PUB_AgregarComplejidad(EComplejidades complejidad);
        Task M_PUB_ActualizarComplejidad(EComplejidades complejidad);
    }
}
