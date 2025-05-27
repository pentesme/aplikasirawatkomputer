import { Controller } from "react-hook-form"
import DatePicker from "react-datepicker"
import { useEffect, useState } from "react"
import type { Control, UseFormRegister, FieldErrors } from "react-hook-form"
import type { FormData } from "./types"
import { supabase } from "../../lib/supabase"

type Props = {
  control: Control<FormData>
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  selectedDate: Date
}

const SLOT_JAM = [
  "09.00–11.00",
  "11.00–13.00",
  "13.30–15.30",
  "16.00–18.00",
  "19.00–21.00",
]

const ClientFormSchedule = ({ control, register, errors, selectedDate }: Props) => {
  const [jamNow, setJamNow] = useState("")
  const [slotTerpakai, setSlotTerpakai] = useState<string[]>([])

  // Update jam saat ini dalam zona waktu Makassar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const makassarTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Makassar" })
      )
      const hour = makassarTime.getHours()
      const minute = makassarTime.getMinutes()
      setJamNow(`${hour}:${minute.toString().padStart(2, "0")}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // perbarui tiap menit
    return () => clearInterval(interval)
  }, [])

  // Cek apakah tanggal yang dipilih adalah hari ini (dalam zona waktu GMT+8)
  const isToday = selectedDate.toDateString() === new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Makassar" })
  ).toDateString()

  // Fetch slot yang sudah dibooking di tanggal terpilih
  useEffect(() => {
    const fetchSlotTerpakai = async () => {
      const tanggalString = selectedDate.toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("appointments")
        .select("jam")
        .eq("tanggal", tanggalString)
        .in("status", ["pending", "confirmed"]) // exclude "done"

      if (!error && data) {
        const list = data.map((item) => item.jam)
        setSlotTerpakai(list)
      }
    }

    fetchSlotTerpakai()
  }, [selectedDate])

  const isSlotValid = (slot: string) => {
    const jamRangeMap: Record<string, [string, string]> = {
      "09.00–11.00": ["09:00", "11:00"],
      "11.00–13.00": ["11:00", "13:00"],
      "13.30–15.30": ["13:30", "15:30"],
      "16.00–18.00": ["16:00", "18:00"],
      "19.00–21.00": ["19:00", "21:00"],
    }

    const [start] = jamRangeMap[slot]

    if (!isToday) return !slotTerpakai.includes(slot)

    return jamNow < start && !slotTerpakai.includes(slot)
  }

  return (
    <>
      {/* Pilih Tanggal */}
      <div>
        <label className="block mb-1 font-medium text-hijautua">Tanggal</label>
        <Controller
          control={control}
          name="tanggal"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 border rounded"
              minDate={new Date()}
            />
          )}
        />
        {errors.tanggal && (
          <p className="text-red-600 text-sm mt-1">{errors.tanggal.message}</p>
        )}
      </div>

      {/* Pilih Jam */}
      <div>
        <label className="block mb-1 font-medium text-hijautua">Jam</label>
        <select
          {...register("jam")}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Pilih Slot Waktu --</option>
          {SLOT_JAM.map((slot) =>
            isSlotValid(slot) ? (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ) : (
              <option key={slot} value={slot} disabled>
                {slot} (tidak tersedia)
              </option>
            )
          )}
        </select>
        {errors.jam && (
          <p className="text-red-600 text-sm mt-1">{errors.jam.message}</p>
        )}
      </div>
    </>
  )
}

export default ClientFormSchedule
