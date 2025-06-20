using System.Collections.Generic;
using System.Threading.Tasks;
using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;

namespace IntelTask.Infrastructure.Services
{
    public class BitacoraCambioEstadoService : IBitacoraCambioEstadoService
    {
        private readonly IBitacoraCambioEstadoRepository _repository;

        public BitacoraCambioEstadoService(IBitacoraCambioEstadoRepository repository)
        {
            _repository = repository;
        }

        public async Task M_PUB_RegistrarCambioEstadoAsync(EBitacoraCambioEstado bitacora)
        {
            await _repository.M_PUB_RegistrarCambioEstadoAsync(bitacora);
        }

        public async Task<IEnumerable<EBitacoraCambioEstado>> F_PUB_ObtenerPorTareaYTipoDocumentoAsync(int idTareaPermiso, int idTipoDocumento)
        {
            return await _repository.F_PUB_ObtenerPorTareaYTipoDocumentoAsync(idTareaPermiso, idTipoDocumento);
        }
    }
}
