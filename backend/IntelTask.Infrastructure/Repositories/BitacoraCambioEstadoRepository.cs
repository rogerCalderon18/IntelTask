using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;

namespace IntelTask.Infrastructure.Repositories
{
    public class BitacoraCambioEstadoRepository : IBitacoraCambioEstadoRepository
    {
        private readonly IntelTaskDbContext _context;

        public BitacoraCambioEstadoRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EBitacoraCambioEstado>> F_PUB_ObtenerPorTareaYTipoDocumentoAsync(int idTareaPermiso, int idTipoDocumento)
        {
            return await Task.Run(() => _context.T_Bitacora_Cambio_Estado
                .Where(b => b.CN_Id_tarea_permiso == idTareaPermiso && b.CN_Id_tipo_documento == idTipoDocumento)
                .OrderBy(b => b.CF_Fecha_hora_cambio)
                .ToList());
        }

        public async Task M_PUB_RegistrarCambioEstadoAsync(EBitacoraCambioEstado bitacora)
        {
            _context.T_Bitacora_Cambio_Estado.Add(bitacora);
            await _context.SaveChangesAsync();
        }
    }
}
