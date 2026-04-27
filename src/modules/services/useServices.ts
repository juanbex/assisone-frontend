import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'

export interface Service {
  id: string; status: string; notes: string | null; location: any
  createdAt: string; assignedAt: string | null; completedAt: string | null
  client: { name: string; policyNumber: string | null; phone: string; email?: string }
  serviceType: { name: string; category: { name: string } }
  frontAgent: { id: string; name: string; email: string } | null
  backAgent:  { id: string; name: string; email: string } | null
  assignments?: any[]; events?: any[]; evidences?: any[]; appointments?: any[]
}

export interface ServicesResponse { data: Service[]; total: number; page: number; limit: number }
export interface StatsResponse { data: Record<string, number> }

export function useServices(params: { status?: string; search?: string; page?: number }) {
  return useQuery<ServicesResponse>({
    queryKey: ['services', params],
    queryFn: async () => {
      const q = new URLSearchParams()
      if (params.status) q.set('status', params.status)
      if (params.search) q.set('search', params.search)
      if (params.page)   q.set('page', String(params.page))
      const { data } = await api.get(`/api/services?${q}`)
      return data
    },
    refetchInterval: 30_000,
  })
}

export function useServicesStats() {
  return useQuery<StatsResponse>({
    queryKey: ['services-stats'],
    queryFn: async () => { const { data } = await api.get('/api/services/stats'); return data },
    refetchInterval: 30_000,
  })
}

export function useService(id: string) {
  return useQuery<{ data: Service }>({
    queryKey: ['service', id],
    queryFn: async () => { const { data } = await api.get(`/api/services/${id}`); return data },
    enabled: !!id,
    refetchInterval: 5_000, // ← cada 5 segundos para ver ETA en tiempo real
    staleTime: 0,            // ← siempre considerar datos desactualizados
  })
}

export function useServiceTypes() {
  return useQuery<{ data: any[] }>({
    queryKey: ['service-types'],
    queryFn: async () => { const { data } = await api.get('/api/services/types'); return data },
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => { const { data } = await api.post('/api/services', body); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] })
      qc.invalidateQueries({ queryKey: ['services-stats'] })
    },
  })
}

export function useUpdateServiceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data } = await api.patch(`/api/services/${id}/status`, { status, notes })
      return data
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['service', vars.id] })
      qc.invalidateQueries({ queryKey: ['services'] })
      qc.invalidateQueries({ queryKey: ['services-stats'] })
    },
  })
}
