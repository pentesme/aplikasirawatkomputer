import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

interface Appointment {
  id: string
  nama: string
  tanggal: string
  jam: string
  status: string
  review?: string
}

const ReviewPage = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [review, setReview] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchAppointment = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, nama, tanggal, jam, review, status")
        .eq("id", id)
        .single()

      if (error || !data) {
        setError("Janji tidak ditemukan.")
      } else if (data.status !== "done") {
        setError("Janji belum selesai. Anda belum bisa memberi review.")
      } else {
        setAppointment(data)
        setReview(data.review || "")
      }

      setLoading(false)
    }

    fetchAppointment()
  }, [id])

  const handleSubmit = async () => {
    if (review.trim().length < 10) {
      alert("Review minimal 10 karakter.")
      return
    }

    const { error } = await supabase
      .from("appointments")
      .update({ review })
      .eq("id", id)

    if (error) {
      alert("Gagal menyimpan review.")
    } else {
      setSuccess(true)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-hijautua dark:text-hijaulakeabu mb-6">
          Review Layanan RawatKomputer
        </h1>

        {loading ? (
          <p className="text-center">Memuat...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : success ? (
          <p className="text-center text-green-600 font-semibold">
            Terima kasih atas review Anda 🙏
          </p>
        ) : (
          <>
            <div className="space-y-2 text-sm text-hijautua dark:text-hijaulakeabu mb-4">
              <p><strong>Nama:</strong> {appointment?.nama}</p>
              <p><strong>Tanggal:</strong> {appointment?.tanggal}</p>
              <p><strong>Jam:</strong> {appointment?.jam}</p>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Tulis Review Anda:</label>
              <textarea
                className="w-full p-2 border rounded min-h-[100px]"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="bg-hijautua text-hijaulakeabu px-4 py-2 rounded hover:opacity-90"
            >
              Kirim Review
            </button>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}

export default ReviewPage
