import { 
  signInWithPopup, 
  signInWithRedirect,
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { FirestoreUser } from '../types/firestore';

export class AuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  // Initialize reCAPTCHA
  initializeRecaptcha(containerId: string) {
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
    }
    return this.recaptchaVerifier;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    try {
      // Use the phone number as provided (should already be formatted)
      console.log('AuthService: Sending OTP to', phoneNumber);
      
      this.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return this.confirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(otp: string): Promise<FirebaseUser> {
    if (!this.confirmationResult) {
      throw new Error('No confirmation result available');
    }

    try {
      const result = await this.confirmationResult.confirm(otp);
      return result.user;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Create or update user in Firestore
  async createOrUpdateUser(firebaseUser: FirebaseUser, additionalData?: Partial<FirestoreUser>): Promise<FirestoreUser> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const userData: Partial<FirestoreUser> = {
      name: additionalData?.name || firebaseUser.displayName || 'User',
      phone: additionalData?.phone || firebaseUser.phoneNumber || '',
      email: firebaseUser.email || '',
      updated_at: serverTimestamp() as Timestamp,
      ...additionalData
    };

    if (userSnap.exists()) {
      // Update existing user
      await updateDoc(userRef, userData);
      const updatedSnap = await getDoc(userRef);
      return { id: firebaseUser.uid, ...updatedSnap.data() } as FirestoreUser;
    } else {
      // Create new user
      const newUserData: Omit<FirestoreUser, 'id'> = {
        ...userData,
        avatar: additionalData?.avatar || Math.floor(Math.random() * 12) + 1, // Random avatar 1-12
        created_at: serverTimestamp() as Timestamp,
      } as Omit<FirestoreUser, 'id'>;

      await setDoc(userRef, newUserData);
      return { id: firebaseUser.uid, ...newUserData } as FirestoreUser;
    }
  }

  // Get user data from Firestore
  async getUserData(uid: string): Promise<FirestoreUser | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: uid, ...userSnap.data() } as FirestoreUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.recaptchaVerifier = null;
      this.confirmationResult = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Clean up reCAPTCHA
  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }
}

export const authService = new AuthService();