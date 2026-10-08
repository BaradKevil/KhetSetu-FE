export const menulist = [
  // Farmer (Seller) Menu Items
  {
    id: 'seller-dashboard',
    name: 'Dashboard',
    path: '/seller',
    roles: ['seller'],
  },
  {
    id: 'seller-products',
    name: 'My Crop Listings',
    path: '/seller/products',
    roles: ['seller'],
  },
  {
    id: 'seller-new-product',
    name: 'Add New Crop',
    path: '/seller/products/new',
    roles: ['seller'],
  },
  {
    id: 'seller-orders',
    name: 'Incoming Orders',
    path: '/seller/orders',
    roles: ['seller'],
  },
  {
    id: 'seller-earnings',
    name: 'Earnings & Payouts',
    path: '/seller/earnings',
    roles: ['seller'],
  },
  {
    id: 'seller-kyc',
    name: 'Farm Profile & KYC',
    path: '/seller/profile',
    roles: ['seller'],
  },

  // Buyer Menu Items
  {
    id: 'buyer-dashboard',
    name: 'Buyer Overview',
    path: '/buyer',
    roles: ['buyer'],
  },
  {
    id: 'buyer-market',
    name: 'Explore Mandi',
    path: '/buyer/market',
    roles: ['buyer'],
  },
  {
    id: 'buyer-orders',
    name: 'My Escrow Orders',
    path: '/buyer/orders',
    roles: ['buyer'],
  },
  {
    id: 'buyer-profile',
    name: 'Business Profile',
    path: '/buyer/profile',
    roles: ['buyer'],
  },

  // Super Admin Menu Items
  {
    id: 'admin-dashboard',
    name: 'Control Tower',
    path: '/admin',
    roles: ['super_admin', 'staff'],
    // section: 'OVERVIEW',
  },
  {
    id: 'admin-users',
    name: 'Users Directory',
    path: '/admin/users',
    roles: ['super_admin', 'staff'],
    // section: 'PEOPLE',
  },
  {
    id: 'admin-kyc',
    name: 'KYC Approvals',
    path: '/admin/kyc',
    roles: ['super_admin', 'staff'],
    // section: 'PEOPLE',
  },
  {
    id: 'admin-orders',
    name: 'Orders Oversight',
    path: '/admin/orders',
    roles: ['super_admin', 'staff'],
    // section: 'MARKETPLACE',
  },
  {
    id: 'admin-listings',
    name: 'Listing Moderation',
    path: '/admin/listings',
    roles: ['super_admin', 'staff'],
    // section: 'MARKETPLACE',
  },
  {
    id: 'admin-disputes',
    name: 'Disputes & Claims',
    path: '/admin/disputes',
    roles: ['super_admin', 'staff'],
    // section: 'MARKETPLACE',
  },
  {
    id: 'admin-ledger',
    name: 'Double-Entry Ledger',
    path: '/admin/finance/ledger',
    roles: ['super_admin', 'staff'],
    // section: 'FINANCE',
  },
  {
    id: 'admin-payouts',
    name: 'Payout Approvals',
    path: '/admin/finance/payouts',
    roles: ['super_admin', 'staff'],
    // section: 'FINANCE',
  },
  {
    id: 'admin-audit',
    name: 'Audit Trail',
    path: '/admin/audit',
    roles: ['super_admin', 'staff'],
    // section: 'SYSTEM',
  },
  {
    id: 'admin-settings',
    name: 'Platform Settings',
    path: '/admin/settings',
    roles: ['super_admin', 'staff'],
    // section: 'SYSTEM',
  },
];
