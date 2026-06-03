"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutClient({ restaurant }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm restaurant={restaurant} />
    </Elements>
  );
}