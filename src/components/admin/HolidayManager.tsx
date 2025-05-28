import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

const SLOT_JAM = [
  "09.00–11.00",
  "11.00–13.00",
  "13.30–15.30",
  "16.00–18.00",
  "19.00–21.00",
]

const WEEKDAYS = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"]

interface Holiday {
  id: string
  type: "date" | "weekday"
  tanggal: string
  jam?: string | null
  reason?: string
  repeat: boolean
}

interface Props {
  onUpdate: () => void
}

const HolidayManager = ({ onUpdate }: Props) => {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    tanggal: "",
    jam: "",
    reason: "",
    repeat: false,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingHoliday, setEditingHoliday] = useState<Partial<Holiday>>({})

  const fetchHolidays = async () => {
    const { data, error } = await supabase.from("holidays").select("*")
    if (!error && data) {
      const formatted = data.map((h) => ({
        ...h,
        tanggal: h.tanggal.trim().toLowerCase(),
      }))
      setHolidays(formatted.sort((a, b) => a.tanggal.localeCompare(b.tanggal)))
    } else {
      console.error("❌ gagal ambil libur", error)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  const addHoliday = async () => {
    const tgl = newHoliday.tanggal?.trim().toLowerCase()
    if (!tgl) return alert("Tanggal wajib diisi.")

    const payload = {
      type: newHoliday.repeat ? "weekday" : "date",
      tanggal: tgl,
      jam: newHoliday.jam || null,
      reason: newHoliday.reason || null,
      repeat: !!newHoliday.repeat,
    }

    const { error } = await supabase.from("holidays").insert(payload)
    if (error) {
      console.error("❌ Gagal tambah libur:", error)
      alert("Gagal menambahkan hari libur.")
      return
    }

    setNewHoliday({ tanggal: "", jam: "", reason: "", repeat: false })
    fetchHolidays()
    onUpdate()
  }

  const deleteHoliday = async (id: string) => {
    const { error } = await supabase.from("holidays").delete().eq("id", id)
    if (!error) {
      fetchHolidays()
      onUpdate()
    }
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
    if (!editingId || !editingHoliday.tanggal) return

    const payload = {
      type: editingHoliday.repeat ? "weekday" : "date",
      tanggal: editingHoliday.tanggal.trim().toLowerCase(),
      jam: editingHoliday.jam || null,
      reason: editingHoliday.reason || null,
      repeat: !!editingHoliday.repeat,
    }

    const { error } = await supabase.from("holidays").update(payload).eq("id", editingId)
    if (!error) {
      setEditingId(null)
      setEditingHoliday({})
      fetchHolidays()
      onUpdate()
    }
  }

  const renderTanggalInput = (
    current: Partial<Holiday>,
    setCurrent: (val: Partial<Holiday>) => void
  ) => {
    return current.repeat ? (
      <select
        value={current.tanggal || ""}
        onChange={(e) => setCurrent({ ...current, tanggal: e.target.value })}
        className="p-2 rounded text-sm bg-transparent text-[var(--foreground)]"
      >
        <option value="">Pilih Hari</option>
        {WEEKDAYS.map((hari) => (
          <option key={hari} value={hari}>
            {hari.charAt(0).toUpperCase() + hari.slice(1)}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="date"
        value={current.tanggal || ""}
        onChange={(e) => setCurrent({ ...current, tanggal: e.target.value })}
        className="p-2 rounded text-sm bg-transparent text-[var(--foreground)]"
      />
    )
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
        Kelola Hari Libur
      </h2>

      {/* Form Tambah */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {renderTanggalInput(newHoliday, setNewHoliday)}
        <select
          value={newHoliday.jam || ""}
          onChange={(e) => setNewHoliday({ ...newHoliday, jam: e.target.value })}
          className="p-2 rounded text-sm bg-transparent text-[var(--foreground)]"
        >
          <option value="">Semua Slot</option>
          {SLOT_JAM.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Alasan (opsional)"
          value={newHoliday.reason || ""}
          onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
          className="p-2 rounded text-sm bg-transparent text-[var(--foreground)] placeholder:text-[var(--subtext)]"
        />
        <label className="flex items-center gap-1 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={!!newHoliday.repeat}
            onChange={(e) => setNewHoliday({ ...newHoliday, repeat: e.target.checked })}
          />
          Berulang
        </label>
        <button onClick={addHoliday} className="btn-primary text-sm">
          Tambah
        </button>
      </div>

      {/* Daftar Libur */}
      <ul className="space-y-2">
        {holidays.map((h) => (
          <li key={h.id} className="card text-sm">
            {editingId === h.id ? (
              <div className="flex flex-wrap gap-2">
                {renderTanggalInput(editingHoliday, setEditingHoliday)}
                <select
                  value={editingHoliday.jam || ""}
                  onChange={(e) =>
                    setEditingHoliday((prev) => ({ ...prev, jam: e.target.value }))
                  }
                  className="p-2 rounded text-sm bg-transparent text-[var(--foreground)]"
                >
                  <option value="">Semua Slot</option>
                  {SLOT_JAM.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Alasan"
                  value={editingHoliday.reason || ""}
                  onChange={(e) =>
                    setEditingHoliday((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="p-2 rounded text-sm bg-transparent text-[var(--foreground)] placeholder:text-[var(--subtext)]"
                />
                <label className="flex items-center gap-1 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={!!editingHoliday.repeat}
                    onChange={(e) =>
                      setEditingHoliday((prev) => ({ ...prev, repeat: e.target.checked }))
                    }
                  />
                  Berulang
                </label>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="text-green-500 text-sm hover:underline">
                    Simpan
                  </button>
                  <button onClick={cancelEdit} className="text-gray-400 text-sm hover:underline">
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-[var(--foreground)]">
                  {h.tanggal} {h.jam ? `(${h.jam})` : "(Semua Slot)"}
                  {h.reason && ` - ${h.reason}`} {h.repeat && "(berulang)"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(h)} className="text-blue-400 text-sm hover:underline">
                    Edit
                  </button>
                  <button onClick={() => deleteHoliday(h.id)} className="text-red-400 text-sm hover:underline">
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
