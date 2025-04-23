// Define interfaces for our data models
export interface Message {
  id: string;
  channelId: string;
  text: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  file: string;
  memberRead: string[];
  memberUnread: string[];
}

export interface Channel {
  id: string;
  name: string;
  desc?: string;
  isPrivate: boolean;
  createdBy: string;
  members?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface MenuAction {
  title: string;
  systemIcon: string;
  onPress: () => void;
}
