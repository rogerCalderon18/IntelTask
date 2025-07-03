import React, { useState } from "react";
import { DatePicker } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { datePickerUtils } from "../../utils/datePickerUtils";

/**
 * Ejemplo de componente que usa las utilidades del DatePicker
 * Este puede ser usado para eventos, recordatorios, etc.
 */
const EventoModal = ({ evento, onSave, onClose }) => {
    const [eventoLocal, setEventoLocal] = useState(evento || {});

    const handleSubmit = (e) => {
        e.preventDefault();
        // Los datos ya están en formato correcto gracias a datePickerUtils
        onSave(eventoLocal);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Programar Evento</h2>
            
            {/* DatePicker para fecha de inicio */}
            <I18nProvider locale="es">
                <DatePicker
                    label="Fecha y hora de inicio"
                    variant="bordered"
                    granularity="minute"
                    hourCycle={12}
                    {...datePickerUtils.getDatePickerProps({
                        currentValue: eventoLocal.fechaInicio,
                        onChange: setEventoLocal,
                        fieldName: 'fechaInicio'
                    })}
                />
            </I18nProvider>

            {/* DatePicker para fecha de fin con límite basado en fecha de inicio */}
            <I18nProvider locale="es">
                <DatePicker
                    label="Fecha y hora de fin"
                    variant="bordered"
                    granularity="minute"
                    hourCycle={12}
                    {...datePickerUtils.getDatePickerProps({
                        currentValue: eventoLocal.fechaFin,
                        onChange: setEventoLocal,
                        maxDateISO: null, // Sin límite superior
                        fieldName: 'fechaFin'
                    })}
                    // Sobreescribir minValue para que sea después de fechaInicio
                    minValue={eventoLocal.fechaInicio 
                        ? datePickerUtils.parseISOToZonedDateTime(eventoLocal.fechaInicio)
                        : datePickerUtils.getMinValue()
                    }
                />
            </I18nProvider>

            <button type="submit">Guardar Evento</button>
            <button type="button" onClick={onClose}>Cancelar</button>
        </form>
    );
};

export default EventoModal;
