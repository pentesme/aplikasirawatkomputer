import type { UseFieldArrayReturn, UseFormRegister } from "react-hook-form"
import type { FormData } from "./types"

type Props = {
  fields: UseFieldArrayReturn<FormData, "aplikasi_custom">["fields"]
  append: UseFieldArrayReturn<FormData, "aplikasi_custom">["append"]
  remove: UseFieldArrayReturn<FormData, "aplikasi_custom">["remove"]
  register: UseFormRegister<FormData>
}

const ClientFormApps = ({ fields, append, remove, register }: Props) => {
  return (
    <div>
      <label className="block mb-1 font-medium text-[var(--foreground)]">
        Aplikasi Tambahan (max 10)
      </label>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 mb-2">
          <input
            type="text"
            {...register(`aplikasi_custom.${index}.nama`)}
            placeholder="Nama Aplikasi"
            className="flex-1 p-2 border rounded bg-transparent text-[var(--foreground)] placeholder:text-[var(--subtext)]"
          />
          <select
            {...register(`aplikasi_custom.${index}.versi`)}
            className="w-32 p-2 border rounded bg-transparent text-[var(--foreground)]"
          >
            <option value="Original">Original</option>
            <option value="Crack">Crack</option>
          </select>
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-600 hover:underline"
          >
            Hapus
          </button>
        </div>
      ))}

      {fields.length < 10 && (
        <button
          type="button"
          onClick={() => append({ nama: "", versi: "Original" })}
          className="text-sm text-[var(--foreground)] hover:underline mt-2"
        >
          + Tambah Aplikasi
        </button>
      )}
    </div>
  )
}

export default ClientFormApps
