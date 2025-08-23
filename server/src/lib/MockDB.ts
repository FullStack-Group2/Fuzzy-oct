// Tiny in-memory "DB" that mimics your Mongo models.
// You can extend these as you add real fields.

export type ObjectId = string;

export interface Customer {
  _id: ObjectId;
  username: string;
  name: string;
  address: string;
}

export interface DistributionHub {
  _id: ObjectId;
  name: string;
  address: string;
}

export interface Product {
  _id: ObjectId;
  name: string;
  imageUrl: string;
}

export type OrderStatus = "ACTIVE" | "CANCELED" | "DELIVERED";

export interface Order {
  _id: ObjectId;
  customer: ObjectId;              // ref Customer
  hub: ObjectId;                   // ref DistributionHub
  orderDate: string;               // ISO
  status: OrderStatus;
  totalPrice: number;
}

export interface OrderItem {
  _id: ObjectId;
  order: ObjectId;                 // ref Order
  product: ObjectId;               // ref Product
  quantity: number;
  priceAtPurchase: number;
}

// --- Seeds (ObjectId-like strings are fine for mocks) ---

export const customers: Customer[] = [
  { _id: "cus_1", username: "nguyenvana", name: "Nguyen Van A", address: "12 Nguyen Hue, District 1, HCMC" },
  { _id: "cus_2", username: "tranthib",   name: "Tran Thi B",   address: "45 Vo Van Tan, District 3, HCMC" },
];

export const hubs: DistributionHub[] = [
  { _id: "hub_hcm", name: "Ho Chi Minh", address: "1 Le Duan, HCMC" },
  { _id: "hub_dad", name: "Da Nang",     address: "2 Bach Dang, Da Nang" },
  { _id: "hub_han", name: "Hanoi",       address: "3 Dinh Tien Hoang, Hanoi" },
];

export const products: Product[] = [
  { _id: "p_grinder", name: "Coffee Grinder", imageUrl: "https://picsum.photos/seed/grinder/80/80" },
  { _id: "p_mug",     name: "Ceramic Mug",    imageUrl: "https://picsum.photos/seed/mug/80/80" },
  { _id: "p_bottle",  name: "Stainless Bottle", imageUrl: "https://picsum.photos/seed/bottle/80/80" },
];

export const orders: Order[] = [
  {
    _id: "ord_1001",
    customer: "cus_1",
    hub: "hub_hcm",
    orderDate: new Date().toISOString(),
    status: "ACTIVE",
    totalPrice: 145.0, // will be recalculated by service too
  },
  {
    _id: "ord_1002",
    customer: "cus_2",
    hub: "hub_hcm",
    orderDate: new Date().toISOString(),
    status: "ACTIVE",
    totalPrice: 79.9,
  },
];

export const orderItems: OrderItem[] = [
  // ord_1001
  { _id: "oi_1", order: "ord_1001", product: "p_grinder", quantity: 2, priceAtPurchase: 45.0 },
  { _id: "oi_2", order: "ord_1001", product: "p_mug",     quantity: 4, priceAtPurchase: 13.75 },

  // ord_1002
  { _id: "oi_3", order: "ord_1002", product: "p_bottle",  quantity: 2, priceAtPurchase: 39.95 },
];

// tiny helpers
export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
export const fmt2 = (n: number) => Math.round(n * 100) / 100;