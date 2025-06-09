using Microsoft.EntityFrameworkCore;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using IntelTask.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Agrega servicios para Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<IntelTaskDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("BdConnection")));

builder.Services.AddScoped<IEstadosRepository, EstadosRepository>();
builder.Services.AddScoped<IAccionesRepository, AccionesRepository>();
builder.Services.AddScoped<IPantallasRepository, PantallasRepository>();
builder.Services.AddScoped<IRolesRepository, RolesRepository>();
builder.Services.AddScoped<IPrioridadesRepository, PrioridadesRepository>();
builder.Services.AddScoped<IComplejidadesRepository, ComplejidadesRepository>();
builder.Services.AddScoped<IOficinasRepository, OficinasRepository>();
builder.Services.AddScoped<IDiasNoHabilesRepository, DiasNoHabilesRepository>();


builder.Services.AddControllers();

var app = builder.Build();

// Configura Swagger en el pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
