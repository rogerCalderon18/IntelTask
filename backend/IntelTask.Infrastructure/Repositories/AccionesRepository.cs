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

        public async Task<IEnumerable<EAcciones>> F_PUB_ObtenerTodasLasAcciones()
        {
            return await _context.T_Acciones.ToListAsync();
        }

        public async Task<EAcciones?> F_PUB_ObtenerAccionPorId(int id)
        {
            return await _context.T_Acciones.FindAsync(id);
        }

        public async Task M_PUB_AgregarAccion(EAcciones accion)
        {
            bool accionExists = await _context.T_Acciones.AnyAsync(a => a.CT_Descripcion_accion == accion.CT_Descripcion_accion);

            if (accionExists)
            {
                throw new InvalidOperationException("DUPLICATE: Ya existe una acción con la misma descripción.");
            }

            try
            {
                await _context.T_Acciones.AddAsync(accion);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("DB_ERROR: Error al guardar en la base de datos.", ex);
            }
        }

        public async Task M_PUB_ActualizarAccion(EAcciones accion)
        {
            var existingAccion = await _context.T_Acciones.FindAsync(accion.CN_Id_accion);
            if (existingAccion != null)
            {
                bool duplicateExists = await _context.T_Acciones.AnyAsync(a => a.CT_Descripcion_accion == accion.CT_Descripcion_accion
                && a.CN_Id_accion != accion.CN_Id_accion);

                if (duplicateExists)
                {
                    throw new InvalidOperationException("DUPLICATE: Ya existe otra acción con la misma descripción.");
                }

                try
                {
                    existingAccion.CT_Descripcion_accion = accion.CT_Descripcion_accion;
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    throw new Exception("DB_ERROR: Error al actualizar en la base de datos.", ex);
                }
            }
        }
    }
}
