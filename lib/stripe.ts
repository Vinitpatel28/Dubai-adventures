import { loadStripe, Stripe } from '@stripe/stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required. ' +
    'Please set it in your .env.local file.'
  );
}

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
