export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem extends CartItem {}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface PaymentInfo {
  method: 'credit_card';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
} 