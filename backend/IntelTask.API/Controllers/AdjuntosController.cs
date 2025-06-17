using IntelTask.Domain.Entities;
using IntelTask.Infrastructure.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // Comentado temporalmente para testing
    public class AdjuntosController : ControllerBase
    {
        private readonly IntelTaskDbContext _context;
        private readonly string _rutaArchivos; public AdjuntosController(IntelTaskDbContext context)
        {
            _context = context;
            _rutaArchivos = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { mensaje = "Controlador de adjuntos funcionando", fecha = DateTime.Now });
        }
        [HttpPost("subir")]
        public async Task<IActionResult> SubirArchivo(IFormFile archivo, [FromForm] int? idTarea, [FromForm] int usuarioId)
        {
            try
            {
                Console.WriteLine($"SubirArchivo llamado - Usuario: {usuarioId}, Tarea: {idTarea}");

                if (archivo == null || archivo.Length == 0)
                {
                    Console.WriteLine("No se proporcionó archivo");
                    return BadRequest("No se ha proporcionado ningún archivo");
                }

                Console.WriteLine($"Archivo recibido: {archivo.FileName}, Tamaño: {archivo.Length}");

                // Crear carpeta si no existe
                if (!Directory.Exists(_rutaArchivos))
                    Directory.CreateDirectory(_rutaArchivos);

                // Generar nombre único
                var extension = Path.GetExtension(archivo.FileName);
                var nombreUnico = $"{Guid.NewGuid()}{extension}";
                var rutaCompleta = Path.Combine(_rutaArchivos, nombreUnico);

                // Guardar archivo
                using (var stream = new FileStream(rutaCompleta, FileMode.Create))
                {
                    await archivo.CopyToAsync(stream);
                }                // Guardar en BD
                var adjunto = new EAdjuntos
                {
                    CT_Archivo_ruta = nombreUnico,
                    CN_Usuario_accion = usuarioId,
                    CF_Fecha_registro = DateTime.Now
                };

                _context.T_Adjuntos.Add(adjunto);
                await _context.SaveChangesAsync();

                // Asociar con tarea si se especifica
                if (idTarea.HasValue && idTarea.Value > 0)
                {
                    var relacion = new EAdjuntosXTareas
                    {
                        CN_Id_adjuntos = adjunto.CN_Id_adjuntos,
                        CN_Id_tarea = idTarea.Value
                    };
                    _context.T_Adjuntos_X_Tareas.Add(relacion);
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    id = adjunto.CN_Id_adjuntos,
                    nombre = archivo.FileName,
                    ruta = adjunto.CT_Archivo_ruta
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("tarea/{idTarea}")]
        public async Task<IActionResult> ObtenerPorTarea(int idTarea)
        {
            try
            {
                var adjuntos = await _context.T_Adjuntos
                    .Where(a => _context.T_Adjuntos_X_Tareas
                        .Any(ax => ax.CN_Id_adjuntos == a.CN_Id_adjuntos && ax.CN_Id_tarea == idTarea)).Select(a => new
                        {
                            id = a.CN_Id_adjuntos,
                            nombre = Path.GetFileName(a.CT_Archivo_ruta), // Extraer nombre del archivo
                            ruta = a.CT_Archivo_ruta,
                            fecha = a.CF_Fecha_registro
                        })
                    .ToListAsync();

                return Ok(adjuntos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("descargar/{id}")]
        public async Task<IActionResult> DescargarArchivo(int id)
        {
            try
            {
                var adjunto = await _context.T_Adjuntos.FindAsync(id);
                if (adjunto == null)
                    return NotFound();

                var rutaCompleta = Path.Combine(_rutaArchivos, adjunto.CT_Archivo_ruta);
                if (!System.IO.File.Exists(rutaCompleta))
                    return NotFound("Archivo no encontrado");
                var bytes = await System.IO.File.ReadAllBytesAsync(rutaCompleta);
                var nombreArchivo = Path.GetFileName(adjunto.CT_Archivo_ruta);
                return File(bytes, "application/octet-stream", nombreArchivo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarArchivo(int id)
        {
            try
            {
                var adjunto = await _context.T_Adjuntos.FindAsync(id);
                if (adjunto == null)
                    return NotFound();

                // Eliminar archivo físico
                var rutaCompleta = Path.Combine(_rutaArchivos, adjunto.CT_Archivo_ruta);
                if (System.IO.File.Exists(rutaCompleta))
                    System.IO.File.Delete(rutaCompleta);

                // Eliminar relaciones
                var relaciones = await _context.T_Adjuntos_X_Tareas
                    .Where(ax => ax.CN_Id_adjuntos == id)
                    .ToListAsync();
                _context.T_Adjuntos_X_Tareas.RemoveRange(relaciones);

                // Eliminar registro
                _context.T_Adjuntos.Remove(adjunto);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}
