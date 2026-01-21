# 🌾 Bromoul MVP

A modern, Khmer-first marketplace platform connecting farmers (កសិករ) and buyers (អ្នកទិញ) directly.


## Quick Start

### Prerequisites
- **Node.js** 16.x or higher
- **npm** 8.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Run

```bash
# Clone or download the repository
cd bromoul-mvp/client

# Install dependencies (one-time)
npm install

# Start development server
npm run dev
```

## How to Use

###  **Landing Page** (ទំព័រដើម)
- Open app → See two role buttons
- Click "កសិករ" to become **Farmer**
- Click "អ្នកទិញ" to become **Buyer**
- Role is saved to localStorage, persists across reloads

###  **Farmer Dashboard**
- **ដំណាំរបស់ខ្ញុំ (My Listings)** – Add/Edit/Delete crops
  - Form: Crop name, Quantity, Price (៛)
  - All data persists to localStorage
- **ការបញ្ជាទិញ (Orders)** – Track delivery
  - See 6-step tracker: Agreed → Preparing → Ready → Out for Delivery → Completed

### **Buyer Dashboard**
- **ស្វែងរក (Search)** – Browse farmer products
  - Filter by crop & region
  - "បញ្ជាទិញ (Test)" button simulates order creation
- **សំណើរបស់ខ្ញុំ** – Post what you need
- **ការបញ្ជាទិញ (Orders)** – Track purchases

### **Marketplace** (ផ្សារ)
- Toggle tabs: "ផលិតផលកសិករ" (Supply) ↔ "តម្រូវការអ្នកទិញ" (Demand)
- Search by crop name
- Click "ទាក់ទង" (Contact) → Opens chat
- Click "+ កន្ត្រក" (Add to Cart) → Adds to shopping cart

###  **Shopping Cart** (កន្ត្រក)
- View items, quantities, subtotal
- Choose delivery: ធម្មតា (Standard: 5,000 ៛) / ត្រជាក់ (Cold: 20,000 ៛)
- Click "បន្តទៅការទូទាត់" → Payment modal
- **Payment Methods:**
  - **ABA QR** – Mock QR code (auto-confirms after 5s in demo)
  - **Cash on Delivery** – Confirmation only

###  **Analytics** (វិភាក)
- **Pie Chart** displays:
  - Green slice = Total Supply (ផ្គត់ផ្គង់)
  - Orange slice = Total Demand (តម្រូវការ)
- Data updates from localStorage listings in real-time

### **Chat** (សារ)
- See list of conversations
- Click to open message thread
- Type and send messages (stored in localStorage)
- All messages persist across sessions

## Data Persistence (localStorage)

All data stored under `bromoul:` prefix:

### Collections

| Key | Description | Sample |
|-----|-------------|--------|
| `bromoul:users` | User accounts | `[{id, name, role, email}]` |
| `bromoul:crops` | Available crops | `[{id, name_kh, category}]` |
| `bromoul:listings` | Farmer supply & buyer demand | `[{id, user_id, crop_id, type, quantity, price_riel}]` |
| `bromoul:cart` | Shopping cart items | `[{id, name, quantity, price_riel}]` |
| `bromoul:orders` | Completed orders | `[{id, buyer_id, seller_id, total_riel, delivery_status}]` |
| `bromoul:messages` | Chat messages | `[{id, sender_id, receiver_id, text, created_at}]` |
| `bromoul:role` | Last selected role | `"farmer"` or `"buyer"` |

### Reset All Data

**Option 1: Browser DevTools**
1. Open DevTools (F12)
2. Go to **Application** → **Storage** → **Local Storage**
3. Click each `bromoul:*` key and delete
4. Refresh page

**Option 2: Browser Console**
```javascript
localStorage.clear();
window.location.reload();
```

**Option 3: In-app Reset (add to navbar)**
```javascript
const resetData = () => {
  localStorage.clear();
  window.location.href = '/';
};
```

## Branding & Styling

### Colors (Bromoul Brand)
- **Primary Green**: `#4CAF50` (buttons, active states)
- **Secondary Orange**: `#FF9800` (alternative action, warnings)
- **White**: `#FFFFFF` (backgrounds)
- **Text Dark**: `#333333` (main text)
- **Text Light**: `#757575` (secondary text)
- **Gray**: `#e0e0e0` (borders, dividers)

### Typography
- **Font**: Noto Sans Khmer (all text, both Khmer & English labels)
- **Import**: Already in `index.html` via Google Fonts
- **Sizes**:
  - Hero titles: 48px, bold
  - Page titles: 28px, bold
  - Section titles: 32px, bold
  - Body text: 16px, regular

### Components
- **Buttons**: Rounded corners (8px), subtle shadow, hover lift effect
- **Cards**: White bg, shadow, rounded 12px, hover elevation
- **Inputs**: Green border on focus, Khmer placeholders
- **Badges**: Green background (verified), Orange (pending)

## Sample Data Included

On first app load, mock data is auto-seeded:

### Users
- **Farmer**: សុខា (Sokha) – sokha@farm.com
- **Buyer**: វិចិត្រ (Dara) – dara@mart.com

### Crops (6 varieties)
- ស្វាយ (Mango) – Fruit
- ចេក (Banana) – Fruit
- ល្ពៅ (Pumpkin) – Vegetable
- ល្ហុង (Papaya) – Fruit

### Listings
- 3 Farmer supplies at various prices
- 2 Buyer demands with different timeframes

## Khmer UI Copy Reference

### Common Buttons
| English | Khmer |
|---------|-------|
| Add | បន្ថែម |
| Edit | កែប្រែ |
| Delete | លុប |
| Contact | ទាក់ទង |
| Add to Cart | បញ្ចូលទៅកាន់កន្ត្រក |
| Pay | បង់ប្រាក់ |
| Confirm | បញ្ជាក់ |
| Cancel | បោះបង់ |

### Common Labels
| English | Khmer |
|---------|-------|
| Product Name | ឈ្មោះផលិតផល |
| Quantity | បរិមាណ |
| Price (Riel) | តម្លៃ (៛) |
| Duration | រយៈពេល |
| Message | សារ |
| Success | ជោគជ័យ |
| Error | កំហុស |
| Loading | កំពុងដំណើរការ |

## Contributing

Help improve Bromoul:
1. Report bugs with browser console errors
2. Suggest features for farming community
3. Translate UI to other Khmer regions


## Status

**MVP v2.0** – Ready for Testing  
**Last Updated**: January 2025  
**Tech Stack**: React 19 + Vite + localStorage + Chart.js  
**Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)