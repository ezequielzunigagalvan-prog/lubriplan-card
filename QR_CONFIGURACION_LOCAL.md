# 🎯 QR en Localhost - Guía de Configuración

## 🔴 PROBLEMA

**Cuando estás en localhost:**
```
Tu computadora:  http://localhost:5173  ✓ Funciona
Otro dispositivo (celular): http://localhost:5173  ✗ NO funciona
```

**Razón:** `localhost` es un alias que solo apunta a TU máquina. Desde otro dispositivo no sabe quién es "localhost".

---

## ✅ SOLUCIÓN: Usar IP Local

**En tu misma red (WiFi):**
```
Tu computadora:  http://192.168.1.100:5173  ✓ Funciona
Otro dispositivo (celular): http://192.168.1.100:5173  ✓ TAMBIÉN FUNCIONA
```

**Tu IP local es única, otro dispositivo puede acceder.**

---

## 🔧 PASO 1: Obtener tu IP Local

### En Windows

**Opción A: Command Prompt**
```bash
ipconfig
```

Busca esta línea:
```
IPv4 Address. . . . . . . . . . : 192.168.1.100
```

Copia ese número (ej: `192.168.1.100`)

**Opción B: PowerShell**
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*WiFi*" -or $_.InterfaceAlias -like "*Ethernet*"}).IPAddress
```

### En Mac

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### En Linux

```bash
hostname -I
```

---

## 🔧 PASO 2: Configurar .env

### Opción A: Editar `.env` manualmente

1. Abre el archivo `.env` en la raíz del proyecto
2. Encuentra esta línea:
   ```
   VITE_QR_BASE_URL=http://192.168.1.100:5173
   ```
3. Reemplaza `192.168.1.100` con TU IP local (del paso 1)
4. Guarda el archivo

**Ejemplo:**
```
# Antes:
VITE_QR_BASE_URL=http://192.168.1.100:5173

# Después (si tu IP es 192.168.0.50):
VITE_QR_BASE_URL=http://192.168.0.50:5173
```

### Opción B: Usar el script de setup

```bash
npm run setup:qr
```

(Este script puede ser creado para automatizar esto)

---

## 🔧 PASO 3: Reiniciar el servidor

Después de cambiar el `.env`, debes reiniciar Vite:

```bash
npm run dev
```

Deberías ver en la consola:
```
VITE v5.0.0 ready in 123 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/  ← Usa ESTA URL
```

---

## 🧪 PASO 4: Testear desde otro dispositivo

### Desde tu celular (mismo WiFi)

1. Abre navegador en celular
2. Tipea: `http://192.168.1.100:5173`
3. Deberías ver: LubriPlan Card funcionando
4. Si funciona → el QR también funcionará

### Generar y escanear QR

1. Admin login en tu computadora
2. Dashboard → Equipos → Selecciona equipo
3. Click "QR"
4. Deberías ver URL: `http://192.168.1.100:5173/pin?equipo=...`
5. Click "Descargar" QR
6. En celular: Abre cámara y escanea
7. Debe llevar a `http://192.168.1.100:5173/pin?equipo=...`
8. Ingresa PIN
9. Deberías ver CartaScreen

---

## ⚠️ SI SIGUE SIN FUNCIONAR

### Problema 1: "No puedo acceder a http://192.168.1.100:5173 desde celular"

**Causa:** Firewall bloquea el puerto

**Solución:**
```
Windows Defender Firewall → Permitir app a través de firewall
Busca: Node.js (o tu app)
Marca ambas opciones (Privadas y Públicas)
```

### Problema 2: "El QR sigue apuntando a localhost"

**Verificar:**
1. Abre `.env` en editor
2. Confirma que `VITE_QR_BASE_URL=http://192.168.1.100:5173` (sin localhost)
3. Guarda el archivo
4. Reinicia servidor: `npm run dev`
5. En consola, deberías ver: `Network: http://192.168.1.100:5173`

### Problema 3: "Celular conectado a WiFi diferente"

**Solución:** Ambos (computadora y celular) DEBEN estar en el mismo WiFi

```
✓ Tu computadora: WiFi "Casa" - IP 192.168.1.100
✓ Tu celular: WiFi "Casa" - Puede acceder a 192.168.1.100

✗ Tu computadora: WiFi "Casa" - IP 192.168.1.100
✗ Tu celular: WiFi "Móvil" - NO puede acceder a 192.168.1.100
```

### Problema 4: "IP cambió después de reiniciar"

**Nota:** Tu IP local puede cambiar si:
- Reiniciaste el router
- Te reconectas al WiFi
- Pasa un tiempo

**Solución:** Configura IP estática en tu router O verifica la IP nuevamente

---

## 📋 GUÍA RÁPIDA DE TROUBLESHOOTING

```
┌─────────────────────────────────────────┐
│ ¿QR funciona en otro dispositivo?       │
└─────────────────────────────────────────┘
              ↓ NO
    ┌─────────────────────┐
    │ .env tiene IP?      │
    └─────────────────────┘
      SÍ ↓        ↗ NO → Edita .env con IP local
    ┌─────────────────────┐
    │ Servidor reiniciado?│
    └─────────────────────┘
      NO ↓        ↗ SÍ → npm run dev
    ┌─────────────────────┐
    │ Mismo WiFi?         │
    └─────────────────────┘
      NO ↓        ↗ SÍ → Conecta celular a mismo WiFi
    ┌─────────────────────┐
    │ Firewall OK?        │
    └─────────────────────┘
      NO ↓        ↗ SÍ → Permitir Node.js en firewall
    ┌─────────────────────┐
    │ ¿Funciona?          │
    └─────────────────────┘
           ↓ SÍ ✓
        ÉXITO!
```

---

## 🚀 PARA PRODUCCIÓN

Cuando depliegues a producción (Vercel):

1. En `.env`:
   ```
   VITE_QR_BASE_URL=https://tudominio.com
   ```

2. El QR apuntará a:
   ```
   https://tudominio.com/pin?equipo=...
   ```

3. Técnicos de CUALQUIER lugar podrán escanear el QR

---

## 📝 CHECKLIST

```
□ Obtuve mi IP local (ipconfig)
□ Edité .env con mi IP
□ Reinicié servidor (npm run dev)
□ Accedo a http://IP:5173 desde celular
□ Genero QR
□ QR apunta a http://IP:5173/pin?equipo=...
□ Escaneo QR desde celular
□ Funciona ✓
```

---

## 💡 RESUMEN

| Situación | URL QR | ¿Funciona en otro dispositivo? |
|-----------|--------|------|
| Localhost (`http://localhost:5173`) | ❌ localhost | NO |
| IP local (`http://192.168.1.100:5173`) | ✓ IP local | SÍ (mismo WiFi) |
| Producción (`https://tudominio.com`) | ✓ Dominio | SÍ (internet público) |

**Usa IP local para desarrollo con otros dispositivos.**
