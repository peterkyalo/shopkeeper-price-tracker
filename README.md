# Retail Shopkeepers: Price Tracker Tool

## Overview
Shopkeepers in informal markets often face challenges with rapidly changing supplier prices, making it difficult to make informed purchasing decisions. This tool empowers shopkeepers to compare and track supplier prices, helping them make smarter, data-driven purchases and improve their business profitability.

## Features
- **Supplier Management:** Add, edit, and view supplier details.
- **Product Management:** Manage products and their categories.
- **Price Tracking:** Record and view historical prices for each product from different suppliers.
- **Price Comparison:** Compare current prices across suppliers for any product.
- **User Authentication:** Secure login and signup for shopkeepers.
- **Responsive UI:** Works seamlessly on desktop and mobile devices.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Routing:** React Router
- **State Management:** React Context API

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/price-tracker-tool.git
   cd price-tracker-tool
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the project root:
     ```env
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
   - Replace with your actual Supabase credentials from your Supabase dashboard.
4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage
- Sign up or log in as a shopkeeper.
- Add suppliers and products relevant to your business.
- Record prices from different suppliers for each product.
- Use the price comparison feature to find the best deals.
- View price history to track trends over time.

## Folder Structure
```
src/
  ├── components/        # Reusable UI components
  ├── contexts/          # React Context providers
  ├── hooks/             # Custom React hooks
  ├── layouts/           # Layout components
  ├── pages/             # Page components (Dashboard, Login, etc.)
  ├── types/             # TypeScript types
  ├── App.tsx            # Main app component
  └── main.tsx           # Entry point
```

## Contributing
1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a pull request.

## License
This project is licensed under the MIT License.

## Acknowledgements
- [Supabase](https://supabase.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---
For any questions or support, please open an issue or contact the maintainer.
