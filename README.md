# Pawan Mobile Repairing Center & Accessories Store
## Complete Professional Full-Stack Application for Nepal

A production-ready full-stack web application and mobile repairing management system built for **Pawan Mobile Repairing Center** in Nepal.

---

### 🌟 Key Features

1. **Animated Brand Intro Screen & Modern UI**:
   - Animated phone circuit and glowing repair logo with slogan *"Your Trusted Mobile Repair & Accessories Partner"*.
   - Respects `prefers-reduced-motion` and remembers user session.
   - Complete Light and Dark theme with persistent preference.
   - Mobile-first responsive layout with 5-tab bottom navigation bar: **Home**, **Categories**, **Repair**, **Orders**, **Account**.

2. **Full Mobile Repairing Services System (All 9 Categories)**:
   - **Charging Problems**: Pin/port replacement, charging IC diagnosis, BGA board repair.
   - **Battery Problems**: Genuine cell replacement, drain diagnosis, swelling checks.
   - **Display & Touch Problems**: Original OLED replacement, OCA glass-only refurbishing, green line diagnosis.
   - **Audio Problems**: Loudspeaker, earpiece, and MEMS mic replacement.
   - **Power & Motherboard Problems**: Short-circuit diagnosis, dead phone revival, data recovery.
   - **Network & Connectivity**: Baseband IC, Wi-Fi greyed out, NTC/Ncell signal diagnosis.
   - **Camera & Sensors**: Sapphire lens replacement, OIS stabilizer repair, proximity sensors.
   - **Software Problems**: Bootloop recovery, official firmware flashing, data-safe OS restore.
   - **Additional Repairs**: Ultrasonic water-damage chemical cleaning, back glass laser replacement.

3. **12-Step Guided Repair Booking System**:
   - Device brand & model selection.
   - Fault diagnosis selection with symptoms and optional photo upload.
   - Appointment date and time slot picker with double-booking prevention.
   - Choice of Shop Visit, Home Courier Pickup, or Free Inspection.
   - Generates unique tracking ID (e.g. `PMR-2026-XXXX`).

4. **Live Repair Progress Tracker & Quote Approval**:
   - Real-time 8-step progress timeline: *Pending → Confirmed → Device Received → Under Diagnosis → Awaiting Approval → In Progress → Ready for Pickup → Completed*.
   - Customer can review quoted repair price in NPR and click **Approve** or **Decline** before work proceeds.
   - Printable Job Card & Tax Invoice with Nepal PAN/VAT details.

5. **Transactional SMS Notification Service**:
   - Automated transactional SMS dispatched for key events:
     - New repair bookings (booking number, date, device).
     - Order confirmations (order number, total NPR).
     - Live repair status updates (especially *"Ready for Pickup"* alert).
     - eSewa and Khalti payment verification receipts.
   - Supports Nepal's major SMS gateways (**Sparrow SMS** and **Aakash SMS**), with intelligent sandbox simulation and full admin delivery audit log.
   - Respects customer privacy with an in-app opt-out toggle in customer profile.

6. **Accessories E-Commerce Store (Daraz-inspired Layout)**:
   - Complete catalog across Chargers (GaN 65W, 20W PD, 33W Sonic), Earphones, Over-Ear Headphones, Waterproof Bluetooth Speakers, 100W Braided Data Cables, Power Banks, Tempered Glass, and Repair Toolkits.
   - Price range filter, brand filter, live search, and sorting (Price, Rating, Newest).
   - Server-validated cart, delivery fee calculation (Free over NPR 2,000), and coupon codes (`PAWAN100`, `REPAIR10`, `NEWCUSTOMER`).

7. **Product Wishlist System**:
   - Customers can save accessories to their wishlist with one tap.
   - Synchronized with customer account in the database and persisted in localStorage for guests.
   - "Add All to Cart" and individual cart moves directly from the wishlist.

8. **Verified Customer Reviews & Ratings**:
   - Customers can leave 1-5 star ratings and reviews for products purchased and repair jobs completed.
   - Verified Purchase and Verified Repair badges.
   - Admin moderation interface to review, approve, or hide customer submissions.

9. **Nepal Payment Gateways (eSewa & Khalti Official v2 APIs)**:
   - **eSewa ePay v2**: HMAC-SHA256 signature generator (`total_amount`, `transaction_uuid`, `product_code`, secret `8gBm/:&EnhH.1/q`). Cryptographic callback verification.
   - **Khalti v2 ePayment**: Sandbox `pidx` initiation and server-side lookup verification.
   - **Cash on Delivery (COD)** and **Pay at Shop Counter**.
   - Server-side amount validation (never trusts frontend totals).

10. **Interactive Google Maps & Contact**:
    - Embedded Google Maps with shop pin marker.
    - Click-to-call and 1-click WhatsApp instant chat.
    - Validated inquiry contact form.

11. **Dedicated Admin Dashboard**:
    - Overview KPIs: Verified NPR revenue, active repair jobs, today's orders, low-stock warnings.
    - Product Management: Add, edit, delete, update stock & prices.
    - Repair Management: Update status, assign technician, quote prices, record parts & labor charges.
    - Order Fulfillment: Update shipping & payment status.
    - SMS Logs: Audit trail of all customer notifications with manual resend.
    - Review Moderation & Shop Settings configuration.

---

### 🔑 Demo Accounts for Instant Testing

| Role | Email | Password | Quick Login |
|---|---|---|---|
| **Shop Owner / Admin** | `admin@pawanmobile.com` | `admin123` | 1-Click button on login page |
| **Customer** | `customer@pawanmobile.com` | `customer123` | 1-Click button on login page |
| **Google Sign-In** | Simulated Google OAuth | Click "Sign In with Google" | Instant session creation |

---

### 🛠️ Environment Configuration (`.env`)

| Variable | Description | Sandbox Default |
|---|---|---|
| `ESEWA_PRODUCT_CODE` | eSewa Merchant Product Code | `EPAYTEST` |
| `ESEWA_SECRET_KEY` | eSewa HMAC-SHA256 Secret | `8gBm/:&EnhH.1/q` |
| `KHALTI_PUBLIC_KEY` | Khalti Sandbox Public Key | `test_public_key_dc74e0fd57cb46cd93832aee0a505e44` |
| `KHALTI_SECRET_KEY` | Khalti Sandbox Secret Key | `test_secret_key_f59e8b7d18b2499f88457d5e1f9cf724` |
| `SHOP_NAME` | Business Name | `Pawan Mobile Repairing Center` |
| `SHOP_PHONE` | Customer Helpline | `+977-9812345678` |
| `SHOP_WHATSAPP` | WhatsApp Instant Contact | `+977-9812345678` |

---

### 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run full-stack dev server (Express + Vite on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
