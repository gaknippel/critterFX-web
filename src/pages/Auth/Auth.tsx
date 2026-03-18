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
    //TODO:
  } 

  const handleSignUp = async (e: React.FormEvent) => {
    //TODO: 
  }

  return (
    <div>
    </div>
  )
}
