import {supabase} from '../../lib/supabase'
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the magic link!')
    }
    
    setLoading(false)
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            enter your email to receive a auth link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'sending...' : 'send auth email link'}
            </Button>

            {message && (
              <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}