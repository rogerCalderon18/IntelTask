using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class EstadosRepository : IEstadosRepository
    {
        private readonly IntelTaskDbContext _context;

        public EstadosRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EEstados>> GetAllEstadosAsync()
        {
            return await _context.T_Estados.ToListAsync();
        }

        public async Task<EEstados?> GetEstadoByIdAsync(byte id)
        {
            return await _context.T_Estados.FindAsync(id);
        }

        public async Task AddEstadoAsync(EEstados estado)
        {
            await _context.T_Estados.AddAsync(estado);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEstadoAsync(EEstados estado)
        {
            var existingEstado = await _context.T_Estados.FindAsync(estado.CN_Id_estado);
            if (existingEstado != null)
            {
                existingEstado.CT_Estado = estado.CT_Estado;
                existingEstado.CT_Descripcion = estado.CT_Descripcion;
                await _context.SaveChangesAsync();
            }
        }
    }
}
