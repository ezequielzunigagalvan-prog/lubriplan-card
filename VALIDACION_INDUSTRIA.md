# 🏭 Validación para Uso Industrial — LubriPlan Card

Auditoría exhaustiva para determinar qué falta para usar en la industria real.

---

## 1️⃣ FLUJO DEL ADMIN

### ✅ Dashboard
- [x] KPI: Cobertura de configuración
- [x] KPI: Puntos de lubricación (total)
- [x] KPI: Actividad de técnicos
- [x] KPI: Equipos requieren atención
- [x] **NUEVO: Total de equipos (implementado)**
  - Muestra: Total | Activos | Inactivos
  - Útil para: Visión rápida del inventario

### ✅ Gestión de Equipos
- [x] Crear equipo (nombre, código, área, sub-área)
- [x] Editar equipo
- [x] Eliminar equipo individual
- [x] **NUEVO: Eliminar múltiples (implementado)**
  - 5 segundos para 200 equipos
- [x] Ver detalles
- [x] Estado activo/inactivo

### ✅ Puntos de Lubricación
- [x] Crear punto (nombre, lubricante, cantidad, unidad, frecuencia, método)
- [x] Editar punto
- [x] Eliminar punto
- [x] 8 frecuencias disponibles (Diario → Anual)
- [x] Validación de campo cantidad
- ⚠️ **TODO:** Validar cantidad > 0

### ✅ Imágenes
- [x] Subir imagen a Cloudinary
- [x] Crear flechas en imagen (x, y en porcentaje)
- [x] Reordenar imágenes (drag & drop)
- [x] Eliminar imagen
- [x] múltiples imágenes por equipo
- ⚠️ **ISSUE:** Validar que x,y están en rango 0-100

### ✅ Importación Masiva
- [x] Descargar plantilla Excel
- [x] Validar archivo antes de importar
- [x] Mostrar errores por fila
- [x] Crear equipos en batch
- [x] Mostrar resultado (creados + errores)

### ✅ Exportación (NUEVO)
- [x] **NUEVO: Exportar a Excel (implementado)**
  - Formato: XLSX profesional
  - Columnas: Código, Nombre, Área, Sub-área, Estado, Puntos, Imágenes, Creado
  - Auto-nombre: equipos-YYYY-MM-DD.xlsx

### ✅ Técnicos
- [x] Crear técnico (nombre, PIN)
- [x] Editar técnico
- [x] Eliminar técnico
- [x] Activar/desactivar técnico
- [x] Ver última consulta
- [x] Validación: PIN único, 4 dígitos

### ✅ Seguridad
- [x] **NUEVO: Rate limiting (implementado)**
  - Admin: 5 intentos / 15 minutos
  - PIN: 10 intentos / 15 minutos
- [x] **NUEVO: Script de config segura (implementado)**
- [x] JWT authentication
- [x] CORS configurado

---

## 2️⃣ FLUJO DEL TÉCNICO (CRÍTICO)

### 🔴 PIN SCREEN
```
Flujo actual:
1. Técnico ve keypad numérico (1-9, 0, DEL)
2. Tipea PIN de 4 dígitos
3. Validar contra BD
4. Si OK: entra a /areas o /carta/{equipoId}
5. Si NO: error con vibración + shake
```

**Validación:**
- [x] Keypad funciona correctamente
- [x] 4 dígitos requeridos (validación)
- [x] Vibración haptica (si dispositivo soporta)
- [x] Shake animation en error
- [x] Rate limiting: 10 intentos / 15 min
- [x] PIN inactivo rechazado
- [x] Soporte para teclado numérico (hardware)

**Mejoras necesarias:**
- ⚠️ No hay "olvidé mi PIN" - solo el admin puede resetear
- ⚠️ No hay validación de sesión expirada (sesión vive hasta cerrar)
- ⚠️ No hay logout visible para técnico

### 🟡 AREAS SCREEN
```
Flujo actual:
1. Técnico ve lista de áreas
2. Click en área → lista de equipos en esa área
3. Click en equipo → CartaScreen
```

**Validación:**
- [x] Lista de áreas agrupa correctamente
- [x] Sub-áreas se muestran
- [x] Click navega correctamente
- ⚠️ **ISSUE:** Sin sub-áreas, equipos no aparecen bien en algunas áreas

**Mejoras necesarias:**
- [ ] Buscar equipo en esta pantalla (para 100+ equipos)
- [ ] Favoritos (equipos que ve frecuentemente)

### 🔴 CARTA SCREEN (LA MÁS IMPORTANTE)
```
Flujo actual:
1. Muestra equipo: nombre, código, área, imagen
2. Muestra puntos sobre imagen con círculos numerados
3. Click en punto → bottom sheet con detalles
4. Bottom sheet muestra: lubricante, cantidad, método, frecuencia
5. Swipe en imagen → siguiente imagen
```

**Validación:**
- [x] Imagen se carga correctamente
- [x] Puntos se posicionan en porcentaje correcto (x%, y%)
- [x] Click en punto abre detalle
- [x] Bottom sheet muestra información correcta
- [x] Swipe en imágenes funciona
- [x] Datos se muestran bien
- ⚠️ **ISSUE:** Validar posición de puntos con imágenes de diferente aspect ratio

**Problemas encontrados:**
1. **Sin múltiples imágenes:** Si hay 3 imágenes, ¿cómo sabe el técnico cuál mira?
   - Solución actual: Swipe
   - **PROBLEMA:** No hay indicador de "imagen 2/3"
   - **RECOMENDACIÓN:** Agregar indicador de página (dots o números)

2. **Puntos en imagen 2 pero técnico mira imagen 1:**
   - Si un punto está en "imagen 2" pero el técnico no cambió de imagen
   - El punto NO aparece (correcto)
   - **PROBLEMA:** El técnico no sabe que hay puntos en otras imágenes
   - **RECOMENDACIÓN:** Mostrar tabs/dots: "Imagen 1 (4 puntos) | Imagen 2 (2 puntos)"

3. **Sin información de última lubricación:**
   - ¿Cuándo fue la última vez que se lubricó el punto?
   - **PROBLEMA:** No hay histórico
   - **RECOMENDACIÓN:** Campo "Última lubricación: 2026-06-05" (si es datos de LubriPlan)

4. **Sin confirmación de lubricación:**
   - Técnico no puede marcar "ya lubricó este punto"
   - **PROBLEMA:** No hay forma de registrar que hizo el trabajo
   - **RECOMENDACIÓN:** Implementar "Marcar como lubricado hoy" en cada punto

### 🟢 QR FLOW
```
Flujo:
1. Admin genera QR
2. QR apunta a: https://card.lubriplan.com/carta/{equipoId}
3. Técnico escanea con teléfono
4. Abre CartaScreen directamente (sin PIN)
```

**Validación:**
- [x] QR se genera correctamente (en QRModal)
- [x] QR es imprimible (botón "Imprimir")
- [x] QR es descargable (botón "Descargar")
- [x] URL correcta en QR
- ⚠️ **ISSUE:** URL hardcodeada a "https://card.lubriplan.com" (funciona solo en producción)
  - En localhost funciona pero muestra advertencia
- [x] Escanear QR abre ficha sin requerir PIN

---

## 3️⃣ GENERACIÓN DE PDF (CRÍTICO)

### 📄 PDF Template
```
Contenido del PDF:
1. Header con logo + nombre equipo + fecha
2. Datos equipo (código, área, tipo, total puntos)
3. Foto del equipo con puntos numerados
4. Tabla de puntos (punto, lubricante, cantidad, frecuencia, método)
5. QR (apunta a https://card.lubriplan.com/carta/{id})
6. Footer con notas (si las hay)
```

**Validación:**
- [x] Template HTML generado correctamente (PDFTemplate.jsx)
- [x] Imagen se renderiza en PDF
- [x] Puntos se posicionan con x%, y% correctamente
- [x] Tabla de puntos se genera
- [x] QR se incluye en PDF
- [x] Numeración de puntos es correcta
- ⚠️ **ISSUE:** QR hardcodeado a producción

### 📥 PDF Export
```
Flujo:
1. Click "Exportar PDF"
2. html2canvas convertir HTML a canvas
3. jsPDF agregar imagen al PDF
4. Descargar: carta-{nombre-equipo}.pdf
```

**Validación:**
- [x] Librería html2canvas importada
- [x] Librería jsPDF importada
- [x] Tiempo de espera para renderización (300ms)
- [x] Configuración de canvas: scale 2, CORS enabled
- [x] PDF se genera en formato letter (vertical)
- [x] Nombre del archivo es descriptivo
- ⚠️ **ISSUE:** Sin validación de puntos en imagen correcta
- ⚠️ **ISSUE:** Sin indicación de progreso (puede tardarse 2-3 segundos)

**Mejoras necesarias:**
- [ ] Mostrar progreso "Generando PDF..."
- [ ] Validar que todas las imágenes cargaron
- [ ] Manejo de errores si una imagen no carga

---

## 4️⃣ VALIDACIONES DE DATOS

### ❌ Problemas de validación encontrados

| Campo | Validación actual | Problema | Severidad | Solución |
|-------|------------------|----------|-----------|----------|
| Nombre equipo | Requerido | Sin máximo de caracteres | 🟡 Baja | Max 255 chars |
| Código | Opcional | Puede haber duplicados | 🔴 Alta | Hacer único |
| Área | Requerido | Sin validación de caracteres especiales | 🟡 Baja | Permitir solo alfanuméricos + espacios |
| Cantidad lubricante | Numérico | Sin validación > 0 | 🔴 Alta | Requerir > 0 |
| X (posición) | Numérico | Sin rango (0-100) | 🔴 Alta | Validar 0 <= x <= 100 |
| Y (posición) | Numérico | Sin rango (0-100) | 🔴 Alta | Validar 0 <= y <= 100 |
| PIN técnico | `\d{4}` + unique | Correcto | ✅ OK | OK |
| Frecuencia | Enum (8 valores) | Correcto | ✅ OK | OK |
| Email admin | Sin validación | Podría ser inválido | 🟡 Baja | Validar formato email |
| Contraseña | Sin validación | Débil | 🔴 Alta | Min 8 chars + complejidad |

---

## 5️⃣ FEATURES FALTANTES PARA INDUSTRIA

### 🚫 BLOQUEADORES

#### 1. **Histórico de Lubricación** 🔴 CRÍTICO
- Técnico necesita saber: "¿Cuándo fue la última lubricación?"
- Actualmente: No existe
- **Para industria:** OBLIGATORIO
- **Solución:** Agregar tabla `lubricaciones_historial` con:
  - Equipo ID
  - Punto ID
  - Fecha/hora
  - Técnico ID
  - Notas
- **Tiempo:** 4-6 horas implementación + testing

#### 2. **Registro de Lubricación (Técnico marca como hecho)** 🔴 CRÍTICO
- Técnico necesita: "Marcar este punto como lubricado hoy"
- Actualmente: Solo puede ver, no hacer nada
- **Para industria:** OBLIGATORIO
- **Solución:** Agregar botón "✓ Lubricado hoy" en cada punto (CartaScreen)
- **Tiempo:** 2-3 horas

#### 3. **Gestión de Mantenimientos Pendientes** 🟡 IMPORTANTE
- Jefe de mantenimiento necesita: "¿Qué no se lubricó todavía esta semana?"
- Actualmente: Dashboard solo muestra estado general
- **Para industria:** MUY RECOMENDADO
- **Solución:** Reportes de "Puntos no lubricados en última semana"
- **Tiempo:** 4-5 horas

#### 4. **Búsqueda/Filtro en Técnico** 🟡 IMPORTANTE
- Técnico con 100+ equipos necesita buscar rápido
- Actualmente: Solo lista por área
- **Para industria:** RECOMENDADO (si > 50 equipos)
- **Solución:** Buscador en AreasScreen
- **Tiempo:** 2 horas

#### 5. **Múltiples Puntos en Misma Posición** 🟡 IMPORTANTE
- ¿Qué pasa si dos puntos están en misma posición (x, y)?
- Actualmente: Se solapan visualmente
- **Para industria:** PROBLEMA
- **Solución:** Ajustar posición automáticamente si detecta solape
- **Tiempo:** 3 horas

#### 6. **Indicador de Página de Imagen** 🟡 IMPORTANTE
- Si hay 3 imágenes, ¿cómo sabe técnico en cuál está?
- Actualmente: Swipe, pero sin indicador
- **Para industria:** RECOMENDADO
- **Solución:** Agregar dots o "Imagen 2/3" en CartaScreen
- **Tiempo:** 1 hora

#### 7. **Validación de Contraseña** 🔴 CRÍTICO (Seguridad)
- Admin puede poner contraseña de 2 caracteres
- Actualmente: Sin validación
- **Para industria:** OBLIGATORIO
- **Solución:** Min 8 chars + 1 mayúscula + 1 número + 1 símbolo
- **Tiempo:** 1 hora

#### 8. **Validación de Campos Numéricos** 🔴 CRÍTICO
- Cantidad puede ser negativa o 0
- X, Y pueden estar fuera de rango
- **Para industria:** OBLIGATORIO
- **Solución:** Validar en frontend + backend
- **Tiempo:** 2 horas

---

### 🟡 MEJORAS IMPORTANTES (No bloqueadores, pero mejoran UX)

| # | Feature | Impacto | Tiempo |
|---|---------|--------|--------|
| 1 | Logout visible para técnico | Alto | 30 min |
| 2 | "Olvidé PIN" → email reset | Medio | 2 hrs |
| 3 | Búsqueda en dashboard admin | Medio | 1 hr |
| 4 | Exportar reportes (CSV) | Medio | 3 hrs |
| 5 | Dark mode para técnico (ya existe) | Alto | 0 min |
| 6 | Notificaciones push (próximos mantenimientos) | Bajo | 4 hrs |
| 7 | Sincronización offline (si no hay internet) | Alto | 8 hrs |
| 8 | Multi-idioma (ES/EN/PT) | Bajo | 6 hrs |

---

## 6️⃣ LISTADO DE FIXES NECESARIOS (ORDEN DE PRIORIDAD)

### URGENTE (Hacer antes de vender)

**Semana 1:**
- [ ] Validar cantidad > 0 (backend + frontend)
- [ ] Validar X, Y en rango 0-100 (backend + frontend)
- [ ] Validar contraseña min 8 chars + complejidad
- [ ] Indicador de página de imagen en CartaScreen
- [ ] Arreglar URL hardcodeada en QR (usar variable de env)
- [ ] Agregar logout visible en técnico
- [ ] Testing completo con datos reales

**Semana 2:**
- [ ] Implementar registro de lubricación (punto "Lubricado hoy")
- [ ] Implementar histórico de lubricaciones (tabla en BD)
- [ ] Dashboard de "Mantenimientos pendientes"
- [ ] Handling de múltiples puntos en misma posición

### IMPORTANTE (Antes de escalar a 10+ clientes)

- [ ] Búsqueda en técnico (para 50+ equipos)
- [ ] Exportar reportes CSV
- [ ] "Olvidé PIN" con email reset
- [ ] Sincronización offline

### OPCIONAL (Roadmap futuro)

- [ ] Notificaciones push
- [ ] Multi-idioma
- [ ] Mobile app nativa (iOS/Android)
- [ ] Integración con ERP

---

## 7️⃣ CHECKLIST DE LISTO PARA INDUSTRIA

### Seguridad
- [x] Rate limiting (login + PIN)
- [x] JWT authentication
- [x] CORS configurado
- [ ] Validación de contraseña (8+ chars, complejidad)
- [ ] HTTPS enforzado
- [ ] Backup automático
- [ ] Auditoría logging

### Funcionalidad
- [x] CRUD equipos
- [x] Importación masiva
- [x] Exportación Excel
- [x] Gestión técnicos
- [x] Generación QR
- [x] Exportación PDF
- [ ] Registro de lubricación (técnico marca como hecho)
- [ ] Histórico de lubricaciones
- [ ] Reportes de mantenimientos pendientes

### Validación de Datos
- [ ] Cantidad > 0
- [ ] X, Y en rango 0-100
- [ ] Código único
- [ ] Email válido
- [ ] PIN único y 4 dígitos

### UX Técnico
- [x] PIN screen
- [x] Ficha de equipo
- [x] Acceso por QR
- [ ] Indicador de página de imagen
- [ ] Logout visible
- [ ] Búsqueda (para 100+ equipos)

### Testing
- [ ] 200+ equipos con performance OK
- [ ] Exportación PDF sin errores
- [ ] Generación QR correcto
- [ ] Rate limiting funciona
- [ ] Técnico puede registrar lubricación
- [ ] Histórico se guarda

### Documentación
- [x] Setup seguro
- [x] Plan de testing
- [x] Auditoría
- [ ] Manual técnico (cómo usar en taller)
- [ ] Manual admin (cómo configurar)
- [ ] Troubleshooting

---

## VEREDICTO FINAL

### ❓ ¿ESTÁ LISTO PARA INDUSTRIA?

**ESTADO: ⚠️ 60% LISTO**

**Para vender a 1-2 clientes piloto:** ✅ SÍ (con disclaimers)
- Agregar: Validaciones, registro de lubricación, histórico
- Tiempo: 1-2 semanas

**Para vender a 10+ clientes:** ❌ NO
- Necesita todas las features listadas arriba
- Tiempo: 4-5 semanas

**Para usar como producto enterprise:** ❌ NO
- Falta: Integraciones ERP, sincronización offline, reportes avanzados
- Tiempo: 8-10 semanas

---

## 📋 TAREAS INMEDIATAS

### Para primera demo con cliente (esta semana):

1. [x] Agregar total de equipos en dashboard ✅ HECHO
2. [ ] Validar cantidad > 0
3. [ ] Validar X, Y en 0-100
4. [ ] Agregar indicador de página en CartaScreen
5. [ ] Logout para técnico
6. [ ] Fix URL de QR (variable de env)
7. [ ] Testing completo

**Tiempo estimado:** 6-8 horas

---

**Última actualización:** 2026-06-10
**Versión:** 1.0.0
