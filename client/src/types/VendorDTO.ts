// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: s4010989

export type OrderStatus = 'PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELED';

export type VendorOrderListDTO = {
  id: string;
  status: OrderStatus;
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
