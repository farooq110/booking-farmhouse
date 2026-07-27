import { useState } from "react"
import { apiClient } from "@/lib"

export interface CustomerInfo {
  name: string
  email?: string
  phone: string
}

export interface BookedSlot {
  label: string
  start: string
  end: string
}

export const useBookings = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBooking = async (data: {
    service_id: string
    customer: CustomerInfo
    date: string
    slot: BookedSlot
    notes?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.post("/bookings", data)
      return response.data.data
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create booking"
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createBooking,
    loading,
    error,
  }
}
