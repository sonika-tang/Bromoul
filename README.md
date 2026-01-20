# Bromoul (ប្រមូល) - Client-Side MVP

This is the Client-Side Only MVP version of Bromoul, adhering to the "Pure Client" architecture. All data is persisted locally in the browser (`localStorage`), removing the need for a backend server for demonstration purposes.

## Features

- **Marketplace (Psar/ផ្សារ)**: Unified view for Farmer Supplies and Buyer Demands.
- **Analytics (Vipheak/វិភាគ)**: Real-time supply vs demand visualization using Chart.js.
- **Cart & Checkout**: Client-side cart management with simulated ABA QR payment.
- **Delivery Workflow**: State tracking (Agreed -> Preparing -> Ready -> Delivering -> Completed).
- **Role Switching**: Seamlessly switch between Farmer and Buyer roles for demoing.
- **Khmer UI**: Full Khmer language support and Bromoul branding (Green/Orange/White).

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: CSS Modules (Custom Design System)
- **Data Persistence**: `mockDB.js` (LocalStorage wrapper)
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router DOM

## Quick Start

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Run the Application**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Visit [http://localhost:5173](http://localhost:5173)

## How to Test (Demo Flow)

1. **Select Role**: On the Landing Page, click "ចូលជាកសិករ" (Farmer) or "ចូលជាអ្នកទិញ" (Buyer). This sets your role in `localStorage`.
2. **Farmer Flow**:
   - Go to "ផ្សារ" (Marketplace) to view listings.
   - Go to "វិភាគ" (Analytics) to see supply/demand charts.
   - Manage incoming orders in the dashboard (simulated).
3. **Buyer Flow**:
   - Add items to Cart.
   - Checkout with simulated Payment.
   - Track delivery status in "ការដឹកជញ្ជូន" (Delivery) tab.
4. **Reset Data**:
   - To clear all data (users, listings, orders), open DevTools Application > LocalStorage > Clear All.
   - Reload the page to re-seed initial data.

## Project Structure

- `src/services/mockDB.js`: The core data layer. Handles seeding and CRUD operations against `localStorage`.
- `src/services/api.js`: Service layer connecting UI to `mockDB`.
- `src/pages/`: Main application views (FarmerDashboard, BuyerDashboard, Marketplace, CartPage, AnalyticsPage).

## Branding

- **Colors**: White (#FFFFFF), Green (#4CAF50), Orange (#FF9800)
- **Typography**: Noto Sans Khmer
- **Language**: Khmer (ភាសាខ្មែរ) only
