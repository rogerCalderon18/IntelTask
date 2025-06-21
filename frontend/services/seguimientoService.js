// Servicios para seguimientos de tareas
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getSeguimientos = async (tareaId) => {
  const res = await fetch(`${API_URL}/api/Tareas/${tareaId}/seguimientos`);
  if (!res.ok) throw new Error("Error al obtener seguimientos");
  return res.json();
};

export const agregarSeguimiento = async (tareaId, comentario) => {
  await fetch(`${API_URL}/api/Tareas/${tareaId}/seguimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CN_Id_tarea: tareaId, CT_Comentario: comentario }),
  });
};
