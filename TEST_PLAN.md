# 🧪 Plan de Testing — LubriPlan Card

Manual de testing para validar que el sistema funciona correctamente antes de vender a clientes.

---

## 📋 TESTING FUNCIONAL

### 1. Autenticación

#### 1.1 Login Admin
- [ ] Loguear con credenciales correctas → ✅ Acceso al dashboard
- [ ] Loguear con email incorrecto → ❌ "Credenciales incorrectas"
- [ ] Loguear con password incorrecto → ❌ "Credenciales incorrectas"
- [ ] Intentar 5 veces con password incorrecto → ⏱️ "Demasiados intentos. Espera 15 minutos"
- [ ] Logout → ✅ Redirige a login

#### 1.2 PIN Técnico
- [ ] Validar PIN correcto → ✅ Acceso a fichas
- [ ] Validar PIN incorrecto → ❌ "PIN incorrecto"
- [ ] Intentar 10 veces PIN incorrecto → ⏱️ Bloqueo de 15 minutos
- [ ] PIN inactivo (técnico deshabilitado) → ❌ "PIN incorrecto"

---

### 2. Gestión de Equipos (CRUD)

#### 2.1 Crear Equipo
```
Formulario:
- Nombre: "Bomba centrífuga #1" ✅
- Código: "BOM-001" ✅
- Área: "Sala de bombas" ✅
- Sub-área: "Nivel 2" ✅
- Descripción: (opcional) ✅
```
- [ ] Crear sin nombre → ❌ Error requerido
- [ ] Crear sin área → ❌ Error requerido
- [ ] Crear con datos válidos → ✅ Guardado, aparece en lista

#### 2.2 Editar Equipo
- [ ] Cambiar nombre → ✅ Guardado
- [ ] Cambiar área → ✅ Guardado
- [ ] Cambiar sub-área → ✅ Guardado
- [ ] Cambiar estado a inactivo → ✅ Se marca como "Inactivo" en lista
- [ ] Los cambios aparecen inmediatamente en dashboard

#### 2.3 Eliminar Equipo (individual)
- [ ] Seleccionar equipo → "¿Seguro eliminar?"
- [ ] Confirmar → ✅ Se elimina
- [ ] No aparece más en lista
- [ ] Las imágenes de Cloudinary se eliminan

#### 2.4 Ver Equipo
- [ ] Click en un equipo → Abre vista de detalle
- [ ] Ve: código, nombre, área, puntos, imágenes
- [ ] Ve botones: Editar, Carta, QR

---

### 3. Importación Masiva

#### 3.1 Generar Plantilla
- [ ] Click "Descargar plantilla Excel"
- [ ] Descarga archivo: plantilla-equipos-lubriplan.xlsx
- [ ] Abrir en Excel → Tiene columnas: Nombre | Código | Área | Sub Área
- [ ] Tiene 3 ejemplos

#### 3.2 Importar Equipos
```excel
Llenar con:
Nombre       | Código | Área         | Sub Área
Compresor 1  | CMP-01 | Cuarto técnico | 
Compresor 2  | CMP-02 | Cuarto técnico |
Bomba 1      | BOM-01 | Sala bombas | Nivel 1
```

- [ ] Subir archivo → Paso 2 "Revisar"
- [ ] Mostrar tabla con 3 equipos ✅ válidos
- [ ] Click "Importar 3 equipos" → Paso 3 progreso
- [ ] Mostrar "✅ ¡Importación completa! 3 equipos creados"
- [ ] Ver equipos en lista → Aparecen todos

#### 3.3 Validación de Importación
- [ ] Importar con nombre vacío en fila 2 → Mostrar ❌ error
- [ ] Importar sin área en fila 2 → Mostrar ❌ error
- [ ] Importar 200 equipos → Debería funcionar (limit es 500)
- [ ] Importar 501 equipos → ❌ "Máximo 500 equipos"

---

### 4. Eliminación Masiva (NEW)

#### 4.1 Seleccionar Equipos
- [ ] Click checkbox en fila → Equipo seleccionado (fondo azul)
- [ ] Click checkbox en encabezado → Todos seleccionados
- [ ] Click "Seleccionar todos" → Todos checked
- [ ] Aparece badge "N seleccionados"
- [ ] Botón "Eliminar (N)" habilitado

#### 4.2 Eliminar Masivamente
- [ ] Seleccionar 5 equipos
- [ ] Click "🗑️ Eliminar (5)" → Confirmación "¿Seguro eliminar 5 equipos?"
- [ ] Confirmar → Progreso "Eliminando..."
- [ ] Después de 2-3 segundos → Desaparecen de lista
- [ ] Badge "5 seleccionados" desaparece
- [ ] Contadores se actualizan

#### 4.3 Limpiar Selección
- [ ] Seleccionar 10 equipos
- [ ] Click "Limpiar" → Se deseleccionan todos
- [ ] Badge desaparece
- [ ] Botón "Seleccionar todos" reaparece

---

### 5. Exportación a Excel (NEW)

#### 5.1 Exportar Todos
- [ ] Tener 50+ equipos en sistema
- [ ] Click "📥 Exportar Excel" → Descarga archivo
- [ ] Nombre: "equipos-2026-06-10.xlsx"
- [ ] Abrir en Excel

**Verificar columnas:**
- [ ] Código ✅
- [ ] Nombre ✅
- [ ] Área ✅
- [ ] Sub-área ✅
- [ ] Estado (Activo/Inactivo) ✅
- [ ] Puntos (cantidad) ✅
- [ ] Imágenes (cantidad) ✅
- [ ] Creado (fecha) ✅

#### 5.2 Validar Datos
- [ ] Todos los equipos de lista están en Excel
- [ ] Datos coinciden con los en pantalla
- [ ] Formato correcto (números como números, texto como texto)
- [ ] Sin caracteres rotos

---

### 6. Puntos de Lubricación

#### 6.1 Agregar Punto
- [ ] Editar equipo
- [ ] Agregar punto: "Cojinete frontal"
- [ ] Frecuencia: "Diario" ✅
- [ ] Lubricante: "Shell Omala S2 G 220" ✅
- [ ] Cantidad: "5" + "ml" ✅
- [ ] Método: "Engrasador manual" ✅
- [ ] Click guardar

#### 6.2 Editar Punto
- [ ] Cambiar frecuencia a "Semanal" → ✅
- [ ] Cambiar cantidad a "10 ml" → ✅
- [ ] Guardar

#### 6.3 Eliminar Punto
- [ ] Click borrar punto → ✅
- [ ] Desaparece

---

### 7. Imágenes

#### 7.1 Subir Imagen
- [ ] Editar equipo
- [ ] Click "Subir imagen"
- [ ] Seleccionar JPG/PNG
- [ ] Sube a Cloudinary
- [ ] Aparece preview

#### 7.2 Crear Flechas en Imagen
- [ ] Click en imagen → Editor de flechas
- [ ] Dibujar flecha del cojinete al punto de lubricación ✅
- [ ] Guardar flecha → Aparece en imagen

#### 7.3 Reordenar Imágenes
- [ ] Tener 3 imágenes
- [ ] Arrastra imagen 3 a posición 1
- [ ] Guardar → Orden se mantiene

---

### 8. Técnicos

#### 8.1 Crear Técnico
- [ ] Nombre: "Juan Pérez" ✅
- [ ] PIN: "1234" ✅
- [ ] Click crear → Aparece en lista

#### 8.2 Editar Técnico
- [ ] Cambiar nombre a "Juan Carlos Pérez" ✅
- [ ] Cambiar PIN a "5555" → ✅ (validar único)
- [ ] Cambiar PIN a PIN existente → ❌ "PIN ya en uso"
- [ ] Guardar

#### 8.3 Desactivar Técnico
- [ ] Click toggle "Inactivo" → Se marca INACTIVO
- [ ] Con PIN inactivo intentar login → ❌ "PIN incorrecto"

#### 8.4 Ver Actividad
- [ ] Dashboard → "Técnicos"
- [ ] Muestra: Nombre | PIN | Última consulta
- [ ] Técnico con acceso reciente → "Hoy" o "Ayer"
- [ ] Técnico sin acceso → "Hace 30 días"

---

### 9. Dashboard

#### 9.1 KPIs
- [ ] Cobertura de configuración: X%
- [ ] Puntos de lubricación: N total
- [ ] Actividad técnicos: X/Y activos semana
- [ ] Equipos que requieren atención: lista

#### 9.2 Gráfico de Frecuencias
- [ ] Mostrar distribución: Diario, Semanal, Mensual, etc.
- [ ] Barras con colores distintos ✅
- [ ] Números correctos

#### 9.3 Equipos Incompletos
- [ ] Mostrar equipos sin puntos → Link a editar
- [ ] Mostrar equipos sin imagen → Link a editar
- [ ] Si todo está completo → "✅ Todo configurado"

---

### 10. Vista Técnico (QR)

#### 10.1 Acceder vía PIN
- [ ] Ir a página de login técnico
- [ ] Validar PIN "1234" → Acceso
- [ ] Ve ficha de equipo asignado
- [ ] Ve: nombre, código, área, imagen con puntos
- [ ] Ve: puntos con lubricante, cantidad, frecuencia, método

#### 10.2 Escanear QR
- [ ] Admin → Equipo → Click QR
- [ ] Se abre modal con código QR
- [ ] Escanear con teléfono → Abre ficha del equipo (PUBLIC)
- [ ] Técnico ve ficha sin necesidad de PIN

---

## 🔒 TESTING DE SEGURIDAD

### 11. Validaciones de Entrada

#### 11.1 SQL Injection
- [ ] Nombre: `'; DROP TABLE equipos_card; --` → ✅ Se guarda como texto
- [ ] Área: `<script>alert('xss')</script>` → ✅ Se muestra como texto
- [ ] Código: `../../../etc/passwd` → ✅ Se guarda como código normal

#### 11.2 Validación de Campos Numéricos
- [ ] Cantidad: `-5` → ❌ Rechazar (o avisar)
- [ ] Cantidad: `999999999` → ✅ Aceptar (no hay límite)
- [ ] X: `150` → ❌ Rechazar (máximo 100)
- [ ] Y: `-10` → ❌ Rechazar (mínimo 0)

#### 11.3 Validación de Email
- [ ] Email: `invalid` → ❌ Error
- [ ] Email: `admin@empresa.com` → ✅ Válido
- [ ] Email: `admin+test@empresa.com` → ✅ Válido

---

### 12. Rate Limiting

#### 12.1 Login Admin
- [ ] Intentar login 5 veces fallidas → ✅ Error en intento 6
- [ ] Esperar 15 minutos → ✅ Permite reintentar
- [ ] Antes de 15 min → ❌ "Demasiados intentos"

#### 12.2 PIN Técnico
- [ ] Intentar PIN 10 veces fallidas → ✅ Error en intento 11
- [ ] Esperar 15 minutos → ✅ Permite reintentar

---

### 13. Autorización

#### 13.1 Solo Admin puede
- [ ] Crear equipos → ✅ Admin puede, técnico no
- [ ] Editar equipos → ✅ Admin puede, técnico no
- [ ] Eliminar equipos → ✅ Admin puede, técnico no
- [ ] Crear técnicos → ✅ Admin puede, técnico no
- [ ] Ver todos los equipos → ✅ Admin puede, técnico solo ve su asignado

#### 13.2 Tokens JWT
- [ ] Con token expirado → ❌ "No autorizado"
- [ ] Sin token en header → ❌ "No autorizado"
- [ ] Con token inválido → ❌ "No autorizado"

---

## ⚡ PERFORMANCE

### 14. Velocidad

#### 14.1 Con 200 Equipos
- [ ] Cargar lista → < 3 segundos ✅
- [ ] Buscar "bomba" → < 1 segundo ✅
- [ ] Expandir área → < 2 segundos ✅

#### 14.2 Exportar
- [ ] Exportar 200 equipos → < 5 segundos ✅
- [ ] Archivo generado correctamente

#### 14.3 Importar
- [ ] Importar 200 equipos → < 10 segundos ✅
- [ ] Todos aparecen en lista

---

## 🐛 EDGE CASES

### 15. Casos Extremos

- [ ] Crear equipo con nombre de 255 caracteres → ✅
- [ ] Crear área con caracteres especiales → ✅
- [ ] Subir imagen de 10 MB → ✅
- [ ] Eliminar equipo con 50 imágenes → ✅
- [ ] Editar equipo mientras se importa otro → ✅ (sin conflictos)
- [ ] Dos admins logueados simultáneamente → ✅

---

## 📊 TESTING DE DATOS

### 16. Integridad

#### 16.1 Base de Datos
- [ ] Después de eliminar 200 equipos → Base datos limpia
- [ ] Referencias intactas (puntos, imágenes)
- [ ] No hay huérfanos en BD

#### 16.2 Cloudinary
- [ ] Subir 20 imágenes → Todas en Cloudinary
- [ ] Eliminar equipo → Imágenes eliminadas de Cloudinary
- [ ] No hay imágenes huérfanas

---

## ✅ CHECKLIST FINAL PRE-VENTA

- [ ] Todos los tests funcionales pasan ✅
- [ ] Todos los tests de seguridad pasan ✅
- [ ] Performance aceptable con 200+ equipos ✅
- [ ] Rate limiting funciona ✅
- [ ] Backup/restore probado ✅
- [ ] Exportación Excel correcta ✅
- [ ] Eliminación masiva segura ✅
- [ ] No hay errores en consola ✅
- [ ] UI responsive en mobile ✅
- [ ] Documentación completa ✅

**¡Listo para vender! 🎉**

---

**Nota:** Ejecutar este plan completo toma ~2-3 horas. Hacerlo antes de cada cliente nuevo.

**Última actualización:** 2026-06-10 | Versión: 1.0.0
