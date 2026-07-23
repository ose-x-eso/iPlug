import React from 'react';
import { 
  Wrench, ShoppingBag, Building, Zap, Droplet, Hammer, Settings, Scissors, 
  Sparkles, Paintbrush, Flame, Wind, Snowflake, Smartphone, Camera, Brush, 
  Utensils, Car, Shirt, Bug, Monitor, PenTool, Tv, Headphones,
  ShoppingCart, Pill, Pizza, HardHat, Armchair, BookOpen, Store,
  Dumbbell, Heart, Briefcase, WashingMachine, Hotel, MapPin, 
  Ticket, Music, Calendar, Users, Mic, Megaphone, AlertCircle, Newspaper
} from 'lucide-react';

/**
 * iPlug Categories
 * Using Lucide Icons for premium UI
 */

export const PILLARS = {
  services: {
    label: "Services",
    icon: <Wrench size={18} className="inline-icon" />,
    description: "Skilled workers and service providers",
  },
  shops: {
    label: "Shops",
    icon: <ShoppingBag size={18} className="inline-icon" />,
    description: "Shops and product sellers",
  },
  places: {
    label: "Places",
    icon: <Building size={18} className="inline-icon" />,
    description: "Businesses and locations",
  },
  events: {
    label: "Events",
    icon: <Ticket size={18} className="inline-icon" />,
    description: "Local events, parties, and gatherings",
  },
  events: {
    label: "Events",
    icon: <Ticket size={18} className="inline-icon" />,
    description: "Local events, parties, and gatherings",
  }
};

export const CATEGORIES = {
  // ---- Services ----
  electrician: { label: "Electrician", pillar: "services", icon: <Zap size={16} className="inline-icon" /> },
  plumber: { label: "Plumber", pillar: "services", icon: <Droplet size={16} className="inline-icon" /> },
  carpenter: { label: "Carpenter", pillar: "services", icon: <Hammer size={16} className="inline-icon" /> },
  mechanic: { label: "Mechanic", pillar: "services", icon: <Settings size={16} className="inline-icon" /> },
  tailor: { label: "Tailor", pillar: "services", icon: <Scissors size={16} className="inline-icon" /> },
  barber: { label: "Barber", pillar: "services", icon: <Scissors size={16} className="inline-icon" /> },
  hairdresser: { label: "Hair Stylist", pillar: "services", icon: <Sparkles size={16} className="inline-icon" /> },
  cleaner: { label: "Cleaner", pillar: "services", icon: <Sparkles size={16} className="inline-icon" /> },
  painter: { label: "Painter", pillar: "services", icon: <Paintbrush size={16} className="inline-icon" /> },
  welder: { label: "Welder", pillar: "services", icon: <Flame size={16} className="inline-icon" /> },
  tiler: { label: "Tiler", pillar: "services", icon: <Hammer size={16} className="inline-icon" /> },
  ac_technician: { label: "AC Technician", pillar: "services", icon: <Snowflake size={16} className="inline-icon" /> },
  generator_repair: { label: "Generator Repair", pillar: "services", icon: <Settings size={16} className="inline-icon" /> },
  phone_repair: { label: "Phone Repair", pillar: "services", icon: <Smartphone size={16} className="inline-icon" /> },
  photographer: { label: "Photographer", pillar: "services", icon: <Camera size={16} className="inline-icon" /> },
  makeup_artist: { label: "Makeup Artist", pillar: "services", icon: <Brush size={16} className="inline-icon" /> },
  caterer: { label: "Caterer", pillar: "services", icon: <Utensils size={16} className="inline-icon" /> },
  driver: { label: "Driver", pillar: "services", icon: <Car size={16} className="inline-icon" /> },
  laundry: { label: "Laundry Service", pillar: "services", icon: <Shirt size={16} className="inline-icon" /> },
  fumigator: { label: "Fumigator", pillar: "services", icon: <Bug size={16} className="inline-icon" /> },
  web_developer: { label: "Web Developer", pillar: "services", icon: <Monitor size={16} className="inline-icon" /> },
  graphic_designer: { label: "Graphic Designer", pillar: "services", icon: <PenTool size={16} className="inline-icon" /> },

  // ---- Shops ----
  electronics: { label: "Electronics", pillar: "shops", icon: <Tv size={16} className="inline-icon" /> },
  phone_accessories: { label: "Phone Accessories", pillar: "shops", icon: <Headphones size={16} className="inline-icon" /> },
  clothing: { label: "Clothing Store", pillar: "shops", icon: <Shirt size={16} className="inline-icon" /> },
  grocery: { label: "Grocery/Provisions", pillar: "shops", icon: <ShoppingCart size={16} className="inline-icon" /> },
  pharmacy: { label: "Pharmacy", pillar: "shops", icon: <Pill size={16} className="inline-icon" /> },
  restaurant: { label: "Restaurant/Food", pillar: "shops", icon: <Pizza size={16} className="inline-icon" /> },
  building_materials: { label: "Building Materials", pillar: "shops", icon: <HardHat size={16} className="inline-icon" /> },
  furniture: { label: "Furniture", pillar: "shops", icon: <Armchair size={16} className="inline-icon" /> },
  bookshop: { label: "Bookshop", pillar: "shops", icon: <BookOpen size={16} className="inline-icon" /> },
  general_goods: { label: "General Goods", pillar: "shops", icon: <Store size={16} className="inline-icon" /> },

  // ---- Places ----
  gym: { label: "Gym/Fitness", pillar: "places", icon: <Dumbbell size={16} className="inline-icon" /> },
  salon: { label: "Salon/Spa", pillar: "places", icon: <Heart size={16} className="inline-icon" /> },
  coworking: { label: "Coworking Space", pillar: "places", icon: <Briefcase size={16} className="inline-icon" /> },
  laundromat: { label: "Laundromat", pillar: "places", icon: <WashingMachine size={16} className="inline-icon" /> },
  car_wash: { label: "Car Wash", pillar: "places", icon: <Car size={16} className="inline-icon" /> },
  hotel: { label: "Hotel/Guest House", pillar: "places", icon: <Hotel size={16} className="inline-icon" /> },
  event_center: { label: "Event Center", pillar: "places", icon: <MapPin size={16} className="inline-icon" /> },
  clinic: { label: "Clinic/Hospital", pillar: "places", icon: <Heart size={16} className="inline-icon" /> },

  // ---- Events (NEW PILLAR) ----
  tech_event: { label: "Tech Event / Meetup", pillar: "events", icon: <Monitor size={16} className="inline-icon" /> },
  party: { label: "Party / Nightlife", pillar: "events", icon: <Music size={16} className="inline-icon" /> },
  concert: { label: "Concert / Show", pillar: "events", icon: <Mic size={16} className="inline-icon" /> },
  workshop: { label: "Workshop / Seminar", pillar: "events", icon: <Users size={16} className="inline-icon" /> },
  cultural_event: { label: "Cultural Event", pillar: "events", icon: <Calendar size={16} className="inline-icon" /> },
  comedy: { label: "Comedy Show", pillar: "events", icon: <Mic size={16} className="inline-icon" /> },

  comedy: { label: "Comedy Show", pillar: "events", icon: <Mic size={16} className="inline-icon" /> }
};

/**
 * Get categories filtered by pillar
 */
export function getCategoriesByPillar(pillarId) {
  return Object.entries(CATEGORIES)
    .filter(([_, cat]) => cat.pillar === pillarId)
    .map(([id, cat]) => ({ id, ...cat }));
}

/**
 * Get all categories as a flat array
 */
export function getAllCategories() {
  return Object.entries(CATEGORIES).map(([key, cat]) => ({ key, ...cat }));
}

/**
 * Search categories by label
 */
export function searchCategories(query) {
  const lower = query.toLowerCase();
  return getAllCategories().filter((cat) =>
    cat.label.toLowerCase().includes(lower)
  );
}
