import { z } from 'zod';

export const ActionSchema = z.object({
  intent: z.string(),
  action: z.string(),
});

export type ActionPlan = z.infer<typeof ActionSchema>;

export class AIService {
  static async processIntent(text: string): Promise<ActionPlan> {
    const res = await fetch('/api/process-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!res.ok) throw new Error('Action Engine Failure');
    const data = await res.json();
    return data;
  }
}
