import { useState, useEffect } from "react";
import { WorkoutPrompt } from "@/components/WorkoutPrompt";
import { WorkoutPlan } from "@/components/WorkoutPlan";
import { generateWorkoutPlan } from "@/services/aiService";
import { WorkoutPlan as WorkoutPlanType } from "@/types/workout";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, History, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SavedPlan {
  _id: string;
  prompt: string;
  programName: string;
  programDescription: string;
  workoutData: WorkoutPlanType;
  createdAt: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<"prompt" | "plan" | "error">("prompt");
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    planId: string | null;
    planName: string;
  }>({
    isOpen: false,
    planId: null,
    planName: ""
  });

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const response = await fetch('/api/workout-plans');
      if (response.ok) {
        const plans = await response.json();
        setSavedPlans(plans);
      } else {
        console.error("Failed to fetch saved plans");
      }
    } catch (error) {
      console.error("Error fetching saved plans:", error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deleteDialog.planId) return;

    try {
      const response = await fetch(`/api/workout-plans/${deleteDialog.planId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Plan deleted successfully");
        setSavedPlans(prev => prev.filter(plan => plan._id !== deleteDialog.planId));
      } else {
        toast.error("Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    } finally {
      setDeleteDialog({ isOpen: false, planId: null, planName: "" });
    }
  };

  const handleSubmitPrompt = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const plan = await generateWorkoutPlan(prompt);
      setWorkoutPlan(plan);
      setCurrentView("plan");
      toast.success("Workout plan generated successfully!", {
        description: `Created "${plan.programName}" with ${plan.weeks.length} weeks`,
        duration: 4000,
      });
      fetchSavedPlans();
    } catch (error) {
      console.error("Error generating workout plan:", error);
      setError(error instanceof Error ? error.message : "Failed to generate workout plan");
      setCurrentView("error");
      toast.error("Failed to generate workout plan", {
        description: "Please check your connection and try again",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentView("prompt");
    setWorkoutPlan(null);
    setError(null);
  };

  const handleRetry = () => {
    setCurrentView("prompt");
    setError(null);
  };

  const handleViewPlan = (plan: SavedPlan) => {
    setWorkoutPlan(plan.workoutData);
    setCurrentView("plan");
  };

  if (currentView === "plan" && workoutPlan) {
    // Find the plan ID if we're viewing a saved plan
    const currentPlan = savedPlans.find(plan => 
      plan.workoutData.programName === workoutPlan.programName &&
      plan.workoutData.programDescription === workoutPlan.programDescription
    );
    
    return (
      <WorkoutPlan 
        workoutPlan={workoutPlan} 
        onBack={handleBack} 
        planId={currentPlan?._id}
      />
    );
  }

  if (currentView === "error") {
    return (
      <div className="min-h-screen bg-fitness-neutral flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-600">{error}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRetry} className="bg-fitness-primary hover:bg-fitness-primary/90">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={handleBack}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBEBEB]">
      {/* Main Prompt Section */}
      <div className="flex items-center justify-center px-4 py-8">
        <WorkoutPrompt 
          onSubmitPrompt={handleSubmitPrompt} 
          isLoading={isLoading}
        />
      </div>

      {/* Saved Plans Section */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Workout Plans</h2>
            {isLoadingPlans && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            )}
          </div>

          {savedPlans.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved plans yet</h3>
              <p className="text-gray-600">Generate your first workout plan to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedPlans.slice(0, 5).map((plan) => (
                <Card key={plan._id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {plan.programName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {plan.programDescription}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPlan(plan)}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({
                          isOpen: true,
                          planId: plan._id,
                          planName: plan.programName
                        })}
                        className="flex items-center text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={() => setDeleteDialog({ isOpen: false, planId: null, planName: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.planName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, planId: null, planName: "" })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
