import { Button } from "./ui/button";
import { ChefHat, ArrowLeft, ArrowRight } from "lucide-react";

interface ReadyToSwipeProps {
  onStartSwiping: () => void;
  onEditPreferences: () => void;
}

export function ReadyToSwipe({ onStartSwiping, onEditPreferences }: ReadyToSwipeProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 text-center mb-6 pt-4 px-6 bg-[#fafafa]">
        <h1 className="text-4xl font-semibold text-foreground tracking-tight">
          You're All Set!
        </h1>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-8">
        <div className="flex flex-col items-center justify-center space-y-10 min-h-full">
          <div className="flex flex-col items-center space-y-8">
            {/* Chef Hat Icon */}
            <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-lg p-3">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Explanation and Visual Guide */}
          <div className="text-center space-y-6 px-4">
            <div className="text-lg text-muted-foreground leading-relaxed">
              <p>We've preloaded top picks near you.</p>
              <p>Swipe to find your next meal.</p>
            </div>
            
            {/* Swipe Visual Guide with Enhanced Card Stack */}
            <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-center space-x-8">
                {/* Swipe Left */}
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm">Skip</span>
                </div>
                
                {/* Enhanced Card Stack Visual */}
                <div className="relative">
                  {/* Background card 3 - most faded */}
                  <div className="w-16 h-20 bg-muted/40 border border-border/30 rounded-xl shadow-sm transform rotate-6 opacity-60"></div>
                  
                  {/* Background card 2 - medium fade */}
                  <div className="w-16 h-20 bg-muted/60 border border-border/50 rounded-xl shadow-sm absolute top-0 left-0 transform rotate-3 opacity-75"></div>
                  
                  {/* Background card 1 - lighter */}
                  <div className="w-16 h-20 bg-background/80 border-2 border-border/70 rounded-xl shadow-md absolute top-0 left-0 transform -rotate-1 opacity-90"></div>
                  
                  {/* Front card - full visibility */}
                  <div className="w-16 h-20 bg-background border-2 border-primary rounded-xl shadow-lg absolute top-0 left-0">
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xl">🍕</span>
                    </div>
                  </div>
                </div>
                
                {/* Swipe Right */}
                <div className="flex items-center space-x-2 text-primary">
                  <span className="text-sm font-medium">Interested</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Swipe right if you're interested, left to skip
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Actions - Always Visible */}
      <div className="flex-shrink-0 pt-6 pb-4 px-8 space-y-4 bg-[#fafafa] border-t border-border/20">
        <Button 
          onClick={onStartSwiping}
          className="w-full h-16 rounded-3xl text-xl shadow-lg bg-primary hover:bg-primary/90 text-white"
          size="lg"
        >
          Start Swiping
        </Button>
        
        <button 
          onClick={onEditPreferences}
          className="w-full text-center text-muted-foreground hover:text-foreground text-base py-2"
        >
          Edit Preferences
        </button>
      </div>
    </div>
  );
}