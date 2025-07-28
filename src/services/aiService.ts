import { WorkoutPlan } from "@/types/workout";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const generateWorkoutPlan = async (prompt: string): Promise<WorkoutPlan> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling AI service:', error);
    throw new Error('Failed to generate workout plan. Please try again.');
  }
};
