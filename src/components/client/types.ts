import { z } from "zod"

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
    "09.00–11.00",
    "11.00–13.00",
    "13.30–15.30",
    "16.00–18.00",
    "19.00–21.00",
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
