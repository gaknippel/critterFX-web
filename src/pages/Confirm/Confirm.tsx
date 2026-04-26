import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function Confirm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    // supabase automatically handles the token in the URL
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setStatus('success')
      } else if (event === 'USER_UPDATED') {
        setStatus('success')
      }
    })
  }, [])

  return (
    <div className="confirm-wrapper">
      {status === 'loading' && (
        <>
          <Loader2 className="confirm-icon animate-spin" />
          <h1>confirming your account...</h1>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle2 className="confirm-icon confirm-icon-success" />
          <h1>account confirmed! 🎉</h1>
          <p>you can close this tab and go back to critterFX.</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h1>something went wrong</h1>
          <p>try signing up again.</p>
        </>
      )}
    </div>
  )
}