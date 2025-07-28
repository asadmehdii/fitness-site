import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://contact:MGqcmDj810m8JKys@cluster0.n6cgzvz.mongodb.net/";
const DB_NAME = "workout_plans";
const COLLECTION_NAME = "plans";

let db;
let client;

async function initializeDatabase() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    await db.collection(COLLECTION_NAME).createIndex({ createdAt: -1 });
    await db.collection(COLLECTION_NAME).createIndex({ prompt: "text" });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

// Initialize database on startup
initializeDatabase().catch(console.error);

// AI Service - Using Claude API
const CLAUDE_API_KEY = process.env.OPENAI_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL;

const workoutPlanSchema = z.object({
  programName: z.string(),
  programDescription: z.string(),
  weeks: z.array(z.object({
    week: z.number(),
    days: z.array(z.object({
      day: z.number(),
      title: z.string(),
      exercises: z.array(z.object({
        circuit: z.string(),
        exerciseName: z.string(),
        sets: z.number(),
        reps: z.string(),
        rest: z.string().optional(),
        notes: z.string()
      }))
    }))
  }))
});

async function generateWorkoutPlanWithAI(prompt) {
  if (!CLAUDE_API_KEY) {
    console.log('⚠️  No Claude API key found. Using mock data.');
    return generateMockWorkoutPlan(prompt);
  }

  try {
    console.log("📝 Generating workout plan with Claude API...");
    console.log("➡️ User Prompt:", prompt);

    const systemPrompt = `You are a professional fitness trainer and workout plan creator. Create detailed, structured workout plans based on user requests. Always respond with valid JSON that matches this exact schema:

{
  "programName": "string",
  "programDescription": "string", 
  "weeks": [
    {
      "week": number,
      "days": [
        {
          "day": number,
          "title": "string",
          "exercises": [
            {
              "circuit": "string (A, B, C, etc.)",
              "exerciseName": "string",
              "sets": number,
              "reps": "string",
              "rest": "string (optional)",
              "notes": "string"
            }
          ]
        }
      ]
    }
  ]
}

Guidelines:
- Create realistic, varied exercises with proper progression
- Include appropriate rest periods and set/rep schemes
- Provide specific notes for form and technique
- Structure programs logically with proper rest days
- Consider the user's fitness level and goals
- Make sure the JSON is properly formatted and all fields are included
- IMPORTANT: Always generate 4 weeks of workout plans unless specifically requested otherwise
- Each week should have 3-5 workout days with proper rest days
- Include progressive overload (increase sets/reps/weight over weeks)
- Vary exercise types and focus areas across weeks

Respond only with valid JSON.`;

    const model = 'claude-3-5-sonnet-20241022';
    
    const requestPayload = {
      model: model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nUser Request: ${prompt}`
        }
      ]
    };

    console.log(`📡 Using Claude model: ${model}`);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log("📥 Received response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Claude API error:`, response.status, errorText);
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Claude API response received");

    const claudeResponse = data.content[0].text;
    console.log("📝 Claude response text:", claudeResponse);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(claudeResponse);
      console.log("✅ Parsed Claude JSON successfully");
    } catch (parseError) {
      console.warn("⚠️ Direct JSON parse failed. Trying to extract from text...");
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        console.log("✅ Recovered and parsed JSON from string match.");
      } else {
        console.error("❌ Could not extract valid JSON from Claude response");
        return generateMockWorkoutPlan(prompt);
      }
    }

    // Validate the response against our schema
    try {
      const validatedResponse = workoutPlanSchema.parse(parsedResponse);
      console.log("✅ Claude response validated successfully");
      return validatedResponse;
    } catch (validationError) {
      console.error("❌ Claude response validation failed:", validationError);
      return generateMockWorkoutPlan(prompt);
    }

  } catch (error) {
    console.error('🔥 Claude API Error:', error);
    if (error.name === 'AbortError') {
      console.error('Request timed out after 30 seconds');
    }
    return generateMockWorkoutPlan(prompt);
  }
}

function generateMockWorkoutPlan(prompt) {
  const isStrength = prompt.toLowerCase().includes('strength');
  const isCardio = prompt.toLowerCase().includes('cardio') || prompt.toLowerCase().includes('conditioning');
  const isFullBody = prompt.toLowerCase().includes('full body') || prompt.toLowerCase().includes('full-body');
  
  const exercises = isStrength ? [
    { name: 'Barbell Bench Press', sets: 4, reps: '8, 6, 4, 4', rest: '90s', notes: 'Focus on form, increase weight each set' },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '10, 8, 6', rest: '75s', notes: 'Control the descent' },
    { name: 'T-Bar Row', sets: 4, reps: '10, 8, 6, 6', rest: '90s', notes: 'Squeeze shoulder blades together' },
    { name: 'Lat Pulldowns', sets: 3, reps: '12, 10, 8', rest: '60s', notes: 'Pull to chest level' },
    { name: 'Overhead Press', sets: 3, reps: '8, 6, 4', rest: '90s', notes: 'Keep core tight' },
    { name: 'Dumbbell Lateral Raises', sets: 3, reps: '12, 10, 8', rest: '60s', notes: 'Light weight, perfect form' }
  ] : isCardio ? [
    { name: 'Burpees', sets: 3, reps: '15, 12, 10', rest: '60s', notes: 'Full body movement' },
    { name: 'Mountain Climbers', sets: 3, reps: '30 seconds', rest: '45s', notes: 'Keep core engaged' },
    { name: 'Jump Squats', sets: 4, reps: '12, 10, 8, 6', rest: '60s', notes: 'Explosive movement' },
    { name: 'High Knees', sets: 3, reps: '45 seconds', rest: '30s', notes: 'Maintain pace' },
    { name: 'Plank to Downward Dog', sets: 3, reps: '10 reps', rest: '45s', notes: 'Smooth transitions' }
  ] : [
    { name: 'Squats', sets: 4, reps: '12, 10, 8, 6', rest: '90s', notes: 'Full depth, chest up' },
    { name: 'Deadlifts', sets: 3, reps: '8, 6, 4', rest: '120s', notes: 'Keep back straight' },
    { name: 'Push-ups', sets: 3, reps: '15, 12, 10', rest: '60s', notes: 'Full range of motion' },
    { name: 'Pull-ups', sets: 3, reps: '8, 6, 4', rest: '90s', notes: 'Assisted if needed' },
    { name: 'Plank', sets: 3, reps: '60 seconds', rest: '45s', notes: 'Hold position' }
  ];

  const programName = isStrength ? 'Strength Builder Pro' : isCardio ? 'Cardio Blast' : 'Full Body Fitness';
  const programDescription = isStrength 
    ? 'A comprehensive strength training program designed to build muscle and increase power through progressive overload.'
    : isCardio 
    ? 'High-intensity cardio program to boost endurance and burn calories effectively.'
    : 'Balanced full-body workout program targeting all major muscle groups for overall fitness.';

  return {
    programName,
    programDescription,
    weeks: [
      {
        week: 1,
        days: [
          {
            day: 1,
            title: isFullBody ? 'Full Body' : isStrength ? 'Upper Body' : 'Cardio',
            exercises: exercises.slice(0, 4).map((ex, i) => ({
              circuit: String.fromCharCode(65 + i), 
              exerciseName: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              rest: ex.rest,
              notes: ex.notes
            }))
          },
          {
            day: 2,
            title: isFullBody ? 'Full Body' : isStrength ? 'Lower Body' : 'HIIT',
            exercises: exercises.slice(2, 6).map((ex, i) => ({
              circuit: String.fromCharCode(65 + i),
              exerciseName: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              rest: ex.rest,
              notes: ex.notes
            }))
          },
          {
            day: 3,
            title: 'Rest',
            exercises: []
          },
          {
            day: 4,
            title: isFullBody ? 'Full Body' : isStrength ? 'Upper Body' : 'Endurance',
            exercises: exercises.slice(0, 3).map((ex, i) => ({
              circuit: String.fromCharCode(65 + i),
              exerciseName: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              rest: ex.rest,
              notes: ex.notes
            }))
          }
        ]
      },
      {
        week: 2,
        days: [
          {
            day: 1,
            title: isFullBody ? 'Full Body' : isStrength ? 'Upper Body' : 'Cardio',
            exercises: exercises.slice(1, 5).map((ex, i) => ({
              circuit: String.fromCharCode(65 + i),
              exerciseName: ex.name,
              sets: ex.sets + 1, 
              reps: ex.reps,
              rest: ex.rest,
              notes: ex.notes + ' - Week 2 progression'
            }))
          }
        ]
      }
    ]
  };
}

// API Routes
app.post('/api/generate-workout', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt is required' });
    }

    const workoutPlan = await generateWorkoutPlanWithAI(prompt);
    
    // Save to database
    if (db) {
      try {
        const result = await db.collection(COLLECTION_NAME).insertOne({
          prompt: prompt,
          programName: workoutPlan.programName,
          programDescription: workoutPlan.programDescription,
          workoutData: workoutPlan,
          createdAt: new Date()
        });
        console.log('✅ Workout plan saved to database with ID:', result.insertedId);
      } catch (dbError) {
        console.error('❌ Database save error:', dbError);
      }
    }
    
    res.json(workoutPlan);
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ error: 'Failed to generate workout plan' });
  }
});

// Get all saved workout plans
app.get('/api/workout-plans', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const plans = await db.collection(COLLECTION_NAME).find({}).sort({ createdAt: -1 }).toArray();
    res.json(plans);
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    res.status(500).json({ error: 'Failed to fetch workout plans' });
  }
});

// Get specific workout plan by ID
app.get('/api/workout-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    // Convert string ID to ObjectId
    const { ObjectId } = await import('mongodb');
    const objectId = new ObjectId(id);

    const plan = await db.collection(COLLECTION_NAME).findOne({ _id: objectId });
    
    if (!plan) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({ error: 'Failed to fetch workout plan' });
  }
});

// Update workout plan by ID
app.put('/api/workout-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { workoutData } = req.body;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    if (!workoutData) {
      return res.status(400).json({ error: 'Workout data is required' });
    }

    // Convert string ID to ObjectId
    const { ObjectId } = await import('mongodb');
    const objectId = new ObjectId(id);

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: objectId },
      { 
        $set: { 
          workoutData: workoutData,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    res.json({ message: 'Workout plan updated successfully' });
  } catch (error) {
    console.error('Error updating workout plan:', error);
    res.status(500).json({ error: 'Failed to update workout plan' });
  }
});

// Delete workout plan by ID
app.delete('/api/workout-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    // Convert string ID to ObjectId
    const { ObjectId } = await import('mongodb');
    const objectId = new ObjectId(id);

    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    res.json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    res.status(500).json({ error: 'Failed to delete workout plan' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: db ? 'Connected' : 'Not connected',
    databaseType: 'MongoDB'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  if (!CLAUDE_API_KEY) {
    console.log('⚠️  No Claude API key found. Using mock data.');
  }
}); 