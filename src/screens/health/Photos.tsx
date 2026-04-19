import { useState, useEffect, useCallback } from 'react'
import { openDB } from 'idb'

interface PhotoEntry {
  id: string
  date: string
  type: 'face' | 'front' | 'side' | 'back'
  blob: Blob
}

const DB_NAME = 'path2026-photos'
const STORE_NAME = 'photos'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-overlay)',
  borderRadius: 16,
  padding: 16,
  border: '1px solid var(--border-muted)',
}

const mono = "'JetBrains Mono', monospace"

export function Photos() {
  const [photos, setPhotos] = useState<{ id: string; date: string; type: string; url: string }[]>([])
  const [selectedType, setSelectedType] = useState<'face' | 'front' | 'side' | 'back'>('face')

  const loadPhotos = useCallback(async () => {
    const db = await getDB()
    const all = await db.getAll(STORE_NAME) as PhotoEntry[]
    const mapped = all.map(p => ({
      id: p.id,
      date: p.date,
      type: p.type,
      url: URL.createObjectURL(p.blob),
    })).sort((a, b) => b.date.localeCompare(a.date))
    setPhotos(mapped)
  }, [])

  useEffect(() => {
    loadPhotos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPhotos])

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const db = await getDB()
    const entry: PhotoEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      type: selectedType,
      blob: file,
    }
    await db.put(STORE_NAME, entry)
    await loadPhotos()
  }

  const handleDelete = async (id: string) => {
    const db = await getDB()
    await db.delete(STORE_NAME, id)
    await loadPhotos()
  }

  const types = [
    { id: 'face' as const, label: 'Лицо' },
    { id: 'front' as const, label: 'Спереди' },
    { id: 'side' as const, label: 'Сбоку' },
    { id: 'back' as const, label: 'Сзади' },
  ]

  const filteredPhotos = photos.filter(p => p.type === selectedType)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 24, color: 'var(--gold-text)', margin: 0 }}>Фото прогресса</h2>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {types.map(t => (
          <button key={t.id} onClick={() => setSelectedType(t.id)}
            style={{
              flex: 1, padding: '8px 0', fontFamily: mono, fontSize: 12, borderRadius: 8,
              cursor: 'pointer', transition: 'all 0.2s',
              ...(selectedType === t.id
                ? { background: 'rgba(201,168,76,0.2)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }
                : { background: 'var(--color-dusk)', color: 'var(--text-faint)', border: '1px solid var(--border-muted)' }
              ),
            }}>{t.label}</button>
        ))}
      </div>

      {/* Add photo */}
      <label style={{
        display: 'block', background: 'var(--surface-overlay)', borderRadius: 16, padding: 24,
        border: '2px dashed var(--border-muted)', cursor: 'pointer', textAlign: 'center',
      }}>
        <p style={{ fontFamily: mono, fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>Нажмите чтобы добавить фото</p>
        <p style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>Сохраняется только на устройстве</p>
        <input type="file" accept="image/*" capture="environment" onChange={handleAddPhoto} style={{ display: 'none' }} />
      </label>

      {/* Photo timeline */}
      {filteredPhotos.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredPhotos.map(photo => (
            <div key={photo.id} style={{ background: 'var(--surface-overlay)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-muted)' }}>
              <img src={photo.url} alt={photo.type} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)' }}>{photo.date}</span>
                <button onClick={() => handleDelete(photo.id)}
                  style={{ fontFamily: mono, fontSize: 12, color: 'rgba(224,90,90,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: 24, textAlign: 'center' }}>
          <p style={{ fontFamily: mono, fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>Нет фото в категории "{types.find(t => t.id === selectedType)?.label}"</p>
          <p style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>Делайте фото раз в 2 недели для отслеживания прогресса</p>
        </div>
      )}

      {/* Compare mode hint */}
      {photos.length >= 2 && (
        <div style={cardStyle}>
          <p style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
            Через 6 месяцев вы увидите разницу. Продолжайте фотографировать каждые 2 недели.
          </p>
        </div>
      )}

      {/* Privacy note */}
      <div style={{ ...cardStyle, padding: 12 }}>
        <p style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', margin: 0 }}>
          Все фото хранятся только в IndexedDB на вашем устройстве. Ничего не отправляется в облако.
        </p>
      </div>
    </div>
  )
}
