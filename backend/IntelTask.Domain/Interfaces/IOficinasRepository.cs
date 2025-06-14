using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IOficinasRepository
    {
        Task<IEnumerable<EOficinas>> F_PUB_ObtenerTodasLasOficinas();
        Task<EOficinas?> F_PUB_ObtenerOficinaPorId(int id);
        Task M_PUB_AgregarOficina(EOficinas oficina);
        Task M_PUB_ActualizarOficina(EOficinas oficina);
    }

}
