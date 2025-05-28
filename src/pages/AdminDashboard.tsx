import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import AppointmentList from "../components/admin/AppointmentList"
import HolidayManager from "../components/admin/HolidayManager"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<Date | null>(null)
  const navigate = useNavigate()

  // 🔐 Cek session login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin")
    })
  }, [navigate])

  // 📅 Ambil data janji
  const fetchAppointments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("tanggal", { ascending: true })
      .order("jam", { ascending: true })

    if (!error && data) setAppointments(data as Appointment[])
    setLoading(false)
  }

  // 📆 Ambil data hari libur (untuk sinkron dengan HolidayManager)
  const fetchHolidays = async () => {
    const { data, error } = await supabase
      .from("holidays")
      .select("*")
      .order("tanggal", { ascending: true })

    if (error) {
      console.error("❌ gagal ambil libur", error)
    } else {
      console.log("✅ libur diambil:", data)
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchHolidays()
  }, [])

  const filteredAppointments = appointments.filter((appt) => {
    const matchStatus = filterStatus === "all" || appt.status === filterStatus
    const matchDate =
      !filterDate ||
      new Date(appt.tanggal).toDateString() === filterDate.toDateString()
    return matchStatus && matchDate
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto space-y-10">
        <h1 className="text-2xl font-bold text-center text-[var(--foreground)]">
          Admin Dashboard
        </h1>

        {/* 🔎 Filter Kontrol */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded px-2 py-1 border border-gray-300 dark:border-gray-600 text-sm"
            >
              <option value="all">Semua</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="done">Selesai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
              Filter Tanggal
            </label>
            <DatePicker
              selected={filterDate}
              onChange={(date: Date | null) => setFilterDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Pilih tanggal"
              className="rounded px-2 py-1 border border-gray-300 dark:border-gray-600 text-sm"
              isClearable
            />
          </div>
        </div>

        {/* 📋 Daftar Janji */}
        <AppointmentList
          appointments={filteredAppointments}
          loading={loading}
          onUpdate={fetchAppointments}
        />

        {/* 📆 Manajemen Hari Libur */}
        <HolidayManager onUpdate={fetchHolidays} />

        {/* 🔓 Logout */}
        <div className="pt-10 flex justify-center">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              navigate("/admin")
            }}
            className="px-4 py-2 rounded bg-red-500 text-white hover:opacity-90 text-sm font-semibold"
          >
            Keluar Admin
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default AdminDashboard
