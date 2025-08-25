export type VendorDecision = "PENDING" | "ACCEPTED" | "REJECTED";
export type OrderStatus    = "ACTIVE" | "DELIVERED" | "CANCELED";

export type VendorOrderListDTO = {
  id: string;
  status: OrderStatus;               // shipper lifecycle
  vendorDecision: Exclude<VendorDecision, "REJECTED">; // list excludes REJECTED
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
  vendorDecision: VendorDecision;
  orderDate: string | null;
  totalPrice: number;
  customerName: string;
  customerAddress: string;
  items: VendorOrderItemDTO[]; // vendor-scoped items
  vendorSubtotal: number;
  vendorRejectReason: string | null;
};
