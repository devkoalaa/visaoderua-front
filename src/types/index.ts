export type ProductLine = "juliet" | "romeo" | "monster-dog" | "minute" | "outros";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  description?: string;
  slug?: string;
  lensColor?: string;
  frameType?: string;
  line: ProductLine;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

export type PaymentMethod = "pix" | "credit_card";

export interface PixData {
  qr_code_base64?: string;
  qr_code?: string;
}

export interface CheckoutPayload {
  customer: { name: string; email: string; cpf: string; phone: string };
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  items: { productId: string; quantity: number }[];
  paymentMethod: "PIX" | "CREDIT_CARD";
}

export interface CheckoutResponse {
  orderId: string;
  /** Número legível do pedido (ex.: VR-1700000000-123). */
  orderNumber?: string;
  status?: string;
  paymentResult?: PixData;
}

export interface Feedback {
  id: string;
  quote: string;
  author: string;
  location: string;
  imageSrc?: string;
}
