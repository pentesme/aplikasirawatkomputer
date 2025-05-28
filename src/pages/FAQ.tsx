// src/pages/FaqPage.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const faqs = [
  {
    question: "Apa itu Rawat Komputer?",
    answer:
      "Rawat Komputer merupakan sarana implementasi pengetahuan dan pengalaman Ulun dalam hal merawat dan instalasi komputer.",
  },
  {
    question: "Apa Saja Layanan Rawat Komputer?",
    answer:
      "Saat ini, Ulun baru bisa menangani Instalasi Software dan Perawatan Software dan Hardware. Ulun belum memiliki pengetahuan memperbaiki hardware, kalau bongkar pasang (Insya Allah) bisa.",
  },
  {
    question: "Berapa Biaya Layanan Rawat Komputer?",
    answer:
      "Ulun tidak mematok biaya, semuanya murni disandarkan pada Keikhlasan Hati & Kecerdasan Pian.",
  },
  {
    question: "Bagaimana Kalau Ada Hardware Yang Perlu Diganti?",
    answer:
      "Ada 2 cara yang bisa Pian pilih. Pertama: Pian beli sendiri barangnya, lalu Ulun akan bantu setup, atau kedua: Pian bisa minta Ulun sekalian belikan sesuai permintaan Pian.",
  },
  {
    question: "Kenapa Tidak Mematok Biaya?",
    answer:
      "Karena Ulun melakukan ini untuk Mengamalkan Pengetahuan yang dianugerahkan Allah, Menambah Relasi, dan sambil mengambil rezeki Allah berupa penghasilan.",
  },
]

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const navigate = useNavigate()

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <>
      {/* Seksi 1: Navbar */}
      <Navbar />

      {/* Seksi 2: FAQ Accordion */}
      <main className="px-4 py-8 max-w-3xl mx-auto space-y-8">
        <section className="space-y-4">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="border-b border-[var(--subtext)] pb-4"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="text-lg font-semibold text-[var(--foreground)]">
                  {item.question}
                </span>
                <ChevronDown
                  className={`transform transition-transform ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === idx && (
                <p className="mt-2 text-[var(--subtext)]">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Seksi 3: Call to Action */}
        <section className="text-center">
          <p className="mb-4 text-lg text-[var(--foreground)]">
            Sudah yakin mau Ulun bantu?
          </p>
          <button
            onClick={() => navigate("/client")}
            className="btn-primary"
          >
            Buat Janji
          </button>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}

export default FaqPage
