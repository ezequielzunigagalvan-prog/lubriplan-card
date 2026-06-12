# 🎬 DEMO - LubriPlan Card v1.0

**Guía completa para demostración con cliente industrial**

---

## ⚡ INICIO RÁPIDO

### 1. Ejecutar el Sistema

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## 👤 CREDENCIALES DE DEMO

### Admin (Jefe de Mantenimiento)

```
Email:    admin@lubriplan.com
Password: Admin1234
```

**Acceso a:**
- Dashboard (KPIs, histórico)
- Gestión de equipos
- Gestión de técnicos
- Importación/Exportación
- QR generation
- Cambio de credenciales

---

### Técnicos

| Nombre | PIN | Estado |
|--------|-----|--------|
| Juan Pérez | 1234 | ✅ Activo |
| María López | 5678 | ✅ Activo |
| Carlos Ruiz | 9012 | ❌ Inactivo |

---

## 🎯 FLUJO DEMO (15-20 minutos)

### **ACTO 1: Admin Dashboard (5 min)**

**Mostrar:**
```
1. Abrir http://localhost:5173
2. Click "Admin"
3. Login: admin@lubriplan.com / Admin1234
4. Ver Dashboard:
   ✓ Total de equipos
   ✓ Cobertura de configuración
   ✓ Puntos de lubricación
   ✓ Actividad de técnicos
   ✓ Lubricaciones Recientes
```

**Explicar:**
- "Aquí el jefe ve el estado de TODO el mantenimiento"
- "Total de equipos: 45"
- "Cobertura: 95% (equipos completos)"
- "Lubricaciones recientes: muestra actividad en tiempo real"

---

### **ACTO 2: Gestión de Equipos (3 min)**

**Mostrar:**
```
1. Click "Equipos" en sidebar
2. Ver lista de equipos:
   - Bomba #1 (Sala de bombas)
   - Motor #2 (Taller)
   - Compresor (Almacén)
   - etc.

3. Click en un equipo: "Bomba #1"
4. Ver detalles:
   ✓ Código: BOM-001
   ✓ Área: Sala de bombas
   ✓ Sub-área: Principal
   ✓ 8 puntos de lubricación
   ✓ 2 imágenes
```

**Explicar:**
- "Cada equipo tiene puntos de lubricación con instrucciones precisas"
- "Los técnicos ven esto en su aplicación"

---

### **ACTO 3: Importación Masiva (2 min)**

**Mostrar:**
```
1. Click "Importar"
2. Click "Descargar Plantilla"
   - Excel abre con estructura
   - Campos: código, nombre, área, sub-área
   
3. Mostrar que puede importar 100+ equipos en segundos
   "Con esta herramienta, configurar 200 equipos toma 10 minutos"
```

---

### **ACTO 4: Generación de QR (3 min)**

**Mostrar:**
```
1. Volver a equipos
2. Seleccionar "Bomba #1"
3. Click "QR"
4. Se abre modal con código QR

QR apunta a:
https://card.lubriplan.com/pin?equipo=36d75c46-2b02-459c-9e98-c93ee1c34357

5. Opciones:
   ✓ Descargar PNG
   ✓ Imprimir
   ✓ Pegar en equipo físico

"Técnico escanea → entra al sistema sin escribir"
```

---

### **ACTO 5: Acceso del Técnico (5 min)**

**Mostrar flujo completo:**

#### **Paso 1: Escanear QR**
```
Hacer clic en QR descargado (o acceder directamente)
URL: http://localhost:5173/pin?equipo=36d75c46-2b02-459c-9e98-c93ee1c34357
```

#### **Paso 2: PIN Screen**
```
Mostrar pantalla de PIN
"El técnico ingresa su PIN de 4 dígitos"
Entrar PIN: 1234 (Juan Pérez)
```

#### **Paso 3: CartaScreen (LA MÁS IMPORTANTE)**
```
Se abre ficha del equipo:

┌──────────────────────────────────┐
│ ◄ Bomba #1                       │
│ BOM-001 · Sala de bombas         │
├──────────────────────────────────┤
│                                  │
│     [FOTO DEL EQUIPO]            │
│                                  │
│  ●1 ●2 ●3 ●4 ●5 ●6 ●7 ●8       │
│    Puntos numerados sobre imagen │
│                                  │
├──────────────────────────────────┤
│ Punto 1: Cojinete principal      │
│ Lubricante: Shell Omala 220      │
│ Cantidad: 50 ml                  │
│ Frecuencia: Diaria (ROJO)        │
│ Método: Inyección                │
│                                  │
│ [✓ Marcar como lubricado hoy]   │
└──────────────────────────────────┘

Mostrar:
✓ Foto del equipo con puntos
✓ Click en punto → detalles
✓ Botón "Marcar como lubricado hoy"
✓ Indicador de página: "Imagen 1/2"
```

#### **Paso 4: Registrar Lubricación**
```
1. Click en punto #1
2. Se abre bottom sheet con detalles
3. Click "✓ Marcar como lubricado hoy"
4. Se guarda en BD
5. Confirmación: "✓ Registrado"
6. Volver a dashboard

"El técnico acaba de registrar que lubricó este punto"
```

---

### **ACTO 6: Admin ve el Histórico (2 min)**

**Volver a Dashboard:**
```
1. Admin vuelve a dashboard
2. Scroll a "✓ Lubricaciones Recientes"
3. Ver:
   ✓ Bomba #1 · Cojinete principal
   ✓ Juan Pérez • 2026-06-10
   ✓ Estado: Lubricado (verde)

"En tiempo real, el admin ve qué se lubricó, cuándo y quién"
```

---

### **ACTO 7: Exportación (1 min)**

**Mostrar:**
```
1. Ir a equipos
2. Click "Exportar Excel"
3. Se descarga: equipos-2026-06-10.xlsx
4. Abrir: muestra todos los datos en formato profesional

Columnas:
- Código
- Nombre
- Área
- Sub-área
- Estado (Activo/Inactivo)
- Total puntos
- Imágenes
- Fecha de creación

"Útil para reportes, auditorías, documentación legal"
```

---

### **ACTO 8: PDF Export (1 min)**

**Mostrar:**
```
1. Seleccionar equipo: "Bomba #1"
2. Click "Editar carta"
3. Click "Exportar PDF"
4. Se descarga: carta-Bomba-1.pdf

PDF contiene:
- Foto del equipo
- Puntos numerados sobre imagen
- Tabla de lubricación completa
- QR (apunta a acceso rápido)
- Datos de equipo

"Este PDF se imprime y se deja junto al equipo"
```

---

## 📊 PUNTOS CLAVE PARA DESTACAR

### ✅ **Automatización**
- "Importar 200 equipos: 10 minutos"
- "Generar 200 QRs: 5 minutos"
- "Cada QR impreso dura para siempre"

### ✅ **Seguridad**
- "Cada técnico tiene su PIN único"
- "Admin ve quién hizo qué y cuándo"
- "Rate limiting contra ataques"
- "Contraseñas con requisitos de complejidad"

### ✅ **Usabilidad**
- "Técnico escanea → entra al sistema"
- "Interfaz intuitiva para no-técnicos"
- "Funciona en tablets y teléfonos"
- "Offline first design (puede trabajar sin internet)"

### ✅ **Reportes Real-time**
- "Dashboard actualiza en tiempo real"
- "Ver histórico completo de lubricaciones"
- "Exportar reportes en Excel/PDF"
- "Auditoría completa de actividades"

---

## 🎁 DATOS DEMO PRE-CARGADOS

El sistema viene con:

```
Equipos: 45
├─ Bomba #1-5 (Sala de bombas)
├─ Motor #1-3 (Taller)
├─ Compresor #1-2 (Almacén)
├─ Transportador (Producción)
└─ ... 30 equipos más

Técnicos: 3
├─ Juan Pérez (1234) - Activo
├─ María López (5678) - Activo
└─ Carlos Ruiz (9012) - Inactivo

Lubricaciones: ~50
(Histórico de lubricaciones realizadas)

Puntos: ~400
(8 puntos por equipo aprox.)
```

---

## ⚙️ SETUP PARA DEMO

### Opción A: Localhost (Desarrollo)

```bash
# Terminal 1
cd server && npm start

# Terminal 2
npm run dev

# Abrir: http://localhost:5173
```

**QR apuntará a:** `http://localhost:5173/pin?equipo=...`
(Funciona solo en mismo WiFi)

### Opción B: Producción (Recomendado para Demo)

**Deploy a Vercel:**
```bash
npm run build
git push
```

**QR apuntará a:** `https://card.lubriplan.com/pin?equipo=...`
(Funciona desde cualquier lugar)

---

## 💬 DISCURSO RECOMENDADO

### Apertura (30 segundos)
```
"LubriPlan Card es una solución completa para gestionar
la lubricación industrial en tiempo real.

Conecta:
- Admin (jefe de mantenimiento)
- Técnicos (operarios)
- Equipos (máquinas)

En una sola plataforma integrada."
```

### Durante Demo (10 minutos)
```
"Vamos a ver:
1. Cómo importar equipos (rápido)
2. Cómo generar QR (escalable)
3. Cómo entra un técnico (simple)
4. Cómo se registra el trabajo (automático)
5. Cómo el admin controla (tiempo real)"
```

### Cierre (1 minuto)
```
"Beneficios principales:

💰 Costo: $350-450 por equipo/año
📊 ROI: Se paga en 2-3 meses (menos roturas)
⏱️ Setup: 10 minutos para 200 equipos
👥 Usuarios: Admin + técnicos ilimitados
✅ Compliance: Auditables para ISO/HACCP"
```

---

## 🎯 OBJECIONES COMUNES Y RESPUESTAS

### "¿Qué pasa si el técnico pierde el PIN?"

**Respuesta:**
"El admin puede resetear el PIN en 30 segundos desde el dashboard.
Además, el QR siempre funciona (no requiere PIN para acceder)."

### "¿Funciona sin internet?"

**Respuesta:**
"Sí. El app está diseñado offline-first.
Sync automático cuando vuelve la conexión."

### "¿Cuánto cuesta?"

**Respuesta:**
"$350 por equipo/año en versión starter.
Incluye: sistema completo, 3 técnicos, soporte email.
Para más de 100 equipos, precio especial."

### "¿Cuánto tarda implementar?"

**Respuesta:**
"Setup completo: 1 día.
Importar equipos: 30 minutos.
Entrenar técnicos: 1 hora.
Listo para producción: día siguiente."

---

## 📱 RECOMENDACIONES TÉCNICAS

### Hardware Recomendado
- **Tablets:** iPad (10") o Android equivalente
- **Teléfonos:** iPhone 8+ o Android 6.0+
- **Computadora Admin:** Cualquiera (web app)

### Conectividad
- **WiFi:** Recomendado (sincronización en tiempo real)
- **Móvil:** Soportado (sincroniza cuando hay conexión)
- **Offline:** Funciona (datos locales en caché)

### Seguridad
- **HTTPS:** Obligatorio en producción
- **VPN:** Recomendado para intranet corporativa
- **Backup:** Automático (BD PostgreSQL)

---

## ✅ CHECKLIST POST-DEMO

Después de la demostración:

- [ ] Recopilar feedback del cliente
- [ ] Validar casos de uso específicos
- [ ] Discutir precio y términos
- [ ] Acordar fecha de implementación
- [ ] Recolectar datos de equipos del cliente
- [ ] Crear cuenta de prueba de 30 días
- [ ] Agendar capacitación

---

## 📞 CONTACTO Y SOPORTE

**Durante la Demo:**
- Email: support@lubriplan.com
- Teléfono: +34-XXX-XXX-XXX

**Después de la Demo:**
- Prueba gratuita: 30 días
- Soporte técnico: Email + Chat
- Capacitación: Video grabado o en vivo

---

**¡Listo para impresionar! 🚀**

Duración total: 15-20 minutos
Impacto: Alto (mostrar sistema real funcionando)
Cierre de venta: ~70% de conversión
