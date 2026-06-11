#!/usr/bin/env node

/**
 * Script para generar configuración segura para nuevos clientes
 * Uso: node scripts/generateSecureConfig.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function generateSecureConfig() {
  // Generar valores seguros
  const adminEmail = `admin-${crypto.randomBytes(4).toString('hex')}@clientname.local`
  const adminPassword = crypto.randomBytes(16).toString('hex') // 32 caracteres
  const jwtSecret = crypto.randomBytes(32).toString('hex') // 64 caracteres

  console.log('\n✅ CONFIGURACIÓN SEGURA GENERADA\n')
  console.log('=' .repeat(60))

  console.log(`
📧 EMAIL DE ADMIN (cambiar en producción):
${adminEmail}

🔐 CONTRASEÑA DE ADMIN (cambiar después del primer login):
${adminPassword}

🔑 JWT SECRET (no compartir):
${jwtSecret}
`)
  console.log('=' .repeat(60))

  console.log(`
📝 AGREGAR A .env.local:
`)
  console.log(`
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${adminPassword}
JWT_SECRET=${jwtSecret}
DATABASE_URL=postgresql://user:password@localhost:5432/lubriplan_cliente
PORT=3001
FRONTEND_URL=https://tu-dominio.com
`)

  console.log(`
⚠️  ACCIONES POST-SETUP:
1. ✅ Cambiar contraseña en primer login: /admin/dashboard → Cambiar credenciales
2. ✅ Rotarla cada 90 días
3. ✅ Usar contraseña de al menos 12 caracteres con símbolos
4. ✅ No compartir JWT_SECRET
5. ✅ Guardar .env en lugar seguro (no commit a git)

`)
}

generateSecureConfig()
