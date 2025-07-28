# AI-Powered Workout Plan Builder

A full-stack, AI-powered workout plan generator that creates personalized fitness programs based on user descriptions. Built with React, TypeScript, Node.js, and OpenAI API.

## 🚀 Features

- **AI-Powered Generation**: Create custom workout plans using natural language descriptions
- **Interactive UI**: Clean, modern interface with smooth transitions and animations
- **Workout Management**: View, edit, reorder, and delete exercises in your workout plans
- **Multi-Week Programs**: Navigate between different weeks of your training program
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant feedback and loading states

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Query** for data fetching

### Backend
- **Node.js** with Express
- **OpenAI API** for AI-powered workout generation
- **Zod** for data validation
- **CORS** enabled for cross-origin requests

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-workout-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   VITE_API_URL=http://localhost:3001
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

4. **Start the development servers**

   In one terminal, start the backend:
   ```bash
   npm run server
   ```

   In another terminal, start the frontend:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎯 Usage

### Creating a Workout Plan

1. **Enter your description**: Describe the type of workout plan you want (e.g., "A 6-week full-body strength program for beginners")
2. **Click submit**: The AI will generate a personalized workout plan
3. **Review and customize**: Navigate through weeks and days, edit exercises as needed

### Managing Your Workout

- **Navigate weeks**: Use the week buttons to switch between different weeks
- **Reorder exercises**: Use the dropdown menu to move exercises up or down
- **Delete exercises**: Remove exercises you don't want
- **Add exercises**: Add new exercises to any workout day

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── WorkoutPrompt.tsx
│   │   └── WorkoutPlan.tsx
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   └── hooks/              # Custom React hooks
├── server/
│   └── index.js            # Backend API server
├── public/                 # Static assets
└── env.example             # Environment variables template
```

## 🔧 API Endpoints

### POST `/api/generate-workout`
Generates a workout plan based on the provided prompt.

**Request:**
```json
{
  "prompt": "A 6-week full-body strength program for beginners"
}
```

**Response:**
```json
{
  "programName": "Full Body Strength Program",
  "programDescription": "A comprehensive 6-week program...",
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": 1,
          "title": "Upper Body",
          "exercises": [
            {
              "circuit": "A",
              "exerciseName": "Push-ups",
              "sets": 3,
              "reps": "10",
              "rest": "60s",
              "notes": "Focus on form"
            }
          ]
        }
      ]
    }
  ]
}
```

### GET `/api/health`
Health check endpoint.

## 🎨 Design System

The application uses a custom design system with:
- **Primary Color**: Purple (#8B5CF6)
- **Neutral Colors**: Light grays for backgrounds
- **Typography**: Poppins font family
- **Components**: Consistent spacing, shadows, and rounded corners

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform

### Backend Deployment (Railway/Render)
1. Set environment variables on your hosting platform
2. Deploy the `server` folder
3. Update `VITE_API_URL` in your frontend environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- Radix UI for the excellent component library
- Tailwind CSS for the utility-first styling approach
