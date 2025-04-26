export interface Category {
  id: number;
  title: string;
  image: string;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  avatar?: string;
  isAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  days: number;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
} 