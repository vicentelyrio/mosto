import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchMe, type LoginReq, login, logout } from '../service'

export function useAuth() {
  const qc = useQueryClient()

  const me = useQuery({ queryKey: ['me'], queryFn: fetchMe, retry: false })

  const signIn = useMutation({
    mutationFn: (req: LoginReq) => login(req),
    onSuccess: (user) => qc.setQueryData(['me'], user),
  })

  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => qc.setQueryData(['me'], null),
  })

  return { me, signIn, signOut }
}
