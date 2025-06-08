using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class AccionesRepository : IAccionesRepository
    {
        private readonly IntelTaskDbContext _context;

        public AccionesRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EAcciones>> GetAllAccionesAsync()
        {
            return await _context.T_Acciones.ToListAsync();
        }

        public async Task<EAcciones?> GetAccionByIdAsync(byte id)
        {
            return await _context.T_Acciones.FindAsync(id);
        }

        public async Task AddAccionAsync(EAcciones accion)
        {
            await _context.T_Acciones.AddAsync(accion);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAccionAsync(EAcciones accion)
        {
            var existingAccion = await _context.T_Acciones.FindAsync(accion.CN_Id_accion);
            if (existingAccion != null)
            {
                existingAccion.CT_Descripcion_accion = accion.CT_Descripcion_accion;
                await _context.SaveChangesAsync();
            }
        }
    }
}
