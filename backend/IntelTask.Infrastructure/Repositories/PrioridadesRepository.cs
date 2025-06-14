using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{    public class PrioridadesRepository : IPrioridadesRepository
    {
        private readonly IntelTaskDbContext _context;

        public PrioridadesRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EPrioridades>> F_PUB_ObtenerTodasLasPrioridades()
        {
            return await _context.T_Prioridades.ToListAsync();
        }

        public async Task<EPrioridades?> F_PUB_ObtenerPrioridadPorId(byte id)
        {
            return await _context.T_Prioridades.FindAsync(id);
        }

        public async Task M_PUB_AgregarPrioridad(EPrioridades prioridad)
        {
            await _context.T_Prioridades.AddAsync(prioridad);
            await _context.SaveChangesAsync();
        }

        public async Task M_PUB_ActualizarPrioridad(EPrioridades prioridad)
        {
            var existingPrioridad = await _context.T_Prioridades.FindAsync(prioridad.CN_Id_prioridad);
            if (existingPrioridad != null)
            {
                existingPrioridad.CT_Nombre_prioridad = prioridad.CT_Nombre_prioridad;
                existingPrioridad.CT_Descripcion_prioridad = prioridad.CT_Descripcion_prioridad;
                await _context.SaveChangesAsync();
            }
        }
    }
}
