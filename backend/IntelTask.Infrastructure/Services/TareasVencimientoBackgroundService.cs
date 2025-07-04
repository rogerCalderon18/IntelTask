using IntelTask.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Timers;

namespace IntelTask.Infrastructure.Services
{
    public class TareasVencimientoBackgroundService : IDisposable
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TareasVencimientoBackgroundService> _logger;
        private readonly System.Timers.Timer _timer;
        private bool _disposed = false;

        public TareasVencimientoBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<TareasVencimientoBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            
            // ⚠️ CONFIGURADO PARA PRUEBAS: Se ejecuta cada 1 MINUTO (60000 ms)
            // Para producción cambiar a 3600000 ms (1 hora)
            _timer = new System.Timers.Timer(60000); // 1 minuto para pruebas
            _timer.Elapsed += async (sender, e) => await ExecuteVerificationAsync();
            _timer.AutoReset = true;
        }

        public void Start()
        {
            _logger.LogInformation("🚀 MODO PRUEBAS: Servicio de verificación iniciado - Se ejecutará cada MINUTO");
            
            // Ejecutar inmediatamente la primera vez
            _ = Task.Run(async () => await ExecuteVerificationAsync());
            
            // Iniciar el timer
            _timer.Start();
        }

        public void Stop()
        {
            _logger.LogInformation("🛑 Deteniendo servicio de verificación (modo pruebas cada minuto)...");
            _timer.Stop();
        }

        private async Task ExecuteVerificationAsync()
        {
            try
            {
                _logger.LogInformation("⏰ PRUEBAS: Ejecutando verificación de tareas vencidas - {FechaHora}", DateTime.Now);
                
                using (var scope = _serviceProvider.CreateScope())
                {
                    var tareasVencimientoService = scope.ServiceProvider.GetRequiredService<ITareasVencimientoService>();
                    await tareasVencimientoService.VerificarYNotificarTareasVencidas();
                }

                _logger.LogInformation("✅ Verificación de tareas completada exitosamente - {FechaHora}", DateTime.Now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error durante la verificación automática de tareas vencidas");
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                _timer?.Stop();
                _timer?.Dispose();
                _disposed = true;
            }
        }
    }
}
