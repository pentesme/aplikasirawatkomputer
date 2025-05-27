import { supabase } from "../../lib/supabase"

interface Appointment {
  id: string
  nama: string
  email: string
  perangkat: string
  permintaan: string
  aplikasi_custom: string[]
  tanggal: string
  jam: string
  status: "pending" | "confirmed" | "done"
  review?: string
}

interface Props {
  appointments: Appointment[]
  loading: boolean
  onUpdate: () => void
}

const AppointmentList = ({ appointments, loading, onUpdate }: Props) => {
  const updateAndNotifyConfirmed = async (appt: Appointment) => {
    try {
      const res = await fetch(import.meta.env.VITE_EMAIL_CONFIRM_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appt.id,
          nama: appt.nama,
          email: appt.email,
          tanggal: appt.tanggal,
          jam: appt.jam,
        }),
      })

      const hasil = await res.json().catch(() => ({ success: false, message: "Invalid JSON response" }))
      console.log("📩 Email konfirmasi ke user:", hasil)

      if (!res.ok || !hasil.success) {
        throw new Error(hasil.message || "Gagal mengirim email konfirmasi ke user.")
      }

      const { error } = await supabase
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", appt.id)

      if (error) {
        throw new Error("Email berhasil, tapi gagal update status.")
      }

      alert("✅ Janji dikonfirmasi & email terkirim ke user.")
      onUpdate()
    } catch (err) {
      console.error("❌ Gagal konfirmasi:", err)
      alert(err instanceof Error ? err.message : "Gagal konfirmasi. Coba lagi nanti.")
    }
  }

  const updateReview = async (id: string, review: string) => {
    const { error } = await supabase.from("appointments").update({ review }).eq("id", id)
    if (!error) onUpdate()
  }

  const updateAndNotifySelesai = async (appt: Appointment) => {
    try {
      const res = await fetch(import.meta.env.VITE_EMAIL_USER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appt.id,
          nama: appt.nama,
          email: appt.email,
          tanggal: appt.tanggal,
          jam: appt.jam,
        }),
      })

      const hasil = await res.json().catch(() => ({ success: false, message: "Invalid JSON response" }))
      console.log("📩 Email ke user:", hasil)

      if (!res.ok || !hasil.success) {
        throw new Error(hasil.message || "Gagal mengirim email ke user.")
      }

      const { error } = await supabase
        .from("appointments")
        .update({ status: "done" })
        .eq("id", appt.id)

      if (error) {
        throw new Error("Email berhasil dikirim, tapi gagal update status.")
      }

      alert("✅ Status selesai & email terkirim ke user.")
      onUpdate()
    } catch (err: unknown) {
      console.error("❌ Gagal menandai selesai:", err)
      alert(err instanceof Error ? err.message : "Gagal menyelesaikan janji. Coba lagi nanti.")
    }
  }

  const deleteAppointment = async (id: string) => {
    const konfirmasi = confirm("Yakin ingin menghapus janji ini?")
    if (!konfirmasi) return

    const { error } = await supabase.from("appointments").delete().eq("id", id)
    if (error) {
      console.error("❌ Gagal menghapus janji:", error.message)
      alert("Gagal menghapus janji.")
    } else {
      onUpdate()
    }
  }

  if (loading) {
    return <p className="text-center text-hijaulakeabu">Loading...</p>
  }

  return (
    <section className="space-y-6">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className={`border-l-4 p-4 rounded shadow bg-white/10 dark:bg-black/10
            ${appt.status === "pending"
              ? "border-red-500"
              : appt.status === "confirmed"
              ? "border-yellow-400"
              : "border-green-500"}`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="font-semibold">
                {appt.nama} ({appt.email})
              </p>
              <p className="text-sm">
                {appt.perangkat} — {appt.permintaan}
              </p>
              <p className="text-sm italic">
                {appt.tanggal} — {appt.jam}
              </p>
              {appt.aplikasi_custom?.length > 0 && (
                <ul className="text-xs mt-1 list-disc list-inside">
                  {appt.aplikasi_custom.map((app, i) => (
                    <li key={i}>{app}</li>
                  ))}
                </ul>
              )}
              <div className="mt-2">
                <label className="text-xs block mb-1 text-hijaulakeabu">Review (opsional)</label>
                <input
                  type="text"
                  className="w-full rounded px-2 py-1 text-sm"
                  defaultValue={appt.review || ""}
                  onBlur={(e) => updateReview(appt.id, e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 items-end">
              {appt.status === "pending" && (
                <>
                  <button
                    onClick={() => updateAndNotifyConfirmed(appt)}
                    className="px-3 py-1 rounded bg-yellow-400 text-hijautua text-sm font-semibold"
                  >
                    Konfirmasi
                  </button>
                  <button
                    onClick={() => deleteAppointment(appt.id)}
                    className="px-3 py-1 rounded bg-red-500 text-white text-sm font-semibold"
                  >
                    Hapus
                  </button>
                </>
              )}
              {appt.status === "confirmed" && (
                <>
                  <button
                    onClick={() => updateAndNotifySelesai(appt)}
                    className="px-3 py-1 rounded bg-green-500 text-white text-sm font-semibold"
                  >
                    Tandai Selesai
                  </button>
                  <button
                    onClick={() => deleteAppointment(appt.id)}
                    className="px-3 py-1 rounded bg-red-500 text-white text-sm font-semibold"
                  >
                    Hapus
                  </button>
                </>
              )}
              {appt.status === "done" && (
                <button
                  onClick={() => deleteAppointment(appt.id)}
                  className="px-3 py-1 rounded bg-red-500 text-white text-sm font-semibold"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default AppointmentList
