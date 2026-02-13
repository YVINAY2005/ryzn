export interface AgentStepResult {
  version?: number;
  plan?: any;
  code?: string;
  explanation?: string;
  thinking?: string[];
}

export class UIAgent {
  private apiUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001') + '/api';

  async run(message: string, mode: 'new' | 'modify' = 'new', currentCode: string = ''): Promise<AgentStepResult> {
    try {
      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, mode, currentCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch from backend');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Frontend Agent Error:', error);
      return {
        explanation: `Error: ${error.message || 'Failed to connect to backend server'}.`,
        thinking: ["Error encountered during communication with backend."]
      };
    }
  }

  async getVersions(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching versions:', error);
      return [];
    }
  }
}
