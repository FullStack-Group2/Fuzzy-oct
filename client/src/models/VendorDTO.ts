export type OrderStatus    = "PENDING" | "ACTIVE" | "DELIVERED" | "CANCELED";

export type VendorOrderListDTO = {
  id: string;
  status: OrderStatus;               
  vendorDecision: Exclude<OrderStatus, "CANCELED">;
  totalPrice: number;
  customerName: string;
};

export type VendorOrderItemDTO = {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
};

export type VendorOrderDetailDTO = {
  id: string;
  status: OrderStatus;
  orderDate: string | null;
  totalPrice: number;
  customerName: string;
  customerAddress: string;
  items: VendorOrderItemDTO[]; // vendor-scoped items
  vendorSubtotal: number;
  cancelReason: string | null;
};
