import React, { useState, useEffect } from 'react';
import { X, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, ConfirmationResult, signInWithPhoneNumber, signInWithRedirect, GoogleAuthProvider, signInWithPopup, getRedirectResult } from 'firebase/auth';

const AuthModal = () => {
  const { state, dispatch } = useAuth();
  const [authMethod, setAuthMethod] = useState<'options' | 'phone' | 'create'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null);

  // Check for redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const firebaseUser = result.user;
          await authService.createOrUpdateUser(firebaseUser);
          resetForm();
        }
      } catch (error: any) {
        console.error('Error handling redirect result:', error);
        setError('Failed to complete Google sign-in. Please try again.');
      }
    };

    handleRedirectResult();
  }, []);

  // Timer effect for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    if (state.showAuthModal && !recaptchaVerifierRef.current && (authMethod === 'phone' || authMethod === 'create')) {
      try {
        // Clear any existing reCAPTCHA
        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.innerHTML = '';
        }
        
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved');
            setRecaptchaCompleted(true);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            setRecaptchaCompleted(false);
            setError('reCAPTCHA expired. Please try again.');
          }
        });
        
        // Render the reCAPTCHA
        verifier.render().then(() => {
          console.log('reCAPTCHA rendered successfully');
        }).catch((error) => {
          console.error('Error rendering reCAPTCHA:', error);
          setError('Failed to initialize reCAPTCHA. Please refresh the page.');
        });
        
        recaptchaVerifierRef.current = verifier;
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        setError('Failed to initialize reCAPTCHA. Please refresh the page.');
      }
    }
  }, [state.showAuthModal, authMethod]);

  if (!state.showAuthModal) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otpSent) {
      // Send OTP
      if (!phoneNumber || phoneNumber.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }


      if (!recaptchaVerifierRef.current) {
        setError('reCAPTCHA not initialized. Please refresh and try again.');
        return;
      }
      
      setIsLoading(true);
      try {
        if (!recaptchaVerifierRef.current) {
          throw new Error('reCAPTCHA not initialized');
        }
        
        // Clean the phone number and format it properly
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const formattedPhone = `+91${cleanPhone}`;
        
        console.log('Sending OTP to:', formattedPhone);
        console.log('Phone number length:', cleanPhone.length);
        console.log('reCAPTCHA verifier:', recaptchaVerifierRef.current);
        
        // Validate phone number format
        if (cleanPhone.length !== 10) {
          throw new Error('Phone number must be exactly 10 digits');
        }
        
        if (!cleanPhone.startsWith('6') && !cleanPhone.startsWith('7') && !cleanPhone.startsWith('8') && !cleanPhone.startsWith('9')) {
          throw new Error('Indian mobile numbers should start with 6, 7, 8, or 9');
        }
        
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
        console.log('OTP sent successfully, confirmation result:', confirmation);
        setConfirmationResult(confirmation);
        setOtpSent(true);
        setResendTimer(30);
      } catch (error: any) {
        console.error('Error sending OTP:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'auth/captcha-check-failed') {
          setError('reCAPTCHA verification failed. Please refresh the page and try again.');
        } else if (error.code === 'auth/invalid-phone-number') {
          setError('Invalid phone number format. Please check your number.');
        } else if (error.code === 'auth/too-many-requests') {
          setError('Too many requests. Please try again later.');
        } else if (error.code === 'auth/quota-exceeded') {
          setError('SMS quota exceeded. Please try again later or contact support.');
        } else if (error.message?.includes('reCAPTCHA')) {
          setError('reCAPTCHA error. Please refresh the page and try again.');
        } else {
          setError(`Failed to send OTP: ${error.message || 'Unknown error'}. Please try again.`);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Verify OTP
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }
      
      setIsLoading(true);
      try {
        if (!confirmationResult) {
          throw new Error('No confirmation result available');
        }
        
        const result = await confirmationResult.confirm(otp);
        const firebaseUser = result.user;
        
        // Create or update user in Firestore
        const additionalData = authMethod === 'create' && userName ? { name: userName } : {};
        await authService.createOrUpdateUser(firebaseUser, {
          phone: `+91${phoneNumber}`,
          ...additionalData
        });
        
        resetForm();
      } catch (error: any) {
        console.error('Error verifying OTP:', error);
        setError('Invalid OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    setOtp('');
    setError('');
    
    
    setIsLoading(true);
    
    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not initialized');
      }
      
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `+91${cleanPhone}`;
      console.log('Resending OTP to:', formattedPhone);
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setResendTimer(30);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      if (error.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA verification failed. Please refresh the page and try again.');
      } else if (error.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Please try again later.');
      } else {
        setError(`Failed to resend OTP: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Configure Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      try {
        // Try popup first
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        
        console.log('Google sign-in successful:', firebaseUser);
        
        // Create or update user in Firestore
        await authService.createOrUpdateUser(firebaseUser);
        
        resetForm();
      } catch (popupError: any) {
        console.error('Popup error:', popupError);
        if (popupError.code === 'auth/popup-blocked') {
          // Fallback to redirect if popup is blocked
          console.log('Popup blocked, trying redirect...');
          await signInWithRedirect(auth, provider);
          // The redirect result will be handled by the useEffect above
          return;
        } else if (popupError.code === 'auth/cancelled-popup-request') {
          setError('Sign-in was cancelled. Please try again.');
          return;
        } else if (popupError.code === 'auth/popup-closed-by-user') {
          setError('Sign-in popup was closed. Please try again.');
          return;
        }
        throw popupError;
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign-in. Please check Firebase configuration.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Please contact support.');
      } else if (error.code === 'auth/invalid-api-key') {
        setError('Invalid API key. Please check Firebase configuration.');
      } else {
        setError(`Google sign-in failed: ${error.message || 'Unknown error'}. Please try again.`);
      }
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setAuthMethod('options');
    setPhoneNumber('');
    setUserName('');
    setOtp('');
    setOtpSent(false);
    setError('');
    setResendTimer(0);
    setConfirmationResult(null);
    setRecaptchaCompleted(false);
    setAgreeToTerms(false);
  };

  const handleClose = () => {
    dispatch({ type: 'HIDE_AUTH_MODAL' });
    resetForm();
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (error) {
        console.error('Error clearing reCAPTCHA:', error);
      }
      recaptchaVerifierRef.current = null;
    }
    setRecaptchaCompleted(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hidden reCAPTCHA container */}
        {(authMethod === 'phone' || authMethod === 'create') && !otpSent && (
          <div className="mb-4">
            <div id="recaptcha-container" className="flex justify-center"></div>
          </div>
        )}

        {authMethod === 'options' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
              <p className="text-gray-600">Choose your preferred sign-in method</p>
            </div>

            {/* Privacy Policy & Terms Checkbox */}
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600 leading-5">
                  I agree to the{' '}
                  <a 
                    href="/terms-and-conditions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    Privacy Policy & Terms and Conditions
                  </a>
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading || !agreeToTerms}
                className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              <button
                onClick={() => setAuthMethod('phone')}
                disabled={!agreeToTerms}
                className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
              >
                <Phone className="w-5 h-5 mr-3" />
                Continue with Phone
              </button>
            </div>
          </>
        )}

        {(authMethod === 'phone' || authMethod === 'create') && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {otpSent ? 'Enter OTP' : authMethod === 'create' ? 'Create Account' : 'Phone Number'}
              </h2>
              <p className="text-gray-600">
                {otpSent 
                  ? `We've sent a 6-digit OTP to +91${phoneNumber}`
                  : authMethod === 'create' 
                    ? 'Enter your details to create a new account'
                    : 'Enter your phone number to receive an OTP'
                }
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              {!otpSent ? (
                <>
                  {authMethod === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <div className="flex justify-between items-center mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setError('');
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Change Number
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className={`text-sm font-medium ${
                        resendTimer > 0 || isLoading
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50"
              >
                {isLoading 
                  ? (otpSent ? 'Verifying...' : 'Sending OTP...') 
                  : (otpSent ? 'Verify OTP' : authMethod === 'create' ? 'Create Account' : 'Send OTP')
                }
              </button>

              {!otpSent && authMethod === 'phone' && (
                <button
                  type="button"
                  onClick={() => setAuthMethod('create')}
                  className="w-full border-2 border-green-600 text-green-600 py-3 px-6 rounded-lg hover:bg-green-50 transition-colors font-semibold text-lg"
                >
                  Create Account
                </button>
              )}
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setAuthMethod('options')}
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                ← Back to sign-in options
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;