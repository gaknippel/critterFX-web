import { useUserContext } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, signOut } = useUserContext()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">{user?.username}</h1>
      <p className="text-muted-foreground mb-6">{user?.id}</p>
      <Button onClick={handleSignOut} variant="destructive">
        sign out
      </Button>
    </div>
  )
}