import { parseAIResponse } from '@/lib/ai/generate';

describe('AI Generator', () => {
  it('parses valid JSON successfully', () => {
    const jsonString = '```json\n{"total": 1000, "client_name": "Test Client"}\n```';
    const result = parseAIResponse(jsonString);
    expect(result.total).toBe(1000);
    expect(result.client_name).toBe('Test Client');
  });

  it('handles JSON without markdown codeblocks', () => {
    const jsonString = '{"total": 2000, "client_name": "Acme Corp"}';
    const result = parseAIResponse(jsonString);
    expect(result.total).toBe(2000);
    expect(result.client_name).toBe('Acme Corp');
  });

  it('throws an error on invalid JSON', () => {
    const jsonString = 'This is not JSON';
    expect(() => parseAIResponse(jsonString)).toThrow('Failed to parse AI response as JSON');
  });
});
