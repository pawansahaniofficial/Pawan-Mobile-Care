export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'technician' | 'customer';
  avatarUrl?: string;
  addresses?: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state?: string;
    isDefault: boolean;
  }>;
  smsNotificationsEnabled?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  description: string;
  compatibility: string[];
  stock: number;
  sku: string;
  warranty: string;
  images: string[];
  features: string[];
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  createdAt: string;
}

export interface RepairService {
  id: string;
  title: string;
  slug: string;
  category: 'charging' | 'battery' | 'display' | 'audio' | 'power' | 'network' | 'camera' | 'software' | 'additional';
  categoryLabel: string;
  iconName: string;
  symptoms: string[];
  possibleCauses: string[];
  procedure: string[];
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  estimatedDuration: string;
  compatibleBrands: string[];
  isPopular?: boolean;
  description: string;
  rating?: number;
  reviewCount?: number;
}

export interface DeviceBrand {
  id: string;
  name: string;
  models: string[];
}

export interface RepairBooking {
  id: string;
  bookingNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  brand: string;
  model: string;
  serviceCategory: string;
  serviceTitle: string;
  issueDescription: string;
  photos: string[];
  appointmentDate: string;
  timeSlot: string;
  serviceType: 'shop_visit' | 'pickup_delivery' | 'free_diagnosis';
  pickupAddress?: string;
  status: 'Pending' | 'Confirmed' | 'Device Received' | 'Under Diagnosis' | 'Awaiting Approval' | 'In Progress' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  assignedTechnician?: string;
  technicianNotes?: string;
  quotedCost?: number;
  partsUsed?: Array<{ partName: string; cost: number }>;
  laborCharge?: number;
  customerApprovedQuote?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    landmark?: string;
    province?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'esewa' | 'khalti' | 'cod' | 'pay_at_shop';
  paymentStatus: 'pending' | 'verified' | 'failed' | 'refunded';
  transactionId?: string;
  paymentReference?: string;
  fulfillmentStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  location?: string;
  targetType: 'product' | 'repair';
  targetId: string;
  targetName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  isFeatured?: boolean;
  helpfulCount?: number;
  adminReply?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  province: string;
  openingHours: string;
  googleMapsEmbed: string;
  googleMapsDirectionsUrl: string;
  standardDeliveryChargeNpr: number;
  freeDeliveryThresholdNpr: number;
  announcementText?: string;
  isPickupAvailable: boolean;
  esewaProductCode?: string;
  esewaSandbox?: boolean;
  khaltiPublicKey?: string;
  khaltiSandbox?: boolean;
  smsEnabled?: boolean;
  smsProvider?: string;
}

export interface SmsLog {
  id: string;
  recipientPhone: string;
  event: string;
  message: string;
  provider: string;
  status: 'sent' | 'simulated' | 'failed';
  timestamp: string;
}
