require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { Pool } = require('pg')
const readline = require('readline')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  console.log('\n=== Limpieza de equipos duplicados ===\n')

  // Total en BD
  const { rows: [{ count: total }] } = await pool.query('SELECT COUNT(*) FROM equipos_card')
  console.log(`Total equipos en BD: ${total}`)

  // Creados hoy
  const hoy = new Date().toISOString().split('T')[0]
  const { rows: [{ count: cantHoy }] } = await pool.query(
    `SELECT COUNT(*) FROM equipos_card WHERE created_at::date = $1`, [hoy]
  )
  console.log(`Equipos creados hoy (${hoy}): ${cantHoy}`)

  if (parseInt(cantHoy) === 0) {
    console.log('\nNo hay equipos de hoy para eliminar.')
    await pool.end()
    return
  }

  // Mostrar muestra de los que se eliminarían
  const { rows: muestra } = await pool.query(
    `SELECT codigo, nombre, area, created_at FROM equipos_card
     WHERE created_at::date = $1 ORDER BY created_at DESC LIMIT 10`,
    [hoy]
  )
  console.log('\nEjemplos de equipos que se eliminarán:')
  muestra.forEach(e => console.log(`  - [${e.codigo || '—'}] ${e.nombre} (${e.area}) @ ${e.created_at.toISOString()}`))
  if (parseInt(cantHoy) > 10) console.log(`  ... y ${parseInt(cantHoy) - 10} más`)

  // Confirmación
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  await new Promise(resolve => {
    rl.question(`\n¿Eliminar los ${cantHoy} equipos creados hoy? (s/n): `, async (answer) => {
      rl.close()
      if (answer.trim().toLowerCase() !== 's') {
        console.log('\nCancelado. No se eliminó nada.')
        await pool.end()
        resolve()
        return
      }
      const { rowCount } = await pool.query(
        `DELETE FROM equipos_card WHERE created_at::date = $1`, [hoy]
      )
      const { rows: [{ count: nuevo }] } = await pool.query('SELECT COUNT(*) FROM equipos_card')
      console.log(`\n✅ ${rowCount} equipos eliminados.`)
      console.log(`   Total restante en BD: ${nuevo}`)
      await pool.end()
      resolve()
    })
  })
}

run().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})
