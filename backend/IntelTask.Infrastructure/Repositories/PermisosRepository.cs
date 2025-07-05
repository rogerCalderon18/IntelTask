using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Domain.DTOs;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class PermisosRepository : IPermisosRepository
    {
        private readonly IntelTaskDbContext _context;
        private readonly IBitacoraCambioEstadoService _bitacoraCambioEstadoService;

        public PermisosRepository(IntelTaskDbContext context, IBitacoraCambioEstadoService bitacoraCambioEstadoService)
        {
            _context = context;
            _bitacoraCambioEstadoService = bitacoraCambioEstadoService;
        }

        public async Task<IEnumerable<EPermisos>> F_PUB_ObtenerTodosLosPermisos()
        {
            return await _context.T_Permisos
                .Include(p => p.Estado)
                .Include(p => p.UsuarioCreador)
                    .ThenInclude(u => u!.Rol)
                .OrderByDescending(p => p.CF_Fecha_hora_registro)
                .ToListAsync();
        }

        public async Task<IEnumerable<EPermisos>> F_PUB_ObtenerPermisosPorUsuario(int usuarioId)
        {
            return await _context.T_Permisos
                .Include(p => p.Estado)
                .Include(p => p.UsuarioCreador)
                    .ThenInclude(u => u!.Rol)
                .Where(p => p.CN_Usuario_creador == usuarioId)
                .OrderByDescending(p => p.CF_Fecha_hora_registro)
                .ToListAsync();
        }

        public async Task<EPermisos?> F_PUB_ObtenerPermisoPorId(int id)
        {
            return await _context.T_Permisos
                .Include(p => p.Estado)
                .Include(p => p.UsuarioCreador)
                    .ThenInclude(u => u!.Rol)
                .FirstOrDefaultAsync(p => p.CN_Id_permiso == id);
        }

        public async Task M_PUB_AgregarPermiso(EPermisos permiso)
        {
            try
            {
                // Verificar si existen las relaciones
                await ValidarRelaciones(permiso);
                
                // Generar ID manualmente
                var maxId = await _context.T_Permisos.AnyAsync() 
                    ? await _context.T_Permisos.MaxAsync(p => p.CN_Id_permiso) 
                    : 0;
                permiso.CN_Id_permiso = maxId + 1;
                
                // Establecer valores por defecto
                permiso.CF_Fecha_hora_registro = DateTime.Now;
                permiso.CN_Id_estado = 1; // Estado inicial: Registrado
                
                await _context.T_Permisos.AddAsync(permiso);
                await _context.SaveChangesAsync();

                // Registrar bitácora de creación
                var bitacora = new EBitacoraCambioEstado
                {
                    CN_Id_tarea_permiso = permiso.CN_Id_permiso,
                    CN_Id_tipo_documento = 2, // 2 = permiso (asumiendo que 1 = tarea)
                    CN_Id_estado_anterior = 1, // Estado inicial
                    CN_Id_estado_nuevo = permiso.CN_Id_estado,
                    CF_Fecha_hora_cambio = DateTime.Now,
                    CN_Id_usuario_responsable = permiso.CN_Usuario_creador,
                    CT_Observaciones = "Permiso creado"
                };
                await _bitacoraCambioEstadoService.M_PUB_RegistrarCambioEstadoAsync(bitacora);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al agregar permiso: {ex.Message}");
                throw new Exception("DB_ERROR: Error al crear el permiso en la base de datos.", ex);
            }
        }

        public async Task<EPermisos> M_PUB_ActualizarPermiso(int id, PermisoUpdateRequest request)
        {
            try
            {
                var permisoExistente = await _context.T_Permisos
                    .Include(p => p.Estado)
                    .Include(p => p.UsuarioCreador)
                    .FirstOrDefaultAsync(p => p.CN_Id_permiso == id);

                if (permisoExistente == null)
                {
                    throw new Exception("PERMISO_NO_ENCONTRADO: El permiso especificado no existe.");
                }

                // Validar relaciones antes de actualizar
                await ValidarRelacionesParaActualizacion(request);

                var estadoAnterior = permisoExistente.CN_Id_estado;

                // Actualizar solo los campos permitidos
                permisoExistente.CT_Titulo_permiso = request.CT_Titulo_permiso;
                permisoExistente.CT_Descripcion_permiso = request.CT_Descripcion_permiso;
                permisoExistente.CN_Id_estado = request.CN_Id_estado;
                permisoExistente.CT_Descripcion_rechazo = request.CT_Descripcion_rechazo;
                permisoExistente.CF_Fecha_hora_inicio_permiso = request.CF_Fecha_hora_inicio_permiso;
                permisoExistente.CF_Fecha_hora_fin_permiso = request.CF_Fecha_hora_fin_permiso;

                _context.Entry(permisoExistente).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                // Guardar cambio de estado en la bitácora si el estado cambió
                if (estadoAnterior != request.CN_Id_estado)
                {
                    var bitacora = new EBitacoraCambioEstado
                    {
                        CN_Id_tarea_permiso = permisoExistente.CN_Id_permiso,
                        CN_Id_tipo_documento = 2, // 2 = permiso
                        CN_Id_estado_anterior = estadoAnterior,
                        CN_Id_estado_nuevo = request.CN_Id_estado,
                        CF_Fecha_hora_cambio = DateTime.Now,
                        CN_Id_usuario_responsable = request.CN_Usuario_editor,
                        CT_Observaciones = request.CT_Descripcion_rechazo
                    };
                    await _bitacoraCambioEstadoService.M_PUB_RegistrarCambioEstadoAsync(bitacora);
                }

                return await F_PUB_ObtenerPermisoPorId(id) ?? permisoExistente;
            }
            catch (Exception ex)
            {
                throw new Exception($"DB_ERROR: Error al actualizar el permiso: {ex.Message}", ex);
            }
        }

        public async Task M_PUB_EliminarPermiso(int id)
        {
            try
            {
                var permisoExistente = await _context.T_Permisos
                    .FirstOrDefaultAsync(p => p.CN_Id_permiso == id);

                if (permisoExistente == null)
                {
                    throw new Exception("PERMISO_NO_ENCONTRADO: El permiso especificado no existe.");
                }

                // Verificar si tiene adjuntos asociados y eliminarlos primero
                var adjuntosAsociados = await _context.T_Adjuntos_X_Permisos
                    .Where(ap => ap.CN_Id_permiso == id)
                    .ToListAsync();

                if (adjuntosAsociados.Any())
                {
                    _context.T_Adjuntos_X_Permisos.RemoveRange(adjuntosAsociados);
                }

                _context.T_Permisos.Remove(permisoExistente);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"DB_ERROR: Error al eliminar el permiso: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<EPermisos>> F_PUB_ObtenerPermisosParaRevisar(int usuarioId)
        {
            try
            {
                // 1. Obtener usuario, rol y oficina
                var usuario = await _context.T_Usuarios
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.CN_Id_usuario == usuarioId);
                
                if (usuario == null)
                {
                    return new List<EPermisos>();
                }

                var rolUsuario = usuario.CN_Id_rol;
                var oficinaUsuario = await _context.TI_Usuario_X_Oficina
                    .Where(x => x.CN_Id_usuario == usuarioId)
                    .Select(x => x.CN_Codigo_oficina)
                    .FirstOrDefaultAsync();

                List<int> usuariosQueReviso = new List<int>();

                // 2. Lógica según el rol para determinar qué usuarios puedo revisar
                // Jerarquía de aprobación: Director -> Subdirector -> Jefe -> Coordinador -> Roles menores
                switch (rolUsuario)
                {
                    case 1: // Director revisa las solicitudes del Subdirector
                        var subdirectores = await _context.T_Usuarios
                            .Where(u => u.CN_Id_rol == 2)
                            .Select(u => u.CN_Id_usuario)
                            .ToListAsync();
                        usuariosQueReviso.AddRange(subdirectores);
                        break;

                    case 2: // Subdirector revisa las solicitudes de los Jefes
                        var jefes = await _context.T_Usuarios
                            .Where(u => u.CN_Id_rol == 3)
                            .Select(u => u.CN_Id_usuario)
                            .ToListAsync();
                        usuariosQueReviso.AddRange(jefes);
                        break;

                    case 3: // Jefe revisa solicitudes de Coordinadores en oficinas dependientes
                        var oficinasDependientes = await _context.T_Oficinas
                            .Where(o => o.CN_Oficina_encargada == oficinaUsuario)
                            .Select(o => o.CN_Codigo_oficina)
                            .ToListAsync();

                        if (oficinasDependientes.Any())
                        {
                            var coordinadoresEnOficinasDependientes = await _context.TI_Usuario_X_Oficina
                                .Where(x => oficinasDependientes.Contains(x.CN_Codigo_oficina))
                                .Include(x => x.Usuario!)
                                .Where(x => x.Usuario != null && x.Usuario.CN_Id_rol == 4) // Solo Coordinadores
                                .Select(x => x.CN_Id_usuario)
                                .ToListAsync();

                            usuariosQueReviso.AddRange(coordinadoresEnOficinasDependientes);
                        }
                        break;

                    case 4: // Coordinador revisa usuarios con roles menores en su oficina
                        var usuariosEnMismaOficina = await _context.TI_Usuario_X_Oficina
                            .Where(x => x.CN_Codigo_oficina == oficinaUsuario && x.CN_Id_usuario != usuarioId)
                            .Include(x => x.Usuario!)
                            .Where(x => x.Usuario != null && new[] { 5, 6, 7, 8 }.Contains(x.Usuario.CN_Id_rol))
                            .Select(x => x.CN_Id_usuario)
                            .ToListAsync();

                        usuariosQueReviso.AddRange(usuariosEnMismaOficina);
                        break;

                    default:
                        // Otros roles no revisan permisos
                        break;
                }

                // 3. Obtener permisos de los usuarios que puedo revisar
                if (usuariosQueReviso.Any())
                {
                    return await _context.T_Permisos
                        .Include(p => p.Estado)
                        .Include(p => p.UsuarioCreador)
                            .ThenInclude(u => u!.Rol)
                        .Where(p => usuariosQueReviso.Contains(p.CN_Usuario_creador))
                        .OrderByDescending(p => p.CF_Fecha_hora_registro)
                        .ToListAsync();
                }

                return new List<EPermisos>();
            }
            catch (Exception ex)
            {
                throw new Exception($"DB_ERROR: Error al obtener permisos para revisar: {ex.Message}", ex);
            }
        }

        private async Task ValidarRelaciones(EPermisos permiso)
        {
            // Validar que exista el usuario creador
            if (!await _context.T_Usuarios.AnyAsync(u => u.CN_Id_usuario == permiso.CN_Usuario_creador))
            {
                throw new Exception("RELACION_ERROR: El usuario creador especificado no existe.");
            }

            // Validar fechas lógicas
            if (permiso.CF_Fecha_hora_inicio_permiso >= permiso.CF_Fecha_hora_fin_permiso)
            {
                throw new Exception("FECHA_ERROR: La fecha de inicio del permiso debe ser anterior a la fecha de fin.");
            }
        }

        private async Task ValidarRelacionesParaActualizacion(PermisoUpdateRequest request)
        {
            // Validar que exista el estado
            if (!await _context.T_Estados.AnyAsync(e => e.CN_Id_estado == request.CN_Id_estado))
            {
                throw new Exception("RELACION_ERROR: El estado especificado no existe.");
            }

            // Validar fechas lógicas
            if (request.CF_Fecha_hora_inicio_permiso >= request.CF_Fecha_hora_fin_permiso)
            {
                throw new Exception("FECHA_ERROR: La fecha de inicio del permiso debe ser anterior a la fecha de fin.");
            }
        }
    }
}
