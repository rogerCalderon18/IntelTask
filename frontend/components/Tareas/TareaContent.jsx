import React, { useState } from "react";
import { FiPlusCircle, FiMoreHorizontal, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useDisclosure } from "@heroui/react";
import SubTareaItem from "./SubTareaItem";
import SubtareasManager from "./SubtareasManager";
import DetalleModal from "./DetalleModal";

// Ahora recibimos tipoSeccion y restriccionesAcciones como props
const TareaContent = ({ descripcion, fechaEntrega, subtareas, tarea, onEdit, onDelete, tipoSeccion, restriccionesAcciones = {} }) => {
  const [subtareasActuales, setSubtareasActuales] = useState(subtareas || []);
  const { isOpen: isDetalleOpen, onOpen: onDetalleOpen, onOpenChange: onDetalleOpenChange } = useDisclosure();

  console.log("restriccionesAcciones", restriccionesAcciones, "tipoSeccion", tipoSeccion, tarea);

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Para formato 12 horas con AM/PM
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const handleSubtareasChange = (nuevasSubtareas) => {
    setSubtareasActuales(nuevasSubtareas);
  };

  const handleEditClick = () => {
    if (onEdit && tarea) {
      onEdit(tarea);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete && tarea) {
      onDelete(tarea);
    }
  };

  const handleDetalleClick = () => {
    onDetalleOpen();
  };
  const handleEditFromDetalle = () => {
    if (onEdit) {
      onEdit(tarea);
    }
  };

  return (
    <div className="p-4 border border-gray-100 rounded-md -mt-1">
      <p className="text-sm text-gray-700 mb-4">{descripcion}</p>

      {/* Gestor de subtareas */}
      <SubtareasManager 
        tareaId={tarea?.cN_Id_tarea || tarea?.id} 
        tareaPadre={tarea}
        tipoSeccion={tipoSeccion}
        onSubtareasChange={handleSubtareasChange}
      />
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-blue-500 transition-colors group"
            onClick={handleDetalleClick}
            title="Ver detalle"
          >
            <FiEye className="w-4 h-4" />
            <span className="text-xs font-medium group-hover:text-blue-500 transition-colors">Detalle</span>
          </div>
          
          {/* Mostrar el icono de editar solo si está permitido */}
          {restriccionesAcciones.editar && (
            <div 
              className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-blue-500 transition-colors group"
              onClick={handleEditClick}
              title="Editar tarea"
            >
              <FiEdit className="w-4 h-4" />
              <span className="text-xs font-medium group-hover:text-blue-500 transition-colors">Editar</span>
            </div>
          )}
          
          {/* Mostrar el icono de eliminar solo si está permitido */}
          {restriccionesAcciones.eliminar && (
            <div 
              className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-red-500 transition-colors group"
              onClick={handleDeleteClick}
              title="Eliminar tarea"
            >
              <FiTrash2 className="w-4 h-4" />
              <span className="text-xs font-medium group-hover:text-red-500 transition-colors">Eliminar</span>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500">Fecha de entrega: {formatearFecha(fechaEntrega)}</span>
      </div>

      {/* Modal de detalle */}
      <DetalleModal 
        isOpen={isDetalleOpen}
        onOpenChange={onDetalleOpenChange}
        onClose={() => onDetalleOpenChange(false)}
        tarea={tarea}
        onEdit={handleEditFromDetalle}
        esSubtarea={false}
      />
    </div>
  );
};

export default TareaContent;