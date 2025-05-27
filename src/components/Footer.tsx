import { ChevronRight } from "lucide-react"

const currentYear = new Date().getFullYear()
const whatsappLink = import.meta.env.VITE_WA_LINK || "#"

const Footer = () => {
  return (
    <footer className="text-sm">

      {/* Bagian 1: Widget */}
      <div className="bg-hijautua text-hijaulakeabu px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
          <a
            href="/faq"
            className="flex items-center gap-2 hover:text-kuninglidah transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            FAQ
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-kuninglidah transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            Kiyau Ulun
          </a>
        </div>
      </div>

      {/* Bagian 2: Copyright */}
      <div className="bg-hijaulakeabu text-hijautua px-4 py-4 text-center text-xs sm:text-sm">
        <span className="block">
          © 2025 - {currentYear} Rawat Komputer by{" "}
          <a
            href="https://muftyexperiences.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-kuninglidah underline transition-colors"
          >
            Mufty Experiences
          </a>
        </span>
      </div>

    </footer>
  )
}

export default Footer
