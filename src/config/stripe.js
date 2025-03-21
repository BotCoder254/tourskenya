import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

console.log('Environment Variables:', {
  stripeKey: stripePublishableKey,
  allEnv: process.env
});

if (!stripePublishableKey) {
  console.error('Stripe key is missing. Current env:', process.env);
  throw new Error('Stripe publishable key is missing. Please check your .env file.');
}

const stripePromise = loadStripe(stripePublishableKey);

export default stripePromise; 