import { DEFAULT_GST_RATE } from "@/lib/constants";

export interface GSTBreakdown {
  subtotal: number;
  gstRate: number;
  isInterState: boolean;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grandTotal: number;
}

/**
 * Calculate GST breakdown based on whether transaction is intra-state or inter-state.
 * Intra-state: CGST (9%) + SGST (9%) = 18%
 * Inter-state: IGST (18%)
 */
export function calculateGST(
  subtotal: number,
  isInterState: boolean = false,
  gstRate: number = DEFAULT_GST_RATE
): GSTBreakdown {
  const totalGst = Math.round((subtotal * gstRate) / 100);

  if (isInterState) {
    return {
      subtotal,
      gstRate,
      isInterState,
      cgst: 0,
      sgst: 0,
      igst: totalGst,
      totalGst,
      grandTotal: subtotal + totalGst,
    };
  }

  const halfGst = Math.round(totalGst / 2);
  return {
    subtotal,
    gstRate,
    isInterState,
    cgst: halfGst,
    sgst: totalGst - halfGst, // Handle odd rounding
    igst: 0,
    totalGst,
    grandTotal: subtotal + totalGst,
  };
}

/**
 * Determine if transaction is inter-state by comparing state codes.
 * State code is the first 2 digits of a GSTIN.
 */
export function isInterStateTransaction(
  sellerGstin?: string,
  buyerGstin?: string
): boolean {
  if (!sellerGstin || !buyerGstin) return false;
  const sellerState = sellerGstin.substring(0, 2);
  const buyerState = buyerGstin.substring(0, 2);
  return sellerState !== buyerState;
}
