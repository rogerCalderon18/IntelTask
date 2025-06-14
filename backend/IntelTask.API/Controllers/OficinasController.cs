
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class OficinasController : ControllerBase
{
    private readonly IOficinasRepository _oficinasRepository;

    public OficinasController(IOficinasRepository oficinasRepository)
    {
        _oficinasRepository = oficinasRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EOficinas>>> F_PUB_ObtenerOficinas()
    {
        var oficinas = await _oficinasRepository.F_PUB_ObtenerTodasLasOficinas();
        return Ok(oficinas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EOficinas>> F_PUB_ObtenerOficina(int id)
    {
        var oficina = await _oficinasRepository.F_PUB_ObtenerOficinaPorId(id);
        if (oficina == null)
        {
            return NotFound();
        }
        return Ok(oficina);
    }

    [HttpPost]
    public async Task<ActionResult<EOficinas>> M_PUB_CrearOficina(EOficinas oficina)
    {
        if (oficina == null)
        {
            return BadRequest("Oficina no puede ser null.");
        }

        await _oficinasRepository.M_PUB_AgregarOficina(oficina);
        return CreatedAtAction(nameof(F_PUB_ObtenerOficina), new { id = oficina.CN_Codigo_oficina }, oficina);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarOficina(int id, EOficinas oficina)
    {
        if (id != oficina.CN_Codigo_oficina)
        {
            return BadRequest("El ID de la oficina no coincide.");
        }

        var existingOficina = await _oficinasRepository.F_PUB_ObtenerOficinaPorId(id);
        if (existingOficina == null)
        {
            return NotFound();
        }
        await _oficinasRepository.M_PUB_ActualizarOficina(oficina);
        return NoContent();
    }
}
