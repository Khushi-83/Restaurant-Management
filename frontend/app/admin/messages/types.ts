export interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  unread: number;
  lastMessage: string;
  pinned?: boolean;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  mine: boolean;
} 