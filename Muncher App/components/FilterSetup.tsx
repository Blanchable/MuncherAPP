import { useState } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface FilterSetupProps {
  onApplyFilters: (filters: FilterState) => void;
  onSkip: () => void;
}

interface FilterState {
  distance: number;
  cuisines: string[];
  dietaryRestrictions: string[];
}

const cuisineOptions = [
  { id: 'pizza', label: '🍕 Pizza', emoji: '🍕' },
  { id: 'sushi', label: '🍣 Sushi', emoji: '🍣' },
  { id: 'mexican', label: '🌮 Mexican', emoji: '🌮' },
  { id: 'burgers', label: '🍔 Burgers', emoji: '🍔' },
  { id: 'salad', label: '🥗 Salad', emoji: '🥗' },
  { id: 'italian', label: '🍝 Italian', emoji: '🍝' },
];

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'halal', label: 'Halal' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'none', label: 'None' },
];

export function FilterSetup({ onApplyFilters, onSkip }: FilterSetupProps) {
  const [distance, setDistance] = useState([8]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<{[key: string]: boolean}>({});

  const handleCuisineToggle = (cuisineId: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisineId) 
        ? prev.filter(id => id !== cuisineId)
        : [...prev, cuisineId]
    );
  };

  const handleDietaryToggle = (restrictionId: string) => {
    setDietaryRestrictions(prev => ({
      ...prev,
      [restrictionId]: !prev[restrictionId]
    }));
  };

  const handleApplyFilters = () => {
    const filters: FilterState = {
      distance: distance[0],
      cuisines: selectedCuisines,
      dietaryRestrictions: Object.keys(dietaryRestrictions).filter(key => dietaryRestrictions[key])
    };
    onApplyFilters(filters);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 text-center mb-6 pt-4 px-6 bg-[#fafafa]">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Set Your Preferences
        </h1>
        <p className="text-sm text-muted-foreground/80 font-normal">
          Customize your experience
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <div className="space-y-6 pb-4">
          {/* Distance Radius Selector */}
          <div className="space-y-3">
            <div>
              <Label className="text-lg text-foreground">Set your search radius</Label>
              <p className="text-sm text-muted-foreground mt-1">Current selection: {distance[0]} miles</p>
            </div>
            
            <div className="px-2">
              <Slider
                value={distance}
                onValueChange={setDistance}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1 mi</span>
                <span>10 mi</span>
                <span>20 mi</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                You can always change this later
              </p>
            </div>
          </div>

          {/* Cuisine Preferences with selection feedback */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-lg text-foreground">Pick your favorite cuisines</Label>
              {selectedCuisines.length > 0 && (
                <span className="text-sm text-primary font-medium">
                  {selectedCuisines.length} cuisine{selectedCuisines.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {cuisineOptions.map((cuisine) => (
                <button
                  key={cuisine.id}
                  onClick={() => handleCuisineToggle(cuisine.id)}
                  className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                    selectedCuisines.includes(cuisine.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}
                >
                  <span className="text-xl mb-1 block">{cuisine.emoji}</span>
                  <span className="text-sm font-medium">{cuisine.label.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>
            
            <button className="text-primary text-sm font-medium hover:underline">
              + See More
            </button>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label className="text-lg text-foreground">Any dietary needs?</Label>
            
            <div className="space-y-2">
              {dietaryOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <Label htmlFor={option.id} className="text-base text-foreground font-medium">
                    {option.label}
                  </Label>
                  <Switch
                    id={option.id}
                    checked={dietaryRestrictions[option.id] || false}
                    onCheckedChange={() => handleDietaryToggle(option.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions - Always Visible */}
      <div className="flex-shrink-0 pt-6 pb-4 px-6 space-y-4 bg-[#fafafa] border-t border-border/20">
        <Button 
          onClick={handleApplyFilters}
          className="w-full h-14 rounded-3xl text-lg shadow-lg bg-primary hover:bg-primary/90 text-white"
          size="lg"
        >
          Apply Filters
        </Button>
        
        <button 
          onClick={onSkip}
          className="w-full text-center text-muted-foreground hover:text-foreground text-base py-2"
        >
          Skip and show everything
        </button>
      </div>
    </div>
  );
}