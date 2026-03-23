import { useUserContext } from '@/context/UserContext'
import { Button } from '@/components/ui/button'

export default function Profile() {
  const { user, signOut } = useUserContext()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{user?.username}</h1>
      <Button onClick={signOut}>sign out</Button>
    </div>
  )
}