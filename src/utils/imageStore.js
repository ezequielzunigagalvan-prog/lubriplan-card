// IndexedDB wrapper for image storage — avoids localStorage quota limits
const DB_NAME = 'lubriplan_imgs'
const STORE = 'imgs'
const VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE)
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

export async function idbSave(equipoId, imagenes) {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      if (imagenes?.length > 0) {
        store.put(JSON.stringify(imagenes), equipoId)
      } else {
        store.delete(equipoId)
      }
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
  } catch {}
}

export async function idbLoadAll() {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const result = {}
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).openCursor()
      req.onsuccess = e => {
        const cursor = e.target.result
        if (cursor) {
          try { result[cursor.key] = JSON.parse(cursor.value) } catch {}
          cursor.continue()
        } else {
          resolve(result)
        }
      }
      req.onerror = () => resolve({})
    })
  } catch {
    return {}
  }
}

export async function idbDelete(equipoId) {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(equipoId)
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
  } catch {}
}
