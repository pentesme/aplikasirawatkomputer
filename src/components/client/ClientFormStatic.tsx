import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { FormData } from "./types"

type Props = {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
}

const ClientFormStatic = ({ register, errors }: Props) => {
  return (
    <>
      {/* Nama */}
      <div>
        <label className="block mb-1 font-medium text-[var(--foreground)]">Nama</label>
        <input
          type="text"
          {...register("nama")}
          className="w-full p-2 border rounded bg-transparent text-[var(--foreground)] placeholder:text-[var(--subtext)]"
        />
        {errors.nama && <p className="text-red-600 text-sm">{errors.nama.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block mb-1 font-medium text-[var(--foreground)]">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full p-2 border rounded bg-transparent text-[var(--foreground)] placeholder:text-[var(--subtext)]"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>

      {/* Perangkat */}
      <div>
        <label className="block mb-1 font-medium text-[var(--foreground)]">Perangkat</label>
        <select
          {...register("perangkat")}
          className="w-full p-2 border rounded bg-transparent text-[var(--foreground)]"
        >
          <option value="">-- Pilih --</option>
          <option value="Laptop">Laptop</option>
          <option value="PC">PC</option>
        </select>
        {errors.perangkat && (
          <p className="text-red-600 text-sm">{errors.perangkat.message}</p>
        )}
      </div>

      {/* Permintaan */}
      <div>
        <label className="block mb-1 font-medium text-[var(--foreground)]">Permintaan</label>
        <select
          {...register("permintaan")}
          className="w-full p-2 border rounded bg-transparent text-[var(--foreground)]"
        >
          <option value="">-- Pilih --</option>
          <option value="Install Ulang Windows (Crack/Original)">
            Install Ulang Windows (Crack/Original)
          </option>
          <option value="Aktivasi Windows/Office (Crack/Original)">
            Aktivasi Windows/Office (Crack/Original)
          </option>
          <option value="Perawatan Murni (Pembersihan Fisik & Windows)">
            Perawatan Murni (Pembersihan Fisik & Windows)
          </option>
          <option value="Perawatan Dengan Install">
            Perawatan Dengan Install
          </option>
        </select>
        {errors.permintaan && (
          <p className="text-red-600 text-sm">{errors.permintaan.message}</p>
        )}

        {/* Hint tambahan */}
        <p className="text-xs text-[var(--subtext)] mt-1 italic">
          Instalasi Windows sudah termasuk: Windows, Office, Pdf Reader, Browser, Media Player.
        </p>
      </div>
    </>
  )
}

export default ClientFormStatic
