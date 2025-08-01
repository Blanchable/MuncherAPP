import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react'

interface ZipCodeEntryProps {
  onBack: () => void
  onContinue: (zipCode: string) => void
}

export function ZipCodeEntry({ onBack, onContinue }: ZipCodeEntryProps) {
  const [zipCode, setZipCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateZipCode = (zip: string): boolean => {
    // US zip code validation (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/
    return zipRegex.test(zip.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const trimmedZip = zipCode.trim()
    
    if (!trimmedZip) {
      setError('Please enter your zip code')
      return
    }
    
    if (!validateZipCode(trimmedZip)) {
      setError('Please enter a valid zip code (e.g., 90210 or 90210-1234)')
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Using zip code:', trimmedZip)
      onContinue(trimmedZip)
      setIsLoading(false)
    }, 500)
  }

  const handleZipCodeChange = (value: string) => {
    // Only allow numbers and hyphens, limit to 10 characters
    const cleaned = value.replace(/[^\d-]/g, '').slice(0, 10)
    setZipCode(cleaned)
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  return (
    <div className="flex-1 flex flex-col px-8 py-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-8">
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

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-8">
          {/* Icon and Title Section */}
          <div className="text-center space-y-6">
            {/* Location Icon */}
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <MapPin className="w-12 h-12 text-primary" />
            </div>
            
            {/* Title and Description */}
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-foreground">
                Enter Your Zip Code
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We'll use your zip code to find great restaurants in your area
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Zip Code Input */}
              <div className="space-y-3">
                <Label htmlFor="zipcode" className="text-foreground font-medium text-lg">
                  Zip Code
                </Label>
                <div className="relative">
                  <Input
                    id="zipcode"
                    type="text"
                    inputMode="numeric"
                    value={zipCode}
                    onChange={(e) => handleZipCodeChange(e.target.value)}
                    placeholder="Enter zip code (e.g., 90210)"
                    className={`h-16 rounded-2xl text-lg text-center bg-input-background border-2 transition-all duration-200 ${
                      error
                        ? 'border-destructive ring-2 ring-destructive/20'
                        : 'border-transparent hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background'
                    }`}
                    disabled={isLoading}
                    aria-invalid={!!error}
                    aria-describedby={error ? "zipcode-error" : undefined}
                    autoComplete="postal-code"
                  />
                  {error && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                  )}
                </div>
                
                {/* Error Message */}
                {error && (
                  <p id="zipcode-error" className="text-destructive text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              {/* Helper Text */}
              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Don't worry, we only use this to show you nearby restaurants. Your privacy matters to us.
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              type="submit"
              disabled={isLoading || !zipCode.trim()}
              className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking...</span>
                </div>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </div>

        {/* Bottom Section with Location Option */}
        <div className="text-center space-y-4">
          <div className="h-px bg-border mx-8"></div>
          <p className="text-sm text-muted-foreground">
            Changed your mind?{' '}
            <button
              type="button"
              onClick={onBack}
              className="text-primary hover:text-primary/80 font-medium transition-colors underline"
              disabled={isLoading}
            >
              Use location instead
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}