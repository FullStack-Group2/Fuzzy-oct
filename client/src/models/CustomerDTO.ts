export type OrderStatus = "PENDING" | "ACTIVE" | "DELIVERED" | "CANCELED";

export type CustomerOrderListDTO = {
  id: string;
  status: OrderStatus;
  totalPrice: number;
  vendorName: string;
};

export type CustomerOrderItemDTO = {
  id: string;
  productName: string;
  imageUrl: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
};

export type CustomerOrderDetailDTO = {
  id: string;
  status: OrderStatus;
  vendorName: string;
  items: CustomerOrderItemDTO[];
  totalPrice: number;
  customerAddress?: string;
  cancelReason?: string | null;
};
