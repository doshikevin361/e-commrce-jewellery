# Retailer: B2B Products → Portal पर बेचने का पूरा Flow

यह document पूरा flow बताता है: retailer B2B में products खरीदता है → **Sell to Portal** से अपनी listing में डालता है → **My Products** से price/listing manage करता है → (आगे) website पर customer को दिखेगा और order/tracking flow.

---

## 1. मुख्य बातें (Summary)

| बात | विवरण |
|-----|--------|
| **Retailer की inventory** | अलग collection `retailer_products` — हर entry की **अलग _id** (product ID). |
| **Sell to Portal** | B2B order place होने के बाद retailer **My Orders** में जाकर उस order पर बटन दबाता है → उस order की **सारी products** एक क्लिक में `retailer_products` में add हो जाती हैं. |
| **My Products** | Retailer अपनी portal products की list देखता है, **price change** करता है, **status** (Active/Inactive) से listing portal पर दिखाता/छुपाता है. |
| **Website पर (आगे)** | Retailer products अलग section में दिखेंगे — shop name, अलग product ID, retailer की price. |
| **Order tracking (आगे)** | Customer जो retailer product से order करेगा, उसका tracking **retailer** update करेगा. |

---

## 2. Implemented Flow (जो अभी code में है)

### 2.1 B2B Order → Sell to Portal

1. Retailer login करके **Products** (catalog) से add to cart करता है।
2. **Cart** → **Checkout** (COD/Razorpay) → **B2B Order** place होता है।
3. **My Orders** (`/retailer/orders`) पर सारे B2B orders दिखते हैं।
4. हर order card पर **"Sell to Portal"** बटन होता है।
5. Retailer जिस order की products portal पर बेचना चाहता है, उस पर **Sell to Portal** क्लिक करता है।
6. Backend:
   - `POST /api/retailer/orders/[orderId]/sell-to-portal`
   - Order validate होता है (retailer का order, orderType = b2b).
   - हर order item के लिए `retailer_products` में **upsert** होता है:
     - **Key:** `retailerId` + `sourceProductId` (vendor product).
     - **Update:** `name`, `mainImage`, `shopName`, `sellingPrice` (order item की price), `quantity` += item.quantity, `status` = 'active', `updatedAt`.
     - पहली बार हो तो नया document (नई **_id**) create होता है; वही **अलग product ID** है.
7. Success पर toast: "All N product(s) added to your portal listing. You can edit price & manage them in My Products."

**नोट:** Delivery का इंतजार नहीं — order place होते ही retailer चाहे तो "Sell to Portal" दबा सकता है। (बाद में चाहें तो rule लगा सकते हैं जैसे सिर्फ delivered orders पर बटन दिखे।)

### 2.2 My Products — List, Price Change, Status

1. Sidebar में **My Products** लिंक → `/retailer/my-products`.
2. **GET /api/retailer/my-products** — query: `page`, `limit`, `status` (all | active | inactive). Response: retailer की `retailer_products` list + pagination.
3. Page पर:
   - हर product: image, name, quantity, **selling price**, **status** (Active/Inactive).
   - **Price change:** Pencil icon → amount edit → Save. Backend: **PATCH /api/retailer/my-products/[id]** body `{ "sellingPrice": number }`.
   - **Status:** Dropdown Active/Inactive. Same PATCH with `{ "status": "active" | "inactive" }`. Inactive = portal पर न दिखे (जब website पर retailer products लाएँगे).
   - Filter: All / Active / Inactive.
   - Empty state: "No products on portal yet" → link to **My Orders** (Sell to Portal use करो).

### 2.3 Data Model (Implemented)

**Collection: `retailer_products`**

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | अलग product ID (MongoDB auto). Website पर retailer listing के लिए यही use होगी. |
| `retailerId` | ObjectId | Retailer ref. |
| `sourceProductId` | ObjectId | Original vendor product. |
| `name` | string | Product name (order item से). |
| `mainImage` | string | Image URL (order item से). |
| `shopName` | string | Retailer company/shop name. |
| `sellingPrice` | number | Retailer की selling price; My Products से change होती है. |
| `quantity` | number | Stock (Sell to Portal पर add; आगे customer order पर minus). |
| `status` | string | 'active' \| 'inactive'. |
| `createdAt` | Date | |
| `updatedAt` | Date | |

Upsert key: `(retailerId, sourceProductId)`. Same product फिर "Sell to Portal" से add करने पर **quantity** बढ़ती है, बाकी fields update.

### 2.4 APIs (Implemented)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/retailer/orders/[orderId]/sell-to-portal` | उस B2B order की सारी items को retailer_products में add/update. |
| GET | `/api/retailer/my-products` | Retailer की portal products list (pagination, status filter). |
| PATCH | `/api/retailer/my-products/[id]` | Update `sellingPrice` और/या `status`. |

### 2.5 Pages / UI (Implemented)

| Page | Path | Description |
|------|------|-------------|
| My Orders | `/retailer/orders` | B2B orders list; हर order पर **Sell to Portal** बटन. |
| My Products | `/retailer/my-products` | Portal products list, price edit, Active/Inactive. |

Sidebar: Dashboard, Products, **My Products**, Cart, Orders.

---

## 3. Flow Diagram (Implemented Part)

```
[Retailer] B2B Catalog → Cart → Checkout → B2B Order placed
        ↓
[Retailer] My Orders → "Sell to Portal" on an order
        ↓
POST /api/retailer/orders/[orderId]/sell-to-portal
        ↓
For each order item: upsert retailer_products (retailerId, sourceProductId)
  → quantity += , set name, mainImage, shopName, sellingPrice, status: active
        ↓
[Retailer] My Products → See list, change price (PATCH), set Active/Inactive (PATCH)
        ↓
(आगे) Website पर retailer products दिखाना, customer cart/checkout, orderType: retailer, tracking
```

---

## 4. आगे का Flow (Website + Customer + Tracking)

यह अभी code में **नहीं** है; document के लिए रखा गया है।

### 4.1 Website पर retailer products दिखाना

- Public API जैसे `GET /api/public/retailer-products` या existing products API में filter (seller = retailer).
- Listing में: retailer_products की **_id** use करें, "Sold by [shopName]", retailer की **sellingPrice**.
- Customer product page पर option: "Buy from [Retailer Name]" — retailer product _id से Add to cart.

### 4.2 Cart और Checkout

- Cart item में जो retailer से है उसके लिए `productId` = retailer_products._id, और `sellerType: 'retailer'` / `retailerId`.
- Checkout पर order create करते समय:
  - Items जो retailer से हों: order में `orderType: 'retailer'`, `retailerId`, items[].product = retailer product _id.
  - Place order के बाद उन items की **retailer_products.quantity** कम करें.

### 4.3 Retailer — Orders to fulfill / Tracking

- Retailer dashboard पर "My Sales" या "Orders to fulfill": orders जहाँ `orderType === 'retailer'` और `retailerId === current retailer`.
- Retailer order status update करे: Processing → Shipped (tracking number) → Delivered.
- Customer "My Orders" / order details में वही status और tracking दिखे.

### 4.4 Implementation Checklist (आगे के लिए)

- [ ] **Public API** — retailer products list for website (active only).
- [ ] **Website UI** — retailer products section / filter, "Sold by [Shop Name]", retailer product _id.
- [ ] **Cart** — support retailer product _id और retailerId.
- [ ] **Checkout/Order** — orderType 'retailer', retailerId; place order पर retailer_products.quantity decrease.
- [ ] **Retailer: My Sales** — list retailer orders, update order status & tracking number.
- [ ] **Customer** — order details में retailer order की tracking/status।

---

## 5. Short Summary (Hindi)

- **Sell to Portal:** My Orders में जिस B2B order पर बटन दबाओगे, उसकी सारी products एक क्लिक में **retailer_products** में add हो जाती हैं (अलग product ID / अलग entry).
- **My Products:** उन्हीं products की list, **price change**, **Active/Inactive** से portal listing manage करो.
- **आगे:** यही retailer products website पर अलग दिखेंगे; customer खरीदेगा तो order retailer को मिलेगा और **tracking retailer update** करेगा।
