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
        }

        // Crear la entidad de tarea a partir de la solicitud
        var tarea = new ETareas
        {
            CT_Titulo_tarea = tareaRequest.CT_Titulo_tarea,
            CT_Descripcion_tarea = tareaRequest.CT_Descripcion_tarea,
            CN_Id_complejidad = tareaRequest.CN_Id_complejidad,
            CN_Id_prioridad = tareaRequest.CN_Id_prioridad,
            CN_Id_estado = tareaRequest.CN_Id_estado,
            CF_Fecha_limite = tareaRequest.CF_Fecha_limite,
            CN_Tarea_origen = tareaRequest.CN_Tarea_origen,
            CN_Numero_GIS = tareaRequest.CN_Numero_GIS,
            CN_Usuario_asignado = tareaRequest.CN_Usuario_asignado,
            // Establecer fecha de asignación actual
            CF_Fecha_asignacion = DateTime.Now,
            // Obtener el usuario actual del sistema
            CN_Usuario_creador = tareaRequest.CN_Usuario_creador,
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
    }    [HttpPut("{id}")]
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
}
