export interface ConversationUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  lastReadAt: string | null;
  user: ConversationUser;
}

export interface MessagePreview {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: MessagePreview[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
