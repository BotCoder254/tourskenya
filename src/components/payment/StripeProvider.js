import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../../config/stripe';

const StripeProvider = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider; 