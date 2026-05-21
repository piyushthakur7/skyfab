/**
 * Delhivery Logistics Service
 *
 * Provides pincode serviceability checks, shipping rate estimation,
 * and shipment tracking via the secure /api/delhivery proxy.
 *
 * In development, calls go directly to the Delhivery API through a
 * Vite dev-server proxy. In production, they go through the Vercel
 * serverless function that injects the token server-side.
 */

const isDev = import.meta.env.DEV;

// In dev we proxy through Vite; in prod through the Vercel serverless fn
const buildUrl = () => (isDev ? '/api/delhivery' : '/api/delhivery');

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PincodeResult {
  pin: number;
  city: string;
  state_code: string;
  district: string;
  country: string;
  cod: string;          // "Y" | "N"
  prepaid: string;      // "Y" | "N"
  pickup: string;       // "Y" | "N"
  repl: string;         // "Y" | "N"
  is_oda: string;       // "Y" | "N"  (Out of Delivery Area)
  sort_code: string;
  max_weight: number;
  max_amount: number;
  pre_paid_amount: number;
}

export interface ServiceabilityResponse {
  serviceable: boolean;
  cod: boolean;
  prepaid: boolean;
  city: string;
  state: string;
  district: string;
  raw?: PincodeResult;
}

export interface ShippingRate {
  totalAmount: number;
  chargedWeight: number;
  zone: string;
  raw?: any;
}

export interface TrackingStatus {
  waybill: string;
  status: string;
  statusType: string;      // e.g. "DL" for delivered
  origin: string;
  destination: string;
  currentLocation: string;
  expectedDate: string;
  scans: Array<{
    time: string;
    location: string;
    status: string;
    instructions: string;
  }>;
  raw?: any;
}

// ─────────────────────────────────────────────
// Pincode Serviceability
// ─────────────────────────────────────────────

export async function checkPincode(pincode: string): Promise<ServiceabilityResponse> {
  try {
    const url = `${buildUrl()}?action=pincode&filter_codes=${pincode}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Delhivery API error: ${res.status}`);

    const data = await res.json();

    // Delhivery returns { delivery_codes: [{ postal_code: { ... } }] }
    const codes = data?.delivery_codes;
    if (!codes || codes.length === 0) {
      return {
        serviceable: false,
        cod: false,
        prepaid: false,
        city: '',
        state: '',
        district: '',
      };
    }

    const pc: PincodeResult = codes[0].postal_code;
    return {
      serviceable: true,
      cod: pc.cod === 'Y',
      prepaid: pc.prepaid === 'Y',
      city: pc.city || '',
      state: pc.state_code || '',
      district: pc.district || '',
      raw: pc,
    };
  } catch (err: any) {
    console.error('[Delhivery] Pincode check failed:', err);
    throw new Error(err.message || 'Unable to verify pincode');
  }
}

// ─────────────────────────────────────────────
// Shipping Rate Calculation
// ─────────────────────────────────────────────

export async function getShippingRate(
  destinationPin: string,
  weightGrams: number = 500,
  mode: 'S' | 'E' = 'S',
  originPin: string = '394325'  // Skyfab Surat warehouse
): Promise<ShippingRate> {
  try {
    const url = `${buildUrl()}?action=rate&d_pin=${destinationPin}&o_pin=${originPin}&cgm=${weightGrams}&md=${mode}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Delhivery rate API error: ${res.status}`);

    const data = await res.json();

    // Delhivery returns an array with charge breakdown
    if (Array.isArray(data) && data.length > 0) {
      const rate = data[0];
      return {
        totalAmount: rate.total_amount ?? 0,
        chargedWeight: rate.charged_weight ?? weightGrams,
        zone: rate.zone ?? '',
        raw: rate,
      };
    }

    return { totalAmount: 0, chargedWeight: weightGrams, zone: '', raw: data };
  } catch (err: any) {
    console.error('[Delhivery] Rate calculation failed:', err);
    throw new Error(err.message || 'Unable to calculate shipping rate');
  }
}

// ─────────────────────────────────────────────
// Shipment Tracking
// ─────────────────────────────────────────────

export async function trackShipment(waybill: string): Promise<TrackingStatus> {
  try {
    const url = `${buildUrl()}?action=track&waybill=${waybill}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Delhivery tracking API error: ${res.status}`);

    const data = await res.json();

    // Delhivery returns { ShipmentData: [{ Shipment: { ... } }] }
    const shipments = data?.ShipmentData;
    if (!shipments || shipments.length === 0) {
      throw new Error('Shipment not found');
    }

    const shipment = shipments[0].Shipment;
    const status = shipment?.Status || {};
    const scans = (shipment?.Scans || []).map((s: any) => {
      const scan = s.ScanDetail;
      return {
        time: scan?.ScanDateTime || '',
        location: scan?.ScannedLocation || '',
        status: scan?.Instructions || '',
        instructions: scan?.Scan || '',
      };
    });

    return {
      waybill: shipment?.AWB || waybill,
      status: status?.Status || 'Unknown',
      statusType: status?.StatusType || '',
      origin: shipment?.Origin || '',
      destination: shipment?.Destination || '',
      currentLocation: status?.StatusLocation || '',
      expectedDate: shipment?.ExpectedDeliveryDate || '',
      scans,
      raw: shipment,
    };
  } catch (err: any) {
    console.error('[Delhivery] Tracking failed:', err);
    throw new Error(err.message || 'Unable to track shipment');
  }
}
