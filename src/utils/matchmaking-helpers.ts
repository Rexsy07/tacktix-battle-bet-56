
/**
 * Helper functions for the matchmaking page
 */

export const formatTimeRemaining = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const timeOpen = now.getTime() - created.getTime();
  const minutesOpen = Math.floor(timeOpen / (1000 * 60));
  
  if (minutesOpen < 60) {
    return `${minutesOpen}m`;
  } else {
    const hoursOpen = Math.floor(minutesOpen / 60);
    const remainingMinutes = minutesOpen % 60;
    return `${hoursOpen}h ${remainingMinutes}m`;
  }
};

/**
 * Generate a random lobby code
 */
export const generateLobbyCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
