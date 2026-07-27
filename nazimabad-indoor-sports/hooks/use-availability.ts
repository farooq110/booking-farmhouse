import { useState, useCallback } from "react"
import { apiClient } from "@/lib"

export interface TimeSlot {
  start: string
  end: string
  price: number
}

export const useAvailability = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendar = useCallback(
    async (serviceId: string, startDate: string, endDate: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get(
          `/availability/${serviceId}/calendar`,
          {
            params: { startDate, endDate },
          },
        )
        return response.data.data
      } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to fetch calendar"
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    fetchCalendar,
    loading,
    error,
  }
}
