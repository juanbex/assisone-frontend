import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'

export interface Provider {
  id: string
  name: string
  whatsapp: string
  type: string
  coverageZones: string[]
  createdAt: string
  _count?: { assignments: number }
  assignments?: any[]
}

export function useProviders(params: { search?: string; type?: string; page?: number } = {}) {
  return useQuery<{ data: Provider[]; total: number }>({
    queryKey: ['providers', params],
    queryFn: async () => {
      const q = new URLSearchParams()
      if (params.search) q.set('search', params.search)
      if (params.type)   q.set('type', params.type)
      if (params.page)   q.set('page', String(params.page))
      const { data } = await api.get(`/api/providers?${q}`)
      return data
    },
  })
}

export function useProvider(id: string) {
  return useQuery<{ data: Provider }>({
    queryKey: ['provider', id],
    queryFn: async () => { const { data } = await api.get(`/api/providers/${id}`); return data },
    enabled: !!id,
  })
}

export function useProviderStats() {
  return useQuery<{ data: { total: number; byType: { type: string; _count: number }[] } }>({
    queryKey: ['provider-stats'],
    queryFn: async () => { const { data } = await api.get('/api/providers/stats'); return data },
  })
}

export function useCreateProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => { const { data } = await api.post('/api/providers', body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['providers'] }),
  })
}

export function useUpdateProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => { const { data } = await api.patch(`/api/providers/${id}`, body); return data },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['provider', vars.id] })
      qc.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export function useSeed() {
  return useMutation({
    mutationFn: async () => { const { data } = await api.post('/api/admin/seed', {}); return data },
  })
}
