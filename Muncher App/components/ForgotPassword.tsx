import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ArrowLeft, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { authService } from '../utils/supabase/client'

interface ForgotPasswordProps {
  onBack: () => void
  onSuccess: (email: string) => void
}

export function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail) {
      setError('Please enter your email address')
      return
    }
    
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    try {
      await authService.resetPassword(trimmedEmail)
      console.log('Password reset email sent to:', trimmedEmail)
      onSuccess(trimmedEmail)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  return (
    <div className="flex-1 flex flex-col px-8 py-6">
      {/* Header with Back Button and Title */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-secondary rounded-xl transition-colors"
          aria-label="Go back to login"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-xl font-medium text-foreground">
          Reset Password
        </h1>
        
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-8">
          {/* Icon and Description */}
          <div className="text-center space-y-6">
            {/* Mail Icon */}
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <Mail className="w-12 h-12 text-primary" />
            </div>
            
            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-medium text-foreground">
                Forgot your password?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                No worries! Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-foreground font-medium text-lg">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter your email address"
                    className={`h-16 rounded-2xl text-lg bg-input-background border-2 transition-all duration-200 ${
                      error
                        ? 'border-destructive ring-2 ring-destructive/20'
                        : 'border-transparent hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background'
                    }`}
                    disabled={isLoading}
                    aria-invalid={!!error}
                    aria-describedby={error ? "email-error" : undefined}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                  {error && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                  )}
                </div>
                
                {/* Error Message */}
                {error && (
                  <p id="email-error" className="text-destructive text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Send Reset Email Button */}
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Reset Email'
              )}
            </Button>
          </form>
        </div>

        {/* Bottom Section */}
        <div className="text-center space-y-4 mt-8">
          <div className="h-px bg-border mx-8"></div>
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <button
              type="button"
              onClick={onBack}
              className="text-primary hover:text-primary/80 font-medium transition-colors underline"
              disabled={isLoading}
            >
              Back to login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}