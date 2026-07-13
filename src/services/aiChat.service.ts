import { api } from '@/api/client';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export async function getAiHistory(): Promise<AiChatMessage[]> {
  const { data } = await api.get('/ai-chat/history');
  const messages = data.data.messages as Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }>;
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.created_at,
  }));
}

export async function sendAiMessage(
  message: string,
  assistantName?: string,
): Promise<{ reply: string; messageId: string; createdAt: string }> {
  const { data } = await api.post('/ai-chat/messages', { message, assistantName });
  return data.data;
}

export async function clearAiHistory(): Promise<void> {
  await api.delete('/ai-chat/history');
}
