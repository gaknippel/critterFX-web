import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import './Auth.css'

export default function Auth() {

  const [isSignup, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {    
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      
      if (error) throw error
      
      toast.success('welcome back!')
      navigate('/') 
    }
    catch(error : any){
      toast.error(error.message)
    }
    finally{
      setIsLoading(false)
    }
  } 

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {

      const { data: existingUser } = await supabase //check for duplicate username
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      throw new Error('username is already taken.')
    }


      const { data, error } = await supabase.auth.signUp({  //call sign up
        email, 
        password,
        options: {
        data: { username },
        emailRedirectTo: 'https://critter-fx-web.vercel.app/confirm'
        }
      })

      if (error) throw error

      if (data?.user?.identities?.length === 0) {
      throw new Error('an account with this email already exists :(')
      }
      
      toast.success('check your email to confirm your account!')
    } 
    catch (error: any) {
      toast.error(error.message)
    } 
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <CardHeader className="auth-header">
          <div className="auth-title-group">
            <CardTitle className="auth-title">
              {isSignup ? 'create an account!' : 'welcome back!'}
            </CardTitle>
            <CardDescription className="auth-description">
              {isSignup ? 'join critterFX!' : 'sign in!'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="auth-content">
          <form onSubmit={isSignup ? handleSignUp : handleSignIn} className="auth-form">
            <div className="auth-field-group">
              <Label htmlFor="email">email</Label>
              <Input
                id="email"
                type="email"
                placeholder="critter@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            {isSignup && (
              <div className="auth-field-group">
                <Label htmlFor="username">username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="crittercat_420"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
            )}

            <div className="auth-field-group">
              <Label htmlFor="password">password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <Button type="submit" className="auth-submit-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignup ? 'creating account...' : 'signing in...'}
                </>
              ) : (
                isSignup ? 'create account' : 'sign in'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="auth-toggle">
          <p className="text-sm text-muted-foreground">
            {isSignup ? 'already have an account? ' : "don't have an account? "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignup)}
              className="auth-toggle-link"
            >
              {isSignup ? 'sign in' : 'sign up'}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
