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
    console.log("📦 Payload Kirim-Email:", body)
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON" }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  }

  const {
    nama,
    email,
    perangkat,
    permintaan,
    tanggal,
    jam,
    lokasi_user,
    jarak,
  } = body

  if (
    !nama || !email || !perangkat || !permintaan ||
    !tanggal || !jam ||
    !lokasi_user ||
    typeof lokasi_user.lat !== "number" ||
    typeof lokasi_user.lng !== "number" ||
    typeof jarak !== "number"
  ) {
    return new Response(JSON.stringify({ message: "Data tidak lengkap" }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  }

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
      to: Deno.env.get("ADMIN_EMAIL"),
      subject: `✅ Janji Baru dari ${nama}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #F6FBF4; padding: 2rem; text-align: center; color: #204B38;">
          <img src="https://rawatkomputer.muftyexperiences.com/logo-email.png" alt="Rawat Komputer" style="width: 120px; margin-bottom: 1rem;" />
          <h2 style="color: #204B38;">📥 Janji Baru Masuk</h2>
          <p style="font-size: 16px;">Ada janji baru dari <strong>${nama}</strong> dengan detail sebagai berikut:</p>

          <div style="background-color: #A3B5A1; padding: 1rem 2rem; border-radius: 12px; color: #204B38; margin: 2rem auto; text-align: left; display: inline-block; border: 2px solid #F9D923;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Perangkat:</strong> ${perangkat}</p>
            <p><strong>Permintaan:</strong> ${permintaan}</p>
            <p><strong>Tanggal:</strong> ${tanggal}</p>
            <p><strong>Jam:</strong> ${jam}</p>
            <p><strong>Lokasi:</strong> ${lokasi_user.lat}, ${lokasi_user.lng}</p>
            <p><strong>Jarak:</strong> ${jarak.toFixed(2)} km</p>
          </div>

          <p style="margin-top: 2rem; font-size: 14px; color: #888;">
            Rawat Komputer #PianDirumahAja
          </p>
        </div>
      `,
      attachments: []
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    console.error("❌ Email ke admin gagal:", err instanceof Error ? err.message : err)
    return new Response(
      JSON.stringify({ success: false, message: "Email gagal dikirim" }),
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
