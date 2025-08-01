import { Button } from "./ui/button";
import { Sliders } from "lucide-react";

interface FilterSetupPromptProps {
  onSetPreferences: () => void;
  onSkip: () => void;
}

export function FilterSetupPrompt({ onSetPreferences, onSkip }: FilterSetupPromptProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 text-center mb-6 pt-4 px-6 bg-[#fafafa]">
        <h1 className="text-4xl font-semibold text-foreground tracking-tight">
          Let's Personalize Your Results
        </h1>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-8">
        <div className="flex flex-col items-center justify-center space-y-10 min-h-full">
          <div className="flex flex-col items-center space-y-8">
            {/* Filter Icon */}
            <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-lg p-3">
              <Sliders className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Explanation */}
          <div className="text-center space-y-4 px-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pick your favorite cuisines and any dietary needs. We'll use this to show you restaurants you'll love.
            </p>
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Actions - Always Visible */}
      <div className="flex-shrink-0 pt-6 pb-4 px-8 space-y-7 bg-[#fafafa] border-t border-border/20">
        <Button 
          onClick={onSetPreferences}
          className="w-full h-16 rounded-3xl text-xl shadow-lg bg-primary hover:bg-primary/90 text-white"
          size="lg"
        >
          Set My Preferences
        </Button>
        
        <Button 
          onClick={onSkip}
          variant="ghost"
          className="w-full h-12 rounded-3xl text-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          size="lg"
        >
          Skip for Now
        </Button>
      </div>
    </div>
  );
}