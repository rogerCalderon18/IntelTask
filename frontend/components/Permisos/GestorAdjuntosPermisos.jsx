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
import { FiUpload, FiDownload, FiTrash2, FiFile, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { adjuntosService } from "../../services/adjuntosService";
import { useSession } from 'next-auth/react';
import useConfirmation from '@/hooks/useConfirmation';

const GestorAdjuntosPermisos = ({ isOpen, onOpenChange, permisoId, permisoTitulo }) => {
  const { data: session } = useSession();
  const { showConfirmation } = useConfirmation();
  const [adjuntos, setAdjuntos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

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
    const confirmed = await showConfirmation({
      title: '¿Eliminar archivo?',
      message: `¿Estás seguro de que deseas eliminar "${adjunto.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await adjuntosService.eliminarArchivo(adjunto.id);
        toast.success('Archivo eliminado exitosamente');
        await cargarAdjuntos();
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
        toast.error('Error al eliminar el archivo');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Adjuntos del Permiso</h2>
              <p className="text-sm text-gray-600">
                {permisoTitulo || `Permiso #${permisoId}`}
              </p>
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-6">
                {/* Zona de carga */}
                <Card>
                  <CardBody>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Subir archivo
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Arrastra y suelta un archivo aquí, o haz clic para seleccionar
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
                        variant="flat"
                        startContent={<FiUpload />}
                        onPress={() => document.getElementById('file-upload').click()}
                        isDisabled={uploading}
                      >
                        Seleccionar archivo
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Tamaño máximo: 10MB
                      </p>
                    </div>

                    {/* Barra de progreso de carga */}
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

                <Divider />

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
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="primary"
                                  startContent={<FiDownload className="w-4 h-4" />}
                                  onPress={() => handleDownload(adjunto)}
                                >
                                  Descargar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  startContent={<FiTrash2 className="w-4 h-4" />}
                                  onPress={() => handleDelete(adjunto)}
                                >
                                  Eliminar
                                </Button>
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
                color="primary" 
                variant="light" 
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
