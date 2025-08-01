import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Utensils, ArrowLeft, Eye, EyeOff, Heart, MapPin, Search, CheckCircle, AlertCircle } from 'lucide-react'
import { authService } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner@2.0.3'

interface SignupProps {
  onBack: () => void
  onSuccess: () => void
  onGoToLogin: () => void
}

export function Signup({ onBack, onSuccess, onGoToLogin }: SignupProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, text: '', color: '' }
    if (password.length < 6) return { strength: 1, text: 'Too short', color: 'text-destructive' }
    if (password.length < 8) return { strength: 2, text: 'Fair', color: 'text-yellow-500' }
    return { strength: 3, text: 'Strong', color: 'text-green' }
  }

  const passwordStrength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validation
    const newErrors: { name?: string; email?: string; password?: string } = {}
    
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    
    try {
      // Call our server signup endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-12068a29/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email,
          password,
          name: name.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Now sign in the user
      await authService.signIn(email, password)
      
      toast.success('Account created successfully!')
      onSuccess()
    } catch (error: any) {
      console.error('Signup error:', error)
      setErrors({ general: error.message || 'Failed to create account. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} sign-up coming soon!`, {
      description: 'Social registration will be available soon.'
    })
  }

  return (
    <div className="flex-1 flex flex-col px-8 py-4">
      {/* Header */}
      <div className="grid grid-cols-3 items-center mb-4">
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Utensils className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-medium text-primary">Muncher</span>
        </div>
        
        <div></div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 pb-4">
          {/* Welcome Section with Interactive Icons */}
          <div className="text-center space-y-4">
            {/* Interactive Welcome Icons */}
            <TooltipProvider>
              <div className="flex justify-center space-x-3 mb-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center cursor-help transition-all hover:bg-primary/20 hover:scale-105">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Save your favorites</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center cursor-help transition-all hover:bg-accent/30 hover:scale-105">
                      <Search className="w-5 h-5 text-accent" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Discover restaurants</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 bg-green/10 rounded-xl flex items-center justify-center cursor-help transition-all hover:bg-green/20 hover:scale-105">
                      <MapPin className="w-5 h-5 text-green" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Find nearby spots</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground">
                Join Muncher
              </h1>
              <p className="text-muted-foreground text-base">
                Create an account to save your dining discoveries
              </p>
              {/* Trust signal */}
              <p className="text-sm text-muted-foreground/70">
                Trusted by food lovers everywhere
              </p>
            </div>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-2 hover:bg-secondary/50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading}
                aria-label="Sign up with Google"
              >
                <div className="w-5 h-5 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-2 hover:bg-secondary/50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => handleSocialLogin('Apple')}
                disabled={isLoading}
                aria-label="Sign up with Apple"
              >
                <div className="w-5 h-5 bg-gray-900 rounded-full mr-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">⌘</span>
                </div>
                Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <Separator className="my-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-warm-background px-4 text-sm text-muted-foreground">
                  or create with email
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: undefined }))
                      }
                    }}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your name"
                    className={`h-12 rounded-2xl bg-input-background border-2 transition-all duration-200 ${
                      errors.name
                        ? 'border-destructive ring-2 ring-destructive/20'
                        : focusedField === 'name' 
                        ? 'border-primary ring-2 ring-primary/20 bg-background' 
                        : 'border-transparent hover:border-border'
                    }`}
                    disabled={isLoading}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: undefined }))
                      }
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your email"
                    className={`h-12 rounded-2xl bg-input-background border-2 transition-all duration-200 ${
                      errors.email
                        ? 'border-destructive ring-2 ring-destructive/20'
                        : focusedField === 'email' 
                        ? 'border-primary ring-2 ring-primary/20 bg-background' 
                        : 'border-transparent hover:border-border'
                    }`}
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: undefined }))
                      }
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Create a password (6+ characters)"
                    className={`h-12 rounded-2xl bg-input-background border-2 pr-12 transition-all duration-200 ${
                      errors.password
                        ? 'border-destructive ring-2 ring-destructive/20'
                        : focusedField === 'password' 
                        ? 'border-primary ring-2 ring-primary/20 bg-background' 
                        : 'border-transparent hover:border-border'
                    }`}
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  {/* Password toggle button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary/50 rounded-xl transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{showPassword ? 'Hide password' : 'Show password'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {/* Error message for password */}
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.password}</span>
                  </p>
                )}
                
                {/* Password Strength Indicator - Fixed height to prevent layout shift */}
                <div className="h-5 flex items-center">
                  {password && !errors.password && (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              level <= passwordStrength.strength
                                ? passwordStrength.strength === 1
                                  ? 'bg-destructive'
                                  : passwordStrength.strength === 2
                                  ? 'bg-yellow-500'
                                  : 'bg-green'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 mt-6 focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Privacy Note */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              By signing up, you agree to our Terms of Service and Privacy Policy.<br />
              We'll never spam you or share your data.
            </p>
          </div>

          {/* Sign in link */}
          <div className="text-center bg-secondary/30 rounded-2xl p-4">
            <p className="text-muted-foreground mb-3">
              Already have an account?
            </p>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={onGoToLogin}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}