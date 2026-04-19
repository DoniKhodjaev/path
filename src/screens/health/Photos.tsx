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
    <div className="space-y-6">
      <h2 className="font-heading text-xl text-txt">Фото прогресса</h2>

      {/* Type selector */}
      <div className="flex gap-2">
        {types.map(t => (
          <button key={t.id} onClick={() => setSelectedType(t.id)}
            className={`flex-1 py-2 font-mono text-xs rounded transition-colors ${
              selectedType === t.id ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-navy-3 text-txt/50 border border-navy-3'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Add photo */}
      <label className="block bg-navy-2 rounded-xl p-6 border-2 border-dashed border-navy-3 hover:border-gold/30 cursor-pointer text-center transition-colors">
        <p className="font-mono text-sm text-txt/40">Нажмите чтобы добавить фото</p>
        <p className="font-mono text-[10px] text-txt/20 mt-1">Сохраняется только на устройстве</p>
        <input type="file" accept="image/*" capture="environment" onChange={handleAddPhoto} className="hidden" />
      </label>

      {/* Photo timeline */}
      {filteredPhotos.length > 0 ? (
        <div className="space-y-4">
          {filteredPhotos.map(photo => (
            <div key={photo.id} className="bg-navy-2 rounded-xl overflow-hidden border border-navy-3">
              <img src={photo.url} alt={photo.type} className="w-full aspect-[3/4] object-cover" />
              <div className="flex justify-between items-center p-3">
                <span className="font-mono text-xs text-txt/40">{photo.date}</span>
                <button onClick={() => handleDelete(photo.id)}
                  className="font-mono text-xs text-accent-red/40 hover:text-accent-red">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-navy-2 rounded-xl p-6 border border-navy-3 text-center">
          <p className="font-mono text-sm text-txt/30">Нет фото в категории "{types.find(t => t.id === selectedType)?.label}"</p>
          <p className="font-mono text-[10px] text-txt/20 mt-1">Делайте фото раз в 2 недели для отслеживания прогресса</p>
        </div>
      )}

      {/* Compare mode hint */}
      {photos.length >= 2 && (
        <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
          <p className="font-mono text-xs text-txt/40">
            Через 6 месяцев вы увидите разницу. Продолжайте фотографировать каждые 2 недели.
          </p>
        </div>
      )}

      {/* Privacy note */}
      <div className="bg-navy-2 rounded-xl p-3 border border-navy-3">
        <p className="font-mono text-[10px] text-txt/30">
          Все фото хранятся только в IndexedDB на вашем устройстве. Ничего не отправляется в облако.
        </p>
      </div>
    </div>
  )
}
