const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ── Helpers ───────────────────────────────────────────────────────────────────

function token() {
  return localStorage.getItem('adminToken')
}

function authHeaders() {
  const t = token()
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  }
}

async function handle(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error || `Error ${res.status}`
    console.error(`[cardApi] ${res.status} ${res.url} →`, msg)
    throw new Error(msg)
  }
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAdmin(email, password) {
  return handle(await fetch(`${BASE}/api/card/auth/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }))
}

export async function validatePin(pin) {
  return handle(await fetch(`${BASE}/api/card/auth/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  }))
}

// ── Equipos ───────────────────────────────────────────────────────────────────

export async function getEquipos() {
  return handle(await fetch(`${BASE}/api/card/equipos`, { headers: authHeaders() }))
}

export async function getEquipo(id) {
  return handle(await fetch(`${BASE}/api/card/equipos/${id}`))
}

export async function createEquipo(datos) {
  return handle(await fetch(`${BASE}/api/card/equipos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(datos),
  }))
}

export async function importarEquipos(equipos) {
  return handle(await fetch(`${BASE}/api/card/equipos/importar`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ equipos }),
  }))
}

export async function updateEquipo(id, datos) {
  return handle(await fetch(`${BASE}/api/card/equipos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(datos),
  }))
}

export async function deleteEquipo(id) {
  return handle(await fetch(`${BASE}/api/card/equipos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }))
}

export async function deleteEquiposMasivo(ids) {
  return handle(await fetch(`${BASE}/api/card/equipos/eliminar-masivo`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  }))
}

export async function exportarEquipos() {
  const token = localStorage.getItem('adminToken')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${BASE}/api/card/equipos/exportar`, { headers })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.blob()
}

// ── Puntos ────────────────────────────────────────────────────────────────────

export async function updatePuntos(equipoId, puntos) {
  return handle(await fetch(`${BASE}/api/card/equipos/${equipoId}/puntos`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ puntos }),
  }))
}

// ── Imágenes ──────────────────────────────────────────────────────────────────

export async function uploadImagen(equipoId, file) {
  const form = new FormData()
  form.append('imagen', file)
  const t = token()
  return handle(await fetch(`${BASE}/api/card/equipos/${equipoId}/imagenes`, {
    method: 'POST',
    headers: t ? { Authorization: `Bearer ${t}` } : {},
    body: form,
  }))
}

export async function updateImagenes(equipoId, imagenes) {
  return handle(await fetch(`${BASE}/api/card/equipos/${equipoId}/imagenes`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ imagenes }),
  }))
}

export async function deleteImagen(equipoId, imgId) {
  return handle(await fetch(`${BASE}/api/card/equipos/${equipoId}/imagenes/${imgId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }))
}

// ── Técnicos ──────────────────────────────────────────────────────────────────

export async function getTecnicos() {
  return handle(await fetch(`${BASE}/api/card/tecnicos`, { headers: authHeaders() }))
}

export async function createTecnico(datos) {
  return handle(await fetch(`${BASE}/api/card/tecnicos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(datos),
  }))
}

export async function updateTecnico(id, datos) {
  return handle(await fetch(`${BASE}/api/card/tecnicos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(datos),
  }))
}

export async function deleteTecnico(id) {
  return handle(await fetch(`${BASE}/api/card/tecnicos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }))
}

export async function toggleTecnico(id) {
  return handle(await fetch(`${BASE}/api/card/tecnicos/${id}/toggle`, {
    method: 'PATCH',
    headers: authHeaders(),
  }))
}

// ── Lubricaciones ─────────────────────────────────────────────────────────

export async function registrarLubricacion(puntoId, equipoId, tecnicoId, notas) {
  return handle(await fetch(`${BASE}/api/card/lubricaciones/registrar`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ puntoId, equipoId, tecnicoId, notas }),
  }))
}

export async function obtenerHistoricoEquipo(equipoId) {
  return handle(await fetch(`${BASE}/api/card/equipos/${equipoId}/lubricaciones`, {
    headers: authHeaders(),
  }))
}

export async function obtenerUltimaLubricacion(puntoId) {
  return handle(await fetch(`${BASE}/api/card/puntos/${puntoId}/ultima-lubricacion`, {
    headers: authHeaders(),
  }))
}

export async function obtenerLubricacionesRecientes() {
  return handle(await fetch(`${BASE}/api/card/lubricaciones/recientes`, {
    headers: authHeaders(),
  }))
}

export async function obtenerHistoricoEquipo(equipoId) {
  return handle(await fetch(`${BASE}/api/card/equipos/${equipoId}/lubricaciones`, {
    headers: authHeaders(),
  }))
}

export async function obtenerEstadisticasLubricacion(equipoId) {
  return handle(await fetch(`${BASE}/api/card/equipos/${equipoId}/estadisticas-lubricacion`, {
    headers: authHeaders(),
  }))
}
