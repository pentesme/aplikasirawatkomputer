import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const LoginAdmin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/admin/dashboard")
    })
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate("/admin/dashboard")
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-[var(--background)] text-[var(--foreground)] p-8 rounded-lg shadow-lg w-full max-w-md space-y-4"
        >
          <h1 className="text-xl font-bold text-center mb-2">Login Admin</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-[var(--foreground)] placeholder:text-[var(--subtext)]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-[var(--foreground)] placeholder:text-[var(--subtext)]"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Masuk
          </button>
        </form>
      </main>
      <Footer />
    </>
  )
}

export default LoginAdmin
