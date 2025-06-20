using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.Threading.Tasks;

namespace IntelTask.Infrastructure.Repositories
{
    public class UsuariosRepository : IUsuariosRepository
    {
        private readonly IntelTaskDbContext _context;

        public UsuariosRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task M_PUB_CrearUsuario(EUsuarios usuario)
        {
            usuario.CT_Contrasenna = BCrypt.Net.BCrypt.HashPassword(usuario.CT_Contrasenna);
            await _context.T_Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();
        }

        public async Task<EUsuarios?> F_PUB_ObtenerUsuarioPorCorreo(string correo)
        {
            return await _context.T_Usuarios.FirstOrDefaultAsync(u => u.CT_Correo_usuario == correo);
        }

        public async Task<EUsuarios?> F_PUB_ObtenerUsuarioPorId(int id)
        {
            return await _context.T_Usuarios.FindAsync(id);
        }

        public async Task<IEnumerable<EUsuarios>> F_PUB_ObtenerTodosLosUsuarios()
        {
            return await _context.T_Usuarios.ToListAsync();
        }

        public async Task M_PUB_ActualizarUsuario(EUsuarios usuario)
        {
            var existingUsuario = await _context.T_Usuarios.FindAsync(usuario.CN_Id_usuario);
            if (existingUsuario != null)
            {
                existingUsuario.CT_Nombre_usuario = usuario.CT_Nombre_usuario;
                existingUsuario.CT_Correo_usuario = usuario.CT_Correo_usuario;
                existingUsuario.CF_Fecha_nacimiento = usuario.CF_Fecha_nacimiento;
                existingUsuario.CB_Estado_usuario = usuario.CB_Estado_usuario;
                existingUsuario.CF_Fecha_modificacion_usuario = DateTime.Now;
                existingUsuario.CN_Id_rol = usuario.CN_Id_rol;

                if (!string.IsNullOrEmpty(usuario.CT_Contrasenna))
                {
                    existingUsuario.CT_Contrasenna = BCrypt.Net.BCrypt.HashPassword(usuario.CT_Contrasenna);
                }

                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<EUsuarios>> F_PUB_ObtenerUsuariosAsignables(int idUsuario)
        {
            // 1. Obtener usuario, rol y oficina
            var usuario = await _context.T_Usuarios.FindAsync(idUsuario);
            if (usuario == null)
            {
                return new List<EUsuarios>();
            }
            var rolUsuario = usuario.CN_Id_rol;
            var oficinaUsuario = await _context.TI_Usuario_X_Oficina
                .Where(x => x.CN_Id_usuario == idUsuario)
                .Select(x => x.CN_Codigo_oficina)
                .FirstOrDefaultAsync();

            // 2. Definir roles asignables según la jerarquía
            List<int> rolesAsignables = rolUsuario switch
            {
                1 => new List<int> { 2 }, // Director → Subdirector
                2 => new List<int> { 3 }, // Subdirector → Jefe
                3 => new List<int> { 4, 5 }, // Jefe → Coordinador, Profesional 3
                4 => new List<int> { 5, 6, 7, 8 }, // Coordinador → Profesional 3, 2, 1, Técnico
                5 => new List<int> { 6, 7, 8 }, // Profesional 3 → Profesional 2, 1, Técnico
                _ => new List<int>() // Otros no pueden asignar
            };

            if (!rolesAsignables.Any())
                return new List<EUsuarios>();

            // 3. Buscar oficinas dependientes de la oficina del usuario actual
            var oficinasDependientes = await _context.T_Oficinas
                .Where(o => o.CN_Oficina_encargada == oficinaUsuario)
                .Select(o => o.CN_Codigo_oficina)
                .ToListAsync();

            // Incluir la oficina actual
            oficinasDependientes.Add(oficinaUsuario);
            // 4. Buscar usuarios en esas oficinas y con roles permitidos
            var usuariosAsignables = await _context.TI_Usuario_X_Oficina
                .Where(x => oficinasDependientes.Contains(x.CN_Codigo_oficina))
                .Include(x => x.Usuario!)
                    .ThenInclude(u => u.Rol!)
                .Where(x => x.Usuario != null
                         && x.Usuario.Rol != null
                         && rolesAsignables.Contains(x.Usuario.CN_Id_rol))
                .Select(x => x.Usuario)
                .ToListAsync();

            return usuariosAsignables.Where(u => u != null).Cast<EUsuarios>().ToList();
        }

    }
}