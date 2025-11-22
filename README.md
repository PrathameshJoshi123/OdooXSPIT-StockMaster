# StockMaster Dashboard (Vite + React + Tailwind)

A simple dashboard UI for an Inventory Management System called "StockMaster".

Features:

- Top navigation with Operations dropdown
- Two main action cards: Receipts and Delivery Orders
- Quick stats and recent activity
- Responsive layout
- Mock data structured for easy replacement with API calls

## Setup (PowerShell)

Open PowerShell in this folder (`c:/Users/sahil/Desktop/StockMaster`) and run:

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev
```

Then open the address shown by Vite (usually http://localhost:5173).

## Notes

- Icons from `lucide-react`.
- Tailwind classes used for all styling.
- To replace mock data with an API call, edit `src/App.jsx` and fetch/replace `mockData`.
