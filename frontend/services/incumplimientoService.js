// Servicios para comentarios de incumplimiento de tareas
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getIncumplimientos = async (tareaId) => {
  const res = await fetch(`${API_URL}/api/Tareas/${tareaId}/incumplimientos`);
  if (!res.ok) throw new Error("Error al obtener incumplimientos");
  return res.json();
};

export const agregarIncumplimiento = async (tareaId, comentario) => {
  await fetch(`${API_URL}/api/Tareas/${tareaId}/incumplimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cN_Id_tarea: tareaId, cT_Justificacion_incumplimiento: comentario }),
  });
};

export const tieneJustificaciones = async (tareaId) => {
  try {
    const incumplimientos = await getIncumplimientos(tareaId);
    return incumplimientos && incumplimientos.length > 0;
  } catch (error) {
    console.error('Error al verificar justificaciones:', error);
    return false;
  }
};
