
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AccionesController : ControllerBase
{
    private readonly IAccionesRepository _accionesRepository;

    public AccionesController(IAccionesRepository accionesRepository)
    {
        _accionesRepository = accionesRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EAcciones>>> F_PUB_ObtenerAcciones()
    {
        var acciones = await _accionesRepository.F_PUB_ObtenerTodasLasAcciones();
        return Ok(acciones);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EAcciones>> F_PUB_ObtenerAccion(int id)
    {
        var accion = await _accionesRepository.F_PUB_ObtenerAccionPorId(id);
        if (accion == null)
        {
            return NotFound();
        }
        return Ok(accion);
    }

    [HttpPost]
    public async Task<ActionResult> PUB_CrearAccion(EAcciones accion)
    {
        if (accion == null)
        {
            return BadRequest("Accion no puede ser null.");
        }

        try
        {
            await _accionesRepository.M_PUB_AgregarAccion(accion);
            return CreatedAtAction(nameof(F_PUB_ObtenerAccion), new { id = accion.CN_Id_accion }, accion);
        }
        catch (Exception ex)
        {
            // Verificar el tipo de error por el mensaje
            if (ex.Message.StartsWith("DUPLICATE:"))
            {
                // Error de duplicado
                return Conflict(ex.Message); // Conflicto, ya existe
            }
            else
            {
                // Otro tipo de error
                return StatusCode(500, "Ocurrió un error inesperado: " + ex.Message);
            }
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarAccion(int id, EAcciones accion)
    {
        if (accion == null)
        {
            return BadRequest("Accion no puede ser null.");
        }

        if (id != accion.CN_Id_accion)
        {
            return BadRequest("El ID de la acción no coincide.");
        }

        var existingAccion = await _accionesRepository.F_PUB_ObtenerAccionPorId(id);
        if (existingAccion == null)
        {
            return NotFound();
        }

        try
        {
            await _accionesRepository.M_PUB_ActualizarAccion(accion);
            return NoContent();
        }
        catch (Exception ex)
        {
            // Verificar el tipo de error por el mensaje
            if (ex.Message.StartsWith("DUPLICATE:"))
            {
                // Error de duplicado
                return Conflict(ex.Message); // Conflicto, ya existe
            }
            else
            {
                // Otro tipo de error
                return StatusCode(500, "Ocurrió un error inesperado: " + ex.Message);
            }
        }
    }
}
