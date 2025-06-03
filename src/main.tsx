import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles/globals.css"

// ✅ Ambil ID dari env
const GA_ID = import.meta.env.VITE_GA_ID
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID

// ✅ Google Analytics (GA4)
if (typeof window !== "undefined" && GA_ID) {
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  const gtag = (...args: unknown[]) => {
    window.dataLayer.push(args)
  }

  gtag("js", new Date())
  gtag("config", GA_ID)
}

// ✅ Meta Pixel (Facebook) — versi anti-conflict
if (typeof window !== "undefined" && PIXEL_ID && !window.fbq) {
  const fbqFunc = function (...args: unknown[]) {
    if (fbqFunc.callMethod) {
      fbqFunc.callMethod(...args)
    } else {
      fbqFunc.queue.push(args)
    }
  } as FbpixelFunction

  fbqFunc.callMethod = undefined
  fbqFunc.queue = []
  fbqFunc.loaded = true
  fbqFunc.version = "2.0"

  window.fbq = fbqFunc

  const pixelScript = document.createElement("script")
  pixelScript.async = true
  pixelScript.src = "https://connect.facebook.net/en_US/fbevents.js"
  document.head.appendChild(pixelScript)

  window.fbq("init", PIXEL_ID)
  window.fbq("track", "PageView")
}

// ✅ Type declarations
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: FbpixelFunction
  }

  interface FbpixelFunction {
    (...args: unknown[]): void
    callMethod?: (...args: unknown[]) => void
    queue: unknown[]
    loaded: boolean
    version: string
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
