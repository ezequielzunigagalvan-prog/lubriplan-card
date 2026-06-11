# 🔒 Setup de Seguridad — LubriPlan Card

Checklist para instalar LubriPlan Card de forma segura en tu empresa.

## 📋 PRE-INSTALACIÓN

### 1. Requisitos de Sistema
- [ ] Node.js 16+ instalado
- [ ] PostgreSQL 12+ instalado y corriendo
- [ ] Puerto 3001 disponible (backend)
- [ ] Puerto 5173 disponible (frontend - desarrollo)

### 2. Generar Configuración Segura

```bash
cd server
node scripts/generateSecureConfig.js
```

Esto generará:
- Email de admin temporal (cambiar post-setup)
- Contraseña segura (32 caracteres)
- JWT Secret (64 caracteres)

**IMPORTANTE:** Guardar en lugar seguro (gestor de contraseñas)

---

## 🚀 INSTALACIÓN

### 3. Clonar y Configurar

```bash
git clone <repo> lubriplan-card
cd lubriplan-card

# Frontend
npm install
cp .env.example .env
# Editar .env con VITE_API_URL=http://localhost:3001

# Backend
cd server
npm install
cp .env.example .env.local
# Editar .env.local con valores de generateSecureConfig.js
```

### 4. Configurar Base de Datos

```bash
cd server
# Las migrations se ejecutan automáticamente al iniciar
node index.js
# Debería mostrar: "[DB] Migración completada correctamente"
```

### 5. Iniciar Aplicación

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Escucha en http://localhost:3001
```

**Terminal 2 (Frontend):**
```bash
npm run dev
# Escucha en http://localhost:5173
```

---

## 🔐 CONFIGURACIÓN SEGURA POST-INSTALACIÓN

### 6. Cambiar Credenciales de Admin (IMPORTANTE)

1. Abrir http://localhost:5173/admin/login
2. Loguear con credenciales de generateSecureConfig.js
3. Ir a Dashboard → "Cambiar credenciales"
4. Cambiar a:
   - Email: tu-email-corporativo@empresa.com
   - Nueva contraseña: al menos 12 caracteres con mayúsculas, números y símbolos

✅ **Contraseña nueva debe guardarse en gestor de contraseñas (1Password, Bitwarden, etc)**

### 7. Validar Autenticación

Intentar login con credenciales incorrectas varias veces:
- [ ] Después de 5 intentos fallidos, debe mostrar error "Demasiados intentos"
- [ ] Después de 15 minutos, debería permitir reintentar
- [ ] Con credenciales correctas, login exitoso

### 8. Generar PIN Técnicos

1. Admin → Gestionar técnicos
2. Crear técnicos reales: Juan Pérez, María López, etc.
3. Asignar PINs de 4 dígitos únicos
   - [ ] Juan Pérez: 1234
   - [ ] María López: 5678
   - [ ] (agregar más según necesidad)
4. Guardar PINs en lugar seguro y distribuirlos a técnicos

---

## 📦 BACKUP & RECUPERACIÓN

### 9. Configurar Backups Automáticos

**Opción A: Script manual (diario)**
```bash
# backup.sh
#!/bin/bash
BACKUP_DIR=~/lubriplan-backups
mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL > $BACKUP_DIR/backup-$(date +%Y-%m-%d).sql
echo "✅ Backup completado"
```

Agregar a crontab:
```bash
crontab -e
# Agregar: 0 2 * * * /path/to/backup.sh
# (Ejecutar diariamente a las 2 AM)
```

**Opción B: Railway (hosting recomendado)**
- Railway automáticamente hace backups diarios
- Ir a railway.app → proyecto → PostgreSQL → Backups

### 10. Testing de Recuperación

Cada mes:
1. [ ] Hacer backup manual
2. [ ] Restaurar en BD de prueba
3. [ ] Verificar que datos están completos
4. [ ] Guardar backup en cloud (Google Drive, OneDrive, etc.)

```bash
# Restaurar
psql $DATABASE_URL < backup-2026-06-10.sql
```

---

## 🛡️ HARDENING DE SEGURIDAD

### 11. Variables de Entorno

```env
# .env.local (NO COMMITEAR A GIT)
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=TuContraseña123!Segura
JWT_SECRET=tu-jwt-secret-de-64-caracteres-aqui
DATABASE_URL=postgresql://user:pass@localhost:5432/lubriplan
PORT=3001
FRONTEND_URL=https://lubriplan.empresa.com
```

**Checklist:**
- [ ] .env.local en .gitignore ✓
- [ ] JWT_SECRET tiene 32+ caracteres
- [ ] PASSWORD tiene 12+ caracteres
- [ ] DATABASE_URL apunta a BD correcta

### 12. HTTPS en Producción

Si desplegando a producción:
```bash
# Forzar HTTPS
app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect('https://' + req.get('host') + req.url)
  }
  next()
})
```

Usar certificado SSL:
- Let's Encrypt (gratuito): certbot
- Cloudflare: free tier incluye SSL
- Railway: SSL automático

### 13. CORS Configuration

Backend:
```javascript
// Ya está configurado en server/index.js
// Verificar que FRONTEND_URL es correcto
```

Frontend:
- [ ] No hardcodear API_URL
- [ ] Usar variable de entorno VITE_API_URL

---

## 👥 GESTIÓN DE USUARIOS

### 14. Crear Cuentas de Técnicos

Cada técnico recibe:
1. PIN de 4 dígitos (único)
2. Acceso a la app vía QR o URL directa
3. URL de acceso: http://localhost:5173 (o tu dominio)

**Técnicos NO pueden:**
- [ ] Ver datos de otros equipos
- [ ] Modificar configuración
- [ ] Ver contraseña de admin

**Técnicos SÍ pueden:**
- [ ] Loguear con PIN
- [ ] Ver fichas de lubricación
- [ ] Registrar lubricaciones completadas

### 15. Auditoría de Acceso

Cada semana:
- [ ] Ver Dashboard → "Actividad de técnicos"
- [ ] Verificar que última consulta es reciente
- [ ] Desactivar técnicos inactivos (más de 30 días)

---

## 🚨 PROTOCOLO DE EMERGENCIA

### Si se compromete la contraseña de admin:

1. ✅ Cambiar inmediatamente en Admin → Credenciales
2. ✅ Resetear JWT Secret en .env.local
3. ✅ Reiniciar servidor
4. ✅ Revisar logs para acceso no autorizado
5. ✅ Hacer backup de datos
6. ✅ Contactar a soporte: soporte@lubriplan.com

### Si se pierden datos:

1. ✅ Restaurar desde último backup
   ```bash
   psql $DATABASE_URL < backup-2026-06-10.sql
   ```
2. ✅ Verificar integridad de datos
3. ✅ Confirmar que técnicos puedan acceder
4. ✅ Documentar en log de incidentes

---

## 📞 SOPORTE

**Contacto técnico:** soporte@lubriplan.com

**Horas de soporte:** Lunes a viernes, 9 AM - 6 PM (Zona horaria Argentina)

**SLA:** Respuesta en 24-48 horas

---

## ✅ CHECKLIST FINAL

- [ ] Base de datos migrada correctamente
- [ ] Admin puede loguear
- [ ] Credenciales cambiadas a seguras
- [ ] Técnicos creados y con PINs
- [ ] Backup configurado
- [ ] HTTPS habilitado (si producción)
- [ ] Prueba de exportación Excel funciona
- [ ] Prueba de eliminación masiva funciona
- [ ] Prueba de importación desde Excel funciona

**¡Sistema listo para usar! 🎉**

---

**Última actualización:** 2026-06-10 | Versión: 1.0.0
