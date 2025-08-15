# ADHD Learning Hub

A web app for ADHD-friendly studying with resources management, timer & sessions, goals tracking, and detailed statistics.

## Features

### 📚 **Resource Management**
- CRUD operations for learning resources
- Search and filter by subject, type, priority, status
- "Surprise Me" feature for random resource discovery
- Subject-based organization

### ⏱️ **Study Timer & Sessions**
- Persistent timer that survives page refreshes
- Space bar to start/pause (global keyboard shortcut)
- Link sessions to subjects and resources
- Automatic session logging

### 🎯 **Goals Tracking**
- Create and manage learning goals
- Progress tracking with percentage completion
- Subject-based goal organization

### 📊 **Statistics & Analytics**
- Today/7-day/all-time study statistics
- Study streak tracking
- Resource completion rates
- Subject-specific analytics

### 🎨 **Subject Management**
- Pre-built subject templates (Math, Science, Programming, etc.)
- Create custom subjects with colors
- Subject-specific statistics and filtering
- Template-based subject creation

### ⚙️ **Settings & Data**
- Dark/Light theme toggle
- Export/Import JSON data
- Guest mode (localStorage only)
- Keyboard shortcuts

## Tech Stack

- **Framework**: Astro + TypeScript
- **Styling**: Tailwind CSS + Tailwind Forms
- **Data**: localStorage (guest mode)
- **Icons**: Heroicons (inline SVG)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd adhd-hub
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open browser to `http://localhost:4321`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── GoalCard.astro        # Goal display component
│   ├── ResourceCard.astro    # Resource display component
│   ├── TimerWidget.astro     # Study timer component
│   └── TopBar.astro          # Navigation component
├── layouts/
│   └── Layout.astro          # Base page layout
├── lib/
│   ├── models.ts             # TypeScript interfaces
│   └── storage.ts            # localStorage functions
└── pages/
    ├── index.astro           # Dashboard (/)
    ├── resources.astro       # Resources page (/resources)
    ├── subjects.astro        # Subjects management (/subjects)
    ├── goals.astro           # Goals page (/goals)
    ├── stats.astro           # Statistics page (/stats)
    └── settings.astro        # Settings page (/settings)
```

## Data Models

### Resource
```typescript
{
  id: string;
  title: string;
  url: string;
  subject: string;
  type: 'video' | 'article' | 'book' | 'course' | 'podcast' | 'other';
  priority: 1 | 2 | 3 | 4 | 5;
  notes: string;
  favorite: boolean;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  nextReviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Session
```typescript
{
  id: string;
  startedAt: Date;
  durationMin: number;
  subject?: string;
  resourceId?: string;
}
```

### Goal
```typescript
{
  id: string;
  name: string;
  subject: string;
  dueDate: Date;
  progressPct: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### Subject
```typescript
{
  id: string;
  name: string;
  description?: string;
  color: string;
  isTemplate: boolean;
  stats: {
    totalStudyTime: number;
    totalResources: number;
    completedResources: number;
    totalGoals: number;
    completedGoals: number;
    lastStudied?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Keyboard Shortcuts

- **Space**: Start/pause timer (global, except in input fields)
- **/**: Focus search (on resources page)

## ADHD-Friendly Features

- **Clear Visual Hierarchy**: High contrast, consistent spacing
- **Persistent Timer**: Survives page refreshes and navigation
- **Quick Actions**: One-click "Surprise Me" for resource discovery
- **Progress Tracking**: Visual progress indicators and streaks
- **Subject Organization**: Color-coded subjects for easy identification
- **Accessible Design**: Keyboard shortcuts and screen reader friendly

## Future Roadmap

- Cloud sync with Cloudflare D1
- Email reminders for goals and study sessions
- Focus Mode with website blocking
- AI assistant integration (Ollama)
- Mobile app version

## Development Guidelines

- **Beginner-Friendly**: Code is well-commented and structured
- **TypeScript**: Strict typing for better development experience
- **Responsive**: Mobile-first design with Tailwind
- **Accessible**: ARIA labels and keyboard navigation
- **Performance**: Optimized for fast loading and smooth interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details