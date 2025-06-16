using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using IntelTask.Domain.Configuration;
using IntelTask.Domain.DTOs;

namespace IntelTask.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly ILogger<EmailController> _logger;
        private readonly EmailSettings _emailSettings;

        public EmailController(
            ILogger<EmailController> logger,
            IOptions<EmailSettings> emailSettings)
        {
            _logger = logger;
            _emailSettings = emailSettings.Value;
        }

        [HttpPost("enviar-notificacion")]
        public async Task<IActionResult> M_PUB_EnviarNotificacion([FromBody] NotificacionEmailRequest request)
        {
            _logger.LogInformation("📧 === INICIO NOTIFICACIÓN EMAIL ===");
            _logger.LogInformation("📧 Email destino: {Email}", request.CT_Email_destino);
            _logger.LogInformation("📧 Tipo: {Tipo}", request.CT_Tipo_notificacion);
            _logger.LogInformation("📧 Asunto: {Asunto}", request.CT_Asunto);

            try
            {
                var CT_Contenido_html = M_PRI_GenerarContenidoHtml(request);

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(
                    _emailSettings.CT_Sender_name,
                    _emailSettings.CT_Sender_email));
                email.To.Add(new MailboxAddress("", request.CT_Email_destino));
                email.Subject = request.CT_Asunto;
                email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = CT_Contenido_html };

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(
                    _emailSettings.CT_Smtp_server,
                    _emailSettings.CN_Smtp_port,
                    SecureSocketOptions.StartTls);

                await smtp.AuthenticateAsync(
                    _emailSettings.CT_Sender_email,
                    _emailSettings.CT_Sender_password);

                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                _logger.LogInformation("✅ Email enviado exitosamente");
                return Ok(new { success = true, mensaje = "Notificación enviada correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al enviar email");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        private string M_PRI_GenerarContenidoHtml(NotificacionEmailRequest request)
        {
            var CT_Template = $@"
            <div style='font-family: ""Segoe UI"", sans-serif; max-width: 650px; margin: auto; background: #ffffff;
                        border-radius: 10px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); overflow: hidden;'>

                <!-- Encabezado con icono -->
                <div style='background: #2563eb; padding: 25px; text-align: center; color: white;'>
                    <div style='font-size: 34px; font-weight: bold;'>IntelTask</div>
                    <div style='font-size: 14px; opacity: 0.9;'>Sistema de notificaciones de tareas</div>
                </div>

                <!-- Cuerpo -->
                <div style='padding: 35px 30px;'>

                    <!-- Título -->
                    <h2 style='margin-top: 0; color: #1e293b; font-size: 22px;'>{request.CT_Titulo}</h2>

                    <!-- Detalles -->
                    <div style='background: #f9fafb; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                        {M_PRI_GenerarCamposDinamicos(request.Campos)}
                    </div>

                    <!-- Mensaje adicional -->
                    {(string.IsNullOrEmpty(request.CT_Mensaje_adicional) ? "" : $@"
                    <div style='margin-top: 30px; background: #fefce8; border-left: 4px solid #facc15; padding: 20px; border-radius: 8px;'>
                        <strong style='color: #92400e;'>Nota:</strong>
                        <p style='margin: 5px 0 0 0; color: #78350f;'>{request.CT_Mensaje_adicional}</p>
                    </div>")}

                </div>

                    <!-- Footer -->
                <div style='background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;'>
                    Este mensaje fue generado automáticamente por el sistema IntelTask.<br />
                    Por favor, no responda a este correo.
                </div>
                </div>";

            return CT_Template;
        }

        private string M_PRI_GenerarCamposDinamicos(Dictionary<string, string> campos)
        {
            if (campos == null || !campos.Any())
                return "<p>Sin información adicional</p>";

            var CT_Html = "";
            foreach (var campo in campos)
            {
                CT_Html += $"<p style='margin: 8px 0;'><strong>{campo.Key}:</strong> {campo.Value}</p>";
            }
            return CT_Html;
        }

        private string M_PRI_GetColorFondo(string CT_Tipo_notificacion)
        {
            return CT_Tipo_notificacion?.ToLower() switch
            {
                "success" => "#d1fae5",   // Verde claro
                "danger" => "#fee2e2",    // Rojo claro
                "warning" => "#fef3c7",   // Amarillo claro
                "info" => "#dbeafe",      // Azul claro
                "primary" => "#f0f9ff",   // Azul muy claro
                _ => "#f3f4f6"            // Gris claro (default)
            };
        }

        private string M_PRI_GetColorBorde(string CT_Tipo_notificacion)
        {
            return CT_Tipo_notificacion?.ToLower() switch
            {
                "success" => "#16a34a",   // Verde
                "danger" => "#dc2626",    // Rojo
                "warning" => "#d97706",   // Amarillo/Naranja
                "info" => "#2563eb",      // Azul
                "primary" => "#0284c7",   // Azul primario
                _ => "#6b7280"            // Gris (default)
            };
        }
    }
}