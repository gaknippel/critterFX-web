import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

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
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {


            console.log('testing direct query...')
        supabase.from('presets').select('count').then(result => {
            console.log('direct query result:', result)
        })


    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .single()
    
    if (data) setUser(data)
  }

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