using IntelTask.Domain.DTOs;
using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

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
                    CT_Titulo_notificacion = request.CT_Titulo, // Usar CT_Titulo en lugar de CT_Asunto
                    CN_Tipo_notificacion = 1,
                    CT_Correo_origen = _emailSettings.CT_Sender_email, // Email del sistema desde configuración
                    CT_Texto_notificacion = request.CT_Asunto + (string.IsNullOrEmpty(request.CT_Mensaje_adicional) ? "" : " - " + request.CT_Mensaje_adicional),
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

        // NUEVO MÉTODO: Verificar si ya existe una notificación reciente para evitar duplicados
        public async Task<bool> F_PUB_ExisteNotificacionRecienteParaTarea(int usuarioId, int tareaId, string tipoNotificacion, int horasAtras = 24)
        {
            try
            {
                var busqueda = $"Tarea ID: {tareaId}";
                
                // Buscar notificaciones que contengan el ID de la tarea en el título
                var existe = await _notificacionesRepository.F_PUB_ExisteNotificacionReciente(
                    usuarioId, 
                    tipoNotificacion, 
                    busqueda, // Identificador único para cada tarea
                    horasAtras
                );
                
                return existe;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar notificación reciente para tarea {TareaId}", tareaId);
                return false; // En caso de error, permitir envío para no bloquear el sistema
            }
        }

        // NUEVO MÉTODO: Guardar notificación Y enviar correo automáticamente
        public async Task<int> M_PUB_GuardarYEnviarNotificacion(NotificacionEmailRequest request, int? usuarioId = null)
        {
            try
            {
                _logger.LogInformation("Guardando notificación y enviando correo");

                // 1. Guardar la notificación en BD (usa el método existente)
                var notificacionId = await M_PUB_GuardarNotificacion(request, usuarioId);

                // 2. Enviar el correo electrónico
                await EnviarCorreoElectronico(request);

                _logger.LogInformation("Notificación guardada y correo enviado exitosamente - ID: {NotificacionId}", notificacionId);
                return notificacionId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al guardar notificación y enviar correo");
                throw;
            }
        }

        // MÉTODO PRIVADO: Enviar correo usando el endpoint del EmailController
        private async Task EnviarCorreoElectronico(NotificacionEmailRequest request)
        {
            try
            {
                _logger.LogInformation("Enviando correo a: {Email}", request.CT_Email_destino);

                using var httpClient = new HttpClient();
                
                // Configurar la URL base (asumo que está corriendo en localhost)
                httpClient.BaseAddress = new Uri("http://localhost:5185"); // Ajustar según configuración
                
                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await httpClient.PostAsync("/api/email/enviar-notificacion", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Correo enviado exitosamente a: {Email}", request.CT_Email_destino);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error al enviar correo. Status: {Status}, Error: {Error}", 
                        response.StatusCode, errorContent);
                    throw new Exception($"Error al enviar correo: {response.StatusCode} - {errorContent}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar correo a: {Email}", request.CT_Email_destino);
                throw;
            }
        }
    }
}
