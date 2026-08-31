import { createContext, useContext } from "react";

/**
 * CSP nonce, provided only during SSR. On the client this is undefined,
 * which is fine: browsers hide the nonce attribute after parsing, so
 * hydration doesn't mismatch.
 */
export const NonceContext = createContext<string | undefined>(undefined);

export function useNonce(): string | undefined {
  return useContext(NonceContext);
}
