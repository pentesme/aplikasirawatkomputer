import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { AlertTriangle } from "lucide-react"

const NotFound = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-600" />
        <h1 className="text-xl font-semibold text-red-600">
          404 – Halaman tidak ditemukan
        </h1>
        <p className="text-[var(--foreground)]">
          Sepertinya alamat yang Pian cari tidak tersedia.
        </p>
      </main>
      <Footer />
    </>
  )
}

export default NotFound
