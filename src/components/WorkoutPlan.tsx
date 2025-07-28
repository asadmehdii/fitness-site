import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { WorkoutPlan as WorkoutPlanType, Exercise } from "@/types/workout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface WorkoutPlanProps {
  workoutPlan: WorkoutPlanType;
  onBack: () => void;
  planId?: string;
}

export const WorkoutPlan = ({ workoutPlan, onBack, planId }: WorkoutPlanProps) => {
  console.log("Initial workoutPlan:", workoutPlan); 

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [workoutData, setWorkoutData] = useState<WorkoutPlanType>(workoutPlan);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    exercise: Exercise | null;
    dayIndex: number;
    exerciseIndex: number;
  }>({
    isOpen: false,
    exercise: null,
    dayIndex: -1,
    exerciseIndex: -1,
  });

  const currentWeek = workoutData.weeks.find((w) => w.week === selectedWeek);

  const handleDeleteClick = (
    exercise: Exercise,
    dayIndex: number,
    exerciseIndex: number
  ) => {
    setDeleteDialog({
      isOpen: true,
      exercise,
      dayIndex,
      exerciseIndex,
    });
  };

  const handleConfirmDelete = async () => {
    const { dayIndex, exerciseIndex } = deleteDialog;

    // Update local state immediately
    const updatedWorkoutData = { ...workoutData };
    const weekIndex = updatedWorkoutData.weeks.findIndex(
      (w) => w.week === selectedWeek
    );

    if (weekIndex !== -1) {
      updatedWorkoutData.weeks[weekIndex].days[dayIndex].exercises.splice(
        exerciseIndex,
        1
      );
      setWorkoutData(updatedWorkoutData);
    }

    if (planId) {
      try {
        const response = await fetch(`/api/workout-plans/${planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workoutData: updatedWorkoutData
          })
        });

        if (!response.ok) {
          toast.error("Failed to save changes to database");
        }
      } catch (error) {
        console.error('Error updating database:', error);
        toast.error("Failed to save changes to database");
      }
    }

    setDeleteDialog({
      isOpen: false,
      exercise: null,
      dayIndex: -1,
      exerciseIndex: -1,
    });
  };

  const handleCancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      exercise: null,
      dayIndex: -1,
      exerciseIndex: -1,
    });
  };

  const handleMoveUp = async (dayIndex: number, exerciseIndex: number) => {
    if (exerciseIndex === 0) return; 

    const updatedWorkoutData = { ...workoutData };
    const weekIndex = updatedWorkoutData.weeks.findIndex(
      (w) => w.week === selectedWeek
    );

    if (weekIndex !== -1) {
      const exercises =
        updatedWorkoutData.weeks[weekIndex].days[dayIndex].exercises;
      const temp = exercises[exerciseIndex];
      exercises[exerciseIndex] = exercises[exerciseIndex - 1];
      exercises[exerciseIndex - 1] = temp;
      setWorkoutData(updatedWorkoutData);
      if (planId) {
        try {
          await fetch(`/api/workout-plans/${planId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              workoutData: updatedWorkoutData
            })
          });
        } catch (error) {
          console.error('Error updating database:', error);
        }
      }
    }
  };

  const handleMoveDown = async (dayIndex: number, exerciseIndex: number) => {
    const updatedWorkoutData = { ...workoutData };
    const weekIndex = updatedWorkoutData.weeks.findIndex(
      (w) => w.week === selectedWeek
    );

    if (weekIndex !== -1) {
      const exercises =
        updatedWorkoutData.weeks[weekIndex].days[dayIndex].exercises;
      if (exerciseIndex === exercises.length - 1) return;

      const temp = exercises[exerciseIndex];
      exercises[exerciseIndex] = exercises[exerciseIndex + 1];
      exercises[exerciseIndex + 1] = temp;
      setWorkoutData(updatedWorkoutData);

      if (planId) {
        try {
          await fetch(`/api/workout-plans/${planId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              workoutData: updatedWorkoutData
            })
          });
        } catch (error) {
          console.error('Error updating database:', error);
        }
      }
    }
  };

const renderExerciseRow = (
  exercise: Exercise,
  index: number,
  dayIndex: number
) => (
  <tr key={index} className="group">
    <td className="p-0 bg-white first:rounded-bl-[8px]">
      <div className="py-2 px-4 h-full flex items-center justify-start border-r border-[#F7F7F7]">
        {exercise.circuit}
      </div>
    </td>
    <td className="p-0 bg-white">
      <div className="py-2 px-4 h-full flex items-center justify-start border-r border-[#F7F7F7]">
        {exercise.exerciseName}
      </div>
    </td>
    <td className="p-0 bg-white">
      <div className="py-2 px-4 h-full flex items-center justify-start border-r border-[#F7F7F7]">
        {exercise.sets}
      </div>
    </td>
    <td className="p-0 bg-white">
      <div className="py-2 px-4 h-full flex items-center justify-start border-r border-[#F7F7F7]">
        {exercise.reps}
      </div>
    </td>
    <td className="p-0 bg-white">
      <div className="py-2 px-4 h-full flex items-center italic justify-start border-r border-[#F7F7F7]">
        {exercise.notes}
      </div>
    </td>
    <td className="p-0 bg-white last:rounded-br-[8px]">
      <div className="py-2 px-4 h-full flex items-center justify-center">
       <div className="flex items-center justify-center space-x-2">
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0 hover:bg-gray-100/50"
    onClick={() => handleDeleteClick(exercise, dayIndex, index)}
  >
    <img src="/delete.png" alt="Delete" className="h-5 w-5 object-contain opacity-100 hover:opacity-100" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0 hover:bg-gray-100/50"
    onClick={() => {
      if (index > 0) {
        handleMoveUp(dayIndex, index);
      } else if (index < currentWeek?.days[dayIndex]?.exercises.length - 1) {
        handleMoveDown(dayIndex, index);
      }
    }}
  >
    <img src="/filter.png" alt="Reorder" className="h-4 w-4 object-contain opacity-100 hover:opacity-100" />
  </Button>
</div>
      </div>
    </td>
  </tr>
);

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-6">
      {/* Header with Brand */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center bg-white space-x-2">
          <img src={"/logo.png"} alt="logo" className="w-[144px] h-[64.70px]" />
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {workoutData.programName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {workoutData.programDescription}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-start space-x-2  mt-4 ">
          {workoutData.weeks.map((week) => (
            <Button
              key={week.week}
              onClick={() => setSelectedWeek(week.week)}
              className={`rounded-lg transition-all duration-200
                      ${
                        selectedWeek === week.week
                          ? "bg-[#6367EF] text-white hover:bg-[#4F52D9]"
                          : "bg-white text-[#131313] hover:bg-[#F3F4F6] hover:text-[#6367EF] hover:border-[#6367EF]"
                      }`}
            >
              Week {week.week}
            </Button>
          ))}
        </div>

        {/* Workout Days */}
        {currentWeek && (
          <div className="space-y-6">
            {currentWeek.days.map((day, dayIndex) => (
              <Card
                key={day.day}
                className="overflow-hidden shadow-sm border-0"
              >
                {/* Day Header */}
                <div
                  className={`px-6 py-3 rounded-[8px] ${
                    day.title === "Rest" ? "bg-[#e2e2e2]" : "bg-[#cbcdeb]"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    Day {day.day} - {day.title}
                  </h3>
                </div>

                {/* Exercises Table */}
                {day.exercises.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2 bg-[#F7F7F7]">
                   <thead className="bg-[#f9fafb]">
  <tr>
    <th className="py-3 px-4 text-left text-[14px] font-normal text-[#000000] border border-[#F2F2F2]">
      Circuits
    </th>
    <th className="py-3 px-4 text-left text-[14px] font-normal text-[#000000] border border-[#F2F2F2]">
      Exercise
    </th>
    <th className="py-3 px-4 text-left text-[14px] font-normal text-[#000000] border border-[#F2F2F2]">
      Sets
    </th>
    <th className="py-3 px-4 text-left text-[14px] font-normal text-[#000000] border border-[#F2F2F2]">
      Reps
    </th>
    <th className="py-3 px-4 text-left text-[14px] font-normal  text-[#000000] border border-[#F2F2F2]">
      Notes
    </th>
    <th className="py-3 px-4 text-left text-[14px] font-normal text-[#000000] border border-[#F2F2F2]">
      {/* Empty */}
    </th>
  </tr>
</thead>

                      <tbody>
                        {day.exercises.map((exercise, index) =>
                          renderExerciseRow(exercise, index, dayIndex)
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <>
                    
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={handleCancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              {deleteDialog.exercise?.exerciseName}" from Day{" "}
              {currentWeek?.days[deleteDialog.dayIndex]?.day}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
