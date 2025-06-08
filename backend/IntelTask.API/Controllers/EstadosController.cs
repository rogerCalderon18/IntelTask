namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class EstadosController : ControllerBase
{
    private readonly IEstadosRepository _estadosRepository;

    public EstadosController(IEstadosRepository estadosRepository)
    {
        _estadosRepository = estadosRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EEstados>>> GetEstados()
    {
        var estados = await _estadosRepository.GetAllEstadosAsync();
        return Ok(estados);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EEstados>> GetEstado(byte id)
    {
        var estado = await _estadosRepository.GetEstadoByIdAsync(id);
        if (estado == null)
        {
            return NotFound();
        }
        return Ok(estado);
    }

    [HttpPost]
    public async Task<ActionResult<EEstados>> CreateEstado(EEstados estado)
    {
        if (estado == null)
        {
            return BadRequest("Estado no puede ser null.");
        }

        await _estadosRepository.AddEstadoAsync(estado);
        return CreatedAtAction(nameof(GetEstado), new { id = estado.CN_Id_estado }, estado);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEstado(byte id, EEstados estado)
    {
        if (id != estado.CN_Id_estado)
        {
            return BadRequest("El ID del estado no coincide.");
        }

        var existingEstado = await _estadosRepository.GetEstadoByIdAsync(id);
        if (existingEstado == null)
        {
            return NotFound();
        }

        await _estadosRepository.UpdateEstadoAsync(estado);
        return NoContent();
    }
}
