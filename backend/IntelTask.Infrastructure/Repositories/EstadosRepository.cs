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

        public async Task<IEnumerable<EEstados>> F_PUB_ObtenerTodosLosEstados()
        {
            return await _context.T_Estados.ToListAsync();
        }

        public async Task<EEstados?> F_PUB_ObtenerEstadoPorId(byte id)
        {
            return await _context.T_Estados.FindAsync(id);
        }

        public async Task M_PUB_AgregarEstado(EEstados estado)
        {
            await _context.T_Estados.AddAsync(estado);
            await _context.SaveChangesAsync();
        }

        public async Task M_PUB_ActualizarEstado(EEstados estado)
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
