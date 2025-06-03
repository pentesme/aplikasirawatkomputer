import { Controller } from "react-hook-form"
import DatePicker from "react-datepicker"
import { useEffect, useState, useMemo } from "react"
import type { Control, UseFormRegister, FieldErrors } from "react-hook-form"
import type { FormData, Holiday } from "./types"
import { supabase } from "../../lib/supabase"

const RAW_SLOT_JAM = [
  "09.00–11.30",
  "12.00–14.30",
  "15.00–17.30",
  "19.00–21.30",
] as const

const normalize = (str: string) =>
  str.trim().toLowerCase().replace(/[–—−]/g, "-")

const SLOT_JAM = RAW_SLOT_JAM.map(normalize)

const JAM_MAP: Record<string, string> = {
  "09.00-11.30": "09:00",
  "12.00-14.30": "12:00",
  "15.00-17.30": "15:00",
  "19.00-21.30": "19:00",
}

type Props = {
  control: Control<FormData>
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  selectedDate: Date
  holidays: Holiday[]
}

const ClientFormSchedule: React.FC<Props> = ({
  control,
  register,
  errors,
  selectedDate,
  holidays,
}) => {
  const [jamServer, setJamServer] = useState<string | null>(null)
  const [slotTerpakai, setSlotTerpakai] = useState<string[]>([])
  const [serverDay, setServerDay] = useState<string>("")
  const [serverDateStr, setServerDateStr] = useState<string>("")

  const tanggalStr = selectedDate.toISOString().slice(0, 10)
  const tanggalDate = new Date(tanggalStr)
  const wdayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]
  const wdayFromTanggal = wdayMap[tanggalDate.getDay()]

  const holidaysNormalized = useMemo(
    () =>
      holidays.map((h) => ({
        ...h,
        tanggal: normalize(h.tanggal),
        jam: h.jam ? normalize(h.jam) : null,
      })),
    [holidays]
  )

  useEffect(() => {
    const fetchServer = async () => {
      const { data } = await supabase.rpc("get_current_time")
      if (data) {
        const [datePart, timePart] = data.split("T")
        const [jam, menit] = timePart.split(":")
        const [year, month, day] = datePart.split("-").map(Number)

        const tglServer = new Date(Date.UTC(year, month - 1, day, +jam, +menit))

        const dayMap: Record<number, string> = {
          0: "minggu",
          1: "senin",
          2: "selasa",
          3: "rabu",
          4: "kamis",
          5: "jumat",
          6: "sabtu",
        }

        setJamServer(`${jam.padStart(2, "0")}:${menit.padStart(2, "0")}`)
        setServerDateStr(datePart)
        setServerDay(dayMap[tglServer.getUTCDay()])
      }
    }

    fetchServer()
    const interval = setInterval(fetchServer, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchSlot = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("jam")
        .eq("tanggal", tanggalStr)
        .in("status", ["pending", "confirmed"])
      if (data) {
        setSlotTerpakai(data.map((d) => normalize(d.jam)))
      }
    }
    fetchSlot()
  }, [tanggalStr])

  const isTanggalLibur = holidaysNormalized.some(
    (h) =>
      !h.jam &&
      ((h.type === "date" && h.tanggal === tanggalStr) ||
        (h.type === "weekday" && h.repeat && h.tanggal === wdayFromTanggal))
  )

  const isSlotLibur = (slotNorm: string): boolean => {
    return holidaysNormalized.some((h) => {
      const cocokTanggal =
        h.type === "date" &&
        h.tanggal === tanggalStr &&
        (!h.jam || h.jam === slotNorm)
      const cocokHari =
        h.type === "weekday" &&
        h.repeat &&
        h.tanggal === wdayFromTanggal &&
        (!h.jam || h.jam === slotNorm)

      return cocokTanggal || cocokHari
    })
  }

  const isToday = tanggalStr === serverDateStr

  const isSlotValid = (slotNorm: string): boolean => {
    if (!jamServer || !serverDay || !serverDateStr) return false
    if (isSlotLibur(slotNorm)) return false
    if (slotTerpakai.includes(slotNorm)) return false

    if (isToday) {
      const jamMulai = JAM_MAP[slotNorm]
      if (!jamMulai) return false

      const [jamSlot, menitSlot] = jamMulai.split(":").map(Number)
      const [jamNow, menitNow] = jamServer.split(":").map(Number)
      const waktuSlot = jamSlot * 60 + menitSlot
      const waktuNow = jamNow * 60 + menitNow
      return waktuNow < waktuSlot
    }

    return true
  }

  if (!jamServer || !serverDay || !serverDateStr) {
    return (
      <div className="p-2 text-[var(--subtext)] bg-gray-100 dark:bg-black/20 rounded text-center">
        ⏳ Memuat waktu server, mohon tunggu...
      </div>
    )
  }

  return (
    <>
      <div>
        <label className="block mb-1 font-medium text-[var(--foreground)]">Tanggal</label>
        <Controller
          control={control}
          name="tanggal"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 border rounded bg-transparent text-[var(--foreground)]"
              minDate={new Date()}
            />
          )}
        />
        {errors.tanggal && (
          <p className="text-red-600 text-sm mt-1">{errors.tanggal.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium text-[var(--foreground)]">Jam</label>
        {isTanggalLibur ? (
          <div className="p-2 text-red-700 bg-red-100 dark:bg-red-900/30 rounded">
            ⛔ Maaf, tidak ada layanan di hari libur ini ({wdayFromTanggal}, {tanggalStr})
          </div>
        ) : (
          <select
            {...register("jam")}
            className="w-full p-2 border rounded bg-transparent text-[var(--foreground)]"
          >
            <option value="">-- Pilih Slot Waktu --</option>
            {SLOT_JAM.map((slotNorm, i) => {
              const raw = RAW_SLOT_JAM[i]
              return isSlotValid(slotNorm) ? (
                <option key={slotNorm} value={raw}>
                  {raw}
                </option>
              ) : (
                <option key={slotNorm} value={raw} disabled>
                  {raw} (tidak tersedia)
                </option>
              )
            })}
          </select>
        )}
        {errors.jam && (
          <p className="text-red-600 text-sm mt-1">{errors.jam.message}</p>
        )}
      </div>
    </>
  )
}

export default ClientFormSchedule
