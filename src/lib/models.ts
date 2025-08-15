export interface Resource {
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

export interface Session {
  id: string;
  startedAt: Date;
  durationMin: number;
  subject?: string;
  resourceId?: string;
}

export interface Goal {
  id: string;
  name: string;
  subject: string;
  dueDate: Date;
  progressPct: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string; // hex color for visual identification
  isTemplate: boolean; // true for templates, false for custom subjects
  stats: {
    totalStudyTime: number; // in minutes
    totalResources: number;
    completedResources: number;
    totalGoals: number;
    completedGoals: number;
    lastStudied?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  theme: 'dark' | 'light';
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  selectedSubjectId?: string; // currently selected subject on dashboard
}

export interface AppData {
  resources: Resource[];
  sessions: Session[];
  goals: Goal[];
  subjects: Subject[];
  settings: Settings;
}

export type ResourceType = Resource['type'];
export type ResourceStatus = Resource['status'];
export type ResourcePriority = Resource['priority'];
export type GoalStatus = Goal['status'];
export type Theme = Settings['theme'];