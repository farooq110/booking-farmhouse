"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { Check, Calendar, Clock, AlertTriangle, ShieldCheck } from "lucide-react"
import { useAvailability, useBookings } from "@/hooks"

interface TimeSlot {
  start: string
  end: string
  price: number
}

const formatTimeTo12Hour = (timeStr: string) => {
  if (!timeStr || !timeStr.includes(":")) return timeStr
  const [hStr, mStr] = timeStr.split(":")
  const h = parseInt(hStr, 10)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${mStr} ${ampm}`
}

export default function Cta() {
  const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID
  const { fetchCalendar, loading: calendarLoading } = useAvailability()
  const { createBooking, loading: bookingSaving, error: bookingError } = useBookings()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)
  const [calendarChecked, setCalendarChecked] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.date || !serviceId) {
        setAvailableSlots([])
        setSelectedSlotIndex(null)
        setCalendarChecked(false)
        return
      }

      try {
        const data = await fetchCalendar(serviceId, formData.date, formData.date)
        const dayInfo = data[formData.date]
        if (dayInfo && dayInfo.is_available && dayInfo.slots) {
          setAvailableSlots(dayInfo.slots)
        } else {
          setAvailableSlots([])
        }
        setSelectedSlotIndex(null)
        setCalendarChecked(true)
      } catch {
        setAvailableSlots([])
        setSelectedSlotIndex(null)
        setCalendarChecked(true)
      }
    }

    checkAvailability().catch(() => {})
  }, [formData.date, serviceId, fetchCalendar])

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (selectedSlotIndex === null)
      newErrors.slot = "Please select an available time slot"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedSlot = availableSlots[selectedSlotIndex!]

    try {
      const created = await createBooking({
        service_id: serviceId!,
        customer: {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
        },
        date: formData.date,
        slot: {
          label: "Appointment",
          start: selectedSlot.start,
          end: selectedSlot.end,
        },
        notes: formData.notes || undefined,
      })
      setCreatedBooking(created)
    } catch {
      // Handled by hook
    }
  }

  const resetForm = () => {
    setCreatedBooking(null)
    setFormData({
      date: new Date().toISOString().split("T")[0],
      name: "",
      email: "",
      phone: "",
      notes: "",
    })
    setSelectedSlotIndex(null)
    setAvailableSlots([])
    setCalendarChecked(false)
  }

  return (
    <section
      id="section-cta"
      data-ball-align="right"
      data-ball-action="wicket-smash"
      className="py-24 sm:py-32 w-full relative bg-transparent md:bg-[#0a0e0c] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div id="cta-form-container" className="lg:col-span-6 space-y-8">
            <div className="reveal-header space-y-4">
              <span className="text-tennis font-display text-lg font-bold uppercase tracking-widest block">
                PITCH DISPATCH
              </span>
              <h2 className="font-display text-5xl sm:text-7xl font-black italic tracking-tight text-white uppercase leading-none">
                LOCK IN YOUR <br />
                <span className="text-tennis">ATTACK INNINGS</span>
              </h2>
              <p className="text-gray-400 font-sans text-base leading-relaxed max-w-lg">
                Complete the flight sheet below to reserve your slot. Your entry keypad codes and digital pass will be generated instantly. Scroll down to see the stumps smash as the ball arrives!
              </p>
            </div>

            <div className="bg-pitch-card border border-pitch-border p-6 sm:p-8 rounded-sm shadow-2xl relative">
              {!createdBooking ? (
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label
                        htmlFor="booking-date"
                        className="font-display text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-tennis" /> Select Date
                      </label>
                      <input
                        type="date"
                        id="booking-date"
                        name="date"
                        value={formData.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={handleInputChange}
                        className="bg-black/40 border border-pitch-border rounded-sm p-3 font-sans text-sm text-white focus:border-tennis focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="font-display text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-tennis" /> Available Slots
                    </label>

                    {calendarLoading ? (
                      <div className="flex items-center gap-2 py-3 text-gray-400 font-sans text-sm">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-tennis" />
                        Checking availability...
                      </div>
                    ) : calendarChecked ? (
                      availableSlots.length === 0 ? (
                        <div className="p-3 bg-cricket-red/10 text-cricket-red rounded-sm text-sm font-sans border border-cricket-red/20 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-cricket-red" />
                          <span>No slots available for this day. Please select another date.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {availableSlots.map((slot, index) => {
                            const isSelected = selectedSlotIndex === index
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setSelectedSlotIndex(index)
                                  if (errors.slot) {
                                    setErrors((prev) => {
                                      const next = { ...prev }
                                      delete next.slot
                                      return next
                                    })
                                  }
                                }}
                                className={`p-3 border rounded-sm text-center transition-all cursor-pointer font-sans text-xs flex flex-col items-center justify-center gap-1 ${
                                  isSelected
                                    ? "bg-tennis border-tennis text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                                    : "bg-black/40 border-pitch-border hover:border-tennis hover:bg-black/60 text-gray-300"
                                }`}
                              >
                                <span className="font-display font-bold tracking-wider">
                                  {formatTimeTo12Hour(slot.start)} - {formatTimeTo12Hour(slot.end)}
                                </span>
                                <span
                                  className={
                                    isSelected
                                      ? "text-black/80 font-semibold"
                                      : "text-tennis/80 font-semibold"
                                  }
                                >
                                  Rs. {slot.price}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )
                    ) : null}
                    {errors.slot && (
                      <span className="text-xs text-cricket-red font-semibold">
                        {errors.slot}
                      </span>
                    )}
                  </div>

                  <div className="border-t border-pitch-border/50 pt-4 space-y-4">
                    <div className="flex flex-col space-y-1.5">
                      <label
                        htmlFor="booking-name"
                        className="font-display text-xs font-bold text-gray-400 uppercase tracking-widest"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="booking-name"
                        name="name"
                        placeholder="e.g. Mitchell Starc"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`bg-black/40 border ${
                          errors.name ? "border-cricket-red" : "border-pitch-border"
                        } rounded-sm p-3 font-sans text-sm text-white focus:border-tennis focus:outline-none transition-colors`}
                      />
                      {errors.name && (
                        <span className="text-xs text-cricket-red font-semibold">
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label
                          htmlFor="booking-email"
                          className="font-display text-xs font-bold text-gray-400 uppercase tracking-widest"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="booking-email"
                          name="email"
                          placeholder="starcy@melbourne.au"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`bg-black/40 border ${
                            errors.email ? "border-cricket-red" : "border-pitch-border"
                          } rounded-sm p-3 font-sans text-sm text-white focus:border-tennis focus:outline-none transition-colors`}
                        />
                        {errors.email && (
                          <span className="text-xs text-cricket-red font-semibold">
                            {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label
                          htmlFor="booking-phone"
                          className="font-display text-xs font-bold text-gray-400 uppercase tracking-widest"
                        >
                          Mobile Contact
                        </label>
                        <input
                          type="tel"
                          id="booking-phone"
                          name="phone"
                          placeholder="+61 400 123 456"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`bg-black/40 border ${
                            errors.phone ? "border-cricket-red" : "border-pitch-border"
                          } rounded-sm p-3 font-sans text-sm text-white focus:border-tennis focus:outline-none transition-colors`}
                        />
                        {errors.phone && (
                          <span className="text-xs text-cricket-red font-semibold">
                            {errors.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label
                        htmlFor="booking-notes"
                        className="font-display text-xs font-bold text-gray-400 uppercase tracking-widest"
                      >
                        Special Requests / Notes (Optional)
                      </label>
                      <textarea
                        id="booking-notes"
                        name="notes"
                        rows={2}
                        placeholder="Any special requests or details..."
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="bg-black/40 border border-pitch-border rounded-sm p-3 font-sans text-sm text-white focus:border-tennis focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-cricket-red/10 text-cricket-red rounded-sm text-sm font-sans border border-cricket-red/20 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-cricket-red" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingSaving}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-tennis text-black hover:bg-tennis-dim font-display text-xl font-black px-6 py-4 rounded-sm transition-transform active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:shadow-[0_0_25px_rgba(204,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    id="submit-booking-form-btn"
                  >
                    {bookingSaving ? "LOCKING IN..." : "BOOK YOUR SLOT"}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-gray-400 font-sans text-xs pt-2">
                    <ShieldCheck className="w-4 h-4 text-tennis" /> Secure Booking Connection • Access Key Dispatched Instantly
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-6 animate-fade-in">
                  <div className="w-16 h-16 bg-tennis/10 border border-tennis/30 rounded-full flex items-center justify-center text-tennis mx-auto">
                    <Check className="w-8 h-8 stroke-3" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-3xl font-extrabold italic tracking-tight text-white uppercase">
                      SESSION SECURED!
                    </h3>
                    <p className="text-gray-400 font-sans text-sm leading-relaxed max-w-sm mx-auto">
                      Innings confirmed, captain. Your digital gateway pass and pitch access are active.
                    </p>
                  </div>

                  <div className="bg-[#0c100e] border border-pitch-border rounded-sm p-4 text-left font-sans text-sm space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between text-gray-400 border-b border-pitch-border/40 pb-1">
                      <span>Captain:</span>
                      <span className="text-white font-medium">
                        {createdBooking?.customer?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 border-b border-pitch-border/40 pb-1">
                      <span>Date / Time:</span>
                      <span className="text-tennis font-semibold">
                        {createdBooking?.date} • {formatTimeTo12Hour(createdBooking?.slot?.start)} - {formatTimeTo12Hour(createdBooking?.slot?.end)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 border-b border-pitch-border/40 pb-1">
                      <span>Assigned Pitch:</span>
                      <span className="text-white font-medium">
                        {createdBooking?.slot?.label || "Premium Match Pitch"}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 border-b border-pitch-border/40 pb-1">
                      <span>Price Charged:</span>
                      <span className="text-white font-medium">
                        {createdBooking?.price_charged} {createdBooking?.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-tennis" /> Keypad Code:
                      </span>
                      <span className="text-tennis font-display font-extrabold text-base tracking-widest">
                        #9875*
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-500 font-sans text-xs">
                      A confirmation was routed to{" "}
                      <span className="text-white/60">
                        {createdBooking?.customer?.email || "none"}
                      </span>{" "}
                      &{" "}
                      <span className="text-white/60">
                        {createdBooking?.customer?.phone}
                      </span>
                      .
                    </p>
                    <button
                      onClick={resetForm}
                      className="text-tennis hover:text-tennis-dim font-display text-sm font-bold tracking-wider uppercase underline focus-visible:outline-none cursor-pointer"
                    >
                      BOOK ANOTHER SLOT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-6 h-[450px] pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
