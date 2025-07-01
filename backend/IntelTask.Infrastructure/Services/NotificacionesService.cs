using IntelTask.Domain.DTOs;
using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IntelTask.Infrastructure.Services
{
    public class NotificacionesService : INotificacionesService
    {
        private readonly INotificacionesRepository _notificacionesRepository;
        private readonly IUsuariosRepository _usuariosRepository;
        private readonly ILogger<NotificacionesService> _logger;
        private readonly EmailSettings _emailSettings;

        public NotificacionesService(
            INotificacionesRepository notificacionesRepository,
            IUsuariosRepository usuariosRepository,
            ILogger<NotificacionesService> logger,
            IOptions<EmailSettings> emailSettings)
        {
            _notificacionesRepository = notificacionesRepository;
            _usuariosRepository = usuariosRepository;
            _logger = logger;
            _emailSettings = emailSettings.Value;
        }

        public async Task<int> M_PUB_GuardarNotificacion(NotificacionEmailRequest request, int? usuarioId = null)
        {
            try
            {
                _logger.LogInformation("Guardando notificación en base de datos");

                // Crear la notificación principal
                var notificacion = new ENotificaciones
                {
                    CT_Titulo_notificacion = request.CT_Asunto,
                    CN_Tipo_notificacion = 1,
                    CT_Correo_origen = _emailSettings.CT_Sender_email, // Email del sistema desde configuración
                    CT_Texto_notificacion = request.CT_Titulo + (string.IsNullOrEmpty(request.CT_Mensaje_adicional) ? "" : " - " + request.CT_Mensaje_adicional),
                    CF_Fecha_notificacion = DateTime.Now,
                    CF_Fecha_registro = DateTime.Now
                };

                // Guardar la notificación
                var notificacionId = await _notificacionesRepository.M_PUB_CrearNotificacion(notificacion);

                // Si se proporciona un usuarioId, crear la relación
                if (usuarioId.HasValue)
                {
                    var notificacionXUsuario = new ENotificacionesXUsuarios
                    {
                        CN_Id_notificacion = notificacionId,
                        CN_Id_usuario = usuarioId.Value,
                        CT_Correo_destino = request.CT_Email_destino
                    };

                    await _notificacionesRepository.M_PUB_CrearNotificacionXUsuario(notificacionXUsuario);
                }
                else
                {
                    // Si no se proporciona usuarioId, intentar encontrar el usuario por email
                    var usuario = await _usuariosRepository.F_PUB_ObtenerUsuarioPorCorreo(request.CT_Email_destino);
                    if (usuario != null)
                    {
                        var notificacionXUsuario = new ENotificacionesXUsuarios
                        {
                            CN_Id_notificacion = notificacionId,
                            CN_Id_usuario = usuario.CN_Id_usuario,
                            CT_Correo_destino = request.CT_Email_destino
                        };

                        await _notificacionesRepository.M_PUB_CrearNotificacionXUsuario(notificacionXUsuario);
                    }
                    else
                    {
                        _logger.LogWarning("No se encontró usuario con email: {Email}", request.CT_Email_destino);
                    }
                }

                _logger.LogInformation("Notificación guardada con ID: {NotificacionId}", notificacionId);
                return notificacionId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al guardar notificación en base de datos");
                throw;
            }
        }

        public async Task<IEnumerable<ENotificaciones>> F_PUB_ObtenerHistorialNotificaciones(int usuarioId)
        {
            return await _notificacionesRepository.F_PUB_ObtenerNotificacionesPorUsuario(usuarioId);
        }

        public async Task<IEnumerable<ENotificaciones>> F_PUB_ObtenerTodasLasNotificaciones()
        {
            return await _notificacionesRepository.F_PUB_ObtenerTodasLasNotificaciones();
        }
    }
}
