import React from "react";
import { Button } from "@heroui/react";
import { FiPlus, FiCalendar, FiClock } from "react-icons/fi";

const EmptyStatePermisos = ({ tabActivo, onNuevoPermiso }) => {
  const getEmptyStateContent = () => {
    switch (tabActivo) {
      case "misSolicitudes":
        return {
          icon: <FiCalendar className="w-16 h-16 text-gray-400" />,
          title: "No tienes solicitudes de permiso",
          description: "Aún no has solicitado ningún permiso. Crea tu primera solicitud para comenzar.",
          action: {
            label: "Solicitar Permiso",
            icon: <FiPlus className="w-4 h-4" />,
            show: true
          }
        };
      case "solicitudes":
        return {
          icon: <FiClock className="w-16 h-16 text-gray-400" />,
          title: "No hay solicitudes pendientes",
          description: "No hay solicitudes de permiso para revisar en este momento.",
          action: {
            show: false
          }
        };
      default:
        return {
          icon: <FiCalendar className="w-16 h-16 text-gray-400" />,
          title: "No hay permisos",
          description: "No se encontraron permisos para mostrar.",
          action: {
            show: false
          }
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-50 rounded-full p-6 mb-6">
        {content.icon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {content.title}
      </h3>
      
      <p className="text-gray-600 text-center max-w-md mb-8">
        {content.description}
      </p>
      
      {content.action.show && (
        <Button
          color="primary"
          size="lg"
          startContent={content.action.icon}
          onPress={onNuevoPermiso}
          className="font-medium"
        >
          {content.action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyStatePermisos;
