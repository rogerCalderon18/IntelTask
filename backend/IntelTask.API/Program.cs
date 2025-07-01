using Microsoft.EntityFrameworkCore;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using IntelTask.Infrastructure.Repositories;
using IntelTask.Domain.Configuration;
using IntelTask.Infrastructure.Services;

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
builder.Services.AddScoped<IUsuariosRepository, UsuariosRepository>();
builder.Services.AddScoped<ITareasRepository, TareasRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBitacoraCambioEstadoService, BitacoraCambioEstadoService>();
builder.Services.AddScoped<IBitacoraCambioEstadoRepository, BitacoraCambioEstadoRepository>();
builder.Services.AddScoped<ITipoDocumentoRepository, TipoDocumentoRepository>(); // Registrar el repositorio de tipo documento
builder.Services.AddScoped<INotificacionesRepository, NotificacionesRepository>();
builder.Services.AddScoped<INotificacionesService, NotificacionesService>();


// Configurar EmailSettings
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:5185", "https://localhost:5185")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configura Swagger en el pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Agregar middleware para archivos estáticos si es necesario
app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
