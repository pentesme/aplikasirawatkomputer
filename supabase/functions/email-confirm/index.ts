import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import "https://deno.land/std@0.192.0/dotenv/load.ts"
import nodemailer from "npm:nodemailer"

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  }

  let body
  try {
    body = await req.json()
    console.log("📦 Payload Email-Confirm:", body)
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON" }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  }

  const { id, nama, email, tanggal, jam } = body

  if (
    !id || !nama || !email || !tanggal || !jam ||
    typeof id !== "string" ||
    typeof nama !== "string" ||
    typeof email !== "string" ||
    typeof tanggal !== "string" ||
    typeof jam !== "string"
  ) {
    return new Response(JSON.stringify({ message: "Data tidak lengkap" }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  }

  const waLink = Deno.env.get("VITE_WA_LINK") || "https://wa.me/62"

  const transporter = nodemailer.createTransport({
    host: Deno.env.get("SMTP_HOST"),
    port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
    secure: Deno.env.get("SMTP_SECURE") === "true",
    auth: {
      user: Deno.env.get("SMTP_USER"),
      pass: Deno.env.get("SMTP_PASS"),
    },
  })

  try {
    await transporter.sendMail({
      from: `"Rawat Komputer" <${Deno.env.get("SMTP_USER")}>`,
      to: email,
      subject: `✅ Janji Pian Sudah Dicatat – Rawat Komputer`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #F6FBF4; padding: 2rem; text-align: center; color: #204B38;">
          <img src="https://rawatkomputer.muftyexperiences.com/logo-email.png" alt="Rawat Komputer" style="width: 120px; margin-bottom: 1rem;" />
          <h2 style="color: #204B38;">✅ Janji Pian Sudah Dicatat</h2>
          <p style="font-size: 16px;">Terima kasih sudah memilih <strong>Rawat Komputer</strong>!</p>

          <div style="background-color: #A3B5A1; padding: 1rem 2rem; border-radius: 12px; color: #204B38; margin: 2rem auto; text-align: left; display: inline-block; border: 2px solid #F9D923;">
            <p><strong>Nama:</strong> ${nama}</p>
            <p><strong>Tanggal & Jam:</strong> ${tanggal} – ${jam}</p>
          </div>

          <p style="font-weight: 500; font-size: 16px; margin-top: 1.5rem;">
            Tolong kirimkan lokasi Pian (Share Loc) ke WA Ulun lah.
          </p>

          <a href="${waLink}" target="_blank"
            style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background-color: #204B38; color: #A3B5A1; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📍 Kirim Share Loc WA
          </a>

          <p style="margin-top: 2rem; font-size: 14px; color: #888;">
            Rawat Komputer #PianDirumahAja
          </p>
        </div>
      `,
      attachments: [] // logo via URL
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    console.error("❌ Gagal kirim email konfirmasi:", err instanceof Error ? err.message : err)
    return new Response(
      JSON.stringify({ success: false, message: "Gagal kirim email" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
  }
})
