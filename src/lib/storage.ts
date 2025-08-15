import type { AppData, Resource, Session, Goal, Settings, Subject } from './models.js';

const STORAGE_KEY = 'adhd-hub-data';

const defaultSettings: Settings = {
  theme: 'dark',
  xp: 0,
  level: 1,
  streak: 0
};

const defaultSubjectTemplates: Subject[] = [
  {
    id: 'template-math',
    name: 'Mathematics',
    description: 'Algebra, Calculus, Statistics, and other math topics',
    color: '#3B82F6',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-science',
    name: 'Science',
    description: 'Physics, Chemistry, Biology, and other sciences',
    color: '#10B981',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-language',
    name: 'Language Arts',
    description: 'Literature, Writing, Reading, and language studies',
    color: '#8B5CF6',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-history',
    name: 'History',
    description: 'World History, Geography, Social Studies',
    color: '#F59E0B',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-programming',
    name: 'Programming',
    description: 'Software Development, Web Development, Data Science',
    color: '#EF4444',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-business',
    name: 'Business',
    description: 'Economics, Finance, Management, Marketing',
    color: '#06B6D4',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const defaultData: AppData = {
  resources: [],
  sessions: [],
  goals: [],
  subjects: defaultSubjectTemplates,
  settings: defaultSettings
};

function deserializeDates(data: AppData): AppData {
  return {
    ...data,
    resources: data.resources.map(r => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      nextReviewDate: r.nextReviewDate ? new Date(r.nextReviewDate) : undefined
    })),
    sessions: data.sessions.map(s => ({
      ...s,
      startedAt: new Date(s.startedAt)
    })),
    goals: data.goals.map(g => ({
      ...g,
      dueDate: new Date(g.dueDate),
      createdAt: new Date(g.createdAt),
      updatedAt: new Date(g.updatedAt)
    })),
    subjects: (data.subjects || defaultSubjectTemplates).map(s => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      stats: {
        ...s.stats,
        lastStudied: s.stats.lastStudied ? new Date(s.stats.lastStudied) : undefined
      }
    }))
  };
}

export function getAll(): AppData {
  if (typeof localStorage === 'undefined') {
    return defaultData;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultData;
    }
    
    const parsed = JSON.parse(stored);
    return deserializeDates({ ...defaultData, ...parsed });
  } catch (error) {
    console.error('Failed to parse stored data:', error);
    return defaultData;
  }
}

export function setAll(data: AppData): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

export function exportJSON(): string {
  const data = getAll();
  return JSON.stringify(data, null, 2);
}

export function importJSON(jsonString: string): AppData {
  try {
    const parsed = JSON.parse(jsonString);
    const data = deserializeDates({ ...defaultData, ...parsed });
    setAll(data);
    return data;
  } catch (error) {
    console.error('Failed to import JSON:', error);
    throw new Error('Invalid JSON format');
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function saveResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Resource {
  const data = getAll();
  const now = new Date();
  const newResource: Resource = {
    ...resource,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  data.resources.push(newResource);
  setAll(data);
  return newResource;
}

export function updateResource(id: string, updates: Partial<Resource>): Resource | null {
  const data = getAll();
  const index = data.resources.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  data.resources[index] = {
    ...data.resources[index],
    ...updates,
    updatedAt: new Date()
  };
  
  setAll(data);
  return data.resources[index];
}

export function deleteResource(id: string): boolean {
  const data = getAll();
  const index = data.resources.findIndex(r => r.id === id);
  
  if (index === -1) return false;
  
  data.resources.splice(index, 1);
  setAll(data);
  return true;
}

export function saveSession(session: Omit<Session, 'id'>): Session {
  const data = getAll();
  const newSession: Session = {
    ...session,
    id: generateId()
  };
  
  data.sessions.push(newSession);
  setAll(data);
  return newSession;
}

export function saveGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal {
  const data = getAll();
  const now = new Date();
  const newGoal: Goal = {
    ...goal,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  data.goals.push(newGoal);
  setAll(data);
  return newGoal;
}

export function updateGoal(id: string, updates: Partial<Goal>): Goal | null {
  const data = getAll();
  const index = data.goals.findIndex(g => g.id === id);
  
  if (index === -1) return null;
  
  data.goals[index] = {
    ...data.goals[index],
    ...updates,
    updatedAt: new Date()
  };
  
  setAll(data);
  return data.goals[index];
}

export function deleteGoal(id: string): boolean {
  const data = getAll();
  const index = data.goals.findIndex(g => g.id === id);
  
  if (index === -1) return false;
  
  data.goals.splice(index, 1);
  setAll(data);
  return true;
}

export function updateSettings(updates: Partial<Settings>): Settings {
  const data = getAll();
  data.settings = { ...data.settings, ...updates };
  setAll(data);
  return data.settings;
}

export function saveSubject(subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Subject {
  const data = getAll();
  const now = new Date();
  const newSubject: Subject = {
    ...subject,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  data.subjects.push(newSubject);
  setAll(data);
  return newSubject;
}

export function updateSubject(id: string, updates: Partial<Subject>): Subject | null {
  const data = getAll();
  const index = data.subjects.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  data.subjects[index] = {
    ...data.subjects[index],
    ...updates,
    updatedAt: new Date()
  };
  
  setAll(data);
  return data.subjects[index];
}

export function deleteSubject(id: string): boolean {
  const data = getAll();
  const index = data.subjects.findIndex(s => s.id === id);
  
  if (index === -1) return false;
  
  // Don't allow deletion of template subjects
  if (data.subjects[index].isTemplate) return false;
  
  data.subjects.splice(index, 1);
  setAll(data);
  return true;
}

export function createSubjectFromTemplate(templateId: string, customName?: string): Subject | null {
  const data = getAll();
  const template = data.subjects.find(s => s.id === templateId && s.isTemplate);
  
  if (!template) return null;
  
  const now = new Date();
  const newSubject: Subject = {
    ...template,
    id: generateId(),
    name: customName || template.name,
    isTemplate: false,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: now,
    updatedAt: now
  };
  
  data.subjects.push(newSubject);
  setAll(data);
  return newSubject;
}

export function updateSubjectStats(): void {
  const data = getAll();
  
  // Update stats for each subject
  data.subjects.forEach(subject => {
    if (subject.isTemplate) return; // Skip templates
    
    // Calculate resource stats
    const subjectResources = data.resources.filter(r => r.subject === subject.name);
    subject.stats.totalResources = subjectResources.length;
    subject.stats.completedResources = subjectResources.filter(r => r.status === 'completed').length;
    
    // Calculate goal stats
    const subjectGoals = data.goals.filter(g => g.subject === subject.name);
    subject.stats.totalGoals = subjectGoals.length;
    subject.stats.completedGoals = subjectGoals.filter(g => g.status === 'completed').length;
    
    // Calculate study time and last studied
    const subjectSessions = data.sessions.filter(s => s.subject === subject.name);
    subject.stats.totalStudyTime = subjectSessions.reduce((sum, s) => sum + s.durationMin, 0);
    
    const lastSession = subjectSessions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
    subject.stats.lastStudied = lastSession ? new Date(lastSession.startedAt) : undefined;
    
    subject.updatedAt = new Date();
  });
  
  setAll(data);
}