import { Timestamp } from 'firebase/firestore';

export interface FirestoreUser {
  id?: string;
  name: string;
  phone: string;
  email: string;
  avatar: number;
  fcm_token?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  last_token_update?: Timestamp;
}

export interface FirestoreAddress {
  id: string;
  name: string;
  phone: string;
  flatNo: string;
  buildingName: string;
  landmark?: string;
  isDefault?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface FirestoreOrderItem {
  product_id: string;
  name: string;
  displayPrice: string;
  numericPrice: number;
  quantity: number;
  imageUrls?: string[];
}

export interface FirestoreOrder {
  id?: string;
  user_id: string;
  items: FirestoreOrderItem[];
  address: FirestoreAddress;
  total_amount: number;
  delivery_fee: number;
  payment_id: string;
  payment_status: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FirestoreNotification {
  id?: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: Timestamp;
  data: {
    order_id?: string;
    order_status?: string;
  };
}