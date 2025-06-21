// Servicios para justificación de rechazo de tareas
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getRechazos = async (tareaId) => {
  const res = await fetch(`${API_URL}/api/Tareas/${tareaId}/rechazos`);
  if (!res.ok) throw new Error("Error al obtener rechazos");
  return res.json();
};

export const agregarRechazo = async (tareaId, descripcionRechazo) => {
  await fetch(`${API_URL}/api/Tareas/${tareaId}/rechazos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CN_Id_tarea: tareaId, CT_Descripcion_rechazo: descripcionRechazo }),
  });
};
