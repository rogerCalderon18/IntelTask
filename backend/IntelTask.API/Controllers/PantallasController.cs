
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class PantallasController : ControllerBase
{
    private readonly IPantallasRepository _pantallasRepository;

    public PantallasController(IPantallasRepository pantallasRepository)
    {
        _pantallasRepository = pantallasRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EPantallas>>> F_PUB_ObtenerPantallas()
    {
        var pantallas = await _pantallasRepository.F_PUB_ObtenerTodasLasPantallas();
        return Ok(pantallas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EPantallas>> F_PUB_ObtenerPantalla(int id)
    {
        var pantalla = await _pantallasRepository.F_PUB_ObtenerPantallaPorId(id);
        if (pantalla == null)
        {
            return NotFound();
        }
        return Ok(pantalla);
    }

    [HttpPost]
    public async Task<ActionResult<EPantallas>> M_PUB_CrearPantalla(EPantallas pantalla)
    {
        if (pantalla == null)
        {
            return BadRequest("Pantalla no puede ser null.");
        }

        await _pantallasRepository.M_PUB_AgregarPantalla(pantalla);
        return CreatedAtAction(nameof(F_PUB_ObtenerPantalla), new { id = pantalla.CN_Id_pantalla }, pantalla);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarPantalla(int id, EPantallas pantalla)
    {
        if (id != pantalla.CN_Id_pantalla)
        {
            return BadRequest("El ID de la pantalla no coincide.");
        }

        var existingPantalla = await _pantallasRepository.F_PUB_ObtenerPantallaPorId(id);
        if (existingPantalla == null)
        {
            return NotFound();
        }
        await _pantallasRepository.M_PUB_ActualizarPantalla(pantalla);
        return NoContent();
    }
}
