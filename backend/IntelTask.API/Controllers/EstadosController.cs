namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class EstadosController : ControllerBase
{    private readonly IEstadosRepository _estadosRepository;

    public EstadosController(IEstadosRepository estadosRepository)
    {
        _estadosRepository = estadosRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EEstados>>> F_PUB_ObtenerEstados()
    {
        var estados = await _estadosRepository.F_PUB_ObtenerTodosLosEstados();
        return Ok(estados);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EEstados>> F_PUB_ObtenerEstado(byte id)
    {
        var estado = await _estadosRepository.F_PUB_ObtenerEstadoPorId(id);
        if (estado == null)
        {
            return NotFound();
        }
        return Ok(estado);
    }

    [HttpPost]
    public async Task<ActionResult<EEstados>> M_PUB_CrearEstado(EEstados estado)
    {
        if (estado == null)
        {
            return BadRequest("Estado no puede ser null.");
        }

        await _estadosRepository.M_PUB_AgregarEstado(estado);
        return CreatedAtAction(nameof(F_PUB_ObtenerEstado), new { id = estado.CN_Id_estado }, estado);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarEstado(byte id, EEstados estado)
    {
        if (id != estado.CN_Id_estado)
        {
            return BadRequest("El ID del estado no coincide.");
        }

        var existingEstado = await _estadosRepository.F_PUB_ObtenerEstadoPorId(id);
        if (existingEstado == null)
        {
            return NotFound();
        }

        await _estadosRepository.M_PUB_ActualizarEstado(estado);
        return NoContent();
    }
}
