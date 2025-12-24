# Stripe Payment Integration Setup

## Overview

The checkout system is set up to support Stripe payments. Currently, it creates orders with delivery addresses. To enable full Stripe payment processing, you'll need to set up the backend integration.

## Frontend Setup

1. Install Stripe packages (if not already installed):

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. Add Stripe publishable key to `.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Backend Setup Required

You'll need to create the following backend endpoints:

1. **POST /api/orders** - Create an order with delivery address

   - Body: `{ postId, deliveryAddress }`
   - Returns: `{ success, data: Order, message }`

2. **POST /api/payments/create-intent** - Create Stripe payment intent

   - Body: `{ orderId }`
   - Returns: `{ success, clientSecret }`

3. **POST /api/payments/confirm** - Confirm payment
   - Body: `{ orderId, paymentIntentId }`
   - Returns: `{ success, message }`

## Current Implementation

The checkout dialog currently:

- ✅ Collects delivery address information
- ✅ Creates an order with delivery details
- ⏳ Payment processing (requires backend Stripe integration)

## Next Steps

1. Install Stripe SDK on backend: `npm install stripe`
2. Set up Stripe account and get API keys
3. Create payment routes in backend
4. Update checkout dialog to use Stripe Elements for card input
5. Handle payment confirmation flow

## Testing

For testing without Stripe, the order creation will work, but payment processing will need the backend endpoints implemented.
