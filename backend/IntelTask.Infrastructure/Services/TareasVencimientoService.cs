using IntelTask.Domain.DTOs;
using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace IntelTask.Infrastructure.Services
{
    public class TareasVencimientoService : ITareasVencimientoService
    {
        private readonly ITareasRepository _tareasRepository;
        private readonly IUsuariosRepository _usuariosRepository;
        private readonly INotificacionesService _notificacionesService;
        private readonly ILogger<TareasVencimientoService> _logger;

        public TareasVencimientoService(
            ITareasRepository tareasRepository,
            IUsuariosRepository usuariosRepository,
            INotificacionesService notificacionesService,
            ILogger<TareasVencimientoService> logger)
        {
            _tareasRepository = tareasRepository;
            _usuariosRepository = usuariosRepository;
            _notificacionesService = notificacionesService;
            _logger = logger;
        }

        public async Task VerificarYNotificarTareasVencidas()
        {
            try
            {
                _logger.LogInformation("🔍 Iniciando verificación de tareas vencidas - {FechaHora}", DateTime.Now);

                // COMENTADO: MODO PRUEBA DESACTIVADO
                // _logger.LogInformation("🧪 MODO PRUEBA ACTIVADO - Enviando notificación de prueba");
                // await EnviarNotificacionPruebaSinValidaciones();

                // Verificar tareas ya vencidas
                var tareasVencidas = await F_PUB_ObtenerTareasVencidas();
                _logger.LogInformation("📊 Encontradas {CantidadVencidas} tareas vencidas", tareasVencidas.Count());
                await ProcesarTareasVencidas(tareasVencidas);

                // Verificar tareas que necesitan recordatorio según el nuevo requerimiento
                var tareasParaRecordatorio = await F_PUB_ObtenerTareasParaRecordatorio();
                _logger.LogInformation("📊 Encontradas {CantidadRecordatorio} tareas para recordatorio", tareasParaRecordatorio.Count());
                await ProcesarTareasParaRecordatorio(tareasParaRecordatorio);

                _logger.LogInformation("✅ Verificación completada - Procesadas {TareasVencidas} vencidas y {TareasRecordatorio} recordatorios", 
                    tareasVencidas.Count(), tareasParaRecordatorio.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante la verificación de tareas vencidas");
                throw;
            }
        }

        public async Task<IEnumerable<ETareas>> F_PUB_ObtenerTareasVencidas()
        {
            try
            {
                var todasLasTareas = await _tareasRepository.F_PUB_ObtenerTodasLasTareas();
                
                // Filtrar tareas vencidas (fecha límite pasada) y que no estén en estado finalizado o incumplido
                // Estados reales: 5=Terminado, 14=Incumplida
                var tareasVencidas = todasLasTareas.Where(t => 
                    t.CF_Fecha_limite < DateTime.Now &&
                    t.CN_Id_estado != 5 && // No terminada
                    t.CN_Id_estado != 14 && // No incumplida ya
                    t.CN_Usuario_asignado.HasValue // Debe tener usuario asignado
                ).ToList();

                return tareasVencidas;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener tareas vencidas");
                throw;
            }
        }

        public async Task<IEnumerable<ETareas>> F_PUB_ObtenerTareasParaRecordatorio()
        {
            try
            {
                var ahora = DateTime.Now;
                var todasLasTareas = await _tareasRepository.F_PUB_ObtenerTodasLasTareas();
                
                var tareasParaRecordatorio = todasLasTareas.Where(t => 
                    t.CN_Id_estado != 5 && // No terminada
                    t.CN_Id_estado != 14 && // No incumplida
                    t.CN_Usuario_asignado.HasValue && // Debe tener usuario asignado
                    (EsUnDiaAntes(t.CF_Fecha_limite, ahora) || EsMismoDiaA425PM(t.CF_Fecha_limite, ahora))
                ).ToList();

                return tareasParaRecordatorio;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener tareas para recordatorio");
                throw;
            }
        }

        private bool EsUnDiaAntes(DateTime fechaLimite, DateTime ahora)
        {
            // Un día antes: entre 7 AM y 4:30 PM del día anterior al vencimiento
            var unDiaAntes = fechaLimite.Date.AddDays(-1);
            return ahora.Date == unDiaAntes &&
                   ahora.Hour >= 7 && 
                   (ahora.Hour < 16 || (ahora.Hour == 16 && ahora.Minute <= 30));
        }

        private bool EsMismoDiaA425PM(DateTime fechaLimite, DateTime ahora)
        {
            // Mismo día del vencimiento: exactamente a las 4:25 PM
            return ahora.Date == fechaLimite.Date &&
                   ahora.Hour == 16 && 
                   ahora.Minute == 25;
        }

        public async Task M_PUB_ActualizarTareaAIncumplida(int tareaId, string justificacion)
        {
            try
            {
                // Obtener la tarea completa primero
                var tareaCompleta = await _tareasRepository.F_PUB_ObtenerTareaPorId(tareaId);
                if (tareaCompleta == null)
                {
                    _logger.LogWarning("Tarea {TareaId} no encontrada para marcar como incumplida", tareaId);
                    return;
                }

                // Crear request con todos los datos actuales, solo cambiando el estado
                var usuarioResponsable = tareaCompleta.CN_Usuario_asignado ?? tareaCompleta.CN_Usuario_creador;
                var updateRequest = new TareaUpdateRequest
                {
                    CN_Id_estado = 14, // Estado incumplida
                    CN_Id_complejidad = tareaCompleta.CN_Id_complejidad,
                    CN_Id_prioridad = tareaCompleta.CN_Id_prioridad,
                    CN_Usuario_asignado = tareaCompleta.CN_Usuario_asignado,
                    CT_Titulo_tarea = tareaCompleta.CT_Titulo_tarea,
                    CT_Descripcion_tarea = tareaCompleta.CT_Descripcion_tarea,
                    CF_Fecha_limite = tareaCompleta.CF_Fecha_limite,
                    CN_Numero_GIS = tareaCompleta.CN_Numero_GIS,
                    // Para proceso automático, usar el usuario asignado o el creador como responsable del cambio
                    CN_Usuario_editor = usuarioResponsable
                };

                _logger.LogInformation("🔄 Actualizando tarea {TareaId} a incumplida. Usuario responsable del cambio: {UsuarioId}", 
                    tareaId, usuarioResponsable);

                await _tareasRepository.M_PUB_ActualizarTarea(tareaId, updateRequest);

                // Registrar el incumplimiento
                var incumplimiento = new ETareasIncumplimiento
                {
                    CN_Id_tarea = tareaId,
                    CT_Justificacion_incumplimiento = justificacion,
                    CF_Fecha_incumplimiento = DateTime.Now
                };

                await _tareasRepository.M_PUB_AgregarIncumplimiento(incumplimiento);

                _logger.LogInformation("✅ Tarea {TareaId} marcada como incumplida exitosamente", tareaId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al actualizar tarea {TareaId} a incumplida", tareaId);
                throw;
            }
        }

        private async Task ProcesarTareasVencidas(IEnumerable<ETareas> tareasVencidas)
        {
            foreach (var tarea in tareasVencidas)
            {
                try
                {
                    // Actualizar tarea a incumplida
                    await M_PUB_ActualizarTareaAIncumplida(tarea.CN_Id_tarea, 
                        "Tarea marcada automáticamente como incumplida por vencimiento de fecha límite");

                    // Enviar notificación al usuario asignado
                    if (tarea.CN_Usuario_asignado.HasValue)
                    {
                        await EnviarNotificacionIncumplimiento(tarea);
                    }

                    // Enviar notificación al creador de la tarea
                    if (tarea.CN_Usuario_creador != tarea.CN_Usuario_asignado)
                    {
                        await EnviarNotificacionIncumplimientoCreador(tarea);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al procesar tarea vencida {TareaId}", tarea.CN_Id_tarea);
                }
            }
        }

        private async Task ProcesarTareasParaRecordatorio(IEnumerable<ETareas> tareasParaRecordatorio)
        {
            foreach (var tarea in tareasParaRecordatorio)
            {
                try
                {
                    var ahora = DateTime.Now;
                    var esUnDiaAntes = EsUnDiaAntes(tarea.CF_Fecha_limite, ahora);
                    var esMismoDia425 = EsMismoDiaA425PM(tarea.CF_Fecha_limite, ahora);
                    
                    if (esUnDiaAntes)
                    {
                        await EnviarNotificacionRecordatorio(tarea, "Un día antes del vencimiento");
                        _logger.LogInformation("📧 Recordatorio enviado (1 día antes) para tarea {TareaId}", tarea.CN_Id_tarea);
                    }
                    else if (esMismoDia425)
                    {
                        await EnviarNotificacionRecordatorio(tarea, "Último recordatorio del día de vencimiento");
                        _logger.LogInformation("📧 Recordatorio final enviado (4:25 PM mismo día) para tarea {TareaId}", tarea.CN_Id_tarea);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al procesar recordatorio para tarea {TareaId}", tarea.CN_Id_tarea);
                }
            }
        }

        private async Task EnviarNotificacionIncumplimiento(ETareas tarea)
        {
            var usuario = await _usuariosRepository.F_PUB_ObtenerUsuarioPorId(tarea.CN_Usuario_asignado!.Value);
            if (usuario != null)
            {
                var notificacion = new NotificacionEmailRequest
                {
                    CT_Email_destino = usuario.CT_Correo_usuario,
                    CT_Asunto = "⚠️ Tarea Incumplida - IntelTask",
                    CT_Titulo = $"La tarea '{tarea.CT_Titulo_tarea}' ha sido marcada como INCUMPLIDA",
                    CT_Tipo_notificacion = "Incumplimiento",
                    CT_Mensaje_adicional = $"Fecha límite: {tarea.CF_Fecha_limite:dd/MM/yyyy HH:mm}. " +
                                         $"La tarea fue automáticamente marcada como incumplida debido al vencimiento de la fecha límite."
                };

                // ENVIAR CORREO Y GUARDAR EN BD
                await _notificacionesService.M_PUB_GuardarYEnviarNotificacion(notificacion, usuario.CN_Id_usuario);
                _logger.LogInformation("📧 Notificación de incumplimiento enviada por correo y guardada para usuario {UsuarioId}", usuario.CN_Id_usuario);
            }
        }

        private async Task EnviarNotificacionIncumplimientoCreador(ETareas tarea)
        {
            var creador = await _usuariosRepository.F_PUB_ObtenerUsuarioPorId(tarea.CN_Usuario_creador);
            if (creador != null)
            {
                var notificacion = new NotificacionEmailRequest
                {
                    CT_Email_destino = creador.CT_Correo_usuario,
                    CT_Asunto = "⚠️ Tarea Creada por Usted - Incumplida",
                    CT_Titulo = $"La tarea '{tarea.CT_Titulo_tarea}' que usted creó ha sido marcada como INCUMPLIDA",
                    CT_Tipo_notificacion = "Incumplimiento",
                    CT_Mensaje_adicional = $"Usuario asignado: {tarea.UsuarioAsignado?.CT_Nombre_usuario}. " +
                                         $"Fecha límite: {tarea.CF_Fecha_limite:dd/MM/yyyy HH:mm}"
                };

                // ENVIAR CORREO Y GUARDAR EN BD
                await _notificacionesService.M_PUB_GuardarYEnviarNotificacion(notificacion, creador.CN_Id_usuario);
                _logger.LogInformation("📧 Notificación de incumplimiento para creador enviada por correo y guardada - Usuario {UsuarioId}", creador.CN_Id_usuario);
            }
        }

        private async Task EnviarNotificacionRecordatorio(ETareas tarea, string tipoRecordatorio)
        {
            var usuario = await _usuariosRepository.F_PUB_ObtenerUsuarioPorId(tarea.CN_Usuario_asignado!.Value);
            if (usuario != null)
            {
                // Verificar si ya se envió notificación para esta tarea
                var yaNotificado = await _notificacionesService.F_PUB_ExisteNotificacionRecienteParaTarea(
                    usuario.CN_Id_usuario, 
                    tarea.CN_Id_tarea, 
                    "Recordatorio", 
                    24 // Últimas 24 horas
                );
                
                if (yaNotificado)
                {
                    _logger.LogInformation("Ya se envió notificación de recordatorio para tarea {TareaId} al usuario {UsuarioId} en las últimas 24 horas", 
                        tarea.CN_Id_tarea, usuario.CN_Id_usuario);
                    return; // No enviar notificación duplicada
                }

                var ahora = DateTime.Now;
                var esUltimoDia = ahora.Date == tarea.CF_Fecha_limite.Date;
                
                var urgencia = esUltimoDia ? "🔴 URGENTE" : "🟡 RECORDATORIO";
                var mensaje = esUltimoDia ? 
                    "La tarea vence HOY. Complete la tarea antes de las 5:00 PM." :
                    $"La tarea vence mañana ({tarea.CF_Fecha_limite:dd/MM/yyyy}). Planifique su tiempo para completarla.";
                
                var notificacion = new NotificacionEmailRequest
                {
                    CT_Email_destino = usuario.CT_Correo_usuario,
                    CT_Asunto = $"{urgencia} - Tarea por vencer",
                    CT_Titulo = $"Recordatorio: '{tarea.CT_Titulo_tarea}' - Tarea ID: {tarea.CN_Id_tarea}", // Incluir ID para identificación única
                    CT_Tipo_notificacion = "Recordatorio",
                    CT_Mensaje_adicional = $"Fecha límite: {tarea.CF_Fecha_limite:dd/MM/yyyy HH:mm}. {mensaje}"
                };

                // ENVIAR CORREO Y GUARDAR EN BD
                await _notificacionesService.M_PUB_GuardarYEnviarNotificacion(notificacion, usuario.CN_Id_usuario);
                _logger.LogInformation("📧 {TipoRecordatorio} enviado para usuario {UsuarioId} - Tarea {TareaId}", 
                    tipoRecordatorio, usuario.CN_Id_usuario, tarea.CN_Id_tarea);
            }
        }

    }
}
