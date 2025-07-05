namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using IntelTask.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class TareasController : ControllerBase
{
    private readonly ITareasRepository _tareasRepository;

    public TareasController(ITareasRepository tareasRepository)
    {
        _tareasRepository = tareasRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ETareas>>> F_PUB_ObtenerTareas()
    {
        var tareas = await _tareasRepository.F_PUB_ObtenerTodasLasTareas();
        return Ok(tareas);
    }

    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<ETareas>>> F_PUB_ObtenerTareasPorUsuario(int usuarioId)
    {
        var tareas = await _tareasRepository.F_PUB_ObtenerTareasPorUsuario(usuarioId);
        return Ok(tareas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ETareas>> F_PUB_ObtenerTarea(int id)
    {
        var tarea = await _tareasRepository.F_PUB_ObtenerTareaPorId(id);
        if (tarea == null)
        {
            return NotFound();
        }
        return Ok(tarea);
    }

    [HttpPost]
    public async Task<ActionResult<ETareas>> M_PUB_CrearTarea([FromBody] TareaRequest tareaRequest)
    {
        if (tareaRequest == null)
        {
            return BadRequest("Datos de tarea no pueden ser null.");
        }        // Crear la entidad de tarea a partir de la solicitud
        var tarea = new ETareas
        {
            CT_Titulo_tarea = tareaRequest.CT_Titulo_tarea,
            CT_Descripcion_tarea = tareaRequest.CT_Descripcion_tarea,
            CN_Id_complejidad = tareaRequest.CN_Id_complejidad,
            CN_Id_prioridad = tareaRequest.CN_Id_prioridad,
            CN_Id_estado = tareaRequest.CN_Usuario_asignado.HasValue ? (byte) 2: (byte) 1,
            CF_Fecha_limite = tareaRequest.CF_Fecha_limite,
            CN_Tarea_origen = tareaRequest.CN_Tarea_origen,
            CN_Numero_GIS = tareaRequest.CN_Numero_GIS,
            CN_Usuario_asignado = tareaRequest.CN_Usuario_asignado,
            // Establecer fecha de asignación si hay usuario asignado
            CF_Fecha_asignacion = tareaRequest.CN_Usuario_asignado.HasValue ? DateTime.Now : new DateTime(1900, 1, 1),
            // Obtener el usuario actual del sistema
            CN_Usuario_creador = tareaRequest.CN_Usuario_creador,
            CF_Fecha_finalizacion = new DateTime(1900, 1, 1) 
        };

        try
        {
            await _tareasRepository.M_PUB_AgregarTarea(tarea);
            
            // Obtener la tarea recién creada con todas sus relaciones
            var tareaCompleta = await _tareasRepository.F_PUB_ObtenerTareaPorId(tarea.CN_Id_tarea);
            
            return CreatedAtAction(nameof(F_PUB_ObtenerTarea), new { id = tarea.CN_Id_tarea }, tareaCompleta);
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("RELACION_ERROR"))
            {
                return BadRequest(ex.Message);
            }
            Console.WriteLine("Error al crear la tarea: " + ex.Message);
            return StatusCode(500, "Error al crear la tarea aqui: " + ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarTarea(int id, [FromBody] TareaUpdateRequest request)
    {
        try
        {
            Console.WriteLine($"Actualizando tarea con ID: {id}");
            Console.WriteLine($"Datos recibidos: {JsonSerializer.Serialize(request)}");

            if (request == null)
            {
                return BadRequest("Los datos de actualización son requeridos");
            }

            var tareaActualizada = await _tareasRepository.M_PUB_ActualizarTarea(id, request);
            
            return Ok(tareaActualizada);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al actualizar tarea: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            
            if (ex.Message.Contains("TAREA_NO_ENCONTRADA"))
            {
                return NotFound("Tarea no encontrada");
            }
            
            if (ex.Message.Contains("RELACION_ERROR"))
            {
                return BadRequest(ex.Message);            }            
            return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> M_PUB_EliminarTarea(int id)
    {
        try
        {
            Console.WriteLine($"Eliminando tarea con ID: {id}");

            await _tareasRepository.M_PUB_EliminarTarea(id);
            
            return Ok(new { message = "Tarea eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al eliminar tarea: {ex.Message}");
            
            if (ex.Message.Contains("TAREA_NO_ENCONTRADA"))
            {
                return NotFound("Tarea no encontrada");
            }
            
            if (ex.Message.Contains("SUBTAREAS_EXISTENTES"))
            {
                return BadRequest(ex.Message);
            }
            
            return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        }
    }

    [HttpGet("{tareaId}/seguimientos")]
    public async Task<ActionResult<IEnumerable<TareaSeguimientoResponse>>> F_PUB_ObtenerSeguimientosPorTarea(int tareaId)
    {
        var seguimientos = await _tareasRepository.F_PUB_ObtenerSeguimientosPorTarea(tareaId);
        var response = seguimientos.Select(s => new TareaSeguimientoResponse
        {
            CN_Id_seguimiento = s.CN_Id_seguimiento,
            CN_Id_tarea = s.CN_Id_tarea,
            CT_Comentario = s.CT_Comentario,
            CF_Fecha_seguimiento = s.CF_Fecha_seguimiento
        });
        return Ok(response);
    }

    [HttpPost("{tareaId}/seguimientos")]
    public async Task<IActionResult> M_PUB_AgregarSeguimiento(int tareaId, [FromBody] TareaSeguimientoRequest request)
    {
        if (request == null || tareaId != request.CN_Id_tarea)
        {
            return BadRequest("Datos de seguimiento inválidos.");
        }
        var seguimiento = new ETareasSeguimiento
        {
            CN_Id_tarea = request.CN_Id_tarea,
            CT_Comentario = request.CT_Comentario ?? string.Empty,
            CF_Fecha_seguimiento = DateTime.Now
        };
        await _tareasRepository.M_PUB_AgregarSeguimiento(seguimiento);
        return Ok();
    }

    [HttpGet("{tareaId}/incumplimientos")]
    public async Task<ActionResult<IEnumerable<TareaIncumplimientoResponse>>> F_PUB_ObtenerIncumplimientosPorTarea(int tareaId)
    {
        var lista = await _tareasRepository.F_PUB_ObtenerIncumplimientosPorTarea(tareaId);
        var response = lista.Select(i => new TareaIncumplimientoResponse
        {
            CN_Id_tarea_incumplimiento = i.CN_Id_tarea_incumplimiento,
            CN_Id_tarea = i.CN_Id_tarea,
            CT_Justificacion_incumplimiento = i.CT_Justificacion_incumplimiento,
            CF_Fecha_incumplimiento = i.CF_Fecha_incumplimiento
        });
        return Ok(response);
    }

    [HttpPost("{tareaId}/incumplimientos")]
    public async Task<IActionResult> M_PUB_AgregarIncumplimiento(int tareaId, [FromBody] TareaIncumplimientoRequest request)
    {
        if (request == null || tareaId != request.CN_Id_tarea)
        {
            return BadRequest("Datos de incumplimiento inválidos.");
        }
        var entity = new ETareasIncumplimiento
        {
            CN_Id_tarea = request.CN_Id_tarea,
            CT_Justificacion_incumplimiento = request.CT_Justificacion_incumplimiento
        };
        await _tareasRepository.M_PUB_AgregarIncumplimiento(entity);
        return Ok();
    }

    [HttpGet("{tareaId}/rechazos")]
    public async Task<ActionResult<IEnumerable<TareaJustificacionRechazoResponse>>> F_PUB_ObtenerRechazosPorTarea(int tareaId)
    {
        var lista = await _tareasRepository.F_PUB_ObtenerRechazosPorTarea(tareaId);
        var response = lista.Select(r => new TareaJustificacionRechazoResponse
        {
            CN_Id_tarea_rechazo = r.CN_Id_tarea_rechazo,
            CN_Id_tarea = r.CN_Id_tarea,
            CF_Fecha_hora_rechazo = r.CF_Fecha_hora_rechazo,
            CT_Descripcion_rechazo = r.CT_Descripcion_rechazo
        });
        return Ok(response);
    }

    [HttpPost("{tareaId}/rechazos")]
    public async Task<IActionResult> M_PUB_AgregarRechazo(int tareaId, [FromBody] TareaJustificacionRechazoRequest request)
    {
        if (request == null || tareaId != request.CN_Id_tarea)
        {
            return BadRequest("Datos de rechazo inválidos.");
        }
        var entity = new ETareasJustificacionRechazo
        {
            CN_Id_tarea = request.CN_Id_tarea,
            CT_Descripcion_rechazo = request.CT_Descripcion_rechazo ?? string.Empty
        };
        await _tareasRepository.M_PUB_AgregarRechazo(entity);
        return Ok();
    }

    [HttpPost("verificar-incumplimientos")]
    public async Task<ActionResult> M_PUB_VerificarIncumplimientos()
    {
        try
        {
            // Obtener el servicio de vencimientos desde el contenedor de dependencias
            var tareasVencimientoService = HttpContext.RequestServices.GetRequiredService<ITareasVencimientoService>();
            
            await tareasVencimientoService.VerificarYNotificarTareasVencidas();
            
            return Ok(new { 
                mensaje = "✅ Verificación de tareas completada exitosamente",
                fecha = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                error = "❌ Error durante la verificación",
                detalle = ex.Message,
                fecha = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            });
        }
    }

    [HttpGet("{id}/subtareas")]
    public async Task<ActionResult<IEnumerable<ETareas>>> F_PUB_ObtenerSubtareas(int id)
    {
        try
        {
            var tareaFechaService = HttpContext.RequestServices.GetRequiredService<ITareaFechaService>();
            var subtareas = await tareaFechaService.F_PUB_ObtenerSubtareasAsync(id);
            return Ok(subtareas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al obtener subtareas: {ex.Message}");
        }
    }

    [HttpPost("{id}/validar-fecha-principal")]
    public async Task<ActionResult> M_PUB_ValidarYActualizarFechaPrincipal(int id, [FromBody] ValidarFechaRequest request)
    {
        try
        {
            var tareaFechaService = HttpContext.RequestServices.GetRequiredService<ITareaFechaService>();
            var seActualizo = await tareaFechaService.M_PUB_ActualizarFechaPrincipalSiEsNecesarioAsync(
                id, 
                request.NuevaFechaLimite, 
                request.UsuarioEditor
            );

            return Ok(new { 
                seActualizoPrincipal = seActualizo,
                mensaje = seActualizo ? "Fecha principal actualizada automáticamente" : "No fue necesario actualizar la fecha principal",
                fecha = DateTime.Now
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al validar fecha principal: {ex.Message}");
        }
    }
}

// DTO para el endpoint de validación de fecha
public class ValidarFechaRequest
{
    public DateTime NuevaFechaLimite { get; set; }
    public int UsuarioEditor { get; set; }
}
