import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

const TermsAndConditions = () => {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms and <span className="text-green-600">Conditions</span>
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Privacy Policy & Terms and Conditions
          </h2>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Welcome to Super Fruit Center! We value your privacy and are committed to 
              protecting your personal information. By using our app, you agree to the following terms:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Data Collection</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We collect information you provide (such as your name, phone number, and address) to 
                  process orders and improve your experience. We may also collect device and 
                  usage data for analytics and security.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Use of Information</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Your information is used to fulfill orders, send notifications, and personalize your 
                  experience. We do not sell your data to third parties.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Data Security</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We use industry-standard security measures to protect your data. However, no method is 
                  100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Third-Party Services</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our app may use third-party services (such as payment gateways and analytics). These 
                  services have their own privacy policies.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. User Rights</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You can update or delete your personal information at any time from your profile. 
                  For account deletion, contact support.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Changes to Policy</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We may update these terms from time to time. We will notify you of significant 
                  changes via the app or email.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Contact Us</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  If you have any questions or concerns, please contact us at 
                  superfruitcenter@gmail.com.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Delivery Charges</h3>
                <div className="text-gray-700 dark:text-gray-300 space-y-2">
                  <p>Our delivery charges are structured as follows:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li><strong className="text-gray-900 dark:text-white">Orders below ₹500:</strong> ₹40 delivery charge</li>
                    <li><strong className="text-gray-900 dark:text-white">Orders ₹500 - ₹999:</strong> ₹20 delivery charge</li>
                    <li><strong className="text-gray-900 dark:text-white">Orders ₹1000 and above:</strong> FREE delivery</li>
                  </ul>
                  <p className="mt-3">
                    Delivery charges are calculated based on the subtotal of your order. 
                    These charges help us maintain our quality delivery service and ensure your fresh 
                    fruits reach you in perfect condition.
                  </p>
                  <p>
                    Delivery charges may vary during peak seasons or special circumstances, and any 
                    changes will be clearly displayed during checkout before order confirmation.
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-8">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  By using this app, you agree to these terms and our privacy policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;