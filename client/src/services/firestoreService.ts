import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirestoreOrder, FirestoreNotification, FirestoreAddress } from '../types/firestore';

export class FirestoreService {
  // Orders
  async createOrder(orderData: Omit<FirestoreOrder, 'id' | 'created_at' | 'updated_at'>): Promise<FirestoreOrder> {
    try {
      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, {
        ...orderData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      // Return the created order with ID
      const createdOrder = await getDoc(docRef);
      return { id: docRef.id, ...createdOrder.data() } as FirestoreOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId: string): Promise<FirestoreOrder[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreOrder[];
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<FirestoreOrder | null> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        return { id: orderId, ...orderSnap.data() } as FirestoreOrder;
      }
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<FirestoreNotification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreNotification[];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        is_read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Products
  async getProducts(): Promise<any[]> {
    try {
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async getProduct(productId: string): Promise<any | null> {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        return { id: productId, ...productSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  // Cart Management
  async getUserCart(userId: string): Promise<any[]> {
    try {
      const cartRef = collection(db, 'users', userId, 'cart');
      const querySnapshot = await getDocs(cartRef);
      return querySnapshot.docs.map(doc => {
  const data = doc.data() as any;
        let numericUnitPrice = Number(
        data.priceValue ?? data.unitPrice ??
        String(data.unitPrice || data.displayPrice || data.priceLabel || '')
          .replace(/[^\d.]/g, '')
      );

      if (isNaN(numericUnitPrice)) {
        numericUnitPrice = 0; // ultimate fallback
      } 
        const priceLabel =
        data.priceLabel ||
        data.displayPrice ||
        (numericUnitPrice ? `₹${numericUnitPrice}/${data.unit || 'box'}` : 'Price unavailable');

      return {
        productId: doc.id,
        ...data,
        unitPrice: numericUnitPrice, // ensure always a number
       priceValue: numericUnitPrice,  // keep in sync
        priceLabel 
      };
});

    } catch (error) {
      console.error('Error getting user cart:', error);
      throw error;
    }
  }

  async addToCart(userId: string, cartItem: {
    productId: string;
    name: string;
    unitPrice: number;
    amount: string;
    unit: string;
    imageUrls: string[];
    quantity: number;
    totalPrice: number;
    priceLabel?: string; // new
    priceValue?: number; // new
    displayPrice?: string; // new - for proper price display
  }): Promise<void> {
    try {
      const cartRef = collection(db, 'users', userId, 'cart');
      
      // Use productId as document ID to match Android app structure
      const cartItemRef = doc(cartRef, cartItem.productId);
      const existingDoc = await getDoc(cartItemRef);
       const finalPriceValue = Number(
      cartItem.priceValue ??
      cartItem.unitPrice ??
      String(cartItem.priceLabel || '').replace(/[^\d.]/g, '')
    ) || 0;

    const finalPriceLabel = cartItem.displayPrice || cartItem.priceLabel
      || `₹${finalPriceValue}/${cartItem.unit || 'box'}`;
      
      if (existingDoc.exists()) {
        // Update existing item - sum amounts like Android app
        const existingData = existingDoc.data();
        const existingAmount = this.parseAmount(existingData.amount, existingData.unit);
        const newAmount = this.parseAmount(cartItem.amount, cartItem.unit);
        const totalAmount = existingAmount + newAmount;
        
        await updateDoc(cartItemRef, {
          amount: this.amountToString(totalAmount, existingData.unit),
          quantity: 1, // Always 1 as per Android logic
          totalPrice: existingData.unitPrice * totalAmount,
          // Ensure all Android app fields are present
          productId: cartItem.productId,
          name: existingData.name,
          unitPrice: finalPriceValue,
          unit: existingData.unit,
          imageUrls: existingData.imageUrls || existingData.image_urls || cartItem.imageUrls,
          image_urls: existingData.image_urls || existingData.imageUrls || cartItem.imageUrls,
           priceLabel: finalPriceLabel, // added
        priceValue: finalPriceValue  // added
        });
      } else {
        // Add new item to cart with productId as document ID
        // Ensure compatibility with Android app by including both field formats
        // Compute price label and value safely
          await setDoc(cartItemRef, {
          productId: cartItem.productId,
          name: cartItem.name,
          unitPrice: cartItem.unitPrice,
          amount: cartItem.amount,
          unit: cartItem.unit,
          imageUrls: cartItem.imageUrls,
          image_urls: cartItem.imageUrls, // Android app compatibility
          quantity: 1, // Always 1 as per Android logic
          totalPrice: cartItem.totalPrice,
          // Add timestamp for Android app compatibility
          addedAt: serverTimestamp(),
          priceLabel: finalPriceLabel, // added
        priceValue: finalPriceValue  // added
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<void> {
    try {
      const cartItemRef = doc(db, 'users', userId, 'cart', productId);
      if (quantity <= 0) {
        await deleteDoc(cartItemRef);
      } else {
        const cartDoc = await getDoc(cartItemRef);
        if (cartDoc.exists()) {
          const data = cartDoc.data();
          const singleAmount = this.parseAmount(data.amount, data.unit);
          const totalAmount = singleAmount * quantity;
          
          await updateDoc(cartItemRef, {
            quantity: quantity,
            totalPrice: data.unitPrice * totalAmount
          });
        }
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    try {
      const cartItemRef = doc(db, 'users', userId, 'cart', productId);
      await deleteDoc(cartItemRef);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearUserCart(userId: string): Promise<void> {
    try {
      const cartRef = collection(db, 'users', userId, 'cart');
      const querySnapshot = await getDocs(cartRef);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Helper methods to match Android app logic
  private normalizeUnit(unit: string): string {
    const u = unit.toLowerCase();
    if (u.includes('kg') || u.includes('g')) return 'kg';
    if (u.includes('piece') || u.includes('pc')) return 'piece';
    if (u.includes('box')) return 'box';
    return u;
  }

  private parseAmount(amountStr: string, unit: string): number {
    const a = amountStr.toLowerCase();
    if (this.normalizeUnit(unit) === 'kg') {
      if (a.endsWith('kg')) {
        return parseFloat(a.replace('kg', '').trim()) || 1;
      } else if (a.endsWith('g')) {
        return (parseFloat(a.replace('g', '').trim()) || 100) / 1000.0;
      }
    } else if (this.normalizeUnit(unit) === 'piece') {
      const pcs = a.match(/(\d+)/);
      return pcs ? parseFloat(pcs[1]) || 1 : 1;
    } else if (this.normalizeUnit(unit) === 'box') {
      const boxes = a.match(/(\d+)/);
      return boxes ? parseFloat(boxes[1]) || 1 : 1;
    }
    return 1;
  }

  private amountToString(amount: number, unit: string): string {
    if (this.normalizeUnit(unit) === 'kg') {
      return amount >= 1 
        ? `${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}kg`
        : `${(amount * 1000).toFixed(0)}g`;
    } else if (this.normalizeUnit(unit) === 'piece') {
      return `${amount.toFixed(0)} pcs`;
    } else if (this.normalizeUnit(unit) === 'box') {
      return `${amount.toFixed(0)} box`;
    }
    return amount.toString();
  }
  // Utility function to convert Firestore timestamp to readable date
  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  // Utility function to format timestamp for display
  formatTimestamp(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Addresses
  async getUserAddresses(userId: string): Promise<FirestoreAddress[]> {
    try {
      const addressesRef = collection(db, 'users', userId, 'addresses');
      
      const querySnapshot = await getDocs(addressesRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreAddress[];
    } catch (error) {
      console.error('Error getting user addresses:', error);
      throw error;
    }
  }

  async saveAddress(userId: string, addressData: Omit<FirestoreAddress, 'id'>): Promise<FirestoreAddress> {
    try {
      const addressesRef = collection(db, 'users', userId, 'addresses');
      const docRef = await addDoc(addressesRef, {
        ...addressData,
        created_at: serverTimestamp()
      });
      
      const createdAddress = await getDoc(docRef);
      return { id: docRef.id, ...createdAddress.data() } as FirestoreAddress;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }

  async updateAddress(addressId: string, addressData: Partial<FirestoreAddress>): Promise<void> {
    try {
      // We need userId to construct the path, so we'll need to modify this method signature
      throw new Error('updateAddress needs userId parameter');
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async updateUserAddress(userId: string, addressId: string, addressData: Partial<FirestoreAddress>): Promise<void> {
    try {
      const addressRef = doc(db, 'users', userId, 'addresses', addressId);
      await updateDoc(addressRef, {
        ...addressData,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(addressId: string): Promise<void> {
    try {
      // We need userId to construct the path, so we'll need to modify this method signature
      throw new Error('deleteAddress needs userId parameter');
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  async deleteUserAddress(userId: string, addressId: string): Promise<void> {
    try {
      const addressRef = doc(db, 'users', userId, 'addresses', addressId);
      await deleteDoc(addressRef);
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();