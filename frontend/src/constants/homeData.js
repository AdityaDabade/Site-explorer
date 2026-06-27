export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1920&auto=format&fit=crop&q=80';

export const CATEGORY_PILLS = ['Monuments', 'Nature', 'Food', 'Culture', 'Beaches'];

export const CATEGORIES = [
  {
    title: 'Monuments',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Nature',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Food Tours',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Audio Guides',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Cultural Sites',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Hidden Gems',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  },
];

export const COLLECTIONS = [
  {
    title: 'Top UNESCO Sites',
    count: '28 experiences',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'AI-Guided Monuments',
    count: '14 narrated tours',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Hidden Gems',
    count: '36 local favorites',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Budget-Friendly Tours',
    count: '42 easy escapes',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Family Adventures',
    count: '19 all-ages routes',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  },
];

export const FEATURE_ROWS = [
  {
    badge: 'QR DISCOVERY',
    title: 'Unlock Stories On Site',
    body: 'Scan heritage codes, open place pages instantly, and continue with guide sections, captions, and narration the moment you arrive.',
    cta: 'Scan a Place',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop',
    bullets: [
      'Fast QR place lookup',
      'Guided heritage sections',
      'Captions and narration in sync',
    ],
  },
  {
    badge: 'AI GUIDE',
    title: 'Your Personal Historian',
    body: 'Ask follow-up questions, unlock place-specific narration, and get smart recommendations that adapt to where you are and what you like.',
    cta: 'Meet Your AI Guide',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop',
    bullets: [
      'Location-aware storytelling',
      'Multilingual support',
      'Contextual nearby suggestions',
    ],
  },
  {
    badge: 'SMART PLANNING',
    title: 'One App, Entire Journey',
    body: 'Plan routes, coordinate group travel, estimate costs, and keep every landmark, booking, and memory flowing together in one timeline.',
    cta: 'Plan a Trip',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop',
    bullets: [
      'Collaborative itinerary planning',
      'Weather and road alerts',
      'Shared budgets and travel stories',
    ],
  },
];

export const FALLBACK_PLACES = [
  {
    id: 1,
    name: 'Amber Fort',
    location_name: 'Jaipur, India',
    category: 'Historic Fort',
    lat: 26.9855,
    lng: 75.8513,
    distance: 2.1,
    rating: 4.9,
    review_count: 2341,
    price: 0,
    free_entry: true,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=900&auto=format&fit=crop&q=80',
    score: 9.1,
  },
  {
    id: 2,
    name: 'Shaniwar Wada',
    location_name: 'Pune, India',
    category: 'Historic Fort',
    lat: 18.5196,
    lng: 73.8553,
    distance: 3.4,
    rating: 4.8,
    review_count: 1820,
    price: 0,
    free_entry: true,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shaniwar_Wada_Pune.jpg?width=900',
    score: 8.9,
  },
  {
    id: 3,
    name: 'Humayun Tomb',
    location_name: 'Delhi, India',
    category: 'UNESCO Site',
    lat: 28.5933,
    lng: 77.2507,
    distance: 5.3,
    rating: 4.9,
    review_count: 3011,
    price: 300,
    free_entry: false,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&auto=format&fit=crop&q=80',
    score: 9.4,
  },
  {
    id: 4,
    name: 'Sinhagad Fort',
    location_name: 'Pune, India',
    category: 'Historic Fort',
    lat: 18.3663,
    lng: 73.7559,
    distance: 1.8,
    rating: 4.7,
    review_count: 954,
    price: 0,
    free_entry: true,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sinhagad-Fort.jpg?width=900',
    score: 8.8,
  },
];

export const REGION_FILTERS = ['All', 'India', 'Europe', 'Asia', 'Americas', 'Middle East'];
