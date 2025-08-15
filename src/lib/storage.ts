import type { AppData, Resource, Session, Goal, Settings, Subject } from './models.js';
import { calculateSessionXP, calculateResourceXP, calculateGoalCompletionXP, calculateStreak, calculateLevel } from './xp.js';
import { calculateReviewProgression, calculateSnoozeDate } from './review.js';

const STORAGE_KEY = 'adhd-hub-data';

const defaultSettings: Settings = {
  theme: 'dark',
  xp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0
};

const defaultSubjectTemplates: Subject[] = [
  // Mathematics & Logic
  {
    id: 'template-mathematics',
    name: 'Mathematics',
    description: 'Algebra, Calculus, Geometry, Statistics, Number Theory',
    color: '#3B82F6',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-statistics',
    name: 'Statistics & Data Analysis',
    description: 'Probability, Statistical Analysis, Data Science, R, Python',
    color: '#1E40AF',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Sciences
  {
    id: 'template-chemistry',
    name: 'Chemistry',
    description: 'Organic Chemistry, Inorganic Chemistry, Physical Chemistry, Biochemistry',
    color: '#059669',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-physics',
    name: 'Physics',
    description: 'Classical Mechanics, Quantum Physics, Thermodynamics, Electromagnetism',
    color: '#10B981',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-biology',
    name: 'Biology',
    description: 'Cell Biology, Genetics, Ecology, Molecular Biology, Anatomy',
    color: '#16A34A',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Programming & Technology
  {
    id: 'template-programming',
    name: 'Programming',
    description: 'Software Development, Algorithms, Data Structures, Design Patterns',
    color: '#DC2626',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-web-development',
    name: 'Web Development',
    description: 'HTML, CSS, JavaScript, React, Node.js, Full-Stack Development',
    color: '#EF4444',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-computer-science',
    name: 'Computer Science',
    description: 'Algorithms, Data Structures, Operating Systems, Computer Networks',
    color: '#B91C1C',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Languages
  {
    id: 'template-japanese',
    name: 'Japanese',
    description: 'Hiragana, Katakana, Kanji, Grammar, Conversation, JLPT Preparation',
    color: '#DC143C',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-english',
    name: 'English',
    description: 'Grammar, Literature, Writing, Reading Comprehension, Vocabulary',
    color: '#7C3AED',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-spanish',
    name: 'Spanish',
    description: 'Grammar, Conversation, Vocabulary, Culture, DELE Preparation',
    color: '#8B5CF6',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-french',
    name: 'French',
    description: 'Grammar, Pronunciation, Literature, Conversation, DELF/DALF',
    color: '#9333EA',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Business & Economics
  {
    id: 'template-business',
    name: 'Business Administration',
    description: 'Management, Strategy, Operations, Leadership, Entrepreneurship',
    color: '#0891B2',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-economics',
    name: 'Economics',
    description: 'Microeconomics, Macroeconomics, Econometrics, Financial Markets',
    color: '#06B6D4',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-finance',
    name: 'Finance',
    description: 'Corporate Finance, Investment Analysis, Financial Modeling, Trading',
    color: '#0EA5E9',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Social Sciences & Humanities
  {
    id: 'template-history',
    name: 'History',
    description: 'World History, Ancient Civilizations, Modern History, Historical Analysis',
    color: '#D97706',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-psychology',
    name: 'Psychology',
    description: 'Cognitive Psychology, Social Psychology, Developmental Psychology, Research Methods',
    color: '#F59E0B',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-philosophy',
    name: 'Philosophy',
    description: 'Ethics, Logic, Metaphysics, Political Philosophy, History of Philosophy',
    color: '#EAB308',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Creative & Arts
  {
    id: 'template-art',
    name: 'Art & Design',
    description: 'Drawing, Painting, Digital Art, Graphic Design, Art History',
    color: '#EC4899',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-music',
    name: 'Music',
    description: 'Music Theory, Instrument Practice, Composition, Music History',
    color: '#F472B6',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Professional Skills
  {
    id: 'template-project-management',
    name: 'Project Management',
    description: 'Agile, Scrum, Risk Management, Planning, Team Leadership',
    color: '#64748B',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-digital-marketing',
    name: 'Digital Marketing',
    description: 'SEO, Social Media, Content Marketing, Analytics, PPC Advertising',
    color: '#475569',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Health & Fitness
  {
    id: 'template-health-fitness',
    name: 'Health & Fitness',
    description: 'Exercise Science, Nutrition, Wellness, Sports Medicine, Personal Training',
    color: '#16A34A',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Other Popular Subjects
  {
    id: 'template-cooking',
    name: 'Cooking & Culinary Arts',
    description: 'Cooking Techniques, Baking, International Cuisine, Food Science',
    color: '#F97316',
    isTemplate: true,
    stats: { totalStudyTime: 0, totalResources: 0, completedResources: 0, totalGoals: 0, completedGoals: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-photography',
    name: 'Photography',
    description: 'Camera Techniques, Composition, Post-Processing, Studio Lighting',
    color: '#84CC16',
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
  
  // Grant XP for high-priority resources
  const xpGain = calculateResourceXP(newResource.priority);
  if (xpGain) {
    data.settings.xp += xpGain.amount;
    
    // Update level based on new XP
    const levelInfo = calculateLevel(data.settings.xp);
    data.settings.level = levelInfo.level;
    
    console.log(`🎉 +${xpGain.amount} XP: ${xpGain.reason}`);
    console.log(`📈 Level ${levelInfo.level} (${Math.round(levelInfo.progressToNext * 100)}% to next)`);
  }
  
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
  
  // Grant XP for the session
  const xpGain = calculateSessionXP(newSession.durationMin);
  data.settings.xp += xpGain.amount;
  
  // Update level based on new XP
  const levelInfo = calculateLevel(data.settings.xp);
  data.settings.level = levelInfo.level;
  
  // Update streak
  const streakInfo = calculateStreak(data.sessions);
  data.settings.streak = streakInfo.currentStreak;
  data.settings.longestStreak = Math.max(data.settings.longestStreak, streakInfo.longestStreak);
  
  setAll(data);
  
  // Log XP gain for user feedback
  if (xpGain.amount > 0) {
    console.log(`🎉 +${xpGain.amount} XP: ${xpGain.reason}`);
    console.log(`📈 Level ${levelInfo.level} (${Math.round(levelInfo.progressToNext * 100)}% to next)`);
  }
  
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
  
  const oldGoal = data.goals[index];
  const updatedGoal = {
    ...oldGoal,
    ...updates,
    updatedAt: new Date()
  };
  
  data.goals[index] = updatedGoal;
  
  // Grant XP for completing a goal
  if (oldGoal.status !== 'completed' && updatedGoal.status === 'completed') {
    const xpGain = calculateGoalCompletionXP();
    data.settings.xp += xpGain.amount;
    
    // Update level based on new XP
    const levelInfo = calculateLevel(data.settings.xp);
    data.settings.level = levelInfo.level;
    
    console.log(`🎉 +${xpGain.amount} XP: ${xpGain.reason}`);
    console.log(`📈 Level ${levelInfo.level} (${Math.round(levelInfo.progressToNext * 100)}% to next)`);
  }
  
  setAll(data);
  return updatedGoal;
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

export function reviewResource(id: string): Resource | null {
  const data = getAll();
  const index = data.resources.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const resource = data.resources[index];
  const reviewResult = calculateReviewProgression(resource);
  
  data.resources[index] = {
    ...resource,
    status: reviewResult.status,
    nextReviewDate: reviewResult.nextReviewDate,
    lastReviewInterval: reviewResult.lastReviewInterval,
    updatedAt: new Date()
  };
  
  setAll(data);
  return data.resources[index];
}

export function snoozeResource(id: string): Resource | null {
  const data = getAll();
  const index = data.resources.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const resource = data.resources[index];
  const snoozeDate = calculateSnoozeDate(resource);
  
  data.resources[index] = {
    ...resource,
    nextReviewDate: snoozeDate,
    updatedAt: new Date()
  };
  
  setAll(data);
  return data.resources[index];
}