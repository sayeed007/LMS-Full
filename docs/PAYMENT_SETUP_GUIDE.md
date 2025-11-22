# SSLCommerz Payment Gateway Setup Guide

This guide explains how to configure and test the SSLCommerz payment gateway for the LMS.

## Prerequisites

- SSLCommerz account (Sandbox or Live)
- Store ID and Store Password from SSLCommerz

## Setup Instructions

### 1. Get SSLCommerz Credentials

#### For Testing (Sandbox):
1. Visit [SSLCommerz Sandbox Registration](https://developer.sslcommerz.com/registration/)
2. Register for a sandbox account
3. After verification, you'll receive:
   - Store ID (e.g., `testbox123456`)
   - Store Password
4. Login to [SSLCommerz Sandbox Portal](https://sandbox.sslcommerz.com/manage/)

#### For Production (Live):
1. Visit [SSLCommerz](https://sslcommerz.com/)
2. Contact sales for merchant account
3. Complete KYC verification
4. Receive live credentials

### 2. Configure Backend Environment

1. Open `backend/.env` file (create from `.env.example` if it doesn't exist)

2. Add/Update these variables:

```env
# SSLCommerz Payment Gateway
SSLCOMMERZ_STORE_ID=your-store-id-here
SSLCOMMERZ_STORE_PASSWORD=your-store-password-here

# URLs (Important for callbacks)
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Environment
NODE_ENV=development
```

**Important:**
- Use sandbox credentials for `development` environment
- Use live credentials for `production` environment
- The system automatically switches between sandbox and live based on `NODE_ENV`

### 3. Test Payment Flow

#### Test Cards for Sandbox:

SSLCommerz provides these test cards:

**Success Scenarios:**
- Card Number: `4111 1111 1111 1111` (Visa)
- Card Number: `5555 5555 5555 4444` (Mastercard)
- Expiry: Any future date
- CVV: Any 3 digits

**Failure Scenarios:**
- Card Number: `4000 0000 0000 0002` (Declined)

**Test Bank Accounts:**
- Use any test bank provided in SSLCommerz sandbox

### 4. Testing Workflow

#### A. Test Successful Payment:

1. Start backend server:
```bash
cd backend
npm run dev
```

2. Start frontend server:
```bash
cd frontend
npm run dev
```

3. Navigate to a paid course
4. Click "Enroll Now" or go to `/payment/checkout?courseId=COURSE_ID`
5. You'll be redirected to SSLCommerz payment gateway
6. Select test payment method:
   - Choose "Visa/Master/Amex" and use test card
   - OR choose test bank and use test credentials
7. Complete payment
8. Should redirect to `/payment/success`
9. Verify enrollment in database

#### B. Test Failed Payment:

1. Follow steps 1-5 above
2. Use a declined test card or intentionally fail payment
3. Should redirect to `/payment/failed`
4. No enrollment should be created

#### C. Test Cancelled Payment:

1. Follow steps 1-5 above
2. Click "Cancel" on payment gateway
3. Should redirect to `/payment/cancelled`
4. No enrollment should be created

### 5. Verify Payment in Database

```javascript
// Check enrollment in MongoDB
db.enrollments.find({ 'payment.transactionId': { $exists: true } })

// Check specific enrollment
db.enrollments.findOne({
  user: ObjectId("USER_ID"),
  course: ObjectId("COURSE_ID")
})
```

### 6. API Endpoints

#### Initiate Payment
```http
POST /api/v1/payments/initiate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "courseId": "COURSE_ID"
}
```

Response:
```json
{
  "status": "success",
  "message": "Payment session initiated",
  "data": {
    "gatewayUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
    "transactionId": "TXN-1234567890-USER_ID",
    "sessionKey": "..."
  }
}
```

#### Get Payment History
```http
GET /api/v1/payments/history?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Verify Payment
```http
GET /api/v1/payments/verify/TRANSACTION_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Refund Payment (Admin Only)
```http
POST /api/v1/payments/refund/ENROLLMENT_ID
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "reason": "Student requested refund"
}
```

### 7. IPN (Instant Payment Notification)

SSLCommerz sends IPN to: `POST /api/v1/payments/ipn`

This endpoint logs the IPN for audit purposes. The actual enrollment creation happens in the success callback for better UX.

### 8. Frontend Pages

| Route | Purpose |
|-------|---------|
| `/payment/checkout?courseId=ID` | Initiates payment and redirects to gateway |
| `/payment/success?enrollment=ID&course=ID` | Shows success message and auto-redirects to course |
| `/payment/failed?course=ID&reason=REASON` | Shows failure message with retry option |
| `/payment/cancelled?course=ID` | Shows cancellation message |
| `/payment/history` | Lists all user's payment transactions |

### 9. Security Considerations

#### Production Checklist:
- [ ] Use HTTPS for all URLs (frontend and backend)
- [ ] Validate payment callback using SSLCommerz `val_id`
- [ ] Store sensitive data encrypted in database
- [ ] Implement rate limiting on payment endpoints
- [ ] Log all payment transactions for audit
- [ ] Set up monitoring for failed payments
- [ ] Configure proper CORS settings
- [ ] Use environment-specific credentials
- [ ] Enable 2FA for SSLCommerz account
- [ ] Regular security audits

### 10. Common Issues

#### Issue: "Not allowed by CORS"
**Solution:** Add payment gateway domain to CORS whitelist in `backend/src/app.js`

#### Issue: Payment success but no enrollment created
**Solution:**
1. Check backend logs for errors
2. Verify MongoDB connection
3. Check if `val_id` validation passed
4. Ensure course ID and user ID are passed correctly

#### Issue: Redirect fails after payment
**Solution:**
1. Verify `FRONTEND_URL` in backend .env
2. Check if URLs are accessible (not localhost for production)
3. Ensure routes are correctly defined

#### Issue: Transaction validation fails
**Solution:**
1. Verify Store ID and Password are correct
2. Check if you're using sandbox credentials in development
3. Ensure `NODE_ENV` is set correctly

### 11. Going Live

When ready for production:

1. **Get Live Credentials:**
   - Complete SSLCommerz merchant onboarding
   - Receive live Store ID and Password

2. **Update Production Environment:**
```env
NODE_ENV=production
SSLCOMMERZ_STORE_ID=your-live-store-id
SSLCOMMERZ_STORE_PASSWORD=your-live-store-password
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

3. **Configure Webhooks in SSLCommerz:**
   - Success URL: `https://api.yourdomain.com/api/v1/payments/success`
   - Fail URL: `https://api.yourdomain.com/api/v1/payments/fail`
   - Cancel URL: `https://api.yourdomain.com/api/v1/payments/cancel`
   - IPN URL: `https://api.yourdomain.com/api/v1/payments/ipn`

4. **Test in Production:**
   - Make a real small-value transaction
   - Verify enrollment creation
   - Test refund process
   - Monitor logs

5. **Enable Transaction Monitoring:**
   - Set up alerts for failed payments
   - Monitor refund requests
   - Track payment success rate

### 12. Support & Resources

- **SSLCommerz Documentation:** https://developer.sslcommerz.com/
- **SSLCommerz Sandbox:** https://sandbox.sslcommerz.com/
- **SSLCommerz Support:** support@sslcommerz.com
- **Phone:** +88 01844 - 878878

---

## Quick Start (TL;DR)

1. Get sandbox credentials from SSLCommerz
2. Add to `backend/.env`:
   ```
   SSLCOMMERZ_STORE_ID=your-sandbox-store-id
   SSLCOMMERZ_STORE_PASSWORD=your-sandbox-password
   ```
3. Start both servers
4. Test with course enrollment
5. Use test card: `4111 1111 1111 1111`

Done! 🎉
