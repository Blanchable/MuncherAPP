import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ArrowLeft, Mail, CheckCircle, ExternalLink } from 'lucide-react'

interface ForgotPasswordConfirmationProps {
  email: string
  onBack: () => void
  onBackToLogin: () => void
}

export function ForgotPasswordConfirmation({ email, onBack, onBackToLogin }: ForgotPasswordConfirmationProps) {
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResendEmail = () => {
    console.log('Resending password reset email to:', email)
    setCountdown(60)
    setCanResend(false)
    // In a real app, this would call the reset password API again
  }

  const getEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase()
    
    const providers = {
      'gmail.com': { name: 'Gmail', url: 'https://mail.google.com' },
      'yahoo.com': { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' },
      'outlook.com': { name: 'Outlook', url: 'https://outlook.live.com' },
      'hotmail.com': { name: 'Outlook', url: 'https://outlook.live.com' },
      'icloud.com': { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' },
      'aol.com': { name: 'AOL Mail', url: 'https://mail.aol.com' }
    }
    
    return providers[domain] || { name: 'your email', url: null }
  }

  const emailProvider = getEmailProvider(email)

  return (
    <div className="flex-1 flex flex-col px-8 py-6">
      {/* Header with Back Button and Title */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-secondary rounded-xl transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-xl font-medium text-foreground">
          Check Your Email
        </h1>
        
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-8">
          {/* Success Icon and Message */}
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green/10 rounded-3xl flex items-center justify-center mx-auto">
              <div className="relative">
                <Mail className="w-10 h-10 text-green" />
                <CheckCircle className="w-6 h-6 text-green bg-background rounded-full absolute -top-1 -right-1" />
              </div>
            </div>
            
            {/* Success Message */}
            <div className="space-y-4">
              <h2 className="text-2xl font-medium text-foreground">
                Email Sent!
              </h2>
              <div className="space-y-3">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We've sent password reset instructions to:
                </p>
                <p className="text-foreground font-medium text-lg bg-muted/50 rounded-2xl py-3 px-4">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-primary/5 rounded-2xl p-6 space-y-4">
            <h3 className="font-medium text-foreground flex items-center space-x-2">
              <span>📧</span>
              <span>Next Steps</span>
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start space-x-2">
                <span className="text-primary font-medium">1.</span>
                <span>Check your email inbox (and spam/junk folder)</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-primary font-medium">2.</span>
                <span>Click the reset link in the email</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-primary font-medium">3.</span>
                <span>Create a new password</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-primary font-medium">4.</span>
                <span>Sign in to Muncher with your new password</span>
              </p>
            </div>
          </div>

          {/* Quick Email Access */}
          {emailProvider.url && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => window.open(emailProvider.url, '_blank')}
                className="h-12 px-6 rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all duration-200"
              >
                <span>Open {emailProvider.name}</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="space-y-6">
          {/* Resend Email */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Didn't receive the email?
            </p>
            <Button
              variant="ghost"
              onClick={handleResendEmail}
              disabled={!canResend}
              className="text-primary hover:text-primary/80 font-medium disabled:text-muted-foreground"
            >
              {canResend ? (
                'Resend Email'
              ) : (
                `Resend in ${countdown}s`
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="h-px bg-border mx-8"></div>

          {/* Back to Login */}
          <div className="text-center">
            <Button
              onClick={onBackToLogin}
              className="w-full h-14 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-all duration-200"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}