import { useState } from "react"
import { supabase } from "../../lib/supabase"

interface Holiday {
  id: string
  date: string
  reason?: string
  repeat: boolean
  jam?: string | null
}

interface Props {
  holidays: Holiday[]
  onUpdate: () => void
}

const SLOT_JAM = [
  "09.00–11.00",
  "11.00–13.00",
  "13.30–15.30",
  "16.00–18.00",
  "19.00–21.00",
]

const HolidayManager = ({ holidays, onUpdate }: Props) => {
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({ date: "", jam: "", reason: "", repeat: false })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingHoliday, setEditingHoliday] = useState<Partial<Holiday>>({})

  const addHoliday = async () => {
    if (!newHoliday?.date || newHoliday.date.trim() === "") {
      alert("Tanggal wajib diisi.")
      return
    }
    const { error } = await supabase
      .from("holidays")
      .insert({
        date: newHoliday.date,
        jam: newHoliday.jam || null,
        reason: newHoliday.reason || null,
        repeat: newHoliday.repeat || false,
      })

    if (error) {
      console.error("❌ Gagal menambahkan hari libur:", error.message)
      alert("Gagal menambahkan hari libur.")
      return
    }

    setNewHoliday({ date: "", jam: "", reason: "", repeat: false })
    onUpdate()
  }

  const deleteHoliday = async (id: string) => {
    const { error } = await supabase.from("holidays").delete().eq("id", id)
    if (!error) onUpdate()
  }

  const startEdit = (holiday: Holiday) => {
    setEditingId(holiday.id)
    setEditingHoliday({ ...holiday })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingHoliday({})
  }

  const saveEdit = async () => {
    if (!editingId || !editingHoliday.date) return
    const { error } = await supabase.from("holidays").update({
      date: editingHoliday.date,
      jam: editingHoliday.jam || null,
      reason: editingHoliday.reason || null,
      repeat: editingHoliday.repeat || false,
    }).eq("id", editingId)
    if (!error) {
      setEditingId(null)
      setEditingHoliday({})
      onUpdate()
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-hijautua dark:text-hijaulakeabu mb-4">Kelola Hari Libur</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="date"
          value={newHoliday.date || ""}
          onChange={(e) => setNewHoliday((prev) => ({ ...prev, date: e.target.value }))}
          className="p-2 rounded text-sm"
        />
        <select
          value={newHoliday.jam || ""}
          onChange={(e) => setNewHoliday((prev) => ({ ...prev, jam: e.target.value }))}
          className="p-2 rounded text-sm"
        >
          <option value="">Semua Slot</option>
          {SLOT_JAM.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Alasan (opsional)"
          value={newHoliday.reason || ""}
          onChange={(e) => setNewHoliday((prev) => ({ ...prev, reason: e.target.value }))}
          className="p-2 rounded text-sm"
        />
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={!!newHoliday.repeat}
            onChange={(e) => setNewHoliday((prev) => ({ ...prev, repeat: e.target.checked }))}
          />
          Berulang
        </label>
        <button
          onClick={addHoliday}
          className="px-4 py-2 rounded bg-hijautua text-hijaulakeabu font-semibold"
        >
          Tambah
        </button>
      </div>

      <ul className="space-y-2">
        {holidays.map((h) => (
          <li key={h.id} className="bg-white/5 dark:bg-black/10 px-4 py-2 rounded">
            {editingId === h.id ? (
              <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    value={editingHoliday.date || ""}
                    onChange={(e) => setEditingHoliday((prev) => ({ ...prev, date: e.target.value }))}
                    className="p-2 rounded text-sm"
                  />
                  <select
                    value={editingHoliday.jam || ""}
                    onChange={(e) => setEditingHoliday((prev) => ({ ...prev, jam: e.target.value }))}
                    className="p-2 rounded text-sm"
                  >
                    <option value="">Semua Slot</option>
                    {SLOT_JAM.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Alasan"
                    value={editingHoliday.reason || ""}
                    onChange={(e) => setEditingHoliday((prev) => ({ ...prev, reason: e.target.value }))}
                    className="p-2 rounded text-sm"
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={!!editingHoliday.repeat}
                      onChange={(e) => setEditingHoliday((prev) => ({ ...prev, repeat: e.target.checked }))}
                    />
                    Berulang
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="text-green-500 text-sm hover:underline">Simpan</button>
                  <button onClick={cancelEdit} className="text-gray-400 text-sm hover:underline">Batal</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {h.date} {h.jam ? `(${h.jam})` : "(Semua Slot)"} {h.reason && `- ${h.reason}`} {h.repeat && `(berulang)`}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(h)}
                    className="text-blue-400 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteHoliday(h.id)}
                    className="text-red-400 text-sm hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default HolidayManager
