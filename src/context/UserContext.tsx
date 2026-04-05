import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from '@/lib/supabase'


type UserProfile = {
  id: string
  username: string
}

type UserContextType = {
  user: UserProfile | null
  isLoading: boolean
  signOut: () => void
}


const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const syncUserProfile = async (userId: string) => {
      setIsLoading(true)

      const { data } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .single()

      setUser(data ?? null)
      setIsLoading(false)
    }

    const initializeUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await syncUserProfile(session.user.id)
        return
      }

      setUser(null)
      setIsLoading(false)
    }

    void initializeUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Break out of the auth callback before fetching profile data.
        setTimeout(() => {
          void syncUserProfile(session.user.id)
        }, 0)
        return
      }

      setUser(null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUserContext must be used within a UserProvider')
  return context
}
