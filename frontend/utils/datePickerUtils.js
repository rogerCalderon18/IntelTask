import { parseZonedDateTime, getLocalTimeZone, now } from "@internationalized/date";

/**
 * Utilidades para manejar DatePicker con zona horaria correcta
 */
export const datePickerUtils = {
    /**
     * Convierte un string ISO a ZonedDateTime sin conversión de zona horaria
     * @param {string} isoString - String ISO (ej: "2025-07-08T08:00:00.000Z")
     * @returns {ZonedDateTime|null} - ZonedDateTime o null si hay error
     */
    parseISOToZonedDateTime: (isoString) => {
        if (!isoString) return null;
        
        try {
            // Extraer componentes directamente del string ISO sin conversión de zona horaria
            const fechaLimpia = isoString.replace('Z', '').replace('.000', '');
            const [datePart, timePart] = fechaLimpia.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = timePart.split(':').map(Number);
            
            // Crear el ZonedDateTime directamente con los componentes sin conversión
            const isoLocal = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
            return parseZonedDateTime(isoLocal + `[${getLocalTimeZone()}]`);
        } catch (error) {
            console.error('Error parseando fecha:', error);
            return null;
        }
    },

    /**
     * Convierte un ZonedDateTime a string ISO manteniendo la hora local
     * @param {ZonedDateTime} date - Fecha del DatePicker
     * @returns {string|null} - String ISO o null si hay error
     */
    zonedDateTimeToISO: (date) => {
        if (!date) return null;
        
        try {
            const localDate = date.toDate(getLocalTimeZone());
            
            // Crear el ISO string manteniendo la hora local como UTC
            const year = localDate.getFullYear();
            const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
            const day = localDate.getDate().toString().padStart(2, '0');
            const hour = localDate.getHours().toString().padStart(2, '0');
            const minute = localDate.getMinutes().toString().padStart(2, '0');
            const second = localDate.getSeconds().toString().padStart(2, '0');
            
            return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
        } catch (error) {
            console.error('Error convirtiendo fecha a ISO:', error);
            return null;
        }
    },

    /**
     * Valida si una fecha es fin de semana
     * @param {ZonedDateTime} date - Fecha a validar
     * @returns {boolean} - true si es fin de semana
     */
    isWeekend: (date) => {
        const dayOfWeek = date.toDate(getLocalTimeZone()).getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Domingo o Sábado
    },

    /**
     * Valida si una hora está dentro del horario laboral (7:00 AM - 4:30 PM)
     * @param {ZonedDateTime} time - Hora a validar
     * @returns {boolean} - true si la hora NO está disponible
     */
    isTimeUnavailable: (time) => {
        const localTime = time.toDate(getLocalTimeZone());
        const hour = localTime.getHours();
        const minute = localTime.getMinutes();
        const ahora = new Date();
        const horaActual = ahora.getHours();
        const minutoActual = ahora.getMinutes();
        
        // Verificar si la fecha seleccionada es hoy
        const fechaSeleccionada = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate());
        const fechaHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const esHoy = fechaSeleccionada.getTime() === fechaHoy.getTime();

        // Validar horario laboral: 7:00 AM - 4:30 PM
        let isUnavailable = false;
        
        if (hour < 7) {
            isUnavailable = true;
        } else if (hour > 16) {
            isUnavailable = true;
        } else if (hour === 16 && minute > 30) {
            isUnavailable = true;
        }
        
        // Validación adicional: si es hoy, no puede ser anterior a la hora actual
        if (esHoy && !isUnavailable) {
            if (hour < horaActual || (hour === horaActual && minute <= minutoActual)) {
                isUnavailable = true;
            }
        }

        return isUnavailable;
    },

    /**
     * Maneja el cambio de fecha en el DatePicker
     * @param {ZonedDateTime} date - Fecha seleccionada
     * @param {Function} setterFunction - Función para actualizar el estado
     * @param {string} fieldName - Nombre del campo a actualizar
     * @returns {boolean} - true si la fecha fue aceptada
     */
    handleDateChange: (date, setterFunction, fieldName = 'cF_Fecha_limite') => {
        if (date) {
            try {
                // Obtener la fecha en zona local SIN conversión automática a UTC
                const localDate = date.toDate(getLocalTimeZone());
                
                // Validar que no sea fin de semana
                const dayOfWeek = localDate.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    return false;
                }

                const isoString = datePickerUtils.zonedDateTimeToISO(date);
                
                setterFunction(prev => ({
                    ...prev,
                    [fieldName]: isoString
                }));
                
                return true;
            } catch (error) {
                console.error('Error procesando fecha:', error);
                return false;
            }
        } else {
            setterFunction(prev => ({
                ...prev,
                [fieldName]: ""
            }));
            return true;
        }
    },

    /**
     * Obtiene el valor mínimo para el DatePicker (ahora)
     * @returns {ZonedDateTime} - Fecha y hora actual en zona local
     */
    getMinValue: () => {
        return now(getLocalTimeZone());
    },

    /**
     * Obtiene el valor máximo basado en una fecha límite
     * @param {string} maxDateISO - Fecha límite en formato ISO
     * @returns {ZonedDateTime|undefined} - Fecha límite o undefined
     */
    getMaxValue: (maxDateISO) => {
        if (!maxDateISO) return undefined;
        return datePickerUtils.parseISOToZonedDateTime(maxDateISO);
    },

    /**
     * Configuración completa para DatePicker de tareas
     * @param {Object} options - Opciones de configuración
     * @param {string} options.currentValue - Valor actual del campo
     * @param {Function} options.onChange - Función de cambio
     * @param {string} options.maxDateISO - Fecha máxima opcional
     * @param {string} options.fieldName - Nombre del campo (default: 'cF_Fecha_limite')
     * @returns {Object} - Configuración completa para DatePicker
     */
    getDatePickerProps: ({ currentValue, onChange, maxDateISO, fieldName = 'cF_Fecha_limite' }) => {
        return {
            value: datePickerUtils.parseISOToZonedDateTime(currentValue),
            onChange: (date) => datePickerUtils.handleDateChange(date, onChange, fieldName),
            minValue: datePickerUtils.getMinValue(),
            maxValue: datePickerUtils.getMaxValue(maxDateISO),
            isDateUnavailable: datePickerUtils.isWeekend,
            isTimeUnavailable: datePickerUtils.isTimeUnavailable,
            errorMessage: "La fecha y hora límite son requeridas (Lunes a Viernes, 7:00 AM - 4:30 PM, no puede ser en el pasado)"
        };
    }
};

export default datePickerUtils;
