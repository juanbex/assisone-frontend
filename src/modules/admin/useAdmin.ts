import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'

export interface AppUser {
  id: string; name: string; email: string; phone: string | null
  status: string; createdAt: string
  userRoles: { role: { id: string; name: string } }[]
}

export interface Role { id: string; name: string; description: string | null; isSystem: boolean }

export function useUsers() {
  return useQuery<{ data: AppUser[] }>({
    queryKey: ['admin-users'],
    queryFn: async () => { const { data } = await api.get('/api/admin/users'); return data },
  })
}

export function useRoles() {
  return useQuery<{ data: Role[] }>({
    queryKey: ['admin-roles'],
    queryFn: async () => { const { data } = await api.get('/api/admin/roles'); return data },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => { const { data } = await api.post('/api/admin/users', body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => { const { data } = await api.patch(`/api/admin/users/${id}`, body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => { const { data } = await api.post('/api/admin/roles', body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-roles'] }),
  })
}

export function useSeedRoles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => { const { data } = await api.post('/api/admin/seed-roles', {}); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-roles'] }),
  })
}
