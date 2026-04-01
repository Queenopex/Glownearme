// ============================================================================
// GLOWNEARME - NIGERIAN MAKEUP ARTIST MARKETPLACE CONFIGURATION
// ============================================================================
// Connecting clients with makeup artists across Lagos Mainland and Island
// ============================================================================

// ----------------------------------------------------------------------------
// Navigation
// ----------------------------------------------------------------------------

export interface NavLink {
  label: string;
  href: string;
}

export interface NavigationConfig {
  logo: string;
  logoAccent: string;
  navLinks: NavLink[];
  ctaText: string;
  ctaHref: string;
  loginText: string;
  signupText: string;
}

export const navigationConfig: NavigationConfig = {
  logo: "GLOW",
  logoAccent: "NEARME",
  navLinks: [
    { label: "Find Artists", href: "#artists" },
    { label: "Styles", href: "#styles" },
    { label: "How It Works", href: "#about" },
    { label: "For Artists", href: "#join" },
  ],
  ctaText: "Book Now",
  ctaHref: "#artists",
  loginText: "Log In",
  signupText: "Sign Up",
};

// ----------------------------------------------------------------------------
// Lagos Locations Database
// ----------------------------------------------------------------------------

export interface LocationData {
  name: string;
  area: 'mainland' | 'island';
  coordinates: { lat: number; lng: number };
}

export const lagosLocations: LocationData[] = [
  // Mainland
  { name: "Ikeja", area: "mainland", coordinates: { lat: 6.6018, lng: 3.3515 } },
  { name: "Yaba", area: "mainland", coordinates: { lat: 6.5095, lng: 3.3711 } },
  { name: "Surulere", area: "mainland", coordinates: { lat: 6.5000, lng: 3.3500 } },
  { name: "Oshodi", area: "mainland", coordinates: { lat: 6.5535, lng: 3.3436 } },
  { name: "Maryland", area: "mainland", coordinates: { lat: 6.5754, lng: 3.3659 } },
  { name: "Magodo", area: "mainland", coordinates: { lat: 6.6208, lng: 3.3833 } },
  { name: "Gbagada", area: "mainland", coordinates: { lat: 6.5500, lng: 3.4000 } },
  { name: "Ketu", area: "mainland", coordinates: { lat: 6.6000, lng: 3.4000 } },
  { name: "Ikorodu", area: "mainland", coordinates: { lat: 6.6000, lng: 3.5000 } },
  { name: "Agege", area: "mainland", coordinates: { lat: 6.6167, lng: 3.3333 } },
  { name: "Ojuelegba", area: "mainland", coordinates: { lat: 6.5000, lng: 3.3667 } },
  { name: "Mushin", area: "mainland", coordinates: { lat: 6.5333, lng: 3.3500 } },
  { name: "Ogba", area: "mainland", coordinates: { lat: 6.6333, lng: 3.3333 } },
  { name: "Shomolu", area: "mainland", coordinates: { lat: 6.5333, lng: 3.3833 } },
  { name: "Bariga", area: "mainland", coordinates: { lat: 6.5333, lng: 3.4000 } },
  
  // Island
  { name: "Lekki Phase 1", area: "island", coordinates: { lat: 6.4500, lng: 3.4667 } },
  { name: "Lekki Phase 2", area: "island", coordinates: { lat: 6.4333, lng: 3.5167 } },
  { name: "Victoria Island", area: "island", coordinates: { lat: 6.4281, lng: 3.4219 } },
  { name: "Ikoyi", area: "island", coordinates: { lat: 6.4500, lng: 3.4333 } },
  { name: "Ajah", area: "island", coordinates: { lat: 6.4667, lng: 3.5667 } },
  { name: "Sangotedo", area: "island", coordinates: { lat: 6.4500, lng: 3.6333 } },
  { name: "Chevron", area: "island", coordinates: { lat: 6.4333, lng: 3.4833 } },
  { name: "Oniru", area: "island", coordinates: { lat: 6.4333, lng: 3.4500 } },
  { name: "Maroko", area: "island", coordinates: { lat: 6.4333, lng: 3.4333 } },
  { name: "Epe", area: "island", coordinates: { lat: 6.5833, lng: 3.9833 } },
  { name: "Ibeju-Lekki", area: "island", coordinates: { lat: 6.4167, lng: 3.5667 } },
  { name: "Banana Island", area: "island", coordinates: { lat: 6.4667, lng: 3.4667 } },
  { name: "Parkview", area: "island", coordinates: { lat: 6.4500, lng: 3.4500 } },
  { name: "Falomo", area: "island", coordinates: { lat: 6.4333, lng: 3.4333 } },
];

// ----------------------------------------------------------------------------
// Hero Section
// ----------------------------------------------------------------------------

export interface HeroConfig {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  backgroundImage: string;
  gridRows: number;
  gridCols: number;
  pinkCells: { row: number; col: number }[];
  searchPlaceholder: string;
  searchButtonText: string;
}

export const heroConfig: HeroConfig = {
  titleLine1: "GLOW",
  titleLine2: "NEAR YOU",
  subtitle: "Book professional makeup artists in Lagos. Whether you're on the Mainland or Island, find your perfect match and get glammed up!",
  ctaText: "Find an Artist",
  ctaHref: "#artists",
  secondaryCtaText: "Join as Artist",
  secondaryCtaHref: "#join",
  backgroundImage: "/images/hero-makeup.jpg",
  gridRows: 6,
  gridCols: 8,
  pinkCells: [
    { row: 0, col: 2 },
    { row: 1, col: 5 },
    { row: 2, col: 0 },
    { row: 3, col: 7 },
    { row: 4, col: 3 },
    { row: 5, col: 6 },
  ],
  searchPlaceholder: "Enter your area (e.g., Lekki, Ikeja, Yaba...)",
  searchButtonText: "Find Artists Near Me",
};

// ----------------------------------------------------------------------------
// Featured Artists Section
// ----------------------------------------------------------------------------

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  serviceType: string;
}

export interface PortfolioImage {
  id: string;
  url: string;
  caption: string;
  style: string;
}

export interface Artist {
  id: string;
  name: string;
  specialty: string;
  location: string;
  area: 'mainland' | 'island';
  coordinates: { lat: number; lng: number };
  rating: number;
  reviews: number;
  reviewList: Review[];
  priceRange: string;
  pricePerSession: number;
  image: string;
  bio: string;
  availability: string[];
  portfolio: PortfolioImage[];
  services: string[];
  yearsOfExperience: number;
  isVerified: boolean;
  isPopular: boolean;
  responseTime: string;
  isOnline?: boolean;
}

export interface FeaturedArtistsConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  description: string;
  artists: Artist[];
  ctaText: string;
  decorativeText: string;
  filterLabel: string;
  allAreasLabel: string;
  mainlandLabel: string;
  islandLabel: string;
  searchLabel: string;
  priceFilterLabel: string;
  serviceFilterLabel: string;
  sortLabel: string;
  noResultsText: string;
  clearFiltersText: string;
  verifiedBadge: string;
  popularBadge: string;
  viewPortfolioText: string;
  messageText: string;
  bookNowText: string;
}

export const featuredArtistsConfig: FeaturedArtistsConfig = {
  sectionLabel: "TOP ARTISTS IN LAGOS",
  headingMain: "BOOK YOUR",
  headingAccent: "GLOW",
  description: "Discover verified makeup artists across Lagos. Search by location, filter by price and services, and book your session instantly.",
  artists: [
    {
      id: "1",
      name: "Chioma Beauty",
      specialty: "Bridal & Traditional",
      location: "Ikeja, Lagos",
      area: "mainland",
      coordinates: { lat: 6.6018, lng: 3.3515 },
      rating: 4.9,
      reviews: 127,
      reviewList: [
        { id: "r1", clientName: "Adesuwa", rating: 5, comment: "Made me look like a queen on my wedding day!", date: "2024-03-10", serviceType: "Bridal Makeup" },
        { id: "r2", clientName: "Funke", rating: 5, comment: "Professional and punctual. Highly recommend!", date: "2024-02-28", serviceType: "Traditional Wedding" },
        { id: "r3", clientName: "Ngozi", rating: 4, comment: "Great work, very patient with my requests.", date: "2024-02-15", serviceType: "Bridal Makeup" },
      ],
      priceRange: "₦15,000 - ₦50,000",
      pricePerSession: 25000,
      image: "/images/artist-1.jpg",
      bio: "Specializing in Nigerian bridal makeup and traditional ceremonies. 5+ years experience creating flawless looks for brides across Lagos.",
      availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      portfolio: [
        { id: "p1", url: "/images/portfolio-bridal-1.jpg", caption: "Traditional Bride", style: "Bridal" },
        { id: "p2", url: "/images/portfolio-party-1.jpg", caption: "Owambe Glam", style: "Party" },
        { id: "p3", url: "/images/portfolio-natural-1.jpg", caption: "Natural Glow", style: "Everyday" },
      ],
      services: ["Bridal Makeup", "Gele Tying", "Traditional Wedding", "Engagement Makeup"],
      yearsOfExperience: 5,
      isVerified: true,
      isPopular: true,
      responseTime: "Within 1 hour",
    },
    {
      id: "2",
      name: "Tunde Glam Studio",
      specialty: "Editorial & Fashion",
      location: "Lekki Phase 1",
      area: "island",
      coordinates: { lat: 6.4500, lng: 3.4667 },
      rating: 4.8,
      reviews: 89,
      reviewList: [
        { id: "r4", clientName: "Chidi", rating: 5, comment: "Amazing work for my music video shoot!", date: "2024-03-05", serviceType: "Editorial Makeup" },
        { id: "r5", clientName: "Amara", rating: 5, comment: "Very creative and professional.", date: "2024-02-20", serviceType: "Fashion Shoot" },
      ],
      priceRange: "₦25,000 - ₦80,000",
      pricePerSession: 40000,
      image: "/images/artist-2.jpg",
      bio: "Celebrity makeup artist for photoshoots, music videos, and red carpet events. Bringing Hollywood glam to Lagos.",
      availability: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      portfolio: [
        { id: "p4", url: "/images/style-editorial.jpg", caption: "Editorial Look", style: "Editorial" },
        { id: "p5", url: "/images/style-glam.jpg", caption: "Red Carpet", style: "Glamour" },
      ],
      services: ["Editorial Makeup", "Fashion Shoots", "Music Videos", "SFX Makeup"],
      yearsOfExperience: 7,
      isVerified: true,
      isPopular: true,
      responseTime: "Within 2 hours",
    },
    {
      id: "3",
      name: "Amaka Glow",
      specialty: "Natural & Everyday",
      location: "Yaba, Lagos",
      area: "mainland",
      coordinates: { lat: 6.5095, lng: 3.3711 },
      rating: 5.0,
      reviews: 203,
      reviewList: [
        { id: "r6", clientName: "Bola", rating: 5, comment: "Perfect natural look for my interview!", date: "2024-03-12", serviceType: "Natural Makeup" },
        { id: "r7", clientName: "Tolu", rating: 5, comment: "Affordable and excellent service.", date: "2024-03-01", serviceType: "Everyday Glam" },
        { id: "r8", clientName: "Yemi", rating: 5, comment: "My go-to makeup artist in Yaba!", date: "2024-02-25", serviceType: "Natural Makeup" },
      ],
      priceRange: "₦10,000 - ₦30,000",
      pricePerSession: 15000,
      image: "/images/artist-3.jpg",
      bio: "Creating flawless natural looks for work, dates, and everyday glam. Budget-friendly without compromising quality.",
      availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      portfolio: [
        { id: "p6", url: "/images/style-natural.jpg", caption: "Everyday Glow", style: "Natural" },
        { id: "p7", url: "/images/style-bridal.jpg", caption: "Soft Bridal", style: "Bridal" },
      ],
      services: ["Natural Makeup", "Everyday Glam", "Office Makeup", "Date Night"],
      yearsOfExperience: 3,
      isVerified: true,
      isPopular: false,
      responseTime: "Within 30 minutes",
    },
    {
      id: "4",
      name: "Zainab Artistry",
      specialty: "Glamour & Events",
      location: "Victoria Island",
      area: "island",
      coordinates: { lat: 6.4281, lng: 3.4219 },
      rating: 4.9,
      reviews: 156,
      reviewList: [
        { id: "r9", clientName: "Halima", rating: 5, comment: "The best for owambe parties!", date: "2024-03-08", serviceType: "Party Makeup" },
        { id: "r10", clientName: "Kemi", rating: 5, comment: "Made me the center of attention!", date: "2024-02-18", serviceType: "Event Makeup" },
      ],
      priceRange: "₦20,000 - ₦60,000",
      pricePerSession: 35000,
      image: "/images/artist-4.jpg",
      bio: "Your go-to artist for owambe parties, corporate events, and special occasions. Bringing the glam to every event.",
      availability: ["Mon", "Wed", "Thu", "Fri", "Sat", "Sun"],
      portfolio: [
        { id: "p8", url: "/images/style-glam.jpg", caption: "Owambe Ready", style: "Glamour" },
        { id: "p9", url: "/images/style-editorial.jpg", caption: "Event Glam", style: "Events" },
      ],
      services: ["Party Makeup", "Event Glam", "Owambe Looks", "Corporate Events"],
      yearsOfExperience: 4,
      isVerified: true,
      isPopular: true,
      responseTime: "Within 1 hour",
    },
    {
      id: "5",
      name: "Ngozi Faces",
      specialty: "Bridal & Gele",
      location: "Surulere, Lagos",
      area: "mainland",
      coordinates: { lat: 6.5000, lng: 3.3500 },
      rating: 4.7,
      reviews: 98,
      reviewList: [
        { id: "r11", clientName: "Ify", rating: 5, comment: "My gele was perfect!", date: "2024-03-03", serviceType: "Bridal + Gele" },
        { id: "r12", clientName: "Chioma", rating: 4, comment: "Great service, arrived on time.", date: "2024-02-22", serviceType: "Bridal Makeup" },
      ],
      priceRange: "₦12,000 - ₦40,000",
      pricePerSession: 20000,
      image: "/images/style-bridal.jpg",
      bio: "Expert in bridal makeup and gele tying for your special day. Making every bride feel like royalty.",
      availability: ["Tue", "Wed", "Thu", "Fri", "Sat"],
      portfolio: [
        { id: "p10", url: "/images/style-bridal.jpg", caption: "Bridal Beauty", style: "Bridal" },
        { id: "p11", url: "/images/style-natural.jpg", caption: "Elegant Bride", style: "Bridal" },
      ],
      services: ["Bridal Makeup", "Gele Tying", "Engagement", "Traditional Wedding"],
      yearsOfExperience: 6,
      isVerified: true,
      isPopular: false,
      responseTime: "Within 2 hours",
    },
    {
      id: "6",
      name: "Fola Beauty Hub",
      specialty: "SFX & Creative",
      location: "Ikoyi, Lagos",
      area: "island",
      coordinates: { lat: 6.4500, lng: 3.4333 },
      rating: 4.8,
      reviews: 67,
      reviewList: [
        { id: "r13", clientName: "Dele", rating: 5, comment: "Incredible SFX work for our film!", date: "2024-03-01", serviceType: "SFX Makeup" },
        { id: "r14", clientName: "Zara", rating: 5, comment: "So creative and talented!", date: "2024-02-15", serviceType: "Creative Makeup" },
      ],
      priceRange: "₦30,000 - ₦100,000",
      pricePerSession: 50000,
      image: "/images/style-editorial.jpg",
      bio: "Creative and special effects makeup for film, theatre, and artistic projects. Bringing imagination to life.",
      availability: ["Mon", "Tue", "Thu", "Fri", "Sat"],
      portfolio: [
        { id: "p12", url: "/images/style-editorial.jpg", caption: "Creative Art", style: "Creative" },
        { id: "p13", url: "/images/style-glam.jpg", caption: "SFX Look", style: "SFX" },
      ],
      services: ["SFX Makeup", "Creative Makeup", "Theatre Makeup", "Film Makeup"],
      yearsOfExperience: 8,
      isVerified: true,
      isPopular: false,
      responseTime: "Within 3 hours",
    },
  ],
  ctaText: "View All Artists",
  decorativeText: "GLOW",
  filterLabel: "Filter by Location:",
  allAreasLabel: "All Lagos",
  mainlandLabel: "Mainland",
  islandLabel: "Island",
  searchLabel: "Search by area:",
  priceFilterLabel: "Price Range",
  serviceFilterLabel: "Services",
  sortLabel: "Sort by",
  noResultsText: "No artists found in this area. Try a different location.",
  clearFiltersText: "Clear all filters",
  verifiedBadge: "Verified",
  popularBadge: "Popular",
  viewPortfolioText: "View Portfolio",
  messageText: "Message",
  bookNowText: "Book Now",
};

// ----------------------------------------------------------------------------
// Makeup Styles Section
// ----------------------------------------------------------------------------

export interface MakeupStyle {
  name: string;
  nameSecondary: string;
  color: string;
  description: string;
  image: string;
  priceFrom: number;
  duration: string;
}

export interface MakeupStylesConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  styles: MakeupStyle[];
  bottomText: string;
  decorativeText: string;
}

export const makeupStylesConfig: MakeupStylesConfig = {
  sectionLabel: "MAKEUP STYLES",
  headingMain: "CHOOSE YOUR",
  headingAccent: "LOOK",
  styles: [
    {
      name: "BRIDAL",
      nameSecondary: "Wedding Day",
      color: "#ffb6c1",
      description: "Flawless bridal makeup with gele tying for your special day. Includes touch-up kit.",
      image: "/images/style-bridal.jpg",
      priceFrom: 30000,
      duration: "2-3 hours",
    },
    {
      name: "OWAMBE",
      nameSecondary: "Party Ready",
      color: "#ff73c3",
      description: "Glamorous makeup for weddings, birthdays, and Nigerian celebrations. Long-lasting finish.",
      image: "/images/style-glam.jpg",
      priceFrom: 20000,
      duration: "1-2 hours",
    },
    {
      name: "EVERYDAY",
      nameSecondary: "Natural Glow",
      color: "#f4a460",
      description: "Subtle, fresh-faced makeup perfect for work, school, or casual outings.",
      image: "/images/style-natural.jpg",
      priceFrom: 8000,
      duration: "45 mins - 1 hour",
    },
    {
      name: "EDITORIAL",
      nameSecondary: "Creative",
      color: "#c41e3a",
      description: "High-fashion and artistic makeup for photoshoots, runways, and creative projects.",
      image: "/images/style-editorial.jpg",
      priceFrom: 40000,
      duration: "2-4 hours",
    },
  ],
  bottomText: "Click any style to see artists who specialize in that look",
  decorativeText: "STYLES",
};

// ----------------------------------------------------------------------------
// How It Works / Join Section
// ----------------------------------------------------------------------------

export interface HowItWorksConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  tagline: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  image: string;
  imageAlt: string;
  decorativeText: string;
  steps: { title: string; description: string }[];
}

export const howItWorksConfig: HowItWorksConfig = {
  sectionLabel: "FOR MAKEUP ARTISTS",
  headingMain: "GROW YOUR",
  headingAccent: "BRAND",
  tagline: "Join hundreds of Lagos makeup artists earning with GlowNearMe. Get discovered by clients in your area and manage bookings seamlessly.",
  features: [
    "Create your professional portfolio",
    "Get booked by clients near you",
    "Accept payments securely on the platform",
    "Build your reputation with reviews",
    "Set your own schedule and rates",
    "Reach clients on Mainland & Island",
  ],
  ctaText: "Join as an Artist",
  ctaHref: "#signup-artist",
  secondaryCtaText: "How It Works",
  secondaryCtaHref: "#how-it-works",
  image: "/images/finale-image.jpg",
  imageAlt: "Makeup artist working with client in Lagos studio",
  decorativeText: "CREATE",
  steps: [
    { title: "Create Profile", description: "Set up your portfolio with photos and services" },
    { title: "Get Discovered", description: "Clients find you based on location and style" },
    { title: "Accept Bookings", description: "Receive and manage booking requests" },
    { title: "Get Paid", description: "Receive secure payments after each session" },
  ],
};

// ----------------------------------------------------------------------------
// Booking Config
// ----------------------------------------------------------------------------

export interface BookingConfig {
  title: string;
  subtitle: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  serviceLabel: string;
  priceLabel: string;
  bookingFeeLabel: string;
  totalLabel: string;
  bookButtonText: string;
  cancelButtonText: string;
  successTitle: string;
  successMessage: string;
  paymentMethods: {
    name: string;
    icon: string;
  }[];
}

export const bookingConfig: BookingConfig = {
  title: "Book Your Session",
  subtitle: "Select your preferred date, time, and location",
  dateLabel: "Select Date",
  timeLabel: "Select Time",
  locationLabel: "Your Location",
  notesLabel: "Special Requests",
  notesPlaceholder: "Any specific requests or allergies...",
  serviceLabel: "Service Type",
  priceLabel: "Service Fee",
  bookingFeeLabel: "Booking Fee (5%)",
  totalLabel: "Total Amount",
  bookButtonText: "Proceed to Payment",
  cancelButtonText: "Cancel",
  successTitle: "Booking Confirmed!",
  successMessage: "Your artist will confirm shortly. Check your email for details.",
  paymentMethods: [
    { name: "Pay with Card", icon: "card" },
    { name: "Bank Transfer", icon: "bank" },
    { name: "USSD", icon: "ussd" },
  ],
};

// ----------------------------------------------------------------------------
// Chat Config
// ----------------------------------------------------------------------------

export interface ChatConfig {
  title: string;
  placeholder: string;
  sendButtonText: string;
  attachImageText: string;
  typingText: string;
  onlineText: string;
  offlineText: string;
  messageArtistText: string;
  startConversationText: string;
}

export const chatConfig: ChatConfig = {
  title: "Chat with",
  placeholder: "Type your message...",
  sendButtonText: "Send",
  attachImageText: "Attach photo",
  typingText: "typing...",
  onlineText: "Online",
  offlineText: "Offline",
  messageArtistText: "Message Artist",
  startConversationText: "Start a conversation to discuss your booking details",
};

// ----------------------------------------------------------------------------
// Login Modal Config
// ----------------------------------------------------------------------------

export interface LoginConfig {
  clientTitle: string;
  clientSubtitle: string;
  artistTitle: string;
  artistSubtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  clientButtonText: string;
  artistButtonText: string;
  orText: string;
  googleButtonText: string;
  forgotPasswordText: string;
  noAccountText: string;
  signupLinkText: string;
}

export const loginConfig: LoginConfig = {
  clientTitle: "Welcome Back",
  clientSubtitle: "Sign in to book your glow session",
  artistTitle: "Artist Login",
  artistSubtitle: "Manage your bookings and profile",
  emailPlaceholder: "Email address",
  passwordPlaceholder: "Password",
  clientButtonText: "Sign In as Client",
  artistButtonText: "Sign In as Artist",
  orText: "or continue with",
  googleButtonText: "Google",
  forgotPasswordText: "Forgot password?",
  noAccountText: "Don't have an account?",
  signupLinkText: "Sign up",
};

// ----------------------------------------------------------------------------
// Payment Config
// ----------------------------------------------------------------------------

export interface PaymentConfig {
  title: string;
  subtitle: string;
  cardNumberLabel: string;
  cardNumberPlaceholder: string;
  expiryLabel: string;
  cvvLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  saveCardLabel: string;
  payButtonText: string;
  secureText: string;
  bankTransferText: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  ussdCode: string;
}

export const paymentConfig: PaymentConfig = {
  title: "Complete Payment",
  subtitle: "Secure payment powered by Paystack",
  cardNumberLabel: "Card Number",
  cardNumberPlaceholder: "0000 0000 0000 0000",
  expiryLabel: "Expiry Date",
  cvvLabel: "CVV",
  nameLabel: "Cardholder Name",
  namePlaceholder: "Name on card",
  saveCardLabel: "Save card for future payments",
  payButtonText: "Pay",
  secureText: "Your payment is secured with 256-bit SSL encryption",
  bankTransferText: "Or pay via bank transfer:",
  accountName: "GlowNearMe Ltd",
  accountNumber: "0123456789",
  bankName: "Guaranty Trust Bank",
  ussdCode: "*737*000*Amount#",
};

// ----------------------------------------------------------------------------
// Footer
// ----------------------------------------------------------------------------

export interface SocialLink {
  platform: "instagram" | "twitter" | "youtube" | "facebook";
  href: string;
  label: string;
}

export interface FooterLinkSection {
  title: string;
  links: { label: string; href: string }[];
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

export interface LegalLink {
  label: string;
  href: string;
}

export interface FooterConfig {
  logo: string;
  logoAccent: string;
  brandDescription: string;
  socialLinks: SocialLink[];
  linkSections: FooterLinkSection[];
  contact: ContactInfo;
  legalLinks: LegalLink[];
  copyrightText: string;
  decorativeText: string;
}

export const footerConfig: FooterConfig = {
  logo: "GLOW",
  logoAccent: "NEARME",
  brandDescription: "Nigeria's premier makeup artist booking platform. Connecting you with talented artists across Lagos Mainland and Island.",
  socialLinks: [
    { platform: "instagram", href: "#", label: "Instagram" },
    { platform: "twitter", href: "#", label: "Twitter" },
    { platform: "facebook", href: "#", label: "Facebook" },
    { platform: "youtube", href: "#", label: "YouTube" },
  ],
  linkSections: [
    {
      title: "For Clients",
      links: [
        { label: "Find an Artist", href: "#artists" },
        { label: "Browse Styles", href: "#styles" },
        { label: "How to Book", href: "#" },
        { label: "Pricing Guide", href: "#" },
      ],
    },
    {
      title: "For Artists",
      links: [
        { label: "Join as Artist", href: "#join" },
        { label: "Success Stories", href: "#" },
        { label: "Artist Resources", href: "#" },
        { label: "Artist Portal", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ],
  contact: {
    address: "12 Admiralty Way, Lekki Phase 1, Lagos",
    phone: "+234 (0) 800 GLOW NEAR",
    email: "hello@glownearme.ng",
  },
  legalLinks: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
  copyrightText: "GlowNearMe Nigeria. All rights reserved.",
  decorativeText: "GLOW",
};

// ----------------------------------------------------------------------------
// Site Metadata
// ----------------------------------------------------------------------------

export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "GlowNearMe - Book Makeup Artists in Lagos",
  description: "Find and book professional makeup artists in Lagos. Bridal, party, and everyday makeup services on Mainland and Island. Secure payments.",
  language: "en",
};
