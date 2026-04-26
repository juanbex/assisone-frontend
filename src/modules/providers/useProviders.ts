import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'

export interface Provider {
  id: string; name: string; whatsapp: string; type: string
  coverageZones: string[]; createdAt: string
  _count?: { assignments: number }
}

export interface ProviderDetail extends Provider {
  assignments: {
    id: string; status: string; sentAt: string; etaMinutes: number | null
    service: { id: string; status: string; createdAt: string; serviceType: { name: string }; client: { name: string } }
  }[]
}

export const PROVIDER_TYPES = [
  { value: 'grua-liviana',      label: 'Grúa liviana',      category: 'auto' },
  { value: 'grua-pesada',       label: 'Grúa pesada',       category: 'auto' },
  { value: 'carro-taller',      label: 'Carro taller',      category: 'auto' },
  { value: 'conductor-elegido', label: 'Conductor elegido',  category: 'auto' },
  { value: 'plomeria',          label: 'Plomería',           category: 'hogar' },
  { value: 'gas',               label: 'Gas domiciliario',   category: 'hogar' },
  { value: 'cerrajeria',        label: 'Cerrajería',         category: 'hogar' },
  { value: 'medico-general',    label: 'Médico general',     category: 'medico' },
  { value: 'urgencias',         label: 'Urgencias dom.',     category: 'medico' },
]

export const TYPE_CATEGORY_COLOR: Record<string, string> = {
  auto: '#0088b8', hogar: '#059669', medico: '#7c3aed',
}

export function useProviders(params: { type?: string; search?: string } = {}) {
  return useQuery<{ data: Provider[] }>({
    queryKey: ['providers', params],
    queryFn: async () => {
      const q = new URLSearchParams()
      if (params.type)   q.set('type', params.type)
      if (params.search) q.set('search', params.search)
      const { data } = await api.get(`/api/providers?${q}`)
      return data
    },
  })
}

export function useProviderStats() {
  return useQuery<{ data: { total: number; byType: { type: string; _count: { _all: number } }[] } }>({
    queryKey: ['providers-stats'],
    queryFn: async () => { const { data } = await api.get('/api/providers/stats'); return data },
  })
}

export function useProvider(id: string) {
  return useQuery<{ data: ProviderDetail }>({
    queryKey: ['provider', id],
    queryFn: async () => { const { data } = await api.get(`/api/providers/${id}`); return data },
    enabled: !!id,
  })
}

export function useCreateProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => { const { data } = await api.post('/api/providers', body); return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['providers'] }); qc.invalidateQueries({ queryKey: ['providers-stats'] }) },
  })
}

export function useUpdateProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => { const { data } = await api.patch(`/api/providers/${id}`, body); return data },
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ['providers'] }); qc.invalidateQueries({ queryKey: ['provider', vars.id] }) },
  })
}

export function useDeleteProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/providers/${id}`) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['providers'] }); qc.invalidateQueries({ queryKey: ['providers-stats'] }) },
  })
}
