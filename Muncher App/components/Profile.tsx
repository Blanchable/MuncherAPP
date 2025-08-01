import { Button } from './ui/button'
import { Utensils, ArrowLeft, LogOut, User } from 'lucide-react'
import { authService, User as UserType } from '../utils/supabase/client'
import { toast } from 'sonner@2.0.3'

interface ProfileProps {
  user: UserType
  onBack: () => void
  onLogout: () => void
}

export function Profile({ user, onBack, onLogout }: ProfileProps) {
  const handleLogout = async () => {
    try {
      await authService.signOut()
      toast.success('Signed out successfully')
      onLogout()
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="flex-1 flex flex-col px-8 py-8">
      {/* Header */}
      <div className="grid grid-cols-3 items-center mb-8">
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
        
        <div></div> {/* Spacer for grid alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col space-y-8">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <User className="w-12 h-12 text-primary" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              {user.name || 'Food Explorer'}
            </h1>
            <p className="text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
            <h3 className="font-medium text-foreground">Account Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Name</span>
                <span className="text-foreground">{user.name || 'Not set'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground text-sm">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout Button */}
        <div className="space-y-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 rounded-2xl border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}