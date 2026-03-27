import { checkRateLimit } from '@/lib/rate-limit';
import { getAdminClient } from '@/lib/supabase/admin';

jest.mock('@/lib/supabase/admin', () => ({
  getAdminClient: jest.fn(),
}));

describe('Rate Limit Checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows generation for Pro users immediately', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { plan: 'pro' },
        error: null,
      }),
    };
    (getAdminClient as jest.Mock).mockReturnValue(mockSupabase);

    const result = await checkRateLimit('user123');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(1000);
  });

  it('checks free tier limits', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { plan: 'free' },
        error: null,
      }),
      count: jest.fn().mockResolvedValue({
        count: 1, // 1 doc used
        error: null,
      }),
    };
    (getAdminClient as jest.Mock).mockReturnValue(mockSupabase);

    const result = await checkRateLimit('user123');
    expect(result.allowed).toBe(true);
    // Assuming limit is 3, used 1 => remaining 2
  });
});
