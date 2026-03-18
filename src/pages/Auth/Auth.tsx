import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card'
import { Sparkles, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import './Auth.css'

export default function Auth() {

  const [isSignup, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    setIsLoading(true)

    try {    
    const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
      if (error) throw error
      
      setMessage('welcome back!')
    }
    catch(error : any){
        setIsError(true)
        setMessage(error.message)
    }
    finally{
      setIsLoading(false)
    }

  } 

  const handleSignUp = async (e: React.FormEvent) => {
    setIsLoading(true)
    
    try{
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if(!data.user) throw new Error('no user returned')
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username })
        
      if (profileError) throw profileError

      setMessage('success! account created.')
    }
    catch(error: any){
      setIsError(true)
      setMessage(error.message)
    }
    finally{
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
    <Card className="auth-card">
      <CardHeader className="auth-header">
        <div className="auth-icon-container">
          <div className="auth-icon-wrapper">
            <Sparkles className="auth-icon" />
          </div>
        </div>
        <div className="auth-title-group">
          <CardTitle className="auth-title">
            {isSignup ? 'create an account' : 'welcome back.'}
          </CardTitle>
          <CardDescription className="auth-description">
            {isSignup ? 'join critterFX!' : 'sign in!'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
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

      {/* error/success message */}
      {message && (
        <CardFooter className="auth-footer">
          <div className={`auth-status-message ${isError ? 'auth-status-error' : 'auth-status-success'}`}>
            {isError 
              ? <AlertCircle className="h-5 w-5 shrink-0" /> 
              : <CheckCircle2 className="h-5 w-5 shrink-0" />
            }
            <span>{message}</span>
          </div>
        </CardFooter>
      )}

      {/* toggle between sign in and sign up */}
      <CardFooter className="auth-toggle">
        <p className="text-sm text-muted-foreground">
          {isSignup ? 'already have an account? ' : "don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignup)
              setMessage('')
              setIsError(false)
            }}
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
