import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import ClientDashboard from "./pages/ClientDashboard"
import LoginAdmin from "./pages/LoginAdmin"
import AdminDashboard from "./pages/AdminDashboard"
import ReviewPage from "./pages/ReviewPage" // ✅ ditambahkan
import FAQ from "./pages/FAQ"
import NotFound from "./pages/NotFound"

const App = () => {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/client" element={<ClientDashboard />} />
      <Route path="/admin" element={<LoginAdmin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/review/:id" element={<ReviewPage />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="*" element={<NotFound />} /> {/* ✅ fallback 404 */}
    </Routes>
    </Router>
  )
}

export default App
