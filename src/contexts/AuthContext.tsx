import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';
import { fcmService } from '../services/fcmService';
import { FirestoreUser } from '../types/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SHOW_AUTH_MODAL' }
  | { type: 'HIDE_AUTH_MODAL' }
  | { type: 'SET_LOADING'; payload: boolean };

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        showAuthModal: false,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        showAuthModal: false,
        loading: false
      };
    case 'SHOW_AUTH_MODAL':
      return {
        ...state,
        showAuthModal: true
      };
    case 'HIDE_AUTH_MODAL':
      return {
        ...state,
        showAuthModal: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

const convertFirestoreUserToUser = (firestoreUser: FirestoreUser): User => {
  return {
    id: firestoreUser.id!,
    email: firestoreUser.email,
    name: firestoreUser.name,
    phone: firestoreUser.phone,
    avatar: firestoreUser.avatar
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    showAuthModal: false,
    loading: true
  });

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await authService.getUserData(firebaseUser.uid);
          if (userData) {
            const user = convertFirestoreUserToUser(userData);
            dispatch({ type: 'LOGIN', payload: user });
            
            // FCM notifications are working via backend, skip token setup
            console.log('✅ Auth: User logged in, FCM handled by backend');
          } else {
            // If user doesn't exist in Firestore, create them
            const newUserData = await authService.createOrUpdateUser(firebaseUser);
            const user = convertFirestoreUserToUser(newUserData);
            dispatch({ type: 'LOGIN', payload: user });
            
            // FCM notifications are working via backend, skip token setup
            console.log('✅ Auth: New user created, FCM handled by backend');
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, []);

  // Listen for foreground FCM messages
  useEffect(() => {
    fcmService.onMessage((payload) => {
      // Show notification when app is in foreground
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      fcmService.showNotification(title, body);
    });
  }, []);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};