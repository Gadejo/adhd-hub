/**
 * XP and Level System for ADHD Hub
 * 
 * Simple, transparent progression system to gamify learning activities.
 */

export interface XPGain {
  amount: number;
  reason: string;
}

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressToNext: number; // 0-1
}

/**
 * XP Rules:
 * - +2 XP per 5 minutes of study (rounded down)
 * - +5 XP for creating a new resource with priority High (1)
 * - +10 XP for marking a goal Completed
 */
export const XP_RULES = {
  STUDY_MINUTES_PER_XP: 5,
  XP_PER_STUDY_BLOCK: 2,
  HIGH_PRIORITY_RESOURCE: 5,
  COMPLETED_GOAL: 10
} as const;

/**
 * Calculate XP gained from a study session
 * Rule: +2 XP per 5 minutes of study (rounded down)
 */
export function calculateSessionXP(durationMinutes: number): XPGain {
  const xpBlocks = Math.floor(durationMinutes / XP_RULES.STUDY_MINUTES_PER_XP);
  const amount = xpBlocks * XP_RULES.XP_PER_STUDY_BLOCK;
  
  return {
    amount,
    reason: `${durationMinutes} minutes of study (${xpBlocks} blocks)`
  };
}

/**
 * Calculate XP for creating a high-priority resource
 * Rule: +5 XP for creating a new resource with priority High (1)
 */
export function calculateResourceXP(priority: number): XPGain | null {
  if (priority === 1) { // High priority
    return {
      amount: XP_RULES.HIGH_PRIORITY_RESOURCE,
      reason: 'Created high-priority resource'
    };
  }
  return null;
}

/**
 * Calculate XP for completing a goal
 * Rule: +10 XP for marking a goal Completed
 */
export function calculateGoalCompletionXP(): XPGain {
  return {
    amount: XP_RULES.COMPLETED_GOAL,
    reason: 'Completed a goal'
  };
}

/**
 * Level Formula: Level = floor(sqrt(XP) / 2) + 1
 * This creates a smooth progression curve where each level requires more XP
 */
export function calculateLevel(totalXP: number): LevelInfo {
  const level = Math.floor(Math.sqrt(totalXP) / 2) + 1;
  
  // Calculate XP thresholds
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  
  // Progress to next level (0-1)
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressToNext = Math.min(1, Math.max(0, xpInCurrentLevel / xpNeededForNextLevel));
  
  return {
    level,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    progressToNext
  };
}

/**
 * Get the minimum XP required for a specific level
 * Inverse of level formula: XP = (2 * (level - 1))^2
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(2 * (level - 1), 2);
}

/**
 * Calculate streak based on study sessions
 * Streak continues if user studies at least once per day
 * Resets if gap is >1 day
 */
export function calculateStreak(sessions: Array<{ startedAt: Date; durationMin: number }>): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Group sessions by date and calculate daily totals
  const dailyMinutes = new Map<string, number>();
  sessions.forEach(session => {
    const date = new Date(session.startedAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.getTime().toString();
    
    const existing = dailyMinutes.get(dateKey) || 0;
    dailyMinutes.set(dateKey, existing + session.durationMin);
  });

  // Get all study dates (days with >0 minutes) in descending order
  const studyDates = Array.from(dailyMinutes.entries())
    .filter(([_, minutes]) => minutes > 0)
    .map(([dateKey, _]) => parseInt(dateKey))
    .sort((a, b) => b - a); // Most recent first

  if (studyDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check current streak from today backwards
  for (let i = 0; i < studyDates.length; i++) {
    const expectedDate = todayTime - (i * 24 * 60 * 60 * 1000);
    
    if (studyDates[i] === expectedDate) {
      if (i === 0 || currentStreak === i) {
        currentStreak++;
      }
    } else if (i === 0) {
      // If no study today, check yesterday
      const yesterdayTime = todayTime - (24 * 60 * 60 * 1000);
      if (studyDates[0] === yesterdayTime) {
        currentStreak = 1;
      }
      break;
    } else {
      break;
    }
  }

  // Calculate longest streak ever
  tempStreak = 1;
  longestStreak = 1;
  
  for (let i = 1; i < studyDates.length; i++) {
    const currentDate = studyDates[i];
    const previousDate = studyDates[i - 1];
    const daysDiff = (previousDate - currentDate) / (24 * 60 * 60 * 1000);
    
    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Simulate sessions for testing XP and level calculations
 */
export function simulateXPGrowth(): void {
  console.log('🧪 XP System Simulation');
  console.log('========================');
  
  let totalXP = 0;
  const scenarios = [
    { minutes: 25, description: 'Pomodoro session' },
    { minutes: 15, description: 'Quick study' },
    { minutes: 45, description: 'Deep focus session' },
    { minutes: 60, description: 'Hour-long study' },
    { minutes: 3, description: 'Brief review (no XP)' }
  ];

  scenarios.forEach(scenario => {
    const xpGain = calculateSessionXP(scenario.minutes);
    totalXP += xpGain.amount;
    const levelInfo = calculateLevel(totalXP);
    
    console.log(`📚 ${scenario.description} (${scenario.minutes}m)`);
    console.log(`   +${xpGain.amount} XP | Total: ${totalXP} XP`);
    console.log(`   Level ${levelInfo.level} (${Math.round(levelInfo.progressToNext * 100)}% to next)`);
    console.log('');
  });

  // Test other XP sources
  console.log('🎯 Other XP Sources:');
  const resourceXP = calculateResourceXP(1);
  if (resourceXP) {
    totalXP += resourceXP.amount;
    console.log(`📝 ${resourceXP.reason}: +${resourceXP.amount} XP`);
  }

  const goalXP = calculateGoalCompletionXP();
  totalXP += goalXP.amount;
  console.log(`✅ ${goalXP.reason}: +${goalXP.amount} XP`);

  const finalLevel = calculateLevel(totalXP);
  console.log('');
  console.log('🏆 Final Results:');
  console.log(`   Total XP: ${totalXP}`);
  console.log(`   Level: ${finalLevel.level}`);
  console.log(`   Progress: ${Math.round(finalLevel.progressToNext * 100)}%`);
  console.log(`   Next level at: ${finalLevel.xpForNextLevel} XP`);
  console.log(`   XP needed: ${finalLevel.xpForNextLevel - totalXP}`);
}

/**
 * Get a motivational message based on level
 */
export function getLevelMessage(level: number): string {
  if (level === 1) return 'Getting started! 🌱';
  if (level <= 3) return 'Building momentum! 🚀';
  if (level <= 5) return 'On a roll! ⭐';
  if (level <= 10) return 'Learning machine! 🔥';
  if (level <= 15) return 'Knowledge seeker! 🧠';
  if (level <= 20) return 'Study master! 👑';
  return 'Legendary learner! 🏆';
}