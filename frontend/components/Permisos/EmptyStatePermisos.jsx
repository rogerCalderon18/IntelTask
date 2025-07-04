import React from "react";
import { Button } from "@heroui/react";
import { FiPlus, FiCalendar, FiClock } from "react-icons/fi";

const EmptyStatePermisos = ({ tabActivo, onNuevoPermiso }) => {
  const getEmptyStateContent = () => {
    switch (tabActivo) {
      case "misSolicitudes":
        return {
          emoji: "",
          title: "¡Tu lista de permisos está vacía!",
          description: "Parece que aún no has solicitado ningún permiso.",
          action: {
            label: "Solicitar mi Primer Permiso",
            icon: <FiPlus className="w-4 h-4" />,
            show: true
          }
        };
      case "solicitudes":
        return {
          emoji: "",
          title: "¡Todo al día!",
          description: "Excelente trabajo. No hay solicitudes de permiso pendientes de revisión en este momento.",
          action: {
            show: false
          }
        };
      default:
        return {
          emoji: "",
          title: "Sin permisos para mostrar",
          description: "No se encontraron permisos que coincidan con los filtros seleccionados.",
          action: {
            show: false
          }
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Animación de rebote suave */}
      <div className="animate-bounce mb-8">
        <div className="text-8xl mb-4">
          {content.emoji}
        </div>
      </div>
      
      {/* Título con gradiente */}
      <h3 className="text-3xl font-bold bg-primary bg-clip-text text-transparent mb-4 text-center">
        {content.title}
      </h3>
      
      {/* Descripción mejorada */}
      <p className="text-lg text-gray-600 text-center max-w-2xl mb-10 leading-relaxed">
        {content.description}
      </p>
      
      {/* Botón de acción mejorado */}
      {content.action.show && (
        <Button
          color="primary"
          size="lg"
          startContent={content.action.icon}
          onPress={onNuevoPermiso}
          className="hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {content.action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyStatePermisos;
