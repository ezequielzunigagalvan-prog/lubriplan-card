const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway')
    ? { rejectUnauthorized: false }
    : false,
})

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool:', err)
})

module.exports = pool
