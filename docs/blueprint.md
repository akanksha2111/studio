# **App Name**: SwiftWheels Driver

## Core Features:

- Nearby Order Display: Display nearby orders within a 3-4 km radius based on the driver's current location using demo data.
- Order Card Details: Show order details (value, items, locations, time) on order cards.
- Order Acceptance Control: Allow drivers to accept multiple orders but prevent accepting orders exceeding wallet balance using a real-time check.
- Wallet Balance Display: Display the driver's current wallet balance.
- Demo Data Loading: Load mock data for restaurants, orders, drivers, and pricing.

## Style Guidelines:

- Primary color: White (#FFFFFF) for a clean base.
- Secondary color: Light gray (#F0F2F5) for backgrounds and subtle contrasts.
- Accent: Teal (#008080) for interactive elements and highlights.
- Clear and readable font for order details and wallet information.
- Simple and intuitive icons for order status and navigation.
- Mobile-first, card-based layout for easy browsing on smaller screens.

## Original User Request:
Prompt:

Design and build a responsive website interface for delivery drivers, inspired by apps like Swiggy and Instamart. The site should include demo data for testing and visualization purposes.

Core Features:

Driver Dashboard:

Display nearby orders within a 3-4 km radius based on the driver's current location.

Each order card should show order value, items, pickup and drop location, and estimated delivery time.

Order Management:

Drivers can accept multiple orders simultaneously.

Total value of accepted orders must not exceed the amount in the driver's wallet.

For example: if the driver has ₹2000 in their wallet, they can only accept orders with a combined value of up to ₹2000.

Wallet System:

Wallet page showing current balance.

Option to add more money.

A real-time check that prevents accepting orders beyond wallet capacity.

Demo Data:

Use mock data for restaurants, grocery stores, orders, and pricing similar to Swiggy/Instamart.

Include sample driver profiles with location, vehicle type, and wallet balance.

Tech & Design:

Clean, mobile-first UI.

Use Google Maps API or similar for distance and radius visualization.

Cards, modals, and buttons styled with Tailwind CSS or similar framework.

Goal:
Make it easy for drivers to browse and accept nearby orders efficiently, while ensuring wallet-based order value restrictions are enforced.
  