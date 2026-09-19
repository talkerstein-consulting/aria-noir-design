/* Square Web Payments SDK, as much of it as the checkout and the desk use.
   Loaded on demand by lib/square — see ensureSquare. */
interface SquareTokenResult {
  status: string;
  token?: string;
  errors?: { message?: string }[];
}

interface SquareCard {
  attach(selector: string): Promise<void>;
  tokenize(details: unknown): Promise<SquareTokenResult>;
  destroy(): Promise<boolean>;
}

interface SquareWallet {
  attach?(selector: string, options?: unknown): Promise<void>;
  tokenize(): Promise<SquareTokenResult>;
  destroy?(): Promise<boolean>;
}

interface SquarePayments {
  card(options?: unknown): Promise<SquareCard>;
  paymentRequest(details: unknown): unknown;
  applePay(request: unknown): Promise<SquareWallet>;
  googlePay(request: unknown): Promise<SquareWallet>;
}

interface Window {
  Square?: {
    payments(appId: string, locationId: string): SquarePayments;
  };
}
