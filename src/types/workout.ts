export interface Exercise {
  circuit: string;
  exerciseName: string;
  sets: number;
  reps: string;
  rest?: string;
  notes: string;
}

export interface WorkoutDay {
  day: number;
  title: string;
  exercises: Exercise[];
}

export interface WorkoutWeek {
  week: number;
  days: WorkoutDay[];
}

export interface WorkoutPlan {
  programName: string;
  programDescription: string;
  weeks: WorkoutWeek[];
}