import { useState } from 'react';
import { motion } from 'framer-motion';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { animations } from '../../constants/theme';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const CheckoutForm = ({ booking, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Create payment intent on your server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          booking_id: booking.id
        })
      });

      const data = await response.json();

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      );

      if (paymentError) {
        setError(paymentError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Update booking status in Firestore
        await updateDoc(doc(db, 'bookings', booking.id), {
          status: 'paid',
          paymentId: paymentIntent.id,
          updatedAt: new Date().toISOString()
        });

        onSuccess();
      }
    } catch (err) {
      setError('An error occurred while processing your payment.');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
        
        <div className="mb-6">
          <div className="border rounded-lg p-4">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-2xl font-bold">${amount}</span>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-primary hover:bg-secondary text-white py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Your payment is secured by Stripe
        </p>
      </form>
    </motion.div>
  );
};

export default CheckoutForm; 