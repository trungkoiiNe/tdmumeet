export interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string;
  role?: 'admin' | 'user';
}

export interface Team {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdBy: string;
  members: string[];
  inviteCode: string;
  createdAt: number;
  updatedAt: number;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  teamId: string;
  createdBy: string;
  participants: string[];
  isRecurring?: boolean;
  meetingLink?: string;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: number;
  };
}

export interface TeamChat {
  id: string;
  teamId: string;
  senderId: string;
  message: string;
  timestamp: number;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
  }[];
  replyTo?: {
    messageId: string;
    preview: string;
  };
  reactions?: {
    [key: string]: string[]; // emoji: userIds[]
  };
}