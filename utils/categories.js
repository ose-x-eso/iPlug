/**
 * iPlug Categories
 * Fixed list + custom option for providers
 */

export const PILLARS = {
  services: {
    label: "Services",
    icon: "🔧",
    description: "Skilled workers and service providers",
  },
  shops: {
    label: "Shops",
    icon: "🛍️",
    description: "Shops and product sellers",
  },
  places: {
    label: "Places",
    icon: "🏢",
    description: "Businesses and locations",
  },
};

export const CATEGORIES = {
  // ---- Services ----
  electrician: { label: "Electrician", pillar: "services", icon: "⚡" },
  plumber: { label: "Plumber", pillar: "services", icon: "🔧" },
  carpenter: { label: "Carpenter", pillar: "services", icon: "🪚" },
  mechanic: { label: "Mechanic", pillar: "services", icon: "🔩" },
  tailor: { label: "Tailor", pillar: "services", icon: "🧵" },
  barber: { label: "Barber", pillar: "services", icon: "💈" },
  hairdresser: { label: "Hair Stylist", pillar: "services", icon: "💇" },
  cleaner: { label: "Cleaner", pillar: "services", icon: "🧹" },
  painter: { label: "Painter", pillar: "services", icon: "🎨" },
  welder: { label: "Welder", pillar: "services", icon: "🔥" },
  tiler: { label: "Tiler", pillar: "services", icon: "🧱" },
  ac_technician: { label: "AC Technician", pillar: "services", icon: "❄️" },
  generator_repair: { label: "Generator Repair", pillar: "services", icon: "⚙️" },
  phone_repair: { label: "Phone Repair", pillar: "services", icon: "📱" },
  photographer: { label: "Photographer", pillar: "services", icon: "📸" },
  makeup_artist: { label: "Makeup Artist", pillar: "services", icon: "💄" },
  caterer: { label: "Caterer", pillar: "services", icon: "🍽️" },
  driver: { label: "Driver", pillar: "services", icon: "🚗" },
  laundry: { label: "Laundry Service", pillar: "services", icon: "👕" },
  fumigator: { label: "Fumigator", pillar: "services", icon: "🐛" },
  web_developer: { label: "Web Developer", pillar: "services", icon: "💻" },
  graphic_designer: { label: "Graphic Designer", pillar: "services", icon: "🖌️" },

  // ---- Shops ----
  electronics: { label: "Electronics", pillar: "shops", icon: "📺" },
  phone_accessories: { label: "Phone Accessories", pillar: "shops", icon: "🎧" },
  clothing: { label: "Clothing Store", pillar: "shops", icon: "👗" },
  grocery: { label: "Grocery/Provisions", pillar: "shops", icon: "🛒" },
  pharmacy: { label: "Pharmacy", pillar: "shops", icon: "💊" },
  restaurant: { label: "Restaurant/Food", pillar: "shops", icon: "🍛" },
  building_materials: { label: "Building Materials", pillar: "shops", icon: "🏗️" },
  furniture: { label: "Furniture", pillar: "shops", icon: "🪑" },
  bookshop: { label: "Bookshop", pillar: "shops", icon: "📚" },
  general_goods: { label: "General Goods", pillar: "shops", icon: "🏪" },

  // ---- Places ----
  gym: { label: "Gym/Fitness", pillar: "places", icon: "🏋️" },
  salon: { label: "Salon/Spa", pillar: "places", icon: "💆" },
  coworking: { label: "Coworking Space", pillar: "places", icon: "🏢" },
  laundromat: { label: "Laundromat", pillar: "places", icon: "🧺" },
  car_wash: { label: "Car Wash", pillar: "places", icon: "🚙" },
  hotel: { label: "Hotel/Guest House", pillar: "places", icon: "🏨" },
  event_center: { label: "Event Center", pillar: "places", icon: "🎪" },
  clinic: { label: "Clinic/Hospital", pillar: "places", icon: "🏥" },
};

/**
 * Get categories filtered by pillar
 */
export function getCategoriesByPillar(pillar) {
  return Object.entries(CATEGORIES)
    .filter(([, cat]) => cat.pillar === pillar)
    .map(([key, cat]) => ({ key, ...cat }));
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
