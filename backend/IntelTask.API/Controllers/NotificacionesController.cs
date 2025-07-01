using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IntelTask.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificacionesController : ControllerBase
    {
        private readonly INotificacionesService _notificacionesService;
        private readonly ILogger<NotificacionesController> _logger;

        public NotificacionesController(
            INotificacionesService notificacionesService,
            ILogger<NotificacionesController> logger)
        {
            _notificacionesService = notificacionesService;
            _logger = logger;
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<ENotificaciones>>> F_PUB_ObtenerNotificacionesUsuario(int usuarioId)
        {
            try
            {
                _logger.LogInformation("📋 Obteniendo notificaciones para usuario: {UsuarioId}", usuarioId);
                
                var notificaciones = await _notificacionesService.F_PUB_ObtenerHistorialNotificaciones(usuarioId);
                
                return Ok(notificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al obtener notificaciones del usuario: {UsuarioId}", usuarioId);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("todas")]
        public async Task<ActionResult<IEnumerable<ENotificaciones>>> F_PUB_ObtenerTodasLasNotificaciones()
        {
            try
            {
                _logger.LogInformation("📋 Obteniendo todas las notificaciones del sistema");
                
                var notificaciones = await _notificacionesService.F_PUB_ObtenerTodasLasNotificaciones();
                
                return Ok(notificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al obtener todas las notificaciones");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
