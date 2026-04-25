import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'

export interface AppUser {
  id: string; name: string; email: string; phone: string | null
  status: string; createdAt: string
  userRoles: { role: { id: string; name: string } }[]
}

export interface Role {
  id: string; name: string; description: string | null; isSystem: boolean
}

export interface Tenant {
  id: string; name: string; slug: string; config: any; createdAt: string
  _count: { users: number; services: number }
}

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

export function useTenants() {
  return useQuery<{ data: Tenant[] }>({
    queryKey: ['admin-tenants'],
    queryFn: async () => { const { data } = await api.get('/api/admin/tenants'); return data },
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

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/admin/roles/${id}`) },
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

export function useCreateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => { const { data } = await api.post('/api/admin/tenants', body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => { const { data } = await api.patch(`/api/admin/tenants/${id}`, body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  })
}
