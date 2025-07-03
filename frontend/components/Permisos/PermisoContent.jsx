import React, { useState } from "react";
import { Button, Chip, Divider, Tooltip, useDisclosure } from "@heroui/react";
import { FiEdit2, FiTrash2, FiCalendar, FiUser, FiClock, FiFileText } from "react-icons/fi";
import GestorAdjuntosPermisos from "./GestorAdjuntosPermisos";

const PermisoContent = ({ permiso, onEdit, onDelete, tipoSeccion, currentUserId }) => {
  const [expandirDescripcion, setExpandirDescripcion] = useState(false);
  const { isOpen: isAdjuntosOpen, onOpen: onAdjuntosOpen, onOpenChange: onAdjuntosOpenChange } = useDisclosure();

  // Función para formatear fecha y hora
  const formatearFechaHora = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para calcular duración del permiso
  const calcularDuracion = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return '';
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin - inicio;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 1) return '1 día';
    if (dias < 1) return 'Menos de 1 día';
    return `${dias} días`;
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = (estadoId) => {
    const colores = {
      1: "default",     // Registrado
      2: "success",     // Aprobado
      15: "danger",     // Rechazado
    };
    return colores[estadoId] || "default";
  };

  // Función para obtener el nombre del estado
  const obtenerNombreEstado = (estadoId) => {
    const estados = {
      1: "Registrado",
      2: "Aprobado",
      15: "Rechazado"
    };
    return estados[estadoId] || `Estado ${estadoId}`;
  };

  // Verificar si el usuario puede editar
  const puedeEditar = () => {
    const esCreador = (permiso.cN_Usuario_creador || permiso.usuarioCreador) === currentUserId;
    const estadoActual = permiso.cN_Id_estado || permiso.estado;
    
    if (tipoSeccion === "misSolicitudes") {
      // En mis solicitudes, solo puedo editar si soy el creador y está en estado registrado
      return esCreador && estadoActual === 1;
    } else if (tipoSeccion === "solicitudes") {
      // En solicitudes para revisar, puedo editar (aprobar/rechazar) si está en estado registrado
      return estadoActual === 1;
    }
    
    return false;
  };

  // Verificar si el usuario puede eliminar
  const puedeEliminar = () => {
    const esCreador = (permiso.cN_Usuario_creador || permiso.usuarioCreador) === currentUserId;
    const estadoActual = permiso.cN_Id_estado || permiso.estado;
    
    // Solo el creador puede eliminar y solo si está en estado registrado
    return tipoSeccion === "misSolicitudes" && esCreador && estadoActual === 1;
  };

  const descripcion = permiso.cT_Descripcion_permiso || permiso.descripcion || '';
  const mostrarBotonExpandir = descripcion.length > 150;
  const descripcionMostrada = expandirDescripcion ? descripcion : descripcion.substring(0, 150);

  return (
    <div className="space-y-4 p-1">
      {/* Información Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fechas del Permiso */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiCalendar className="w-4 h-4" />
            <span>Período</span>
          </div>
          <div className="text-sm text-gray-600">
            <div><strong>Inicio:</strong> {formatearFechaHora(permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio)}</div>
            <div><strong>Fin:</strong> {formatearFechaHora(permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin)}</div>
          </div>
        </div>

        {/* Duración */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiClock className="w-4 h-4" />
            <span>Duración</span>
          </div>
          <div className="text-sm text-gray-600">
            {calcularDuracion(
              permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio,
              permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin
            )}
          </div>
        </div>

        {/* Usuario Creador */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiUser className="w-4 h-4" />
            <span>Solicitante</span>
          </div>
          <div className="text-sm text-gray-600">
            {permiso.usuarioCreador?.cT_Nombre_usuario || 'Usuario desconocido'}
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span>Estado</span>
          </div>
          <div>
            <Chip
              color={obtenerColorEstado(permiso.cN_Id_estado || permiso.estado)}
              variant="flat"
              size="sm"
            >
              {obtenerNombreEstado(permiso.cN_Id_estado || permiso.estado)}
            </Chip>
          </div>
        </div>
      </div>

      <Divider />

      {/* Descripción */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FiFileText className="w-4 h-4" />
          <span>Descripción</span>
        </div>
        <div className="text-sm text-gray-600">
          {descripcionMostrada}
          {mostrarBotonExpandir && !expandirDescripcion && '...'}
          {mostrarBotonExpandir && (
            <button
              onClick={() => setExpandirDescripcion(!expandirDescripcion)}
              className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              {expandirDescripcion ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
      </div>

      {/* Motivo de Rechazo (si aplica) */}
      {(permiso.cN_Id_estado || permiso.estado) === 15 && (permiso.cT_Descripcion_rechazo || permiso.descripcionRechazo) && (
        <>
          <Divider />
          <div className="space-y-2">
            <div className="text-sm font-medium text-red-700">
              Motivo de Rechazo
            </div>
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {permiso.cT_Descripcion_rechazo || permiso.descripcionRechazo}
            </div>
          </div>
        </>
      )}

      <Divider />

      {/* Acciones */}
      <div className="flex flex-wrap gap-2 justify-end">
        {/* Botón de Adjuntos */}
        <Button
          size="sm"
          variant="light"
          color="default"
          onPress={onAdjuntosOpen}
        >
          Adjuntos
        </Button>

        {/* Botón de Editar */}
        {puedeEditar() && (
          <Tooltip content={tipoSeccion === "solicitudes" ? "Aprobar/Rechazar permiso" : "Editar permiso"}>
            <Button
              size="sm"
              color="primary"
              variant="light"
              startContent={<FiEdit2 className="w-4 h-4" />}
              onPress={() => onEdit(permiso)}
            >
              {tipoSeccion === "solicitudes" ? "Revisar" : "Editar"}
            </Button>
          </Tooltip>
        )}

        {/* Botón de Eliminar */}
        {puedeEliminar() && (
          <Tooltip content="Eliminar permiso">
            <Button
              size="sm"
              color="danger"
              variant="light"
              startContent={<FiTrash2 className="w-4 h-4" />}
              onPress={() => onDelete(permiso.id || permiso.cN_Id_permiso)}
            >
              Eliminar
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Modal de Adjuntos */}
      <GestorAdjuntosPermisos
        isOpen={isAdjuntosOpen}
        onOpenChange={onAdjuntosOpenChange}
        permisoId={permiso.id || permiso.cN_Id_permiso}
        permisoTitulo={permiso.cT_Titulo_permiso || permiso.titulo}
      />
    </div>
  );
};

export default PermisoContent;
