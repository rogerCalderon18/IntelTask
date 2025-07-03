namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using IntelTask.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class PermisosController : ControllerBase
{
    private readonly IPermisosRepository _permisosRepository;

    public PermisosController(IPermisosRepository permisosRepository)
    {
        _permisosRepository = permisosRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EPermisos>>> F_PUB_ObtenerPermisos()
    {
        var permisos = await _permisosRepository.F_PUB_ObtenerTodosLosPermisos();
        return Ok(permisos);
    }

    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<EPermisos>>> F_PUB_ObtenerPermisosPorUsuario(int usuarioId)
    {
        var permisos = await _permisosRepository.F_PUB_ObtenerPermisosPorUsuario(usuarioId);
        return Ok(permisos);
    }

    [HttpGet("revisar/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<EPermisos>>> F_PUB_ObtenerPermisosParaRevisar(int usuarioId)
    {
        var permisos = await _permisosRepository.F_PUB_ObtenerPermisosParaRevisar(usuarioId);
        return Ok(permisos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EPermisos>> F_PUB_ObtenerPermiso(int id)
    {
        var permiso = await _permisosRepository.F_PUB_ObtenerPermisoPorId(id);
        if (permiso == null)
        {
            return NotFound();
        }
        return Ok(permiso);
    }

    [HttpPost]
    public async Task<ActionResult<EPermisos>> M_PUB_CrearPermiso([FromBody] PermisoRequest permisoRequest)
    {
        if (permisoRequest == null)
        {
            return BadRequest("Datos de permiso no pueden ser null.");
        }

        // Crear la entidad de permiso a partir de la solicitud
        var permiso = new EPermisos
        {
            CT_Titulo_permiso = permisoRequest.CT_Titulo_permiso,
            CT_Descripcion_permiso = permisoRequest.CT_Descripcion_permiso,
            CF_Fecha_hora_inicio_permiso = permisoRequest.CF_Fecha_hora_inicio_permiso,
            CF_Fecha_hora_fin_permiso = permisoRequest.CF_Fecha_hora_fin_permiso,
            CN_Usuario_creador = permisoRequest.CN_Usuario_creador
        };

        try
        {
            await _permisosRepository.M_PUB_AgregarPermiso(permiso);
            
            // Obtener el permiso recién creado con todas sus relaciones
            var permisoCompleto = await _permisosRepository.F_PUB_ObtenerPermisoPorId(permiso.CN_Id_permiso);
            
            return CreatedAtAction(nameof(F_PUB_ObtenerPermiso), new { id = permiso.CN_Id_permiso }, permisoCompleto);
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("RELACION_ERROR") || ex.Message.Contains("FECHA_ERROR"))
            {
                return BadRequest(ex.Message);
            }
            Console.WriteLine("Error al crear el permiso: " + ex.Message);
            return StatusCode(500, "Error al crear el permiso: " + ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarPermiso(int id, [FromBody] PermisoUpdateRequest request)
    {
        try
        {
            Console.WriteLine($"Actualizando permiso con ID: {id}");
            Console.WriteLine($"Datos recibidos: {JsonSerializer.Serialize(request)}");

            if (request == null)
            {
                return BadRequest("Los datos de actualización son requeridos");
            }

            var permisoActualizado = await _permisosRepository.M_PUB_ActualizarPermiso(id, request);
            
            return Ok(permisoActualizado);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al actualizar permiso: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            
            if (ex.Message.Contains("PERMISO_NO_ENCONTRADO"))
            {
                return NotFound("Permiso no encontrado");
            }
            
            if (ex.Message.Contains("RELACION_ERROR") || ex.Message.Contains("FECHA_ERROR"))
            {
                return BadRequest(ex.Message);
            }
            
            return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> M_PUB_EliminarPermiso(int id)
    {
        try
        {
            Console.WriteLine($"Eliminando permiso con ID: {id}");

            await _permisosRepository.M_PUB_EliminarPermiso(id);
            
            return Ok(new { message = "Permiso eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al eliminar permiso: {ex.Message}");
            
            if (ex.Message.Contains("PERMISO_NO_ENCONTRADO"))
            {
                return NotFound("Permiso no encontrado");
            }
            
            return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        }
    }
    
    [HttpGet("{permisoId}/adjuntos")]
    public async Task<IActionResult> F_PUB_ObtenerAdjuntosPorPermiso(int permisoId)
    {
        try
        {
            // Verificar que el permiso existe
            var permiso = await _permisosRepository.F_PUB_ObtenerPermisoPorId(permisoId);
            if (permiso == null)
            {
                return NotFound("Permiso no encontrado");
            }

            // Redirigir al controlador de adjuntos
            return RedirectToAction("ObtenerPorPermiso", "Adjuntos", new { idPermiso = permisoId });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al obtener adjuntos del permiso: {ex.Message}");
            return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        }
    }
}
