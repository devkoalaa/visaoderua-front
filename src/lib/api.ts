import type { CheckoutPayload, CheckoutResponse, Product } from "@/types";
import { normalizeProduct, type ApiProduct } from "@/lib/products";
import { mockProducts } from "@/data/mock-products";

const DEFAULT_API_URL = process.env.NODE_ENV === "production" ? "https://visaoderua-backend.vercel.app" : "http://localhost:3333";

/** URL do backend (visaoderua-backend). Pode ser sobrescrita por NEXT_PUBLIC_API_URL. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new ApiError(`Falha na requisição (${res.status})`, res.status);
  return (await res.json()) as T;
}

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

/**
 * Catálogo de demonstração: ligado sempre em desenvolvimento e, em produção,
 * apenas com NEXT_PUBLIC_USE_MOCK_CATALOG=true (enquanto o backend não existe).
 */
const USE_MOCK_CATALOG = process.env.NEXT_PUBLIC_USE_MOCK_CATALOG === "true";

/**
 * Busca o catálogo. Se a API não responder e o mock estiver habilitado
 * (dev ou flag em produção), cai no catálogo de demonstração; senão o erro sobe.
 */
export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  if (USE_MOCK_CATALOG && !process.env.NEXT_PUBLIC_API_URL) return mockProducts;
  try {
    const data = await request<ApiProduct[] | { products: ApiProduct[] }>("/api/products", { signal });
    const list = Array.isArray(data) ? data : (data.products ?? []);
    return list.map(normalizeProduct);
  } catch (error) {
    if ((process.env.NODE_ENV === "development" || USE_MOCK_CATALOG) && !isAbort(error)) {
      console.warn("[catalog] API indisponível, usando catálogo de demonstração.");
      return mockProducts;
    }
    throw error;
  }
}

export function createCheckout(payload: CheckoutPayload) {
  return request<CheckoutResponse>("/api/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchOrderStatus(orderId: string, signal?: AbortSignal) {
  return request<{ status: string }>(`/api/orders/${orderId}/status`, { signal });
}

export interface ViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function lookupCep(cep: string, signal?: AbortSignal): Promise<ViaCep | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal });
    if (!res.ok) return null;
    const data = (await res.json()) as ViaCep;
    return data.erro ? null : data;
  } catch {
    return null;
  }
}
