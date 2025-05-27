import { z } from "zod"

export const schema = z.object({
  nama: z.string().min(1, "Wajib diisi"),
  email: z.string().email("Email tidak valid"),
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
        nama: z.string().min(1, "Wajib"),
        versi: z.enum(["Original", "Crack"]),
      })
    )
    .max(10, "Maksimal 10 aplikasi")
    .optional(),

  tanggal: z.date({
    required_error: "Tanggal wajib dipilih",
    invalid_type_error: "Tanggal tidak valid",
  }),

  jam: z.enum([
    "09.00–11.00",
    "11.00–13.00",
    "13.30–15.30",
    "16.00–18.00",
    "19.00–21.00",
  ], {
    required_error: "Waktu wajib dipilih",
  }),

  // lokasi_user akan diisi manual setelah form submit, bukan input langsung
})

export type FormData = z.infer<typeof schema>
