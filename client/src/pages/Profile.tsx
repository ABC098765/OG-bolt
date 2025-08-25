import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Check, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/authService';
import { useLocation } from 'wouter';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../config/firebase';

const Profile = () => {
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('initials');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [pendingPhoneChange, setPendingPhoneChange] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isRecaptchaSolved, setIsRecaptchaSolved] = useState(false);
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null);
  const [showPhoneEditModal, setShowPhoneEditModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: authState.user?.name?.split(' ')[0] || '',
    lastName: authState.user?.name?.split(' ').slice(1).join(' ') || '',
    email: authState.user?.email || '',
    phone: authState.user?.phone || ''
  });

  const [editData, setEditData] = useState(profileData);

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!authState.isAuthenticated && authState.user === null) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
    }
  }, [authState.isAuthenticated, authDispatch]);

  // Initialize reCAPTCHA when OTP modal opens
  React.useEffect(() => {
    if (showPhoneEditModal && !recaptchaVerifierRef.current) {
      try {
        // Clear any existing reCAPTCHA
        const container = document.getElementById('profile-recaptcha-container');
        if (container) {
          container.innerHTML = '';
        }
        
        const verifier = new RecaptchaVerifier(auth, 'profile-recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('Profile reCAPTCHA solved');
            setIsRecaptchaSolved(true);
          },
          'expired-callback': () => {
            console.log('Profile reCAPTCHA expired');
            setIsRecaptchaSolved(false);
            setOtpError('reCAPTCHA expired. Please try again.');
          }
        });
        
        verifier.render().then(() => {
          console.log('Profile reCAPTCHA rendered successfully');
        }).catch((error) => {
          console.error('Error rendering profile reCAPTCHA:', error);
          setOtpError('Failed to initialize reCAPTCHA. Please refresh the page.');
        });
        
        recaptchaVerifierRef.current = verifier;
      } catch (error) {
        console.error('Error initializing profile reCAPTCHA:', error);
      }
    }
  }, [showPhoneEditModal]);

  // Cleanup reCAPTCHA when modal closes
  React.useEffect(() => {
    if (!showPhoneEditModal && !showOtpModal && recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (error) {
        console.error('Error clearing profile reCAPTCHA:', error);
      }
      recaptchaVerifierRef.current = null;
      setIsRecaptchaSolved(false);
    }
  }, [showPhoneEditModal, showOtpModal]);

  // Show loading or sign in prompt if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <User className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Please sign in to view and manage your profile information.
            </p>
            <button 
              onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="lg:col-span-3 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Actions</h3>
            <div className="flex justify-center">
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    try {
                      await authService.signOut();
                      navigate('/');
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }
                }}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-semibold"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avatarOptions = [
    { id: 'initials', type: 'initials', name: 'Initials' },
    { id: 'avatar1', type: 'emoji', emoji: '👨‍💼', name: 'Professional' },
    { id: 'avatar2', type: 'emoji', emoji: '👩‍💼', name: 'Business Woman' },
    { id: 'avatar3', type: 'emoji', emoji: '🧑‍🎓', name: 'Student' },
    { id: 'avatar4', type: 'emoji', emoji: '👨‍🍳', name: 'Chef' },
    { id: 'avatar5', type: 'emoji', emoji: '👩‍🎨', name: 'Artist' },
    { id: 'avatar6', type: 'emoji', emoji: '🧑‍💻', name: 'Developer' },
    { id: 'avatar7', type: 'emoji', emoji: '👨‍🔬', name: 'Scientist' },
    { id: 'avatar8', type: 'emoji', emoji: '👩‍⚕️', name: 'Doctor' },
    { id: 'avatar9', type: 'emoji', emoji: '🧑‍🏫', name: 'Teacher' },
    { id: 'avatar10', type: 'emoji', emoji: '👨‍🌾', name: 'Farmer' },
    { id: 'avatar11', type: 'emoji', emoji: '👩‍🚀', name: 'Astronaut' },
    { id: 'avatar12', type: 'emoji', emoji: '🧑‍🎤', name: 'Singer' }
  ];

  const renderAvatar = (avatarId: string, size: string = 'w-24 h-24') => {
    const avatar = avatarOptions.find(a => a.id === avatarId);
    
    if (!avatar || avatar.type === 'initials') {
      return (
        <div className={`${size} bg-gradient-to-br from-green-400 to-orange-400 rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
          {profileData.firstName[0]}{profileData.lastName[0]}
        </div>
      );
    }
    
    return (
      <div className={`${size} bg-gray-100 rounded-full flex items-center justify-center text-4xl`}>
        {avatar.emoji}
      </div>
    );
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setShowAvatarModal(false);
  };

  const handleSave = () => {
    // Validate required fields
    if (!editData.firstName.trim()) {
      alert('First name is required');
      return;
    }
    
    // Save profile without phone number changes (phone is handled separately)
    saveProfile();
  };

  const saveProfile = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handlePhoneEdit = () => {
    setNewPhoneNumber(profileData.phone.replace('+91', '').replace(/\D/g, ''));
    setShowPhoneEditModal(true);
  };

  const handleSendOtp = () => {
    // Validate phone number
    if (!newPhoneNumber || newPhoneNumber.length !== 10) {
      setOtpError('Please enter a valid 10-digit phone number');
      return;
    }

    
    setIsOtpLoading(true);
    setOtpError('');
    
    if (!recaptchaVerifierRef.current) {
      setOtpError('reCAPTCHA not initialized. Please refresh and try again.');
      setIsOtpLoading(false);
      return;
    }
    
    // Send real OTP using Firebase
    const formattedPhone = `+91${newPhoneNumber}`;
    signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current)
      .then((confirmation) => {
        setConfirmationResult(confirmation);
        setIsOtpLoading(false);
        setShowPhoneEditModal(false);
        setShowOtpModal(true);
      })
      .catch((error) => {
        console.error('Error sending OTP:', error);
        setIsOtpLoading(false);
        if (error.code === 'auth/captcha-check-failed') {
          setOtpError('reCAPTCHA verification failed. Please try again.');
        } else if (error.code === 'auth/invalid-phone-number') {
          setOtpError('Invalid phone number format.');
        } else if (error.code === 'auth/too-many-requests') {
          setOtpError('Too many requests. Please try again later.');
        } else {
          setOtpError(`Failed to send OTP: ${error.message}`);
        }
      });
  };

  const handleVerifyOtp = () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsOtpLoading(true);
    setOtpError('');
    
    if (!confirmationResult) {
      setOtpError('No confirmation result available. Please resend OTP.');
      setIsOtpLoading(false);
      return;
    }
    
    // Verify real OTP using Firebase
    confirmationResult.confirm(otpValue)
      .then((result) => {
        // OTP verified successfully
        // Update profile data with new phone number
        const updatedProfileData = { ...profileData, phone: `+91${newPhoneNumber}` };
        const updatedEditData = { ...editData, phone: `+91${newPhoneNumber}` };
        setProfileData(updatedProfileData);
        setEditData(updatedEditData);
        
        setIsOtpLoading(false);
        setShowOtpModal(false);
        setOtpValue('');
        setConfirmationResult(null);
        setNewPhoneNumber('');
        alert('Phone number updated successfully!');
      })
      .catch((error) => {
        console.error('Error verifying OTP:', error);
        setIsOtpLoading(false);
        if (error.code === 'auth/invalid-verification-code') {
          setOtpError('Invalid OTP. Please check and try again.');
        } else if (error.code === 'auth/code-expired') {
          setOtpError('OTP has expired. Please request a new one.');
        } else {
          setOtpError('Invalid OTP. Please try again.');
        }
      });
  };

  const handleCancelOtp = () => {
    setShowOtpModal(false);
    setOtpValue('');
    setOtpError('');
    setPendingPhoneChange('');
    // Reset phone number in edit data
    setEditData({...editData, phone: profileData.phone});
    setConfirmationResult(null);
    setIsRecaptchaSolved(false);
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (error) {
        console.error('Error clearing reCAPTCHA:', error);
      }
      recaptchaVerifierRef.current = null;
    }
  };

  const handleCancelPhoneEdit = () => {
    setShowPhoneEditModal(false);
    setNewPhoneNumber('');
    setOtpError('');
    setIsRecaptchaSolved(false);
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (error) {
        console.error('Error clearing reCAPTCHA:', error);
      }
      recaptchaVerifierRef.current = null;
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your <span className="text-green-600">Profile</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
              <div className="relative inline-block mb-6">
                {renderAvatar(selectedAvatar)}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{profileData.email}</p>
              
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors font-semibold"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg">{profileData.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg">{profileData.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg">
                        {profileData.phone.replace('+91', '').replace(/\D/g, '') || 'Not provided'}
                      </div>
                      <button
                        onClick={handlePhoneEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg">
                      {profileData.phone.replace('+91', '').replace(/\D/g, '') || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-semibold"
                data-testid="button-toggle-theme"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-5 h-5 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5 mr-2" />
                    Light Mode
                  </>
                )}
              </button>
              
              {/* Sign Out Button */}
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    try {
                      await authService.signOut();
                      navigate('/');
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }
                }}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-semibold"
                data-testid="button-sign-out"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Avatar Selection Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Choose Your Avatar</h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {avatarOptions.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`relative cursor-pointer group ${
                      selectedAvatar === avatar.id ? 'ring-4 ring-green-500' : ''
                    }`}
                    onClick={() => handleAvatarSelect(avatar.id)}
                  >
                    <div className="text-center">
                      {renderAvatar(avatar.id, 'w-16 h-16 mx-auto')}
                      <p className="text-xs text-gray-600 mt-2 truncate">{avatar.name}</p>
                    </div>
                    
                    {selectedAvatar === avatar.id && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-green-500 bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all"></div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phone Edit Modal */}
        {showPhoneEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Edit Phone Number</h3>
                <p className="text-gray-600">
                  Enter your new phone number and verify with OTP
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* reCAPTCHA container */}
                <div className="flex justify-center">
                  <div id="profile-recaptcha-container"></div>
                </div>

                {otpError && (
                  <p className="text-red-500 text-sm text-center">{otpError}</p>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelPhoneEdit}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={isOtpLoading || !isRecaptchaSolved || newPhoneNumber.length !== 10}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOtpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Phone Number</h3>
                <p className="text-gray-600">
                  We've sent a 6-digit OTP to +91{newPhoneNumber}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isOtpLoading}
                      className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                    >
                      {isOtpLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                {otpError && (
                  <p className="text-red-500 text-sm text-center">{otpError}</p>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelOtp}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isOtpLoading || otpValue.length !== 6}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOtpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;