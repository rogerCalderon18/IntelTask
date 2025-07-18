import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Divider,
  Chip,
  Spinner,
  Progress
} from "@heroui/react";
import { FiUpload, FiDownload, FiFile, FiX, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import { adjuntosService } from "../../services/adjuntosService";
import { useSession } from 'next-auth/react';

const GestorAdjuntosPermisos = ({ 
  isOpen, 
  onOpenChange, 
  permisoId, 
  permisoTitulo, 
  currentUserId, 
  estadoPermiso, 
  usuarioCreadorId 
}) => {
  const { data: session } = useSession();
  const [adjuntos, setAdjuntos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Verificar si el usuario puede eliminar adjuntos
  const puedeEliminarAdjuntos = (adjunto) => {
    // El usuario debe ser el creador del permiso
    const esCreador = currentUserId && usuarioCreadorId && 
                     parseInt(currentUserId) === parseInt(usuarioCreadorId);
    
    // El estado debe ser "Registrado" (ID 1)
    const estaRegistrado = estadoPermiso === 1;
    
    // El usuario debe ser quien subió el archivo (si aplica)
    const esPropioArchivo = !adjunto.usuarioId || adjunto.usuarioId === parseInt(currentUserId);
    
    return esCreador && estaRegistrado && esPropioArchivo;
  };

  // Verificar si el usuario puede agregar adjuntos
  const puedeAgregarAdjuntos = () => {
    // El usuario debe ser el creador del permiso
    const esCreador = currentUserId && usuarioCreadorId && 
                     parseInt(currentUserId) === parseInt(usuarioCreadorId);
    
    // El estado debe ser "Aprobado" (ID 6)
    const estaAprobado = estadoPermiso === 6;
    
    // Log para depuración (se puede eliminar en producción)
    console.log('Verificando permisos adjuntos:', {
      currentUserId,
      usuarioCreadorId,
      estadoPermiso,
      esCreador,
      estaAprobado,
      puedeAgregar: esCreador && estaAprobado
    });
    
    return esCreador && estaAprobado;
  };

  const cargarAdjuntos = useCallback(async () => {
    if (!permisoId) return;
    
    setLoading(true);
    try {
      const data = await adjuntosService.obtenerPorPermiso(permisoId);
      setAdjuntos(data || []);
    } catch (error) {
      console.error('Error al cargar adjuntos:', error);
      toast.error('Error al cargar los adjuntos');
    } finally {
      setLoading(false);
    }
  }, [permisoId]);

  useEffect(() => {
    if (isOpen && permisoId) {
      cargarAdjuntos();
    }
  }, [isOpen, permisoId, cargarAdjuntos]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0 || !session?.user?.id) return;

    // Verificar permisos antes de proceder
    if (!puedeAgregarAdjuntos()) {
      if (!currentUserId || !usuarioCreadorId || parseInt(currentUserId) !== parseInt(usuarioCreadorId)) {
        toast.error('Solo el creador del permiso puede agregar adjuntos.');
      } else if (estadoPermiso !== 2) {
        toast.error('Solo se pueden agregar adjuntos a permisos aprobados.');
      } else {
        toast.error('No tienes permisos para agregar adjuntos a este permiso.');
      }
      return;
    }

    const file = files[0];
    
    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('idPermiso', permisoId.toString());
      formData.append('usuarioId', session.user.id.toString());

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await adjuntosService.subirArchivo(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success('Archivo subido exitosamente');
      await cargarAdjuntos();
      
    } catch (error) {
      console.error('Error al subir archivo:', error);
      toast.error('Error al subir el archivo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (adjunto) => {
    try {
      await adjuntosService.descargarArchivo(adjunto.id);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const handleDelete = async (adjunto) => {
    // Verificar si puede eliminar el adjunto
    if (!puedeEliminarAdjuntos(adjunto)) {
      const esCreador = currentUserId && usuarioCreadorId && 
                       parseInt(currentUserId) === parseInt(usuarioCreadorId);
      const estaRegistrado = estadoPermiso === 1;
      
      let mensaje = "No puedes eliminar este adjunto.";
      
      if (!esCreador) {
        mensaje = "Solo el creador del permiso puede eliminar adjuntos.";
      } else if (!estaRegistrado) {
        mensaje = "Solo se pueden eliminar adjuntos cuando el permiso está en estado Registrado.";
      } else {
        mensaje = "Solo puedes eliminar adjuntos que tú hayas subido.";
      }
      
      toast.error(mensaje);
      return;
    }

    // Mostrar confirmación
    if (window.confirm('¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer.')) {
      try {
        await adjuntosService.eliminarArchivo(adjunto.id);
        await cargarAdjuntos();
        toast.success('Archivo eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
        toast.error('Error al eliminar el archivo');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Solo permitir drag si se tienen permisos
    if (!puedeAgregarAdjuntos()) {
      return;
    }
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Verificar permisos antes de proceder
    if (!puedeAgregarAdjuntos()) {
      return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const iconClass = "w-5 h-5";
    
    switch (extension) {
      case 'pdf':
        return <FiFile className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FiFile className={`${iconClass} text-blue-500`} />;
      case 'xls':
      case 'xlsx':
        return <FiFile className={`${iconClass} text-green-500`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FiFile className={`${iconClass} text-purple-500`} />;
      default:
        return <FiFile className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-2 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                Gestión de Adjuntos
              </h2>
              <p className="text-gray-500 text-md">
                {permisoTitulo || `Permiso #${permisoId}`}
              </p>
              {!puedeAgregarAdjuntos() && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mt-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 text-lg">ℹ️</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-amber-800 font-semibold text-sm mb-1">
                        Acceso restringido
                      </h4>
                      <p className="text-amber-700 text-sm leading-relaxed font-normal">
                        Solo el creador del permiso puede agregar adjuntos cuando el estado es Aprobado
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-6">
                {/* Zona de carga mejorada - Solo mostrar si puede agregar adjuntos */}
                {puedeAgregarAdjuntos() && (
                  <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                    <CardBody className="p-0">
                      <div
                        className={`rounded-xl p-8 text-center transition-all duration-300 ${
                          dragActive
                            ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-400 scale-105'
                            : 'bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="mb-6">
                          <FiUpload className={`w-12 h-12 text-blue-500 mx-auto mb-4 ${dragActive ? 'animate-pulse' : ''}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                          {dragActive ? '¡Suelta el archivo aquí!' : 'Subir Archivo'}
                        </h3>
                        <p className="text-gray-600 mb-6 text-lg">
                          {dragActive 
                            ? 'Perfecto, suelta tu archivo para subirlo' 
                            : 'Arrastra y suelta un archivo aquí, o haz clic para seleccionar'
                          }
                        </p>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          disabled={uploading}
                        />
                        <Button
                          color="primary"
                          size="lg"
                          variant="flat"
                          startContent={<FiUpload className="w-5 h-5" />}
                          onPress={() => document.getElementById('file-upload').click()}
                          isDisabled={uploading}
                        >
                          Seleccionar Archivo
                        </Button>
                        <p className="ml-2 text-xs text-gray-500 mt-4 bg-gray-100 rounded-full px-4 py-2 inline-block">
                          Tamaño máximo: 10MB
                        </p>
                      </div>

                      {uploading && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Subiendo archivo...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} color="primary" />
                        </div>
                      )}
                    </CardBody>
                  </Card>
                )}

                {/* Divider solo si hay zona de carga */}
                {puedeAgregarAdjuntos() && <Divider />}

                {/* Lista de adjuntos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      Archivos adjuntos ({adjuntos.length})
                    </h3>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : adjuntos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FiFile className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay archivos adjuntos</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {adjuntos.map((adjunto) => (
                        <Card key={adjunto.id} className="shadow-sm">
                          <CardBody className="py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {getFileIcon(adjunto.nombre)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {adjunto.nombre}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(adjunto.fecha).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer group"
                                  onClick={() => handleDownload(adjunto)}
                                  title="Descargar archivo"
                                >
                                  <FiDownload className="w-4 h-4" />
                                  <span className="text-sm font-medium group-hover:text-blue-700 transition-colors">Descargar</span>
                                </div>
                                
                                {puedeEliminarAdjuntos(adjunto) && (
                                  <div
                                    className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer group"
                                    onClick={() => handleDelete(adjunto)}
                                    title="Eliminar adjunto"
                                  >
                                    <FiTrash className="w-4 h-4" />
                                    <span className="text-sm font-medium group-hover:text-red-700 transition-colors">Eliminar</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                color="danger" 
                className="bg-danger text-white" 
                onPress={onClose}
              >
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default GestorAdjuntosPermisos;
