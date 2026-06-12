const express    = require('express')
const { v4: uuid } = require('uuid')
const pool       = require('../db/pool')
const { requireAuth, signToken } = require('../middleware/auth')
const upload     = require('../middleware/uploadCard')
const { uploadBuffer, deleteImage } = require('../lib/cloudinary')
const { authLimiter, pinLimiter } = require('../middleware/rateLimiter')
const XLSX = require('xlsx')

const router = express.Router()

// ── Helper: construye el objeto equipo completo desde la BD ──────────────────
async function buildEquipo(id) {
  const eq = await pool.query('SELECT * FROM equipos_card WHERE id = $1', [id])
  if (!eq.rows.length) return null

  const imgs = await pool.query(
    'SELECT * FROM imagenes_equipo_card WHERE equipo_id=$1 ORDER BY orden, created_at',
    [id]
  )
  const pts = await pool.query(
    'SELECT * FROM puntos_lubricacion_card WHERE equipo_id=$1',
    [id]
  )

  const e = eq.rows[0]
  const imagenes = imgs.rows.map(i => ({
    id: i.id,
    url: i.url,
    flechas: i.flechas || [],
  }))

  return {
    id:          e.id,
    codigo:      e.codigo,
    nombre:      e.nombre,
    area:        e.area,
    subArea:     e.sub_area || null,
    imagen:      e.imagen,
    descripcion: e.descripcion,
    activo:      e.activo,
    createdAt:   e.created_at,
    imagenes,
    imagenUrl:   imagenes[0]?.url || null,
    puntos: pts.rows.map(p => ({
      id:        p.id,
      nombre:    p.nombre,
      frecuencia:p.frecuencia,
      lubricante:p.lubricante,
      cantidad:  parseFloat(p.cantidad) || 0,
      unidad:    p.unidad,
      metodo:    p.metodo,
      x:         parseFloat(p.x) || 0,
      y:         parseFloat(p.y) || 0,
      notas:     p.notas,
      imagenId:  p.imagen_id,
    })),
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

// Login admin → devuelve JWT
router.post('/auth/admin', authLimiter, async (req, res) => {
  const { email, password } = req.body || {}
  if (
    email    !== (process.env.ADMIN_EMAIL    || 'admin@lubriplan.com') ||
    password !== (process.env.ADMIN_PASSWORD || 'Admin1234')
  ) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }
  const token = signToken({ role: 'admin', email })
  res.json({ token })
})

// Validar PIN técnico — PÚBLICO
router.post('/auth/pin', pinLimiter, async (req, res) => {
  const { pin } = req.body || {}
  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN debe ser 4 dígitos' })
  }
  try {
    const result = await pool.query(
      'SELECT * FROM tecnicos_card WHERE pin=$1 AND activo=true', [pin]
    )
    if (!result.rows.length) return res.status(401).json({ error: 'PIN incorrecto' })

    const t = result.rows[0]
    await pool.query(
      'UPDATE tecnicos_card SET ultima_consulta=CURRENT_DATE WHERE id=$1', [t.id]
    )
    res.json({ id: t.id, nombre: t.nombre, activo: t.activo })
  } catch (err) {
    console.error('[PIN]', err)
    res.status(500).json({ error: 'Error interno' })
  }
})

// ── Equipos ───────────────────────────────────────────────────────────────────

// Listar todos — requiere auth
router.get('/equipos', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM equipos_card ORDER BY created_at DESC'
    )
    const equipos = await Promise.all(rows.map(r => buildEquipo(r.id)))
    res.json(equipos.filter(Boolean))
  } catch (err) {
    console.error('[GET equipos]', err)
    res.status(500).json({ error: 'Error obteniendo equipos' })
  }
})

// Exportar todos a Excel — requiere auth
router.get('/equipos/exportar', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM equipos_card ORDER BY area, nombre'
    )
    const equipos = await Promise.all(rows.map(r => buildEquipo(r.id)))

    const datos = equipos.filter(Boolean).map(e => ({
      'Código': e.codigo || '',
      'Nombre': e.nombre,
      'Área': e.area,
      'Sub-área': e.subArea || '',
      'Estado': e.activo ? 'Activo' : 'Inactivo',
      'Puntos': e.puntos?.length || 0,
      'Imágenes': e.imagenes?.length || 0,
      'Creado': new Date(e.createdAt || Date.now()).toLocaleDateString('es-AR'),
    }))

    const ws = XLSX.utils.json_to_sheet(datos)
    ws['!cols'] = [
      { wch: 12 }, { wch: 30 }, { wch: 20 },
      { wch: 15 }, { wch: 10 }, { wch: 8 },
      { wch: 8 }, { wch: 12 }
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos')

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
    const timestamp = new Date().toISOString().slice(0, 10)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="equipos-${timestamp}.xlsx"`)
    res.send(buffer)
  } catch (err) {
    console.error('[GET exportar]', err)
    res.status(500).json({ error: 'Error exportando equipos' })
  }
})

// Obtener uno — PÚBLICO (lo usa el QR del técnico)
router.get('/equipos/:id', async (req, res) => {
  try {
    const equipo = await buildEquipo(req.params.id)
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' })
    res.json(equipo)
  } catch (err) {
    console.error('[GET equipo]', err)
    res.status(500).json({ error: 'Error obteniendo equipo' })
  }
})

// Crear — requiere auth
router.post('/equipos', requireAuth, async (req, res) => {
  const { codigo, nombre, area, subArea, imagen, descripcion } = req.body || {}
  if (!nombre?.trim() || !area?.trim()) {
    return res.status(400).json({ error: 'nombre y area son requeridos' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO equipos_card (codigo, nombre, area, sub_area, imagen, descripcion)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [codigo || null, nombre.trim(), area.trim(), subArea?.trim() || null, imagen || 'motor', descripcion || null]
    )
    res.status(201).json(await buildEquipo(rows[0].id))
  } catch (err) {
    console.error('[POST equipo]', err)
    res.status(500).json({ error: 'Error creando equipo' })
  }
})

// Importar equipos en lote — requiere auth
router.post('/equipos/importar', requireAuth, async (req, res) => {
  const { equipos } = req.body || {}
  if (!Array.isArray(equipos) || !equipos.length) {
    return res.status(400).json({ error: 'Se requiere un array de equipos' })
  }
  let creados = 0
  const errores = []
  for (const eq of equipos) {
    if (!eq.nombre?.trim() || !eq.area?.trim()) {
      errores.push({ nombre: eq.nombre, error: 'Nombre y área son requeridos' })
      continue
    }
    try {
      await pool.query(
        `INSERT INTO equipos_card (codigo, nombre, area, sub_area, imagen, descripcion)
         VALUES ($1,$2,$3,$4,'motor',null)`,
        [eq.codigo?.trim() || null, eq.nombre.trim(), eq.area.trim(), eq.subArea?.trim() || null]
      )
      creados++
    } catch (err) {
      console.error('[importar equipo]', err)
      errores.push({ nombre: eq.nombre, error: err.message })
    }
  }
  res.json({ creados, errores })
})

// Actualizar — requiere auth
router.put('/equipos/:id', requireAuth, async (req, res) => {
  const { codigo, nombre, area, subArea, imagen, descripcion, activo } = req.body || {}
  try {
    const { rowCount } = await pool.query(
      `UPDATE equipos_card
       SET codigo=$1, nombre=$2, area=$3, sub_area=$4, imagen=$5, descripcion=$6, activo=$7, updated_at=NOW()
       WHERE id=$8`,
      [codigo||null, nombre, area, subArea?.trim()||null, imagen||'motor', descripcion||null, activo!==false, req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Equipo no encontrado' })
    res.json(await buildEquipo(req.params.id))
  } catch (err) {
    console.error('[PUT equipo]', err)
    res.status(500).json({ error: 'Error actualizando equipo' })
  }
})

// Eliminar — requiere auth
router.delete('/equipos/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT filename FROM imagenes_equipo_card WHERE equipo_id=$1', [req.params.id]
    )
    await Promise.allSettled(rows.map(({ filename }) => filename && deleteImage(filename)))
    await pool.query('DELETE FROM equipos_card WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error('[DELETE equipo]', err)
    res.status(500).json({ error: 'Error eliminando equipo' })
  }
})

// Eliminar múltiples equipos — requiere auth
router.post('/equipos/eliminar-masivo', requireAuth, async (req, res) => {
  const { ids } = req.body || {}
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: 'Se requiere un array de IDs' })
  }
  if (ids.length > 500) {
    return res.status(400).json({ error: 'Máximo 500 equipos por operación' })
  }
  try {
    const { rows: imgs } = await pool.query(
      'SELECT DISTINCT filename FROM imagenes_equipo_card WHERE equipo_id = ANY($1)',
      [ids]
    )
    await Promise.allSettled(imgs.map(({ filename }) => filename && deleteImage(filename)))
    const { rowCount } = await pool.query(
      'DELETE FROM equipos_card WHERE id = ANY($1)',
      [ids]
    )
    res.json({ eliminados: rowCount })
  } catch (err) {
    console.error('[DELETE masivo]', err)
    res.status(500).json({ error: 'Error eliminando equipos' })
  }
})

// ── Puntos ────────────────────────────────────────────────────────────────────

// Reemplaza todos los puntos del equipo — requiere auth
router.put('/equipos/:id/puntos', requireAuth, async (req, res) => {
  const { puntos } = req.body || {}
  try {
    // Validar puntos
    if (Array.isArray(puntos)) {
      for (const p of puntos) {
        if (!p.nombre?.trim()) return res.status(400).json({ error: 'Punto sin nombre' })
        const cantidad = parseFloat(p.cantidad) || 0
        if (p.cantidad !== undefined && p.cantidad !== null && p.cantidad !== '' && cantidad <= 0) {
          return res.status(400).json({ error: `Cantidad debe ser > 0 (punto: ${p.nombre})` })
        }
        const x = parseFloat(p.x) || 0
        const y = parseFloat(p.y) || 0
        if (x < 0 || x > 100 || y < 0 || y > 100) {
          return res.status(400).json({ error: `Posición inválida X,Y (punto: ${p.nombre}). Debe estar entre 0 y 100.` })
        }
      }
    }

    await pool.query('DELETE FROM puntos_lubricacion_card WHERE equipo_id=$1', [req.params.id])
    if (Array.isArray(puntos) && puntos.length) {
      for (const p of puntos) {
        await pool.query(
          `INSERT INTO puntos_lubricacion_card
           (id, equipo_id, imagen_id, nombre, frecuencia, lubricante, cantidad, unidad, metodo, x, y, notas)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            p.id || uuid(),
            req.params.id,
            p.imagenId || null,
            p.nombre,
            p.frecuencia || null,
            p.lubricante || null,
            parseFloat(p.cantidad) || 0,
            p.unidad     || null,
            p.metodo     || null,
            parseFloat(p.x) || 0,
            parseFloat(p.y) || 0,
            p.notas || null,
          ]
        )
      }
    }
    res.json(await buildEquipo(req.params.id))
  } catch (err) {
    console.error('[PUT puntos]', err)
    res.status(500).json({ error: 'Error actualizando puntos' })
  }
})

// ── Imágenes ──────────────────────────────────────────────────────────────────

// Subir imagen — requiere auth
router.post('/equipos/:id/imagenes', requireAuth, upload.single('imagen'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo de imagen' })
  try {
    const { url, publicId } = await uploadBuffer(req.file.buffer)

    const { rows: maxRows } = await pool.query(
      'SELECT COALESCE(MAX(orden),-1) AS m FROM imagenes_equipo_card WHERE equipo_id=$1',
      [req.params.id]
    )
    const orden = (maxRows[0].m ?? -1) + 1

    const { rows } = await pool.query(
      `INSERT INTO imagenes_equipo_card (equipo_id, filename, url, flechas, orden)
       VALUES ($1,$2,$3,'[]',$4) RETURNING id`,
      [req.params.id, publicId, url, orden]
    )
    res.status(201).json({ id: rows[0].id, url, flechas: [] })
  } catch (err) {
    console.error('[POST imagen]', err)
    res.status(500).json({ error: 'Error guardando imagen' })
  }
})

// Actualizar flechas de todas las imágenes del equipo — requiere auth
router.put('/equipos/:id/imagenes', requireAuth, async (req, res) => {
  const { imagenes } = req.body || {}
  if (!Array.isArray(imagenes)) return res.status(400).json({ error: 'imagenes debe ser array' })
  try {
    for (const img of imagenes) {
      if (!img.id) continue
      await pool.query(
        'UPDATE imagenes_equipo_card SET flechas=$1, orden=$2 WHERE id=$3 AND equipo_id=$4',
        [JSON.stringify(img.flechas || []), img.orden ?? 0, img.id, req.params.id]
      )
    }
    res.json(await buildEquipo(req.params.id))
  } catch (err) {
    console.error('[PUT imagenes]', err)
    res.status(500).json({ error: 'Error actualizando imágenes' })
  }
})

// Eliminar imagen — requiere auth
router.delete('/equipos/:id/imagenes/:imgId', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT filename FROM imagenes_equipo_card WHERE id=$1 AND equipo_id=$2',
      [req.params.imgId, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Imagen no encontrada' })

    if (rows[0].filename) await deleteImage(rows[0].filename).catch(() => {})

    await pool.query('DELETE FROM imagenes_equipo_card WHERE id=$1', [req.params.imgId])
    await pool.query(
      'UPDATE puntos_lubricacion_card SET imagen_id=NULL WHERE imagen_id=$1',
      [req.params.imgId]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('[DELETE imagen]', err)
    res.status(500).json({ error: 'Error eliminando imagen' })
  }
})

// ── Histórico de Lubricaciones ────────────────────────────────────────────

// Registrar lubricación — requiere auth
router.post('/lubricaciones/registrar', requireAuth, async (req, res) => {
  const { puntoId, equipoId, tecnicoId, notas } = req.body || {}
  if (!puntoId || !equipoId || !tecnicoId) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO lubricaciones_historial (punto_id, equipo_id, tecnico_id, notas)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [puntoId, equipoId, tecnicoId, notas || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[POST lubricacion]', err)
    res.status(500).json({ error: 'Error registrando lubricación' })
  }
})

// Obtener lubricaciones recientes — requiere auth
router.get('/lubricaciones/recientes', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        lh.id, lh.fecha, lh.hora,
        p.nombre as punto_nombre,
        e.nombre as equipo_nombre, e.id as equipo_id,
        t.nombre as tecnico_nombre
      FROM lubricaciones_historial lh
      JOIN puntos_lubricacion_card p ON lh.punto_id = p.id
      JOIN equipos_card e ON lh.equipo_id = e.id
      LEFT JOIN tecnicos_card t ON lh.tecnico_id = t.id
      ORDER BY lh.fecha DESC, lh.hora DESC
      LIMIT 20
    `)
    res.json(rows.map(r => ({
      id: r.id,
      fecha: r.fecha,
      hora: r.hora,
      puntoNombre: r.punto_nombre,
      equipoNombre: r.equipo_nombre,
      equipoId: r.equipo_id,
      tecnicoNombre: r.tecnico_nombre,
    })))
  } catch (err) {
    console.error('[GET lubricaciones recientes]', err)
    res.status(500).json({ error: 'Error obteniendo histórico' })
  }
})

// Obtener histórico de equipo con puntos — requiere auth
router.get('/equipos/:id/lubricaciones', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        lh.id, lh.fecha, lh.hora,
        p.nombre as punto_nombre,
        t.nombre as tecnico_nombre
      FROM lubricaciones_historial lh
      JOIN puntos_lubricacion_card p ON lh.punto_id = p.id
      LEFT JOIN tecnicos_card t ON lh.tecnico_id = t.id
      WHERE lh.equipo_id=$1
      ORDER BY lh.fecha DESC, lh.hora DESC
      LIMIT 50
    `, [req.params.id])
    res.json(rows.map(r => ({
      id: r.id,
      puntoNombre: r.punto_nombre,
      tecnicoNombre: r.tecnico_nombre,
      fecha: r.fecha,
      hora: r.hora,
    })))
  } catch (err) {
    console.error('[GET lubricaciones equipo]', err)
    res.status(500).json({ error: 'Error obteniendo histórico' })
  }
})

// Obtener estadísticas de lubricación por equipo (últimos 30 días)
router.get('/equipos/:id/estadisticas-lubricacion', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        DATE(lh.fecha) as fecha,
        COUNT(*) as total_lubricaciones,
        COUNT(DISTINCT lh.punto_id) as puntos_unicos
      FROM lubricaciones_historial lh
      WHERE lh.equipo_id=$1
        AND lh.fecha >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(lh.fecha)
      ORDER BY fecha DESC
    `, [req.params.id])
    res.json(rows.map(r => ({
      fecha: r.fecha,
      totalLubricaciones: parseInt(r.total_lubricaciones),
      puntosUnicos: parseInt(r.puntos_unicos),
    })))
  } catch (err) {
    console.error('[GET estadisticas]', err)
    res.status(500).json({ error: 'Error obteniendo estadísticas' })
  }
})

// Obtener última lubricación de un punto — requiere auth
router.get('/puntos/:id/ultima-lubricacion', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM lubricaciones_historial
       WHERE punto_id=$1
       ORDER BY fecha DESC, hora DESC LIMIT 1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.json(null)
    const r = rows[0]
    res.json({
      id: r.id,
      fecha: r.fecha,
      hora: r.hora,
      notas: r.notas,
    })
  } catch (err) {
    console.error('[GET ultima-lubricacion]', err)
    res.status(500).json({ error: 'Error obteniendo última lubricación' })
  }
})

// ── Técnicos ───────────────────────────────────────────────────────────────────

router.get('/tecnicos', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tecnicos_card ORDER BY created_at')
    res.json(rows.map(t => ({
      id: t.id, nombre: t.nombre, pin: t.pin,
      activo: t.activo, ultimaConsulta: t.ultima_consulta,
    })))
  } catch (err) {
    console.error('[GET tecnicos]', err)
    res.status(500).json({ error: 'Error obteniendo técnicos' })
  }
})

router.post('/tecnicos', requireAuth, async (req, res) => {
  const { nombre, pin } = req.body || {}
  if (!nombre?.trim() || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'nombre y PIN de 4 dígitos son requeridos' })
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO tecnicos_card (nombre, pin) VALUES ($1,$2) RETURNING *',
      [nombre.trim(), pin]
    )
    const t = rows[0]
    res.status(201).json({ id: t.id, nombre: t.nombre, pin: t.pin, activo: t.activo, ultimaConsulta: t.ultima_consulta })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese PIN ya está en uso' })
    console.error('[POST tecnico]', err)
    res.status(500).json({ error: 'Error creando técnico' })
  }
})

router.put('/tecnicos/:id', requireAuth, async (req, res) => {
  const { nombre, pin, activo } = req.body || {}
  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE tecnicos_card SET nombre=$1, pin=$2, activo=$3 WHERE id=$4 RETURNING *',
      [nombre, pin, activo !== false, req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Técnico no encontrado' })
    const t = rows[0]
    res.json({ id: t.id, nombre: t.nombre, pin: t.pin, activo: t.activo, ultimaConsulta: t.ultima_consulta })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese PIN ya está en uso' })
    console.error('[PUT tecnico]', err)
    res.status(500).json({ error: 'Error actualizando técnico' })
  }
})

router.delete('/tecnicos/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tecnicos_card WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error('[DELETE tecnico]', err)
    res.status(500).json({ error: 'Error eliminando técnico' })
  }
})

router.patch('/tecnicos/:id/toggle', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE tecnicos_card SET activo=NOT activo WHERE id=$1 RETURNING activo',
      [req.params.id]
    )
    res.json({ activo: rows[0]?.activo })
  } catch (err) {
    console.error('[PATCH tecnico toggle]', err)
    res.status(500).json({ error: 'Error actualizando técnico' })
  }
})

module.exports = router
