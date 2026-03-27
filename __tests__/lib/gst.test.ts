import { calculateGST, detectInterState } from '@/lib/gst';

describe('GST Calculator', () => {
  describe('calculateGST', () => {
    it('calculates intra-state GST correctly (CGST + SGST)', () => {
      const result = calculateGST(1000, 18, false);
      expect(result.cgst_amount).toBe(90);
      expect(result.sgst_amount).toBe(90);
      expect(result.igst_amount).toBe(0);
      expect(result.total_tax).toBe(180);
    });

    it('calculates inter-state GST correctly (IGST)', () => {
      const result = calculateGST(1000, 18, true);
      expect(result.cgst_amount).toBe(0);
      expect(result.sgst_amount).toBe(0);
      expect(result.igst_amount).toBe(180);
      expect(result.total_tax).toBe(180);
    });

    it('handles zero amount', () => {
      const result = calculateGST(0, 18, false);
      expect(result.total_tax).toBe(0);
    });

    it('handles zero rate', () => {
      const result = calculateGST(1000, 0, false);
      expect(result.total_tax).toBe(0);
    });
  });

  describe('detectInterState', () => {
    it('detects intra-state when state codes match', () => {
      expect(detectInterState('27ABCDE1234F1Z5', '27')).toBe(false); // Both Maharashtra
    });

    it('detects inter-state when state codes differ', () => {
      expect(detectInterState('29ABCDE1234F1Z5', '27')).toBe(true); // Karnataka vs Maharashtra
    });

    it('defaults to intra-state (false) if GSTIN is invalid or missing', () => {
      expect(detectInterState('', '27')).toBe(false);
      expect(detectInterState(undefined as any, '27')).toBe(false);
      expect(detectInterState('INVALID', '27')).toBe(false);
    });
  });
});
