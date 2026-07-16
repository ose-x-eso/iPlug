const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local
let env = {};
try {
  env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=');
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
  }, {});
} catch (err) {
  console.error("Could not read .env.local");
  process.exit(1);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  console.error("Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file to bypass RLS and create seed data.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const fakeData = [
  {
    user: { email: 'chinedu.tech@example.com', username: 'ChineduTech', full_name: 'Chinedu Okeke', phone_number: '+2348012345671', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Chinedu Laptop & Phone Repairs', description: 'Fast and reliable gadget repairs. Specializing in MacBooks, iPhones, and Android devices.', pillar: 'services', category: 'Gadget Repair', address: 'Computer Village, Ikeja', latitude: 6.5921, longitude: 3.3427, image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'amaka.bakes@example.com', username: 'AmakaCakes', full_name: 'Amaka Ndubuisi', phone_number: '+2348012345672', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Amaka\'s Sweet Treats', description: 'Custom cakes for birthdays, weddings, and anniversaries. We also deliver freshly baked meatpies.', pillar: 'shops', category: 'Bakery', address: 'Lekki Phase 1', latitude: 6.4474, longitude: 3.4720, image_url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'bola.styles@example.com', username: 'BolaStyles', full_name: 'Bola Adeyemi', phone_number: '+2348012345673', avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Bola Unisex Salon', description: 'Premium haircuts, dreads locking, braids, and manicures. VIP home service is also available.', pillar: 'services', category: 'Beauty & Hair', address: 'Yaba, Lagos', latitude: 6.5095, longitude: 3.3711, image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'emeka.autos@example.com', username: 'EmekaAutos', full_name: 'Emeka Eze', phone_number: '+2348012345674', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Emeka Auto Repairs', description: 'Expert mechanic for Toyota, Honda, and Mercedes Benz. We do engine overhauls and AC fixing.', pillar: 'services', category: 'Automotive', address: 'Ladipo Market', latitude: 6.5414, longitude: 3.3421, image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'grace.fits@example.com', username: 'GraceFits', full_name: 'Grace Ojo', phone_number: '+2348012345675', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Grace Thrift Boutique', description: 'High-quality, first-grade thrifted clothes from the UK and US. Corporate wear and casuals.', pillar: 'shops', category: 'Fashion & Clothing', address: 'Tejuosho Market', latitude: 6.5161, longitude: 3.3683, image_url: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd15?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'tunde.photography@example.com', username: 'TundePhotos', full_name: 'Tunde Babalola', phone_number: '+2348012345676', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Tunde Captures', description: 'Professional photography for weddings, events, and studio portraits. We capture your best moments.', pillar: 'services', category: 'Photography', address: 'Surulere', latitude: 6.4957, longitude: 3.3481, image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'mama.put@example.com', username: 'IyaBasira', full_name: 'Basira Alabi', phone_number: '+2348012345677', avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Iya Basira Hot Meals', description: 'The best local delicacies. Amala, Ewedu, Pounded Yam, and Egusi soup. We take bulk orders.', pillar: 'places', category: 'Restaurant', address: 'Obalende', latitude: 6.4468, longitude: 3.4143, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'samuel.graphics@example.com', username: 'SamGraphics', full_name: 'Samuel Chukwu', phone_number: '+2348012345678', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Sam Design Studios', description: 'Logos, flyers, branding, and UI/UX design. I help businesses stand out with world-class designs.', pillar: 'services', category: 'Design', address: 'Remote', latitude: 6.5244, longitude: 3.3792, image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'kemi.spa@example.com', username: 'KemiSpa', full_name: 'Kemi Peters', phone_number: '+2348012345679', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Glow Up Spa & Wellness', description: 'Relaxing massages, facials, and skincare routines. Book a session and experience ultimate tranquility.', pillar: 'places', category: 'Spa & Wellness', address: 'Victoria Island', latitude: 6.4281, longitude: 3.4219, image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'david.plumbing@example.com', username: 'DavePlumber', full_name: 'David Mark', phone_number: '+2348012345680', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Dave Expert Plumbing', description: 'Pipe leakages, water heater installations, and general plumbing services. Available 24/7.', pillar: 'services', category: 'Plumbing', address: 'GRA Phase 2, Port Harcourt', latitude: 4.8156, longitude: 7.0498, image_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'joy.events@example.com', username: 'JoyEvents', full_name: 'Joy Nnamdi', phone_number: '+2348012345681', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Joyful Event Planners', description: 'We organize weddings, corporate events, and birthday parties from start to finish.', pillar: 'services', category: 'Event Planning', address: 'Abuja', latitude: 9.0765, longitude: 7.3986, image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'femi.fitness@example.com', username: 'FemiFit', full_name: 'Femi Johnson', phone_number: '+2348012345682', avatar_url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Femi Iron Gym', description: 'Fully equipped gym with professional trainers. Weight loss programs, and aerobics classes.', pillar: 'places', category: 'Fitness Center', address: 'Gwarinpa, Abuja', latitude: 9.1066, longitude: 7.4116, image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'zainab.makeup@example.com', username: 'ZeeGlam', full_name: 'Zainab Bello', phone_number: '+2348012345683', avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Zee Glamour Studio', description: 'Bridal makeup, gele tying, and special effects makeup. We make you look flawless.', pillar: 'services', category: 'Beauty & Hair', address: 'Kano City', latitude: 12.0022, longitude: 8.5920, image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'victor.logistics@example.com', username: 'VicDelivery', full_name: 'Victor Okafor', phone_number: '+2348012345684', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Vic Swift Logistics', description: 'Fast and secure dispatch rider services within the city. We deliver packages and food safely.', pillar: 'services', category: 'Logistics', address: 'Enugu', latitude: 6.4520, longitude: 7.5103, image_url: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'ngozi.groceries@example.com', username: 'NgoziMart', full_name: 'Ngozi Uche', phone_number: '+2348012345685', avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Ngozi Fresh Mart', description: 'Fresh farm produce, provisions, and household items at wholesale prices. Home delivery available.', pillar: 'shops', category: 'Groceries', address: 'Ogbete Market, Enugu', latitude: 6.4361, longitude: 7.4912, image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  // YC / Bay Area Focused Data
  {
    user: { email: 'alex.tech@example.com', username: 'AlexFixes', full_name: 'Alex Chen', phone_number: '+14155550101', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'SOMA Device Rescue', description: 'Fast, reliable MacBook and iPhone repair right in the heart of San Francisco. Same-day service available for busy founders.', pillar: 'services', category: 'Gadget Repair', address: 'SOMA, San Francisco', latitude: 37.7785, longitude: -122.4056, image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'sarah.bakes@example.com', username: 'SarahSourdough', full_name: 'Sarah Jenkins', phone_number: '+16505550102', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Palo Alto Artisan Bakery', description: 'Freshly baked sourdough, cruffins, and artisanal coffee. The perfect spot for your morning standup or casual networking.', pillar: 'places', category: 'Bakery & Coffee', address: 'University Ave, Palo Alto', latitude: 37.4449, longitude: -122.1610, image_url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'miguel.tacos@example.com', username: 'MiguelTaqueria', full_name: 'Miguel Rodriguez', phone_number: '+14155550103', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Mission District Authentic Tacos', description: 'The best Al Pastor tacos in the Bay Area. We cater for startup events, hackathons, and office parties.', pillar: 'places', category: 'Restaurant', address: 'Mission District, SF', latitude: 37.7599, longitude: -122.4148, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'james.fitness@example.com', username: 'JamesFit', full_name: 'James Wilson', phone_number: '+16505550104', avatar_url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Mountain View Crossfit', description: 'High-intensity interval training for busy professionals. Stay fit while building the future.', pillar: 'places', category: 'Fitness Center', address: 'Mountain View, CA', latitude: 37.3861, longitude: -122.0839, image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'chloe.design@example.com', username: 'ChloeDesigns', full_name: 'Chloe Kim', phone_number: '+14155550105', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Chloe UX/UI Studio', description: 'Award-winning product design and branding for seed-stage startups. Let me help you nail your YC demo day presentation.', pillar: 'services', category: 'Design', address: 'Remote / San Francisco', latitude: 37.7749, longitude: -122.4194, image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600&h=400' }
  },
  {
    user: { email: 'david.bikes@example.com', username: 'DaveBikes', full_name: 'David Thompson', phone_number: '+15105550106', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200' },
    plug: { title: 'Berkeley Bike Repair & Rental', description: 'Electric bikes, road bikes, and quick repairs. Skip the traffic and commute sustainably.', pillar: 'shops', category: 'Transportation', address: 'Berkeley, CA', latitude: 37.8715, longitude: -122.2730, image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600&h=400' }
  }
];

async function seed() {
  console.log("Starting database seeding...");

  for (const item of fakeData) {
    try {
      // 1. Create User using Admin API (bypasses email confirmation)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: item.user.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          username: item.user.username,
          full_name: item.user.full_name,
          phone_number: item.user.phone_number,
          avatar_url: item.user.avatar_url
        }
      });

      if (authError) {
        if (authError.code === 'user_already_exists') {
          console.log(`User ${item.user.email} already exists, skipping...`);
          continue; // Skip existing users to prevent duplicate plugs
        } else {
          console.error(`Error creating user ${item.user.email}:`, authError.message);
          continue;
        }
      }

      const userId = authData.user.id;

      // 2. Insert Plug (Wait 2 seconds to allow the database trigger to create the profile first)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error: plugError } = await supabase.from('plugs').insert({
        provider_id: userId,
        title: item.plug.title,
        description: item.plug.description,
        pillar: item.plug.pillar,
        category: item.plug.category,
        address: item.plug.address,
        latitude: item.plug.latitude,
        longitude: item.plug.longitude,
        image_url: item.plug.image_url,
      });

      if (plugError) {
        console.error(`Error creating plug for ${item.user.email}:`, plugError.message);
      } else {
        console.log(`✅ Successfully seeded: ${item.plug.title}`);
      }

    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  console.log("🎉 Seeding complete!");
}

seed();
