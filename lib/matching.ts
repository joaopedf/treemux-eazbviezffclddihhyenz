import { prisma } from './prisma';

interface TaskMatchInput {
  taskId: string;
  category: string;
  latitude: number;
  longitude: number;
  price: number;
}

interface UserMatchProfile {
  id: string;
  skills: string[];
  latitude?: number | null;
  longitude?: number | null;
  totalRating: number;
  reviewCount: number;
  completedTasks: number;
}

// Calculate match score between a user and a task
export function calculateMatchScore(
  user: UserMatchProfile,
  task: TaskMatchInput
): number {
  let score = 0;
  let weightSum = 0;

  // 1. Skill matching (weight: 0.35)
  const skillWeight = 0.35;
  if (user.skills.length > 0) {
    const hasMatchingSkill = user.skills.some((skill) =>
      task.category.toLowerCase().includes(skill.toLowerCase())
    );
    score += hasMatchingSkill ? skillWeight * 100 : 0;
  }
  weightSum += skillWeight;

  // 2. Location proximity (weight: 0.30)
  const locationWeight = 0.30;
  if (user.latitude && user.longitude) {
    const distance = calculateDistance(
      user.latitude,
      user.longitude,
      task.latitude,
      task.longitude
    );
    // Closer is better - exponential decay
    const locationScore = Math.exp(-distance / 10) * 100;
    score += locationScore * locationWeight;
  }
  weightSum += locationWeight;

  // 3. Reputation score (weight: 0.20)
  const reputationWeight = 0.20;
  if (user.reviewCount > 0) {
    // Rating is 0-5, normalize to 0-100
    const reputationScore = (user.totalRating / 5) * 100;
    score += reputationScore * reputationWeight;
  } else {
    // New users get a moderate score
    score += 60 * reputationWeight;
  }
  weightSum += reputationWeight;

  // 4. Experience (completed tasks) (weight: 0.15)
  const experienceWeight = 0.15;
  const experienceScore = Math.min(user.completedTasks * 5, 100);
  score += experienceScore * experienceWeight;
  weightSum += experienceWeight;

  // Normalize to 0-100
  return score / weightSum;
}

// Find best matching users for a task
export async function findMatchingUsers(
  taskId: string,
  limit: number = 10
): Promise<Array<{ userId: string; score: number }>> {
  // Get task details
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Get all available users (exclude task requester)
  const users = await prisma.user.findMany({
    where: {
      id: { not: task.requesterId },
    },
    select: {
      id: true,
      skills: true,
      latitude: true,
      longitude: true,
      totalRating: true,
      reviewCount: true,
      completedTasks: true,
    },
  });

  // Calculate match scores
  const matches = users.map((user) => {
    const userProfile: UserMatchProfile = {
      id: user.id,
      skills: user.skills ? JSON.parse(user.skills) : [],
      latitude: user.latitude,
      longitude: user.longitude,
      totalRating: user.totalRating,
      reviewCount: user.reviewCount,
      completedTasks: user.completedTasks,
    };

    const score = calculateMatchScore(userProfile, {
      taskId: task.id,
      category: task.category,
      latitude: task.latitude,
      longitude: task.longitude,
      price: task.price,
    });

    return { userId: user.id, score };
  });

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  // Take top N and record in match history
  const topMatches = matches.slice(0, limit);

  // Save match history for ML learning
  if (topMatches.length > 0) {
    await prisma.matchHistory.createMany({
      data: topMatches.map((match) => ({
        userId: match.userId,
        taskId: task.id,
        matchScore: match.score,
      })),
    });
  }

  return topMatches;
}

// Get personalized task recommendations for a user
export async function getPersonalizedTasks(
  userId: string,
  limit: number = 10
): Promise<Array<{ taskId: string; score: number }>> {
  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      skills: true,
      latitude: true,
      longitude: true,
      totalRating: true,
      reviewCount: true,
      completedTasks: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const userProfile: UserMatchProfile = {
    id: user.id,
    skills: user.skills ? JSON.parse(user.skills) : [],
    latitude: user.latitude,
    longitude: user.longitude,
    totalRating: user.totalRating,
    reviewCount: user.reviewCount,
    completedTasks: user.completedTasks,
  };

  // Get available tasks
  const tasks = await prisma.task.findMany({
    where: {
      status: 'open',
      requesterId: { not: userId },
    },
  });

  // Calculate match scores
  const matches = tasks.map((task) => {
    const score = calculateMatchScore(userProfile, {
      taskId: task.id,
      category: task.category,
      latitude: task.latitude,
      longitude: task.longitude,
      price: task.price,
    });

    return { taskId: task.id, score };
  });

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, limit);
}

// Update match history when user accepts/rejects a task
export async function updateMatchFeedback(
  userId: string,
  taskId: string,
  wasAccepted: boolean
): Promise<void> {
  await prisma.matchHistory.updateMany({
    where: {
      userId,
      taskId,
    },
    data: {
      wasAccepted,
    },
  });
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
