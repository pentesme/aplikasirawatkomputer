import { z } from "zod"

// ✅ Struktur slot waktu aman
export const slotTimeMap = {
  "09.00–11.30": "09:00",
  "12.00–14.30": "12:00",
  "15.00–17.30": "15:00",
  "19.00–21.30": "19:00",
} as const

export const slotTimeList = Object.keys(slotTimeMap) as (keyof typeof slotTimeMap)[]

export const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  perangkat: z.enum(["Laptop", "PC"]),
  permintaan: z.enum([
    "Install Ulang Windows (Crack/Original)",
    "Aktivasi Windows/Office (Crack/Original)",
    "Perawatan Murni (Pembersihan Fisik & Windows)",
    "Perawatan Dengan Install",
  ]),
  aplikasi_custom: z
    .array(
      z.object({
        nama: z.string().min(1, "Nama aplikasi wajib diisi"),
        versi: z.string().min(1, "Versi wajib diisi"),
      })
    )
    .max(10, "Maksimal 10 aplikasi")
    .optional(),
  tanggal: z.date({
    required_error: "Tanggal wajib diisi",
    invalid_type_error: "Format tanggal tidak valid",
  }),
  jam: z.enum([
    "09.00–11.30",
    "12.00–14.30",
    "15.00–17.30",
    "19.00–21.30",
  ]),
})

export type FormData = z.infer<typeof schema>

export interface Holiday {
  id: string
  type: "date" | "weekday"
  tanggal: string // yyyy-mm-dd atau nama hari (lowercase)
  jam?: string | null
  reason?: string | null
  repeat: boolean
  created_at?: string
}

export interface LokasiUser {
  lat: number
  lng: number
}

export const SLOT_JAM = [
  "09.00–11.30",
  "12.00–14.30",
  "15.00–17.30",
  "19.00–21.30",
] as const

export const JAM_MAP: Record<string, string> = {
  "09.00–11.30": "09:00",
  "12.00–14.30": "12:00",
  "15.00–17.30": "15:00",
  "19.00–21.30": "19:00",
}

// 🆕 JAM_MAP untuk akhir slot (digunakan untuk validasi)
export const SLOT_JAM_END: Record<string, string> = {
  "09.00–11.30": "11:30",
  "12.00–14.30": "14:30",
  "15.00–17.30": "17:30",
  "19.00–21.30": "21:30",
}

// Fungsi normalizeSlot agar bisa digunakan di berbagai file
export const normalizeSlot = (s: string): string =>
  s.replace(/[–—−]/g, "-").toLowerCase().trim()
