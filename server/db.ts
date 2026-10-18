import fs from 'fs';
import path from 'path';

// Define DB directory and file
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'technician' | 'customer';
  passwordHash: string;
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

export interface Review {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  location?: string;
  targetType: 'product' | 'repair';
  targetId: string;
  targetName: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  isVerified: boolean; // verified buyer or completed repair
  isApproved: boolean; // moderation flag
  isFeatured?: boolean;
  helpfulCount?: number;
  adminReply?: string;
  createdAt: string;
}

export interface WishlistItem {
  userId: string;
  productIds: string[];
  updatedAt: string;
}

export interface SmsLog {
  id: string;
  recipientPhone: string;
  event: 'new_booking' | 'order_confirmed' | 'repair_status_update' | 'payment_verified' | 'ready_for_pickup';
  message: string;
  provider: string;
  status: 'sent' | 'simulated' | 'failed';
  timestamp: string;
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
  logo?: string;
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

export interface PaymentRecord {
  id: string;
  transactionUuid: string;
  provider: 'esewa' | 'khalti' | 'cash';
  amount: number;
  status: 'initiated' | 'verified' | 'failed';
  orderId?: string;
  bookingId?: string;
  paymentType: 'order' | 'repair';
  gatewayResponse?: any;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
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
  esewaProductCode: string;
  esewaSecretKey: string;
  esewaSandbox: boolean;
  khaltiPublicKey: string;
  khaltiSandbox: boolean;
  standardDeliveryChargeNpr: number;
  freeDeliveryThresholdNpr: number;
  announcementText?: string;
  isPickupAvailable: boolean;
  smsProvider: 'simulation' | 'sparrow' | 'aakash' | 'twilio';
  smsApiKey?: string;
  smsSenderId?: string;
  smsEnabled: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  adminReply?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: UserProfile[];
  products: Product[];
  repairServices: RepairService[];
  deviceBrands: DeviceBrand[];
  repairBookings: RepairBooking[];
  orders: Order[];
  payments: PaymentRecord[];
  coupons: Coupon[];
  reviews: Review[];
  wishlists: WishlistItem[];
  smsLogs: SmsLog[];
  settings: ShopSettings;
  contactMessages: ContactMessage[];
  auditLogs: AuditLog[];
}

// Initial Seed Data
const initialBrands: DeviceBrand[] = [
  {
    id: 'apple',
    name: 'Apple iPhone',
    models: [
      'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 
      'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro Max', 
      'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone XR', 'iPhone X'
    ]
  },
  {
    id: 'samsung',
    name: 'Samsung Galaxy',
    models: [
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 
      'Galaxy Z Fold 5', 'Galaxy Z Flip 5', 'Galaxy A55 5G', 'Galaxy A54 5G', 'Galaxy A35', 
      'Galaxy A25', 'Galaxy A15', 'Galaxy M34', 'Galaxy M14'
    ]
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi / Redmi / POCO',
    models: [
      'Xiaomi 14 Ultra', 'Xiaomi 13 Pro', 'Redmi Note 13 Pro+ 5G', 'Redmi Note 13 Pro', 
      'Redmi Note 13', 'Redmi Note 12 Pro', 'Redmi 13C', 'Redmi 12', 'POCO X6 Pro', 
      'POCO F5', 'POCO M6 Pro'
    ]
  },
  {
    id: 'realme',
    name: 'Realme',
    models: [
      'Realme 12 Pro+ 5G', 'Realme 12+ 5G', 'Realme 11 Pro+', 'Realme 11x 5G', 
      'Realme C67', 'Realme C55', 'Realme C53', 'Realme Narzo 60'
    ]
  },
  {
    id: 'vivo',
    name: 'Vivo',
    models: [
      'Vivo X100 Pro', 'Vivo V30 Pro', 'Vivo V30', 'Vivo V29 5G', 'Vivo Y200e 5G', 
      'Vivo Y28 5G', 'Vivo Y17s', 'Vivo T2 Pro'
    ]
  },
  {
    id: 'oppo',
    name: 'Oppo',
    models: [
      'Oppo Reno 11 Pro 5G', 'Oppo Reno 11', 'Oppo Reno 10 Pro', 'Oppo A79 5G', 
      'Oppo A58', 'Oppo A38', 'Oppo A18'
    ]
  },
  {
    id: 'oneplus',
    name: 'OnePlus',
    models: [
      'OnePlus 12', 'OnePlus 12R', 'OnePlus 11 5G', 'OnePlus Nord 4', 
      'OnePlus Nord CE 4', 'OnePlus Nord CE 3 Lite', 'OnePlus 10 Pro'
    ]
  },
  {
    id: 'transsion',
    name: 'Infinix & Tecno',
    models: [
      'Infinix Note 40 Pro', 'Infinix GT 20 Pro', 'Infinix Hot 40 Pro', 'Tecno Camon 30 Premier', 
      'Tecno Spark 20 Pro+', 'Tecno Pova 6 Pro'
    ]
  },
  {
    id: 'google',
    name: 'Google Pixel',
    models: [
      'Pixel 9 Pro XL', 'Pixel 9', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7a', 'Pixel 6a'
    ]
  }
];

const initialRepairServices: RepairService[] = [
  // A. Charging Problems
  {
    id: 'charge-pin-port-rep',
    title: 'Charging Port & Pin Replacement',
    slug: 'charging-port-replacement',
    category: 'charging',
    categoryLabel: 'Charging Problems',
    iconName: 'Zap',
    symptoms: ['Cable falls out easily', 'Must hold cable at an angle to charge', 'Device does not charge at all', 'Burnt or blackened charging pins'],
    possibleCauses: ['Accumulated pocket lint & debris', 'Bent internal pin contacts', 'Oxidation or liquid exposure', 'Physical stress from tugging cable'],
    procedure: ['Microscope inspection of socket contacts', 'Precision hot-air SMD desoldering of old port', 'Cleaning PCB solder pads with copper wick', 'Installing OEM gold-plated Type-C/Lightning connector', 'Stress testing with 5V/9V fast charging protocol'],
    estimatedPriceMin: 800,
    estimatedPriceMax: 2200,
    estimatedDuration: '30 - 45 mins',
    compatibleBrands: ['All Brands', 'Apple iPhone', 'Samsung', 'Xiaomi', 'Realme', 'Vivo', 'Oppo', 'OnePlus'],
    isPopular: true,
    description: 'Fix loose, broken, or water-damaged charging connectors with high-precision SMD replacement and quick turnaround.'
  },
  {
    id: 'charge-ic-diag',
    title: 'Charging IC Diagnosis & Board Repair',
    slug: 'charging-ic-repair',
    category: 'charging',
    categoryLabel: 'Charging Problems',
    iconName: 'Cpu',
    symptoms: ['Phone shows charging icon but percentage never increases (fake charging)', 'Motherboard gets burning hot during charging', 'Dead phone drawing 0.00A on ammeter'],
    possibleCauses: ['High-voltage power surge from fake local adapters', 'Faulty Tristar/Hydra IC on iPhones', 'Damaged PMIC charging sub-circuit'],
    procedure: ['Bench power supply current draw analysis', 'Thermal camera heat mapping of faulty PMIC', 'Micro-soldering replacement of BGA charging controller', 'Protective conformal coating application'],
    estimatedPriceMin: 2200,
    estimatedPriceMax: 4800,
    estimatedDuration: '2 - 4 hours',
    compatibleBrands: ['Apple iPhone', 'Samsung Galaxy', 'Xiaomi / Poco', 'OnePlus'],
    isPopular: false,
    description: 'Expert component-level motherboard charging IC diagnosis and replacement for devices not holding charge or suffering fake charging.'
  },

  // B. Battery Problems
  {
    id: 'battery-replacement',
    title: 'Genuine Battery Replacement',
    slug: 'battery-replacement',
    category: 'battery',
    categoryLabel: 'Battery Problems',
    iconName: 'BatteryCharging',
    symptoms: ['Battery health below 80%', 'Phone shuts down suddenly at 20-30%', 'Swollen back cover or lifted screen', 'Extremely fast battery drain'],
    possibleCauses: ['Normal chemical degradation over 500+ charge cycles', 'Frequent overnight charging with overheating', 'Defective internal battery cells'],
    procedure: ['Safe heated back panel removal', 'Discharge check and safe adhesive strip release', 'Installation of Grade A OEM high-density cell', 'Battery calibration and load testing', 'New waterproof adhesive gasket seal'],
    estimatedPriceMin: 1400,
    estimatedPriceMax: 4500,
    estimatedDuration: '25 - 40 mins',
    compatibleBrands: ['All Brands', 'Apple iPhone', 'Samsung', 'Xiaomi', 'Realme', 'Vivo', 'OnePlus'],
    isPopular: true,
    description: 'Revive phone battery backup with high-capacity tested batteries backed by a 6-month shop warranty.'
  },

  // C. Display and Touch Problems
  {
    id: 'display-touch-screen',
    title: 'Original / OLED Display & Touch Replacement',
    slug: 'display-replacement',
    category: 'display',
    categoryLabel: 'Display & Touch Problems',
    iconName: 'Smartphone',
    symptoms: ['Shattered glass screen', 'Green/pink vertical lines on display', 'Black ink spots spreading on panel', 'Ghost touch or unresponsive touch zones'],
    possibleCauses: ['Direct drop impact on hard concrete/tile', 'Extreme localized pressure in pocket', 'Flex cable micro-tear near hinge/bottom frame'],
    procedure: ['Frame separation with temperature-controlled heating pad', 'Glass & digitizer removal without frame distortion', 'Dust-free frame cleaning & true-tone / color calibration transfer', 'Assembly with original optical adhesive & pressure clamp curing'],
    estimatedPriceMin: 2800,
    estimatedPriceMax: 16500,
    estimatedDuration: '45 - 60 mins',
    compatibleBrands: ['Apple iPhone', 'Samsung Galaxy', 'Xiaomi', 'Realme', 'OnePlus', 'Vivo', 'Oppo'],
    isPopular: true,
    description: 'High refresh-rate Super AMOLED and crisp IPS display replacements with flawless touch sensitivity and vibrant color reproduction.'
  },
  {
    id: 'glass-only-refurbish',
    title: 'Outer Glass Only Replacement (OCA Refurbishing)',
    slug: 'glass-only-replacement',
    category: 'display',
    categoryLabel: 'Display & Touch Problems',
    iconName: 'Layers',
    symptoms: ['Outer glass cracked but display image & touch work 100% fine', 'Spiderweb hairline cracks on surface'],
    possibleCauses: ['Surface glass drop impact without internal AMOLED panel damage'],
    procedure: ['Cryogenic / hot wire glass separation from original OLED', 'Glue removal and polariser cleaning', 'Dust-free laminar flow room OCA film application', 'Vacuum laminating and autoclave bubble removal machine'],
    estimatedPriceMin: 1800,
    estimatedPriceMax: 5500,
    estimatedDuration: '1 - 2 hours',
    compatibleBrands: ['Samsung S/Note/A Series', 'Apple iPhone', 'OnePlus', 'Xiaomi'],
    isPopular: true,
    description: 'Save up to 60% compared to full combo replacement! Keep your original factory OLED panel while getting fresh, scratch-free outer glass.'
  },

  // D. Audio Problems
  {
    id: 'speaker-mic-earpiece',
    title: 'Loudspeaker, Earpiece & Mic Replacement',
    slug: 'speaker-mic-replacement',
    category: 'audio',
    categoryLabel: 'Audio Problems',
    iconName: 'Volume2',
    symptoms: ['Cannot hear caller on phone calls without speaker mode', 'Crackling, distorted, or muffled speaker sound', 'Other party cannot hear your voice', 'Microphone not recording in voice notes'],
    possibleCauses: ['Dust and metallic shavings in speaker mesh', 'Blown diaphragm coil due to water/excessive volume', 'Microphone MEMS chip failure'],
    procedure: ['Ultrasonic audio mesh deep cleansing', 'Audio transducer impedance testing', 'Installation of genuine high-decibel acoustic module', 'Call and stereo playback frequency check'],
    estimatedPriceMin: 700,
    estimatedPriceMax: 1900,
    estimatedDuration: '20 - 35 mins',
    compatibleBrands: ['All Brands'],
    isPopular: false,
    description: 'Clear, loud sound restored for calls, YouTube, and music playback using genuine acoustic replacement parts.'
  },

  // E. Power and Motherboard Problems
  {
    id: 'motherboard-short-circuit',
    title: 'Motherboard Short-Circuit & Dead Phone Recovery',
    slug: 'motherboard-dead-phone-repair',
    category: 'power',
    categoryLabel: 'Power & Motherboard Problems',
    iconName: 'Activity',
    symptoms: ['Phone completely dead and will not turn on', 'Device reboots endlessly on brand logo (bootloop)', 'Burning electronics smell or intense heating near camera bump'],
    possibleCauses: ['Short-circuited filter capacitor on main power rail (VCC_MAIN/VBAT)', 'Corrosion after water/tea spill', 'Failed CPU reball or cracked BGA solder ball'],
    procedure: ['Voltage line probe tracing with multimeter', 'Thermal diagnostic locating of shorted MLCC capacitors', 'Precision soldering station micro-jumper wire reconstruction', 'Data-safe motherboard survival diagnostic'],
    estimatedPriceMin: 2500,
    estimatedPriceMax: 7500,
    estimatedDuration: '3 - 6 hours',
    compatibleBrands: ['Apple iPhone', 'Samsung', 'Xiaomi / Poco', 'Realme', 'OnePlus'],
    isPopular: true,
    description: 'Advanced board-level micro-soldering to revive completely dead smartphones and recover vital photos, contacts, and personal data.'
  },

  // F. Network and Connectivity Problems
  {
    id: 'network-sim-wifi-repair',
    title: 'Network Signal, SIM Card & Wi-Fi IC Repair',
    slug: 'network-signal-wifi-repair',
    category: 'network',
    categoryLabel: 'Network & Connectivity',
    iconName: 'Wifi',
    symptoms: ['"No Service" or "Searching..." on status bar', 'SIM card not recognized / tray broken', 'Wi-Fi toggle switch greyed out', 'Weak cellular data in Nepal Telecom (NTC) / Ncell'],
    possibleCauses: ['Baseband power IC breakdown', 'WTR transceiver chip desoldered after a hard fall', 'Damaged coaxial RF antenna cable'],
    procedure: ['RF antenna continuity and coaxial socket check', 'Baseband voltage line diagnostics', 'Reballing or replacing Baseband IC & WTR transceiver', 'Field signal strength validation for NTC/Ncell 4G bands'],
    estimatedPriceMin: 1800,
    estimatedPriceMax: 4200,
    estimatedDuration: '1 - 3 hours',
    compatibleBrands: ['Apple iPhone', 'Samsung', 'Xiaomi', 'Vivo', 'Realme'],
    isPopular: false,
    description: 'Fix stubborn signal dropping, Wi-Fi greyed out issues, and damaged SIM trays for seamless connectivity.'
  },

  // G. Camera and Sensor Problems
  {
    id: 'camera-lens-sensor',
    title: 'Camera Module, Blurry Lens & Sensor Replacement',
    slug: 'camera-sensor-replacement',
    category: 'camera',
    categoryLabel: 'Camera & Sensor Problems',
    iconName: 'Camera',
    symptoms: ['Camera app shows black screen or crashes immediately', 'Camera rattles or vibrates violently (OIS failure)', 'Photos are blurry, hazy, or out of focus', 'Broken rear camera glass lens'],
    possibleCauses: ['Motorcycle handlebar vibrations damaging optical image stabilization', 'Shattered sapphire lens glass letting in abrasive dust', 'Liquid exposure inside sensor cavity'],
    procedure: ['Camera lens glass precision removal without opening device', 'Sensor dust extraction with optical blower', 'OEM camera module replacement with OIS alignment', 'Autofocus and multi-lens portrait switching test'],
    estimatedPriceMin: 1200,
    estimatedPriceMax: 5500,
    estimatedDuration: '30 - 45 mins',
    compatibleBrands: ['Apple iPhone', 'Samsung', 'Xiaomi', 'Realme', 'OnePlus', 'Vivo'],
    isPopular: false,
    description: 'Crystal clear photos and stable 4K video recording restored with genuine camera sensors and scratch-resistant sapphire lenses.'
  },

  // H. Software Problems
  {
    id: 'software-flashing-recovery',
    title: 'Official Firmware Recovery, Boot-loop & Software Repair',
    slug: 'software-firmware-repair',
    category: 'software',
    categoryLabel: 'Software & OS Recovery',
    iconName: 'Terminal',
    symptoms: ['Stuck on boot logo or recovery screen', 'System UI stopped error looping', 'Phone extremely slow after failed OTA update', 'Safe backup and transfer assistance'],
    possibleCauses: ['Corrupted system partition during battery drain mid-update', 'Storage chip memory exhaustion', 'Damaged bootloader configuration'],
    procedure: ['EDL / DFU mode connection to diagnostic workstation', 'Official stock ROM flashing with zero malware', 'Integrity verification of eMMC/UFS internal flash memory', 'Post-flash clean operating system optimization'],
    estimatedPriceMin: 800,
    estimatedPriceMax: 1800,
    estimatedDuration: '45 - 90 mins',
    compatibleBrands: ['All Android Brands', 'Apple iOS (iTunes/Finder restore)'],
    isPopular: true,
    description: 'Safe software flashing and boot-loop recovery using official manufacturer firmware while prioritizing data safety.'
  },

  // I. Additional Repairs
  {
    id: 'water-damage-cleaning',
    title: 'Water Damage Ultrasonic Cleaning & Corrosion Treatment',
    slug: 'water-damage-treatment',
    category: 'additional',
    categoryLabel: 'Additional Repairs',
    iconName: 'Droplets',
    symptoms: ['Dropped in bucket, rain, or river', 'Fog or condensation inside camera lens', 'Screen flickering with abnormal battery heating'],
    possibleCauses: ['Moisture ingress causing electrolytic dendrite corrosion across microchips'],
    procedure: ['Immediate battery isolation to prevent further board frying', 'Ultrasonic chemical bath in 99.9% isopropyl alcohol', 'Dehydration in SMD drying cabinet', 'Microscopic trace inspection for corroded vias'],
    estimatedPriceMin: 1200,
    estimatedPriceMax: 3500,
    estimatedDuration: '2 - 4 hours',
    compatibleBrands: ['All Brands'],
    isPopular: true,
    description: 'Professional emergency liquid damage treatment with medical-grade ultrasonic cleaners to stop oxidation and revive soaked phones.'
  },
  {
    id: 'back-glass-body-housing',
    title: 'Back Glass, Metal Frame & Housing Replacement',
    slug: 'back-glass-housing-replacement',
    category: 'additional',
    categoryLabel: 'Additional Repairs',
    iconName: 'Shield',
    symptoms: ['Shattered rear back glass', 'Bent aluminum or titanium midframe', 'Stuck volume and power physical buttons'],
    possibleCauses: ['Hard drop onto asphalt or severe vehicle impact'],
    procedure: ['Laser back glass adhesive de-bonding for iPhones', 'Precision frame realignment or chassis swap', 'Installation of fresh glass with OEM camera ring and seal'],
    estimatedPriceMin: 1500,
    estimatedPriceMax: 4800,
    estimatedDuration: '1 - 2 hours',
    compatibleBrands: ['Apple iPhone', 'Samsung Galaxy S-series', 'Xiaomi', 'OnePlus'],
    isPopular: false,
    description: 'Make your phone look brand new with precision laser glass replacement and rigid frame restorations.'
  }
];

const initialProducts: Product[] = [
  // A. Chargers
  {
    id: 'prod-chg-65w-gan',
    name: 'Pawan Turbo 65W GaN Fast Charger (Type-C + USB-A)',
    slug: 'pawan-turbo-65w-gan-charger',
    category: 'Chargers',
    subCategory: 'PD fast charger',
    brand: 'PawanTech Pro',
    price: 2450,
    originalPrice: 3200,
    discountPercentage: 23,
    description: 'Next-gen Gallium Nitride (GaN) technology delivers high-speed 65W charging for laptops, MacBooks, Samsung Super Fast Charging 2.0 (45W), and iPhone PD fast charging.',
    compatibility: ['iPhone 12-16 Series', 'Samsung S22/S23/S24 Series', 'MacBook Air/Pro', 'Xiaomi 67W Turbo', 'iPad Pro/Air'],
    stock: 28,
    sku: 'PT-GAN-65W',
    warranty: '1 Year Replacement Warranty',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622445268046-248405021a81?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['GaN III Technology', 'Dual Port (Type-C PD + USB-A QC 3.0)', 'Over-temperature & short-circuit auto cutoff', 'Compact foldable Nepali socket design'],
    rating: 4.9,
    reviewCount: 38,
    isFeatured: true,
    isPopular: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-chg-20w-pd-iphone',
    name: '20W PD USB-C Fast Adapter for iPhone & iPad',
    slug: '20w-pd-iphone-adapter',
    category: 'Chargers',
    subCategory: 'iPhone-compatible charging adapters',
    brand: 'iPro Nepal',
    price: 1250,
    originalPrice: 1750,
    discountPercentage: 28,
    description: 'Charges your iPhone up to 50% in just 30 minutes. Regulated voltage curve protects battery health from degradation in Nepal’s fluctuating power grid.',
    compatibility: ['iPhone 11 through iPhone 16 Pro Max', 'iPad 9th/10th Gen', 'AirPods Pro'],
    stock: 45,
    sku: 'IP-20W-PD',
    warranty: '6 Months Shop Warranty',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['Power Delivery 3.0', 'Smart Current Negotiation', 'Fire-retardant PC Shell', 'Cold running temperature'],
    rating: 4.8,
    reviewCount: 52,
    isFeatured: true,
    isPopular: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-chg-33w-xiaomi',
    name: '33W SonicCharge 2.0 Fast Charger with Type-C Cable',
    slug: '33w-soniccharge-charger',
    category: 'Chargers',
    subCategory: 'Compatible branded chargers',
    brand: 'Mi Compatible',
    price: 1390,
    originalPrice: 1800,
    discountPercentage: 22,
    description: 'Displays "MI Turbo Charge" on Redmi and POCO smartphones. Ships bundled with 1-meter high amp 3A cable.',
    compatibility: ['Redmi Note 10/11/12/13 series', 'Poco X3/X5', 'Realme Dart Charge', 'Samsung Adaptive Fast Charge'],
    stock: 35,
    sku: 'MI-33W-SONIC',
    warranty: '6 Months Shop Warranty',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['Quick Charge 3.0 certified', 'Includes 3A Type-C data cable', 'Surge suppression built-in'],
    rating: 4.7,
    reviewCount: 29,
    isPopular: true,
    createdAt: new Date().toISOString()
  },

  // B. Earphones
  {
    id: 'prod-ear-typec-anc',
    name: 'ProBass Type-C Digital Hi-Fi Earphones with Mic',
    slug: 'probass-type-c-earphones',
    category: 'Earphones',
    subCategory: 'USB-C earphones',
    brand: 'ProBass',
    price: 890,
    originalPrice: 1250,
    discountPercentage: 28,
    description: 'Built-in Realtek DAC chip provides crisp 24-bit 96kHz lossless audio for all smartphones without a 3.5mm headphone jack. Includes HD call microphone.',
    compatibility: ['Samsung Galaxy S & A series', 'iPhone 15 & 16 Series', 'OnePlus', 'Xiaomi', 'iPad Pro Type-C'],
    stock: 50,
    sku: 'PB-TC-HIFI',
    warranty: '3 Months Replacement',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['Integrated Digital DAC Chip', 'Braided tangle-free cable', 'Inline 3-button volume & call controls', 'Ergonomic in-ear noise isolating tips'],
    rating: 4.7,
    reviewCount: 41,
    isPopular: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-ear-tws-wireless',
    name: 'SoundWave AirBuds Pro TWS Wireless Earphones',
    slug: 'soundwave-airbuds-pro-tws',
    category: 'Earphones',
    subCategory: 'Wireless earphones',
    brand: 'SoundWave',
    price: 2150,
    originalPrice: 3200,
    discountPercentage: 32,
    description: 'Bluetooth 5.3 true wireless earbuds with Active Environmental Noise Cancellation (ENC) for clear phone calls on busy Kathmandu streets. 32 hours total playtime.',
    compatibility: ['Android', 'iOS', 'Windows', 'Mac'],
    stock: 30,
    sku: 'SW-TWS-AIR',
    warranty: '6 Months Shop Warranty',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['Bluetooth 5.3 Low Latency', 'Touch controls with volume swipe', 'IPX4 sweat & splash resistance', 'Type-C quick recharge case'],
    rating: 4.8,
    reviewCount: 65,
    isFeatured: true,
    isPopular: true,
    createdAt: new Date().toISOString()
  },

  // C. Headphones
  {
    id: 'prod-head-gaming-bt',
    name: 'ThunderX Wireless Over-Ear Active Noise Cancelling Headphones',
    slug: 'thunderx-wireless-over-ear-headphones',
    category: 'Headphones',
    subCategory: 'Bluetooth headphones',
    brand: 'ThunderX',
    price: 3650,
    originalPrice: 4900,
    discountPercentage: 25,
    description: 'Plush memory foam ear cushions, 40mm titanium dynamic drivers with punchy deep bass, low latency gaming mode, and up to 50 hours battery life.',
    compatibility: ['All Bluetooth devices', 'Aux 3.5mm wired input included', 'Gaming PCs', 'Smartphones'],
    stock: 18,
    sku: 'TX-ANC-50H',
    warranty: '1 Year Warranty',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['40mm Titanium Drivers', 'Foldable travel-friendly design', 'Built-in microphone for meetings & Discord', 'Dual connection: Bluetooth 5.3 or 3.5mm AUX'],
    rating: 4.9,
    reviewCount: 34,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },

  // D. Bluetooth Speakers
  {
    id: 'prod-spk-waterproof-mini',
    name: 'PawanBoom 16W IPX7 Waterproof Portable Bluetooth Speaker',
    slug: 'pawanboom-16w-waterproof-speaker',
    category: 'Bluetooth Speakers',
    subCategory: 'Waterproof-rated speakers',
    brand: 'PawanBoom',
    price: 2850,
    originalPrice: 3800,
    discountPercentage: 25,
    description: 'Rugged outdoor speaker with dual passive bass radiators, 360-degree room filling sound, party RGB illumination, and 14 hours battery on a single charge.',
    compatibility: ['All smartphones, laptops, and tablets via Bluetooth or MicroSD/TF card'],
    stock: 22,
    sku: 'PB-BOOM-16W',
    warranty: '1 Year Warranty',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['IPX7 waterproof rating (submersible)', '16W crystal stereo + passive subwoofer', 'MicroSD card reader & AUX mode', 'Sturdy lanyard for outdoor trekking'],
    rating: 4.9,
    reviewCount: 47,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },

  // E. Data Cables
  {
    id: 'prod-cbl-100w-braided',
    name: 'Braided 100W Type-C to Type-C Fast Charging & 480Mbps Data Cable',
    slug: '100w-type-c-braided-cable',
    category: 'Data Cables',
    subCategory: 'USB-C to USB-C cables',
    brand: 'ArmourKev',
    price: 650,
    originalPrice: 950,
    discountPercentage: 31,
    description: 'Military-grade zinc alloy connectors and ballistic nylon braiding tested for 30,000+ bends. Built-in E-marker chip safely delivers up to 100W power.',
    compatibility: ['Laptops (MacBook/Dell/HP)', 'Galaxy S24/S23 Ultra', 'iPhone 15 & 16 Series', 'iPad Pro', 'Power banks'],
    stock: 60,
    sku: 'AK-100W-CC',
    warranty: '1 Year Replacement',
    images: [
      'https://images.unsplash.com/photo-1616763355603-9755a640a287?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['E-Marker intelligent protection chip', 'Supports 100W (20V/5A) Power Delivery', 'Thick 22AWG copper core', 'Anti-fray reinforced strain relief'],
    rating: 4.8,
    reviewCount: 78,
    isPopular: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-cbl-iphone-lightning',
    name: 'Fast Charging USB to Lightning Cable for iPhone (1.2m)',
    slug: 'usb-to-lightning-cable-iphone',
    category: 'Data Cables',
    subCategory: 'Lightning-compatible iPhone cables',
    brand: 'ArmourKev',
    price: 490,
    originalPrice: 750,
    discountPercentage: 34,
    description: 'High-speed sync and 2.4A fast charging cable for iPhone 6 through iPhone 14 models. No "Accessory Not Supported" warnings.',
    compatibility: ['iPhone 6/7/8/X/11/12/13/14', 'iPad with Lightning port', 'AirPods'],
    stock: 75,
    sku: 'AK-LIGHT-12M',
    warranty: '6 Months Warranty',
    images: [
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['Gold plated contact pins', 'Supports 2.4A rapid charging', 'Flexible anti-kink TPE sheath'],
    rating: 4.7,
    reviewCount: 54,
    createdAt: new Date().toISOString()
  },

  // F. Additional Accessories
  {
    id: 'prod-pwb-20000-pd',
    name: 'MegaPower 20,000mAh 22.5W Fast Charging Power Bank',
    slug: 'megapower-20000mah-power-bank',
    category: 'Additional Accessories',
    subCategory: 'Power banks',
    brand: 'MegaPower',
    price: 2790,
    originalPrice: 3800,
    discountPercentage: 26,
    description: 'Charges your phone 4 to 5 times. Features real-time LED digital battery percentage display and triple outputs (2x USB-A + 1x Type-C bidirectional PD).',
    compatibility: ['All smartphones, tablets, smartwatches, and earbuds'],
    stock: 25,
    sku: 'MP-20K-22W',
    warranty: '1 Year Warranty',
    images: [
      'https://images.unsplash.com/photo-1609592424367-96105342bcba?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['High-density Lithium Polymer cells', 'Accurate LED numerical display', 'Airline safe & travel approved', 'Charges 3 devices simultaneously'],
    rating: 4.9,
    reviewCount: 62,
    isFeatured: true,
    isPopular: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-glass-9d-tempered',
    name: '9D Edge-to-Edge Curved Tempered Glass Screen Protector',
    slug: '9d-edge-curved-tempered-glass',
    category: 'Additional Accessories',
    subCategory: 'Tempered glass and screen protectors',
    brand: 'ShieldGlass Pro',
    price: 350,
    originalPrice: 600,
    discountPercentage: 41,
    description: 'Real 9H hardness tempered glass with oleophobic anti-fingerprint coating and seamless curved edge coverage. Protects against knife scratches and drop impacts.',
    compatibility: ['Available for iPhone, Samsung, Redmi, Vivo, Realme models (mention model in order note)'],
    stock: 120,
    sku: 'SG-9D-FULL',
    warranty: 'Defect-free guarantee upon delivery',
    images: [
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['9H Hardness rating', 'Oleophobic anti-grease coating', '99.9% HD optical transparency', 'Case-friendly dimension design'],
    rating: 4.8,
    reviewCount: 110,
    isPopular: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-toolkit-phone-repair',
    name: 'Precision 32-in-1 Smartphone & Electronics Repair Screwdriver Toolkit',
    slug: 'precision-smartphone-repair-toolkit',
    category: 'Additional Accessories',
    subCategory: 'Repair tools',
    brand: 'MasterCraft Tools',
    price: 1150,
    originalPrice: 1600,
    discountPercentage: 28,
    description: 'Essential toolkit for mobile phone enthusiasts and technicians. Includes Torx, Pentalobe (for iPhone), Phillips, pry tools, and ESD tweezers in a magnetized storage box.',
    compatibility: ['iPhones, Android phones, watches, laptops, Nintendo Switch, glasses'],
    stock: 20,
    sku: 'MC-TK-32IN1',
    warranty: '6 Months Warranty',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['CR-V Chrome Vanadium steel bits', 'Magnetic bit holder with rotating cap', 'Includes suction cup & triangular pry spudgers', 'Spring-loaded compact case'],
    rating: 4.9,
    reviewCount: 31,
    isPopular: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-holder-car-mag',
    name: '360° Magnetic Car Air Vent & Dashboard Phone Holder',
    slug: 'magnetic-car-phone-holder',
    category: 'Additional Accessories',
    subCategory: 'Phone holders',
    brand: 'DriveGrip',
    price: 750,
    originalPrice: 1100,
    discountPercentage: 31,
    description: 'Powerful 6-magnet neodymium array holds even the heaviest phones securely during bumpy rides. Rotates 360 degrees for GPS navigation in landscape or portrait.',
    compatibility: ['All mobile phones with included metal plate or MagSafe cases'],
    stock: 35,
    sku: 'DG-MAG-360',
    warranty: '6 Months Warranty',
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'
    ],
    features: ['6x N52 Neodymium magnets', 'Dual-claw anti-slip air vent clamp', 'Soft silicone scratch-prevention pad'],
    rating: 4.6,
    reviewCount: 24,
    createdAt: new Date().toISOString()
  }
];

const initialUsers: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Pawan Kumar (Shop Owner)',
    email: 'admin@pawanmobile.com',
    phone: '+977-9812345678',
    role: 'admin',
    passwordHash: 'admin123', // In demo/local mode for convenient testing
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    addresses: [
      {
        id: 'addr-01',
        label: 'Shop Address',
        street: 'Main Road, Ward No. 4',
        city: 'Biratnagar',
        state: 'Koshi Province',
        isDefault: true
      }
    ],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'usr-cust-01',
    name: 'Ramesh Adhikari',
    email: 'customer@pawanmobile.com',
    phone: '+977-9841234567',
    role: 'customer',
    passwordHash: 'customer123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    addresses: [
      {
        id: 'addr-02',
        label: 'Home',
        street: 'New Baneshwor, Ward 10',
        city: 'Kathmandu',
        state: 'Bagmati Province',
        isDefault: true
      }
    ],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  }
];

const initialBookings: RepairBooking[] = [
  {
    id: 'book-001',
    bookingNumber: 'PMR-2026-0814',
    userId: 'usr-cust-01',
    customerName: 'Ramesh Adhikari',
    customerPhone: '+977-9841234567',
    customerEmail: 'customer@pawanmobile.com',
    brand: 'Samsung Galaxy',
    model: 'Galaxy S23',
    serviceCategory: 'display',
    serviceTitle: 'Original / OLED Display & Touch Replacement',
    issueDescription: 'Dropped on tiles, screen has purple vertical lines and lower half touch is not working.',
    photos: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80'],
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '11:00 AM - 12:00 PM',
    serviceType: 'shop_visit',
    status: 'In Progress',
    assignedTechnician: 'Pawan Kumar',
    technicianNotes: 'Original Dynamic AMOLED display disassembled. Tested new panel colors and touch grid. Waiting for adhesive cure.',
    quotedCost: 7800,
    partsUsed: [{ partName: 'Samsung S23 Genuine AMOLED Screen Assembly', cost: 6800 }],
    laborCharge: 1000,
    customerApprovedQuote: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'book-002',
    bookingNumber: 'PMR-2026-0820',
    customerName: 'Bikash Shrestha',
    customerPhone: '+977-9807654321',
    customerEmail: 'bikash@example.com',
    brand: 'Apple iPhone',
    model: 'iPhone 13 Pro',
    serviceCategory: 'battery',
    serviceTitle: 'Genuine Battery Replacement',
    issueDescription: 'Battery health is 74%. Phone drains from 100% to 15% in less than 3 hours.',
    photos: [],
    appointmentDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    timeSlot: '02:00 PM - 03:00 PM',
    serviceType: 'pickup_delivery',
    pickupAddress: 'Thamel, Kathmandu',
    status: 'Confirmed',
    assignedTechnician: 'Senior Tech Sandeep',
    technicianNotes: 'Pickup scheduled for tomorrow afternoon.',
    quotedCost: 3800,
    laborCharge: 600,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-98241',
    userId: 'usr-cust-01',
    customerName: 'Ramesh Adhikari',
    customerEmail: 'customer@pawanmobile.com',
    customerPhone: '+977-9841234567',
    shippingAddress: {
      street: 'New Baneshwor, Ward 10',
      city: 'Kathmandu',
      landmark: 'Near Krishna Bakery',
      province: 'Bagmati'
    },
    items: [
      {
        productId: 'prod-chg-65w-gan',
        name: 'Pawan Turbo 65W GaN Fast Charger (Type-C + USB-A)',
        price: 2450,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
        sku: 'PT-GAN-65W'
      },
      {
        productId: 'prod-cbl-100w-braided',
        name: 'Braided 100W Type-C to Type-C Fast Charging & 480Mbps Data Cable',
        price: 650,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1616763355603-9755a640a287?w=800&auto=format&fit=crop&q=80',
        sku: 'AK-100W-CC'
      }
    ],
    subtotal: 3100,
    deliveryCharge: 0,
    discount: 100,
    couponCode: 'PAWAN100',
    total: 3000,
    paymentMethod: 'esewa',
    paymentStatus: 'verified',
    transactionId: 'ESEWA-TXN-847291',
    paymentReference: 'ESW-ORD-98241',
    fulfillmentStatus: 'delivered',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

const initialCoupons: Coupon[] = [
  {
    code: 'PAWAN100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1000,
    validUntil: '2028-12-31',
    isActive: true,
    usageCount: 15
  },
  {
    code: 'REPAIR10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1500,
    maxDiscount: 500,
    validUntil: '2028-12-31',
    isActive: true,
    usageCount: 28
  },
  {
    code: 'NEWCUSTOMER',
    discountType: 'fixed',
    discountValue: 150,
    minOrderAmount: 1200,
    validUntil: '2028-12-31',
    isActive: true,
    usageCount: 42
  }
];

const initialSettings: ShopSettings = {
  shopName: 'Pawan Mobile Repairing Center',
  tagline: 'Your Trusted Mobile Repair & Accessories Partner in Nepal',
  phone: '+977-9812345678',
  whatsapp: '+977-9812345678',
  email: 'contact@pawanmobile.com',
  address: 'Main Commercial Road, Biratnagar / Kathmandu, Nepal',
  city: 'Biratnagar',
  province: 'Koshi Province',
  openingHours: 'Sun - Fri: 9:00 AM - 8:00 PM | Sat: 10:00 AM - 5:00 PM',
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.748174577821!2d85.3123293751795!3d27.70191297618247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19a0a86db9d1%3A0xe54e2c84236a1005!2sKathmandu%2044600!5e0!3m2!1sen!2snp!4v1710000000000!5m2!1sen!2snp',
  googleMapsDirectionsUrl: 'https://maps.google.com/?q=27.701913,85.312329',
  esewaProductCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
  esewaSecretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  esewaSandbox: true,
  khaltiPublicKey: process.env.KHALTI_PUBLIC_KEY || 'test_public_key_dc74e0fd57cb46cd93832aee0a505e44',
  khaltiSandbox: true,
  standardDeliveryChargeNpr: 100,
  freeDeliveryThresholdNpr: 2000,
  announcementText: '🇳🇵 Dashain & Tihar Special: Free tempered glass with every display replacement + Same-Day Express Repair!',
  isPickupAvailable: true,
  smsProvider: 'simulation',
  smsApiKey: 'sparrow_test_key_np',
  smsSenderId: 'PAWAN_MOB',
  smsEnabled: true
};

const initialReviews: Review[] = [
  {
    id: 'rev-01',
    userId: 'usr-cust-01',
    userName: 'Ramesh Adhikari',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    targetType: 'product',
    targetId: 'prod-chg-65w-gan',
    targetName: 'Pawan Turbo 65W GaN Fast Charger',
    rating: 5,
    comment: 'Super fast charging for both my Galaxy S23 and laptop. Very compact and stays surprisingly cool. Highly recommended for daily use in Nepal!',
    isVerified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'rev-02',
    userId: 'usr-cust-02',
    userName: 'Pooja Karki',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    targetType: 'repair',
    targetId: 'display-touch-screen',
    targetName: 'Original / OLED Display & Touch Replacement',
    rating: 5,
    comment: 'Pawan Dai replaced my shattered iPhone 13 OLED screen in less than 45 minutes! True Tone and 120Hz touch sensitivity are completely intact. Best repair center in town.',
    isVerified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'rev-03',
    userId: 'usr-cust-03',
    userName: 'Anish Gurung',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    targetType: 'product',
    targetId: 'prod-pwb-20000-pd',
    targetName: 'MegaPower 20,000mAh Power Bank',
    rating: 5,
    comment: 'Saved me during load shedding and mountain trekking in Pokhara. The digital battery display is very accurate and fast charges via PD.',
    isVerified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'rev-04',
    userId: 'usr-cust-04',
    userName: 'Sushil Bhattarai',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    targetType: 'repair',
    targetId: 'motherboard-short-circuit',
    targetName: 'Motherboard Short-Circuit & Dead Phone Recovery',
    rating: 5,
    comment: 'Other shops in Biratnagar told me to throw away my dead Poco X3 Pro. Pawan Mobile diagnosed the shorted PMIC cap and recovered all my photos! Incredible micro-soldering skill.',
    isVerified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  }
];

const initialWishlists: WishlistItem[] = [
  {
    userId: 'usr-cust-01',
    productIds: ['prod-spk-waterproof-mini', 'prod-head-gaming-bt'],
    updatedAt: new Date().toISOString()
  }
];

const initialSmsLogs: SmsLog[] = [
  {
    id: 'sms-init-01',
    recipientPhone: '+977-9841234567',
    event: 'order_confirmed',
    message: '[Pawan Mobile] Thank you Ramesh! Your order ORD-98241 (NPR 3,000) is confirmed. Delivery in 1-2 days.',
    provider: 'sparrow_sms',
    status: 'sent',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'sms-init-02',
    recipientPhone: '+977-9841234567',
    event: 'repair_status_update',
    message: '[Pawan Mobile] Update for Booking PMR-2026-0814 (Samsung Galaxy S23): Status changed to "In Progress". Tech: Pawan Kumar.',
    provider: 'sparrow_sms',
    status: 'sent',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

const initialContacts: ContactMessage[] = [
  {
    id: 'msg-01',
    name: 'Sunil Thapa',
    email: 'sunil@example.com',
    phone: '+977-9861234567',
    subject: 'OnePlus 11 Green Line Repair Question',
    message: 'Hello, my OnePlus 11 got a green line after the OxygenOS update. Do you offer display replacement or laser line bonding repair?',
    status: 'in_progress',
    adminReply: 'Hello Sunil, yes we provide OnePlus certified OLED panel replacement with true colors and 120Hz refresh rate. Please bring it for free diagnostic inspection.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-01',
    userId: 'usr-admin-01',
    userName: 'Pawan Kumar (Shop Owner)',
    action: 'SYSTEM_BOOT',
    details: 'Pawan Mobile Repairing Center fullstack database initialized with seed catalog.',
    timestamp: new Date().toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all top-level keys exist
        return {
          users: parsed.users || initialUsers,
          products: parsed.products || initialProducts,
          repairServices: parsed.repairServices || initialRepairServices,
          deviceBrands: parsed.deviceBrands || initialBrands,
          repairBookings: parsed.repairBookings || initialBookings,
          orders: parsed.orders || initialOrders,
          payments: parsed.payments || [],
          coupons: parsed.coupons || initialCoupons,
          reviews: parsed.reviews || initialReviews,
          wishlists: parsed.wishlists || initialWishlists,
          smsLogs: parsed.smsLogs || initialSmsLogs,
          settings: parsed.settings ? { ...initialSettings, ...parsed.settings } : initialSettings,
          contactMessages: parsed.contactMessages || initialContacts,
          auditLogs: parsed.auditLogs || initialAuditLogs
        };
      }
    } catch (e) {
      console.error('Error reading db.json, falling back to default seed:', e);
    }

    const defaultData: DatabaseSchema = {
      users: initialUsers,
      products: initialProducts,
      repairServices: initialRepairServices,
      deviceBrands: initialBrands,
      repairBookings: initialBookings,
      orders: initialOrders,
      payments: [],
      coupons: initialCoupons,
      reviews: initialReviews,
      wishlists: initialWishlists,
      smsLogs: initialSmsLogs,
      settings: initialSettings,
      contactMessages: initialContacts,
      auditLogs: initialAuditLogs
    };

    this.saveDirect(defaultData);
    return defaultData;
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing db.json:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.data[key] = value;
    this.save();
  }

  public logAudit(userId: string, userName: string, action: string, details: string) {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
  }
}

export const db = new Database();
