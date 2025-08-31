export type OrderStatus = "ACTIVE" | "CANCELED" | "DELIVERED";

export interface OrderListDTO {
  id: string;               // order _id
  status: OrderStatus;
  totalPrice: number;
  customerName: string;
}

export interface OrderItemDTO {
  id: string;               // orderItem _id
  productName: string;
  imageUrl: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;         // priceAtPurchase * quantity
}

export interface OrderDetailDTO {
  id: string;
  status: OrderStatus;
  orderDate: string;        // ISO string
  totalPrice: number;
  hubId: string;
  customerName: string;
  customerAddress: string;
  items: OrderItemDTO[];
}
