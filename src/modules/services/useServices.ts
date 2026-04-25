import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'

export interface Service {
  id: string
  status: string
  notes: string | null
  location: any
  createdAt: string
  client: { name: string; policyNumber: string | null; phone: string }
  serviceType: { name: string; category: { name: string } }
  frontAgent: { name: string } | null
  backAgent: { name: string } | null
}

export interface ServicesResponse {
  data: Service[]
  total: number
  page: number
  limit: number
}

export interface StatsResponse {
  data: {
    total: number
    received: number
    in_coordination: number
    uncoordinated: number
    coordinated: number
    assigned: number
    in_progress: number
    completed: number
    cancelled: number
  }
}

export function useServices(params: { status?: string; search?: string; page?: number }) {
  return useQuery<ServicesResponse>({
    queryKey: ['services', params],
    queryFn: async () => {
      const query = new URLSearchParams()
      if (params.status) query.set('status', params.status)
      if (params.search) query.set('search', params.search)
      if (params.page)   query.set('page', String(params.page))
      const { data } = await api.get(`/api/services?${query.toString()}`)
      return data
    },
    refetchInterval: 30_000,
  })
}

export function useServicesStats() {
  return useQuery<StatsResponse>({
    queryKey: ['services-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/services/stats')
      return data
    },
    refetchInterval: 30_000,
  })
}
