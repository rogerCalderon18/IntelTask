# DatePicker Utils - Documentación

Utilidades para manejar DatePicker con zona horaria correcta y validaciones de horario laboral.

## Instalación

```javascript
import { datePickerUtils } from "../../utils/datePickerUtils";
```

## Uso Básico

### Configuración Completa (Recomendado)

```javascript
<I18nProvider locale="es">
    <DatePicker
        isRequired
        label="Fecha y hora límite"
        variant="bordered"
        granularity="minute"
        hourCycle={12}
        {...datePickerUtils.getDatePickerProps({
            currentValue: estado.fecha,
            onChange: setEstado,
            maxDateISO: fechaLimiteOpcional,
            fieldName: 'fecha' // opcional, default: 'cF_Fecha_limite'
        })}
    />
</I18nProvider>
```

### Uso Individual de Funciones

```javascript
// Convertir ISO a ZonedDateTime
const zonedDate = datePickerUtils.parseISOToZonedDateTime("2025-07-08T08:00:00.000Z");

// Convertir ZonedDateTime a ISO
const isoString = datePickerUtils.zonedDateTimeToISO(zonedDate);

// Validar fin de semana
const esFinDeSemana = datePickerUtils.isWeekend(zonedDate);

// Validar horario laboral
const noDisponible = datePickerUtils.isTimeUnavailable(zonedDate);

// Manejar cambio de fecha
datePickerUtils.handleDateChange(newDate, setEstado, 'nombreCampo');
```

## Funciones Disponibles

### `parseISOToZonedDateTime(isoString)`
Convierte un string ISO a ZonedDateTime sin conversión de zona horaria.
- **Parámetros:** `isoString` (string) - Fecha en formato ISO
- **Retorna:** `ZonedDateTime | null`

### `zonedDateTimeToISO(date)`
Convierte un ZonedDateTime a string ISO manteniendo la hora local.
- **Parámetros:** `date` (ZonedDateTime) - Fecha del DatePicker
- **Retorna:** `string | null`

### `isWeekend(date)`
Valida si una fecha es fin de semana.
- **Parámetros:** `date` (ZonedDateTime) - Fecha a validar
- **Retorna:** `boolean` - true si es fin de semana

### `isTimeUnavailable(time)`
Valida si una hora está dentro del horario laboral (7:00 AM - 4:30 PM).
- **Parámetros:** `time` (ZonedDateTime) - Hora a validar
- **Retorna:** `boolean` - true si la hora NO está disponible

### `handleDateChange(date, setterFunction, fieldName)`
Maneja el cambio de fecha en el DatePicker.
- **Parámetros:** 
  - `date` (ZonedDateTime) - Fecha seleccionada
  - `setterFunction` (Function) - Función para actualizar el estado
  - `fieldName` (string) - Nombre del campo a actualizar
- **Retorna:** `boolean` - true si la fecha fue aceptada

### `getMinValue()`
Obtiene el valor mínimo para el DatePicker (ahora).
- **Retorna:** `ZonedDateTime` - Fecha y hora actual en zona local

### `getMaxValue(maxDateISO)`
Obtiene el valor máximo basado en una fecha límite.
- **Parámetros:** `maxDateISO` (string) - Fecha límite en formato ISO
- **Retorna:** `ZonedDateTime | undefined`

### `getDatePickerProps(options)`
Configuración completa para DatePicker de tareas.
- **Parámetros:** `options` (Object)
  - `currentValue` (string) - Valor actual del campo
  - `onChange` (Function) - Función de cambio
  - `maxDateISO` (string, opcional) - Fecha máxima
  - `fieldName` (string, opcional) - Nombre del campo (default: 'cF_Fecha_limite')
- **Retorna:** `Object` - Configuración completa para DatePicker

## Validaciones Incluidas

### Horario Laboral
- **Días:** Lunes a Viernes únicamente
- **Horas:** 7:00 AM a 4:30 PM
- **Tiempo pasado:** No permite seleccionar horas anteriores si es el día actual

### Zona Horaria
- **Manejo correcto:** Las horas se muestran exactamente como se guardan
- **Sin conversiones automáticas:** 8:00 AM se muestra como 8:00 AM

## Ejemplos de Uso

### Modal de Tareas
```javascript
const TareaModal = () => {
    const [tarea, setTarea] = useState({});
    
    return (
        <DatePicker
            {...datePickerUtils.getDatePickerProps({
                currentValue: tarea.fechaLimite,
                onChange: setTarea,
                maxDateISO: tareaPadre?.fechaLimite,
                fieldName: 'fechaLimite'
            })}
        />
    );
};
```

### Modal de Eventos
```javascript
const EventoModal = () => {
    const [evento, setEvento] = useState({});
    
    return (
        <>
            {/* Fecha de inicio */}
            <DatePicker
                {...datePickerUtils.getDatePickerProps({
                    currentValue: evento.fechaInicio,
                    onChange: setEvento,
                    fieldName: 'fechaInicio'
                })}
            />
            
            {/* Fecha de fin con mínimo basado en fecha de inicio */}
            <DatePicker
                {...datePickerUtils.getDatePickerProps({
                    currentValue: evento.fechaFin,
                    onChange: setEvento,
                    fieldName: 'fechaFin'
                })}
                minValue={evento.fechaInicio 
                    ? datePickerUtils.parseISOToZonedDateTime(evento.fechaInicio)
                    : datePickerUtils.getMinValue()
                }
            />
        </>
    );
};
```

## Notas Importantes

1. **Siempre usar con I18nProvider:** Asegúrate de envolver el DatePicker en `<I18nProvider locale="es">`
2. **Formato de datos:** Las fechas se guardan en formato ISO: `"2025-07-08T08:00:00.000Z"`
3. **Zona horaria:** Las utilidades manejan automáticamente la zona horaria local
4. **Validaciones:** Las validaciones son automáticas y no requieren configuración adicional
