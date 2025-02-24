import { Meeting, Team } from "../types";

// Error handling utilities for the app
export class AppError extends Error {
  constructor(
    message: string,
    public code: 'auth' | 'permission' | 'validation' | 'network' | 'unknown',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const validateMeeting = (meeting: Partial<Meeting>): boolean => {
  if (!meeting.title?.trim()) {
    throw new AppError('Meeting title is required', 'validation');
  }
  
  if (!meeting.startTime || !meeting.endTime) {
    throw new AppError('Meeting start and end time are required', 'validation');
  }
  
  if (meeting.startTime >= meeting.endTime) {
    throw new AppError('Meeting end time must be after start time', 'validation');
  }
  
  if (meeting.startTime < Date.now()) {
    throw new AppError('Meeting cannot be scheduled in the past', 'validation');
  }
  
  return true;
};

export const validateTeamAccess = (userId: string, team: Team): boolean => {
  if (!team.members.includes(userId)) {
    throw new AppError('You do not have access to this team', 'permission');
  }
  return true;
};

export const validateMessage = (message: string): boolean => {
  if (!message.trim()) {
    throw new AppError('Message cannot be empty', 'validation');
  }
  
  if (message.length > 1000) {
    throw new AppError('Message is too long (maximum 1000 characters)', 'validation');
  }
  
  return true;
};