# Phase 2: Seller & Restaurant Management

This plan outlines the steps to build out the fully functional Seller Partner system for EATnaked using React Router, Supabase Auth, PostgreSQL, and Supabase Storage.

## User Review Required
> [!IMPORTANT]
> Since we are using Supabase Storage for restaurant logos and food images, I will need you to create a public storage bucket in your Supabase project named `food-images`. I will provide instructions on how to do this once we reach that step.

> [!WARNING]
> RLS Policies for Phase 2 are already partially defined in `supabase_schema.sql`, but I will enforce strict isolation to ensure Seller A cannot access or modify Seller B's data.

## Open Questions
- Do you already have a Supabase project created with the `supabase_schema.sql` applied, or should I continue using the local mock data (`localStorage`) for Phase 2? The prompt heavily implies using actual Supabase ("Use Supabase authentication", "Use Supabase Storage"). If we are moving to real Supabase, I will need the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Proposed Changes

We will transition the existing `SellerDashboardModal` and `SellerAuthModal` into dedicated full-page routes, structured for scalability and responsiveness.

### Routing & Layout

- **`src/App.jsx`**: Add seller-specific routes wrapped in a protected layout.
  - `/seller/login`
  - `/seller/register`
  - `/seller/dashboard` (Overview)
  - `/seller/restaurant` (Setup/Edit, Image Uploads, Location)
  - `/seller/menu` (Categories & Food Items)
  - `/seller/settings` (Profile, Password)
- **`src/layouts/SellerLayout.jsx`**: A dedicated sidebar layout for sellers, distinct from the customer `MainLayout`. Responsive (collapsible sidebar on mobile).

### Authentication

- **`src/pages/seller/SellerLoginPage.jsx` & `SellerRegisterPage.jsx`**: Form validation (email, password match), integrating with `authService.signUpSeller` to create the user and assign the `seller` role in the `profiles` table.

### Restaurant Setup & Management

- **`src/pages/seller/RestaurantSetupPage.jsx`**: Initial setup wizard capturing Name, Description, Address (Lat/Lng manual entry), Cuisine, Radius, and Prep Time. Sets status to `DRAFT`.
- **`src/pages/seller/SellerRestaurantPage.jsx`**: Editing existing restaurant details, toggling `ACTIVE`/`PAUSED`, and configuring opening hours (stored as JSON text in the `opening_hours` column).
- **`src/services/storageService.js`**: New service to handle uploading Logos and Cover images to the `food-images` bucket using `supabase.storage`.

### Menu Management

- **`src/pages/seller/SellerMenuPage.jsx`**: Main hub for managing categories and items.
- **Categories**: UI to Add, Edit, Delete, and Reorder categories.
- **Food Items**: Form to create/edit food items including: Name, Description, Price, Image Upload, Veg/Non-Veg, Bestseller toggle, Prep Time, and Availability toggle.
- **Item Isolation**: Validate that the `category_id` selected belongs to the seller's `restaurant_id`.
- **Soft Deletes/Safe Deletes**: When deleting an item, ensure it warns the user. (Note: RLS and foreign keys are set to `ON DELETE CASCADE` or `SET NULL` in the schema. We will stick to the schema's design).

### Dashboard & Preview

- **`src/pages/seller/SellerDashboardPage.jsx`**: Overview metrics (Total items, available/unavailable count, profile completion percentage). Orders tab will show "Coming in the next phase".
- **`src/pages/seller/RestaurantPreviewPage.jsx`**: Uses the same customer-facing components (`RestaurantPageModal` UI) to render a live preview of the seller's menu.

### Data Security & Validation

- Rely on Supabase Row Level Security (RLS) to enforce isolation.
- Remove any frontend-only filtering that could be bypassed.

## Verification Plan

### Manual Verification
1. Register a new Seller A. Complete restaurant setup.
2. Upload images for Logo and Food items. Check if they render correctly.
3. Create Categories and Food Items. Toggle availability and verify UI updates.
4. Preview the restaurant.
5. Register Seller B. Verify Seller B sees an empty dashboard and cannot access Seller A's data or images.
6. Verify customer side (`/`) still works seamlessly.
