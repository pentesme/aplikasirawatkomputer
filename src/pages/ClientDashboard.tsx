import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { schema } from "../components/client/types"
import type { FormData, Holiday } from "../components/client/types"
import ClientFormStatic from "../components/client/ClientFormStatic"
import ClientFormApps from "../components/client/ClientFormApps"
import ClientFormSchedule from "../components/client/ClientFormSchedule"
import { hitungJarak } from "../lib/utils"
import { supabase } from "../lib/supabase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useState, useEffect } from "react"

interface Payload {
  nama: string
  email: string
  perangkat: string
  permintaan: string
  tambahan: null
  aplikasi_custom: string[] | null
  tanggal: string
  jam: string
  lokasi_user: { lat: number; lng: number }
  status: "pending"
}

const normalizeSlot = (s: string) =>
  s.replace(/[–—−]/g, "-").toLowerCase().trim()

const ClientDashboard = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [holidays, setHolidays] = useState<Holiday[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nama: "",
      email: "",
      perangkat: undefined,
      permintaan: undefined,
      aplikasi_custom: [],
      tanggal: new Date(),
      jam: undefined,
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "aplikasi_custom",
    control,
  })

  useEffect(() => {
    const fetchHolidays = async () => {
      const { data, error } = await supabase.from("holidays").select("*")
      if (!error && data) {
        const formatted = (data as Holiday[]).map((h) => ({
          ...h,
          tanggal: h.tanggal.trim().toLowerCase(),
          jam: h.jam ? normalizeSlot(h.jam) : null,
        }))
        setHolidays(formatted)
        console.log("✅ Holidays loaded:", formatted)
      } else {
        console.error("❌ Gagal ambil libur:", error)
      }
    }
    fetchHolidays()
  }, [])

  const ambilWaktuServer = async (): Promise<Date> => {
    const resTime = await supabase.rpc("get_current_time")
    if (!resTime.data) throw new Error("Gagal ambil waktu server")
    return new Date(resTime.data)
  }

  const validasiTanggalDanJam = (tanggalUser: Date, jam: string, now: Date) => {
    const tanggalStr = tanggalUser.toISOString().split("T")[0]
    const nowStr = now.toISOString().split("T")[0]

    const isToday = tanggalStr === nowStr
    if (tanggalStr < nowStr) {
      throw new Error("Tanggal yang dipilih sudah lewat.")
    }

    if (isToday) {
      const jamMap: Record<string, string> = {
        "09.00–11.00": "09:00",
        "11.00–13.00": "11:00",
        "13.30–15.30": "13:30",
        "16.00–18.00": "16:00",
        "19.00–21.00": "19:00",
      }
      const jamMulai = jamMap[jam]
      if (jamMulai && now.toTimeString().slice(0, 5) >= jamMulai) {
        throw new Error(`Slot ${jam} sudah dimulai atau lewat.`)
      }
    }
  }

  const cekSlot = async (tanggal: Date, jam: string) => {
    const tanggalStr = tanggal.toISOString().split("T")[0]
    const slotNorm = normalizeSlot(jam)

    const { data: existing, error } = await supabase
      .from("appointments")
      .select("id")
      .eq("tanggal", tanggalStr)
      .eq("jam", jam)
      .in("status", ["pending", "confirmed"])

    if (error) throw new Error("Error saat cek slot booking.")
    if (existing && existing.length > 0)
      throw new Error(`Slot ${jam} pada ${tanggalStr} sudah dibooking.`)

    const hari = tanggal.toLocaleDateString("id-ID", { weekday: "long" }).toLowerCase()
    const slotLibur = holidays.some((h) => {
      const cocokTanggal =
        h.type === "date" &&
        h.tanggal === tanggalStr &&
        (!h.jam || h.jam === slotNorm)
      const cocokHari =
        h.type === "weekday" &&
        h.tanggal === hari &&
        h.repeat &&
        (!h.jam || h.jam === slotNorm)
      return cocokTanggal || cocokHari
    })

    if (slotLibur)
      throw new Error(`Slot ${jam} pada ${tanggalStr} tidak tersedia (libur).`)
  }

  const cekLokasiDanJarak = async (): Promise<{
    lat: number
    lng: number
    jarak: number
  }> => {
    if (!navigator.geolocation)
      throw new Error("Browser Anda tidak mendukung fitur lokasi.")

    if (navigator.permissions) {
      const perm = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      })
      if (perm.state === "denied") throw new Error("Izin lokasi ditolak.")
    }

    const posisi = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })

    const lat = posisi.coords.latitude
    const lng = posisi.coords.longitude
    const jarak = hitungJarak(lat, lng, -3.339456, 114.619209)
    if (jarak > 36)
      throw new Error(`Lokasi di luar jangkauan (±${jarak.toFixed(2)} km).`)
    return { lat, lng, jarak }
  }

  const simpanKeSupabase = async (payload: Payload) => {
    const { error } = await supabase.from("appointments").insert([payload])
    if (error) throw new Error("Gagal menyimpan ke database.")
  }

  const kirimEmailAdmin = async (payload: Payload & { jarak: number }) => {
    const res = await fetch(import.meta.env.VITE_EMAIL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Gagal mengirim notifikasi email ke admin.")
    const hasil = await res.json()
    console.log("📩 Notify response:", hasil)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const serverNow = await ambilWaktuServer()
      validasiTanggalDanJam(data.tanggal, data.jam!, serverNow)
      await cekSlot(data.tanggal, data.jam!)
      const { lat, lng, jarak } = await cekLokasiDanJarak()

      const tanggalStr = data.tanggal.toISOString().split("T")[0]
      const payload: Payload = {
        nama: data.nama,
        email: data.email,
        perangkat: data.perangkat,
        permintaan: data.permintaan,
        tambahan: null,
        aplikasi_custom: data.aplikasi_custom?.length
          ? data.aplikasi_custom.map((app) => `${app.nama} (${app.versi})`)
          : null,
        tanggal: tanggalStr,
        jam: data.jam!,
        lokasi_user: { lat, lng },
        status: "pending",
      }

      await kirimEmailAdmin({ ...payload, jarak })
      await simpanKeSupabase(payload)

      alert("✅ Janji berhasil dibuat.")
    } catch (err: unknown) {
      console.error("❌ Submit error:", err)
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert("Terjadi kesalahan. Coba lagi nanti.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const tanggalTerpilih = watch("tanggal")

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-[var(--foreground)] mb-6">
          Buat Janji Rawat Komputer
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ClientFormStatic register={register} errors={errors} />
          <ClientFormApps
            fields={fields}
            append={append}
            remove={remove}
            register={register}
          />
          <ClientFormSchedule
            control={control}
            register={register}
            errors={errors}
            selectedDate={tanggalTerpilih}
            holidays={holidays}
          />
          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ Membuat Janji..." : "Buat Janji"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  )
}

export default ClientDashboard
