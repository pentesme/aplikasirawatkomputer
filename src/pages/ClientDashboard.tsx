import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { schema } from "../components/client/types"
import type { FormData } from "../components/client/types"
import ClientFormStatic from "../components/client/ClientFormStatic"
import ClientFormApps from "../components/client/ClientFormApps"
import ClientFormSchedule from "../components/client/ClientFormSchedule"
import { hitungJarak } from "../lib/utils"
import { supabase } from "../lib/supabase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useState } from "react"

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

const ClientDashboard = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const ambilWaktuServer = async (): Promise<Date> => {
    const resTime = await supabase.rpc("get_current_time")
    if (!resTime.data) throw new Error("Gagal ambil waktu server")
    return new Date(resTime.data)
  }

  const validasiTanggal = (tanggalUser: Date, serverNow: Date) => {
    const tUser = new Date(tanggalUser)
    tUser.setHours(0, 0, 0, 0)
    const tServer = new Date(serverNow)
    tServer.setHours(0, 0, 0, 0)
    if (tUser < tServer) throw new Error("Tanggal yang dipilih sudah lewat.")
  }

  const cekLokasiDanJarak = async (): Promise<{ lat: number; lng: number; jarak: number }> => {
    if (!navigator.geolocation) throw new Error("Browser Anda tidak mendukung fitur lokasi.")

    if (navigator.permissions) {
      const perm = await navigator.permissions.query({ name: "geolocation" as PermissionName })
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
    if (jarak > 36) throw new Error(`Lokasi di luar jangkauan (±${jarak.toFixed(2)} km).`)
    return { lat, lng, jarak }
  }

  const cekSlot = async (tanggal: Date, jam: string) => {
    const tanggalStr = tanggal.toISOString().split("T")[0]
    const { data: existing, error } = await supabase
      .from("appointments")
      .select("id")
      .eq("tanggal", tanggalStr)
      .eq("jam", jam)
      .in("status", ["pending", "confirmed"])
    if (error) throw new Error("Error cek slot.")
    if (existing && existing.length > 0) throw new Error(`Slot ${jam} pada ${tanggalStr} sudah dibooking.`)
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
    console.log("Notify response:", hasil)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const serverNow = await ambilWaktuServer()
      validasiTanggal(data.tanggal, serverNow)
      const { lat, lng, jarak } = await cekLokasiDanJarak()
      await cekSlot(data.tanggal, data.jam!)

      const tanggalStr = data.tanggal.toISOString().split("T")[0]
      const payload: Payload = {
        nama: data.nama,
        email: data.email,
        perangkat: data.perangkat,
        permintaan: data.permintaan,
        tambahan: null,
        aplikasi_custom: data.aplikasi_custom?.length
          ? data.aplikasi_custom.map(app => `${app.nama} (${app.versi})`)
          : null,
        tanggal: tanggalStr,
        jam: data.jam!,
        lokasi_user: { lat, lng },
        status: "pending",
      }

      await kirimEmailAdmin({ ...payload, jarak }) // Kirim email lebih dulu
      await simpanKeSupabase(payload) // Baru simpan jika email sukses

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-hijautua mb-6 text-center">Buat Janji Rawat Komputer</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ClientFormStatic register={register} errors={errors} />
          <ClientFormApps fields={fields} append={append} remove={remove} register={register} />
          <ClientFormSchedule control={control} register={register} errors={errors} selectedDate={watch('tanggal')} />
          <button
            type="submit"
            className="bg-hijautua text-hijaulakeabu px-4 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
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
