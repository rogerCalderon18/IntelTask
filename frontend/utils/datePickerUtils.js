import { parseZonedDateTime, getLocalTimeZone, now, parseAbsoluteToLocal } from "@internationalized/date";

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
     * Convierte un string ISO a ZonedDateTime usando parseAbsoluteToLocal (para permisos)
     * @param {string} isoString - String ISO (ej: "2025-07-08T08:00:00.000Z")
     * @returns {ZonedDateTime|null} - ZonedDateTime o null si hay error
     */
    parseISOToAbsoluteLocal: (isoString) => {
        if (!isoString) return null;
        
        try {
            return parseAbsoluteToLocal(new Date(isoString).toISOString());
        } catch (error) {
            console.error('Error parseando fecha absoluta:', error);
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
            // Método más directo: usar toAbsoluteString() y luego formatear
            if (date.toAbsoluteString) {
                // Obtener el string absoluto y formatear correctamente
                const absoluteString = date.toAbsoluteString();
                return absoluteString;
            }
            
            // Método de respaldo: convertir manualmente
            const localDate = date.toDate(getLocalTimeZone());
            
            if (!(localDate instanceof Date) || isNaN(localDate.getTime())) {
                console.error('Fecha inválida:', localDate);
                return null;
            }
            
            // Crear el ISO string manteniendo la hora local como UTC
            const year = localDate.getFullYear();
            const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
            const day = localDate.getDate().toString().padStart(2, '0');
            const hour = localDate.getHours().toString().padStart(2, '0');
            const minute = localDate.getMinutes().toString().padStart(2, '0');
            const second = localDate.getSeconds().toString().padStart(2, '0');
            
            const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
            console.log('ISO string generado:', isoString);
            return isoString;
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
                    console.warn('Fecha no válida: fin de semana');
                    return false;
                }

                // Convertir a string ISO válido manteniendo la hora local
                const isoString = datePickerUtils.zonedDateTimeToISO(date);
                
                if (!isoString) {
                    console.error('No se pudo convertir la fecha a ISO string');
                    return false;
                }

                console.log(`Fecha cambiada en ${fieldName}:`, isoString);
                
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
            // Si no hay fecha, limpiar el campo
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
     * Obtiene el valor máximo para permisos (solo fecha, sin restricción de hora)
     * @param {string} maxDateISO - Fecha límite en formato ISO
     * @returns {ZonedDateTime|undefined} - Fecha límite sin restricción de hora o undefined
     */
    getMaxValueForPermissions: (maxDateISO) => {
        if (!maxDateISO) return undefined;
        
        try {
            // Para permisos, si es el mismo día, no aplicar restricción de hora máxima
            const maxDate = datePickerUtils.parseISOToZonedDateTime(maxDateISO);
            if (!maxDate) return undefined;
            
            // Convertir a fecha sin hora (final del día)
            const endOfDay = maxDate.set({ 
                hour: 16, 
                minute: 30, 
                second: 59 
            });
            
            return endOfDay;
        } catch (error) {
            console.error('Error calculando maxValue para permisos:', error);
            return undefined;
        }
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
    },

    /**
     * Configuración completa para DatePicker de permisos (sin restricciones de horario laboral)
     * @param {Object} options - Opciones de configuración
     * @param {string} options.currentValue - Valor actual del campo
     * @param {Function} options.onChange - Función de cambio personalizada (opcional)
     * @param {string} options.fieldName - Nombre del campo
     * @returns {Object} - Configuración completa para DatePicker de permisos
     */
    getPermissionDatePickerProps: (options) => {
        // Manejar el caso donde se pasa un string directamente (compatibilidad hacia atrás)
        if (typeof options === 'string' || !options) {
            const currentValue = typeof options === 'string' ? options : null;
            return {
                value: datePickerUtils.parseISOToAbsoluteLocal(currentValue),
                minValue: datePickerUtils.getMinValue(),
                showTimeField: true,
                granularity: "minute",
                hourCycle: 12,
                showMonthAndYearPickers: true,
                hideTimeZone: true,
                variant: "bordered",
                isDateUnavailable: datePickerUtils.isWeekend,
                errorMessage: "La fecha es requerida (Solo días hábiles: Lunes a Viernes)"
            };
        }

        // Extraer propiedades del objeto
        const { currentValue, onChange, fieldName } = options;
        
        return {
            value: datePickerUtils.parseISOToAbsoluteLocal(currentValue),
            onChange: onChange || undefined, // Usar onChange personalizado si se proporciona
            minValue: datePickerUtils.getMinValue(),
            showTimeField: true
        };
    },

    /**
     * Configuración completa para DatePicker de permisos con todas las opciones (con restricciones de horario)
     * @param {Object} options - Opciones de configuración
     * @param {string} options.currentValue - Valor actual del campo
     * @param {Function} options.onChange - Función de cambio
     * @param {string} options.maxDateISO - Fecha máxima opcional
     * @param {string} options.fieldName - Nombre del campo
     * @returns {Object} - Configuración completa para DatePicker de permisos
     */
    getPermissionDatePickerPropsComplete: (options) => {
        // Manejar el caso donde se pasa un string directamente o no se pasa nada
        if (typeof options === 'string' || !options) {
            const currentValue = typeof options === 'string' ? options : null;
            return {
                value: datePickerUtils.parseISOToZonedDateTime(currentValue),
                minValue: datePickerUtils.getMinValue(),
                isDateUnavailable: datePickerUtils.isWeekend,
                isTimeUnavailable: datePickerUtils.isTimeUnavailable,
                errorMessage: "La fecha y hora son requeridas (Lunes a Viernes, 7:00 AM - 4:30 PM, no puede ser en el pasado)"
            };
        }

        // Extraer propiedades del objeto con valores por defecto
        const { 
            currentValue = null, 
            onChange = null, 
            maxDateISO = null, 
            fieldName = 'cF_Fecha_limite' 
        } = options;
        
        return {
            value: datePickerUtils.parseISOToZonedDateTime(currentValue),
            onChange: onChange ? (date) => datePickerUtils.handleDateChange(date, onChange, fieldName) : undefined,
            minValue: datePickerUtils.getMinValue(),
            maxValue: datePickerUtils.getMaxValueForPermissions(maxDateISO),
            isDateUnavailable: datePickerUtils.isWeekend,
            isTimeUnavailable: datePickerUtils.isTimeUnavailable,
            errorMessage: "La fecha y hora son requeridas (Lunes a Viernes, 7:00 AM - 4:30 PM, no puede ser en el pasado)"
        };
    }
};

export default datePickerUtils;
