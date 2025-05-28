import { useState, useEffect } from "react"
import { Menu, X, Moon, Sun } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import logo from "../assets/fav.png"

const menuItems = [
  { name: "Home", path: "/" },
  { name: "Buat Janji", path: "/client" },
  { name: "FAQ", path: "/faq" },
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const location = useLocation()

  const toggleMenu = () => setOpen(!open)

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const isDarkPreferred =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (isDarkPreferred) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  return (
    <nav className="bg-hijautua text-hijaulakeabu shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo dan Judul */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <div className="leading-tight">
            <div className="font-bold text-lg text-textterang">Rawat Komputer</div>
            <div className="text-xs text-hijaulakeabu">#PianDirumahAja</div>
          </div>
        </div>

        {/* Menu Desktop + Toggle */}
        <div className="hidden md:flex items-center space-x-6 font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:underline ${
                location.pathname === item.path
                  ? "text-kuninglidah"
                  : "text-hijaulakeabu"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Toggle Theme Switch */}
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm">{isDark ? "Dark" : "Light"}</span>
            <button
              onClick={toggleTheme}
              title="Ganti Tema"
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
                isDark ? "bg-kuninglidah" : "bg-hijaulakeabu"
              }`}
            >
              <div
                className={`bg-hijautua w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  isDark ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Burger Menu */}
        <button className="md:hidden" onClick={toggleMenu}>
          {open ? (
            <X className="w-6 h-6 text-hijaulakeabu" />
          ) : (
            <Menu className="w-6 h-6 text-hijaulakeabu" />
          )}
        </button>
      </div>

      {/* Menu Mobile */}
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-2 font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`block ${
                location.pathname === item.path
                  ? "text-kuninglidah"
                  : "text-hijaulakeabu"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Toggle Theme Mobile */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 mt-2"
            title="Ganti Tema"
          >
            {isDark ? (
              <>
                <Sun className="w-5 h-5 text-kuninglidah" />
                <span className="text-kuninglidah">Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-hijaulakeabu" />
                <span className="text-hijaulakeabu">Mode Gelap</span>
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
