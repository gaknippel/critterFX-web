import { createContext, useContext, useState, useEffect } from "react"
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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
  console.log('setting up auth listener')
  
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('auth event:', event)
  if (session?.user) {
    const userId = session.user.id
    // setTimeout breaks out of the auth callback, preventing deadlock
    setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .single()
      
      if (data) setUser(data)
    }, 0)
  } else {
    setUser(null)
  }
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