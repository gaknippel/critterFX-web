import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, Loader2, XCircle, } from 'lucide-react'
import FadeContent from '@/components/FadeContent'
import './Confirm.css'

export default function Confirm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus('success')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="confirm-page-wrapper">
      <FadeContent duration={600}>
        <div className="confirm-card">
          <div className="confirm-header">
            <div className="confirm-icon-wrapper">
              {status === 'loading' && (
                <div className="icon-bg loading">
                  <Loader2 className="confirm-icon animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="icon-bg success">
                  <CheckCircle2 className="confirm-icon" />
                </div>
              )}
              {status === 'error' && (
                <div className="icon-bg error">
                  <XCircle className="confirm-icon" />
                </div>
              )}
            </div>

            <h1 className="confirm-title">
              {status === 'loading' && 'confirming account'}
              {status === 'success' && 'account confirmed!'}
              {status === 'error' && 'something went wrong'}
            </h1>

            <p className="confirm-description">
              {status === 'loading' && 'please wait while the database verifies your account...'}
              {status === 'success' && 'your account has been successfully verified. welcome to critterFX!'}
              {status === 'error' && 'we could not verify your account. the link may be expired or invalid.'}
            </p>
          </div>

          <div className="confirm-content">
             {status === 'success' && (
               <p className="confirm-subtext">
                 you can now return to the desktop or web app.
               </p>
             )}
          </div>

        </div>
      </FadeContent>
    </div>
  )
}