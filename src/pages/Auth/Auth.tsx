import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card'
import { Sparkles, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import './Auth.css'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setMessage('')
    setIsError(false)

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    })

    if (error) {
      setMessage(error.message)
      setIsError(true)
    } else {
      setMessage('Check your email for the magic link!')
      setIsError(false)
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-page dark">
      {/* Background glow */}
      <div className="auth-glow" />
      
      <Card className="auth-card">
        <CardHeader className="auth-header">
          <div className="auth-icon-container">
            <div className="auth-icon-wrapper">
              <Sparkles className="auth-icon" />
            </div>
          </div>
          <div className="auth-title-group">
            <CardTitle className="auth-title">Welcome Back</CardTitle>
            <CardDescription className="auth-description">
              Enter your email for a secure magic link
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field-group">
              <Label htmlFor="email" className="auth-label">
                Email Address
              </Label>
              <div className="auth-input-container">
                <div className="auth-input-icon-wrapper">
                  <Mail className="auth-input-icon" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="auth-submit-button" 
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Magic Link'
              )}
            </Button>
          </form>
        </CardContent>
        {message && (
          <CardFooter className="auth-footer">
            <div className={`auth-status-message ${isError ? 'auth-status-error' : 'auth-status-success'}`}>
              {isError ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
              <span className="flex-1">{message}</span>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
