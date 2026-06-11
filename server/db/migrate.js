const pool = require('./pool')

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Habilitar extensión uuid
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    await client.query(`
      CREATE TABLE IF NOT EXISTS equipos_card (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo      VARCHAR(50),
        nombre      VARCHAR(255) NOT NULL,
        area        VARCHAR(255) NOT NULL,
        imagen      VARCHAR(100) DEFAULT 'motor',
        descripcion TEXT,
        activo      BOOLEAN DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS imagenes_equipo_card (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        equipo_id  UUID NOT NULL REFERENCES equipos_card(id) ON DELETE CASCADE,
        filename   VARCHAR(255) NOT NULL,
        url        TEXT NOT NULL,
        flechas    JSONB DEFAULT '[]',
        orden      INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS puntos_lubricacion_card (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        equipo_id  UUID NOT NULL REFERENCES equipos_card(id) ON DELETE CASCADE,
        imagen_id  UUID REFERENCES imagenes_equipo_card(id) ON DELETE SET NULL,
        nombre     VARCHAR(255) NOT NULL,
        frecuencia VARCHAR(50),
        lubricante VARCHAR(255),
        cantidad   NUMERIC(10,3) DEFAULT 0,
        unidad     VARCHAR(50),
        metodo     VARCHAR(50),
        x          NUMERIC(6,3) DEFAULT 0,
        y          NUMERIC(6,3) DEFAULT 0,
        notas      TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS tecnicos_card (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre           VARCHAR(255) NOT NULL,
        pin              VARCHAR(4)   NOT NULL UNIQUE,
        activo           BOOLEAN DEFAULT true,
        ultima_consulta  DATE,
        created_at       TIMESTAMP DEFAULT NOW()
      )
    `)

    // Técnicos iniciales si la tabla quedó vacía
    const { rows } = await client.query('SELECT COUNT(*) FROM tecnicos_card')
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO tecnicos_card (nombre, pin, activo) VALUES
          ('Juan Pérez',   '1234', true),
          ('María López',  '5678', true),
          ('Carlos Ruiz',  '9012', false)
      `)
      console.log('[DB] Técnicos iniciales creados')
    }

    // Agregar sub_area si no existe (seguro en producción)
    await client.query(`
      ALTER TABLE equipos_card ADD COLUMN IF NOT EXISTS sub_area VARCHAR(255)
    `)

    // Tabla de histórico de lubricaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS lubricaciones_historial (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        punto_id    UUID NOT NULL REFERENCES puntos_lubricacion_card(id) ON DELETE CASCADE,
        equipo_id   UUID NOT NULL REFERENCES equipos_card(id) ON DELETE CASCADE,
        tecnico_id  UUID REFERENCES tecnicos_card(id) ON DELETE SET NULL,
        fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
        hora        TIME,
        notas       TEXT,
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `)

    // Índices para queries rápidas
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lubricaciones_equipo ON lubricaciones_historial(equipo_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lubricaciones_punto ON lubricaciones_historial(punto_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lubricaciones_fecha ON lubricaciones_historial(fecha)`)

    await client.query('COMMIT')
    console.log('[DB] Migración completada correctamente')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[DB] Error en migración:', err)
    throw err
  } finally {
    client.release()
  }
}

module.exports = migrate
