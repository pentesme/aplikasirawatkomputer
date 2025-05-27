import { Link } from "react-router-dom"
import logoHome from "../assets/logo-home.png"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const HomePage = () => {
  const [reviews, setReviews] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("review")
        .eq("status", "done")
        .not("review", "is", null)

      if (!error && data) {
        const list = data.map((r) => r.review?.trim()).filter(Boolean) as string[]
        setReviews(list.length > 0 ? list : ["Belum ada review masuk."])
      } else {
        setReviews(["Gagal mengambil review dari server."])
      }
    }

    fetchReviews()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [reviews])

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto text-center space-y-8">
        {/* Logo */}
        <img
          src={logoHome}
          alt="Logo Rawat Komputer"
          className="w-[350px] mx-auto"
        />

        {/* Pengantar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-hijautua dark:text-hijaulakeabu">
            Layanan Rawat Komputer #PianDirumahAja lahir karena:
          </h2>
          <ul className="text-left space-y-2 list-disc list-inside">
            <li>
              Ulun suka membantu orang. Kali ini dengan pengetahuan & keterampilan yang
              Allah titipi dibidang Komputer.
            </li>
            <li>
              Ulun suka menambah relasi baru. Dengan membantu Pian, semoga terjalin relasi
              yang baik antara kita.
            </li>
            <li>
              Ulun perlu penghasilan. Ternyata hidup di kota apa-apa perlu uang, dengan ini,
              ulun menghasilkan uang, Bismillah.
            </li>
          </ul>
        </section>

        {/* Tombol Buat Janji */}
        <div>
          <Link
            to="/client"
            className="inline-block px-6 py-3 rounded font-semibold transition-colors
              bg-hijautua text-hijaulakeabu hover:opacity-90
              dark:bg-hijaulakeabu dark:text-hijautua"
          >
            Buat Janji
          </Link>
        </div>

        {/* Informasi Layanan */}
        <section className="bg-hijaulakeabu/20 dark:bg-hijautua/20 p-6 rounded-md text-left space-y-4">
          <h2 className="text-xl font-bold text-hijautua dark:text-hijaulakeabu">
            🧾 Informasi Layanan (Hanya Windows OS)
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Ulun hanyalah orang yang berhasil merawat laptop dari 2011 hingga sekarang,
              dan masih mampu menjalankan aplikasi berat.
            </li>
            <li>
              Ulun hanya orang yang suka membantu, dan bukan pedagang perlengkapan komputer.
              Jadi, kalau perlu pergantian atau upgrade hardware, sebaiknya beli sendiri
              atau kalau titip ke Ulun, sebaiknya perlakukan Ulun hanya sebagai orang yang
              membantu Pian dan bukan sebagai pedagang.
            </li>
            <li>
              Semua software yang diinstall merupakan software original free. Kalau mau di
              upgrade menjadi premium, bisa beli licensinya sendiri dan Ulun bantu dampingi.
              Atau software rasa premium tapi bajakan (dengan semua risiko Pian yang tanggung).
            </li>
            <li>
              Biaya layanan sepenuhnya disandarkan pada keikhlasan hati dan kecerdasan Pian.
              Dengan hanya menunggu dirumah dan Pian bisa melihat semua proses yang ulun
              lakukan dalam merawat perangkat Pian, berapapun yang diberi akan ulun terima
              dengan ikhlas (Insya Allah).
            </li>
          </ul>
        </section>

        {/* Review Carousel */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-hijautua dark:text-hijaulakeabu mb-4">
            Apa Kata Mereka
          </h2>
          <div className="relative p-6 bg-hijaulakeabu/10 dark:bg-hijautua/10 rounded shadow text-hijautua dark:text-hijaulakeabu">
            <p className="italic max-w-md mx-auto">"{reviews[currentIndex]}"</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default HomePage
