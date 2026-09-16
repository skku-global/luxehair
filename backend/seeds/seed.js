require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const sampleProducts = [
  // --- WIGS ---
  {
    name: "The Parisian Bone Straight HD Frontal Unit",
    category: "wigs",
    price: 320000,
    compareAtPrice: 380000,
    shortDescription: "Ultra-silky, glass-like finish crafted from single-donor raw Vietnamese hair with bespoke HD invisible frontal.",
    description: "The crown jewel of our salon collection. Sourced from single-donor Vietnamese mountain hair, renowned for its impenetrable natural cuticle alignment. This unit features our proprietary 13x6 ultra-thin HD Swiss lace, perfectly pre-plucked with micro-bleached knots to melt undetectable against all skin tones. Can be heat-styled up to 450°F, dyed to platinum 613, and guarantees a sleek mirror shine that lasts for years.",
    specifications: {
      hairType: "100% Single Donor Raw Virgin Hair",
      origin: "Vietnam Highlands",
      laceType: "13x6 Ultra-Thin HD Swiss Lace",
      hairGrade: "14A Double Drawn (Full to the ends)",
      capSize: "Medium (22.5\") with elastic band & combs",
      longevity: "3 - 5 Years with proper maintenance",
      texture: "Bone Straight"
    },
    images: [
      "/images/products/wig-bone-straight-1.jpg",
      "/images/products/wig-bone-straight-2.jpg",
      "/images/products/wig-bone-straight-3.jpg"
    ],
    variants: [
      { name: '24" / 200% Density / Natural Black #1B', length: '24"', density: '200%', color: 'Natural Black #1B', texture: 'Bone Straight', price: 320000, stock: 12 },
      { name: '28" / 250% Density / Natural Black #1B', length: '28"', density: '250%', color: 'Natural Black #1B', texture: 'Bone Straight', price: 385000, stock: 8 },
      { name: '32" / 250% Density / Jet Black #1', length: '32"', density: '250%', color: 'Jet Black #1', texture: 'Bone Straight', price: 440000, stock: 5 }
    ],
    inStock: true,
    stockQuantity: 25,
    isFeatured: true,
    isBestseller: true,
    rating: 5.0,
    reviewsCount: 34,
    tags: ["bone straight", "hd lace", "raw hair", "vietnamese", "luxury"]
  },
  {
    name: "Monaco Deep Wave Virgin Frontal Wig",
    category: "wigs",
    price: 285000,
    compareAtPrice: 330000,
    shortDescription: "Voluminous, glistening beach curls with high-definition moisture retention and zero frizz.",
    description: "Indulge in luscious, hydrated curls that bounce back with water and botanical leave-in. Sourced from Burmese raw donors, these natural deep curls hold high elasticity, zero tangling, and maintain their curl pattern even after repetitive washing. Styled with a transparent 13x4 HD frontal offering versatile parting across the crown.",
    specifications: {
      hairType: "100% Unprocessed Raw Burmese Hair",
      origin: "Burma / Myanmar",
      laceType: "13x4 Bespoke HD Lace",
      hairGrade: "13A Double Drawn",
      capSize: "Medium (22.5\") Breathable Silk Cap",
      longevity: "3+ Years",
      texture: "Deep Wave Curly"
    },
    images: [
      "/images/products/wig-deep-wave-1.jpg",
      "/images/products/wig-deep-wave-2.jpg"
    ],
    variants: [
      { name: '22" / 200% Density / Natural Brown', length: '22"', density: '200%', color: 'Natural Dark Brown', texture: 'Deep Wave', price: 285000, stock: 10 },
      { name: '26" / 250% Density / Natural Brown', length: '26"', density: '250%', color: 'Natural Dark Brown', texture: 'Deep Wave', price: 340000, stock: 6 },
      { name: '30" / 250% Density / Natural Brown', length: '30"', density: '250%', color: 'Natural Dark Brown', texture: 'Deep Wave', price: 395000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 20,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 27,
    tags: ["deep wave", "curly", "frontal", "burmese", "volume"]
  },
  {
    name: "Milan Luxury Glueless Bob Unit",
    category: "wigs",
    price: 165000,
    compareAtPrice: 195000,
    shortDescription: "Chic blunt cut 12-inch bob featuring pre-cut HD lace and secure elastic grip for 60-second wear.",
    description: "The ultimate ready-to-wear luxury investment. Designed for effortless glamour with zero adhesive required. Equipped with our 3D dome cap and velvet adjustable grip band, this blunt-cut bob frames the jawline with razor-sharp precision. 100% virgin human hair that can be straightened or curled in minutes.",
    specifications: {
      hairType: "100% Virgin Cuticle-Intact Human Hair",
      origin: "Brazilian Highlands",
      laceType: "5x5 Pre-Cut HD Closure (Glueless)",
      hairGrade: "12A Double Drawn",
      capSize: "Small-Medium with Snug Grip Band",
      longevity: "2 - 3 Years",
      texture: "Blunt Straight Bob"
    },
    images: [
      "/images/products/wig-bob-1.jpg",
      "/images/products/wig-bob-2.jpg"
    ],
    variants: [
      { name: '10" / 180% Density / Jet Black', length: '10"', density: '180%', color: 'Jet Black #1', texture: 'Blunt Bob', price: 155000, stock: 8 },
      { name: '12" / 180% Density / Natural Black', length: '12"', density: '180%', color: 'Natural Black #1B', texture: 'Blunt Bob', price: 165000, stock: 14 },
      { name: '14" / 200% Density / Chocolate Brown #4', length: '14"', density: '200%', color: 'Chocolate Brown #4', texture: 'Blunt Bob', price: 185000, stock: 5 }
    ],
    inStock: true,
    stockQuantity: 27,
    isFeatured: true,
    isBestseller: false,
    rating: 4.8,
    reviewsCount: 19,
    tags: ["glueless", "bob", "short hair", "closure", "ready to wear"]
  },
  {
    name: "Silk Velvet Body Wave Lace Masterpiece",
    category: "wigs",
    price: 310000,
    compareAtPrice: 360000,
    shortDescription: "Cascading S-pattern body waves with royal volume and unmatched movement.",
    description: "Crafted for red carpet moments and high-society occasions. Our Silk Velvet Body Wave showcases gentle, opulent undulations that catch light from every angle. Made with full cuticles flowing in the same direction to resist all shedding and tangling.",
    specifications: {
      hairType: "100% Raw Cambodian Hair",
      origin: "Cambodia",
      laceType: "13x6 HD Swiss Frontal",
      hairGrade: "14A Double Drawn",
      capSize: "Medium Adjustable Cap",
      longevity: "3 - 5 Years",
      texture: "Body Wave"
    },
    images: [
      "/images/products/wig-body-wave-1.jpg",
      "/images/products/wig-body-wave-2.jpg"
    ],
    variants: [
      { name: '24" / 200% Density / Natural Black', length: '24"', density: '200%', color: 'Natural Black', texture: 'Body Wave', price: 310000, stock: 11 },
      { name: '28" / 250% Density / Natural Black', length: '28"', density: '250%', color: 'Natural Black', texture: 'Body Wave', price: 375000, stock: 7 }
    ],
    inStock: true,
    stockQuantity: 18,
    isFeatured: false,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 22,
    tags: ["body wave", "cambodian", "hd lace", "luxury"]
  },

  // --- ATTACHMENTS ---
  {
    name: "Seamless Clip-In Extensions Set (7 Pieces)",
    category: "attachments",
    price: 95000,
    compareAtPrice: 115000,
    shortDescription: "Ultra-flat silicone band clip-ins for instant red-carpet length and seamless blending in 5 minutes.",
    description: "Transform your hair in five minutes with zero salon appointments. Crafted with ultra-thin polyurethane silicone wefts that lie 50% flatter against the scalp than traditional sewn clip-ins. 100% cuticle-aligned virgin human hair that mimics natural blowout texture seamlessly.",
    specifications: {
      hairType: "100% Cuticle Intact Human Hair",
      origin: "Southeast Asia",
      laceType: "Invisible Silicone Weft Technology",
      hairGrade: "12A Double Drawn (160 Grams Total)",
      capSize: "7 Multi-Width Pieces (1x 4-clip, 2x 3-clip, 2x 2-clip, 2x 1-clip)",
      longevity: "18 - 24 Months",
      texture: "Natural Straight / Blowout"
    },
    images: [
      "/images/products/attachment-clipin-1.jpg",
      "/images/products/attachment-clipin-2.jpg"
    ],
    variants: [
      { name: '20" / 160g / Natural Black #1B', length: '20"', density: '160g', color: 'Natural Black #1B', texture: 'Natural Straight', price: 95000, stock: 15 },
      { name: '24" / 200g / Natural Black #1B', length: '24"', density: '200g', color: 'Natural Black #1B', texture: 'Natural Straight', price: 125000, stock: 12 },
      { name: '24" / 200g / Honey Blonde Balayage', length: '24"', density: '200g', color: 'Balayage #1B/27', texture: 'Natural Straight', price: 140000, stock: 8 }
    ],
    inStock: true,
    stockQuantity: 35,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 42,
    tags: ["clip-ins", "seamless", "extensions", "natural straight"]
  },
  {
    name: "Skin-Weft Invisible Tape-In Extensions",
    category: "attachments",
    price: 140000,
    compareAtPrice: 165000,
    shortDescription: "40 pieces of medical-grade ultra-thin tape-ins offering weightless semi-permanent hair luxury.",
    description: "The choice of celebrity hairstylists. Each pack contains 40 individual tape-ins (100 grams) fitted with hospital-grade, hypoallergenic adhesive tape that lasts 8-10 weeks before re-taping. Ultra-flexible wefts distribute weight evenly with zero strain on biological hair follicles.",
    specifications: {
      hairType: "100% Raw Virgin Donor Hair",
      origin: "Vietnamese Virgin",
      laceType: "Medical Grade Invisible PU Skin Weft",
      hairGrade: "13A Double Drawn (40 Sandwiches)",
      capSize: "Universal 4cm x 0.8cm Tabs",
      longevity: "Reusable for up to 2 Years with re-taping",
      texture: "Silky Straight"
    },
    images: [
      "/images/products/attachment-tapein-1.jpg",
      "/images/products/attachment-tapein-2.jpg"
    ],
    variants: [
      { name: '22" / 100g (40 pcs) / Natural Black', length: '22"', density: '100g', color: 'Natural Black', texture: 'Straight', price: 140000, stock: 14 },
      { name: '26" / 120g (40 pcs) / Natural Black', length: '26"', density: '120g', color: 'Natural Black', texture: 'Straight', price: 175000, stock: 10 }
    ],
    inStock: true,
    stockQuantity: 24,
    isFeatured: false,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 16,
    tags: ["tape-in", "semi-permanent", "extensions", "luxury"]
  },
  {
    name: "The Sovereign Sleek Wrap-Around Ponytail",
    category: "attachments",
    price: 85000,
    compareAtPrice: 105000,
    shortDescription: "Dramatic runway-length ponytail attachment with hidden comb and velcro wrap lock.",
    description: "Elevate your everyday high or low ponytail into a dramatic fashion editorial statement. Constructed on an ergonomic curved pocket with an integrated steel comb and matching hair-wrap tail that effortlessly hides all hair bands.",
    specifications: {
      hairType: "100% Raw Virgin Hair",
      origin: "Burma",
      laceType: "Breathable Pocket Weft",
      hairGrade: "13A Double Drawn",
      capSize: "One size fits all buns",
      longevity: "2+ Years",
      texture: "Bone Straight"
    },
    images: [
      "/images/products/attachment-ponytail-1.jpg",
      "/images/products/attachment-ponytail-2.jpg"
    ],
    variants: [
      { name: '26" / 150g / Natural Black #1B', length: '26"', density: '150g', color: 'Natural Black #1B', texture: 'Bone Straight', price: 85000, stock: 20 },
      { name: '30" / 180g / Natural Black #1B', length: '30"', density: '180g', color: 'Natural Black #1B', texture: 'Bone Straight', price: 105000, stock: 12 }
    ],
    inStock: true,
    stockQuantity: 32,
    isFeatured: true,
    isBestseller: false,
    rating: 4.9,
    reviewsCount: 23,
    tags: ["ponytail", "wrap-around", "instant style", "runway"]
  },

  // --- HAIR CARE & FORMULATIONS ---
  {
    name: "Golden Elixir Moroccan Argan & Marula Hair Oil",
    category: "hair-care",
    price: 24500,
    compareAtPrice: 30000,
    shortDescription: "Ultra-nourishing cold-pressed botanical gloss elixir that seals cuticles and prevents heat damage.",
    description: "Formulated in Grasse, France specifically for virgin hair extensions and high-end human hair units. A decadent fusion of cold-pressed Moroccan Argan Oil, Namibian Marula, and Camellia Seed Oil. Delivers mirror-like luminosity without greasy residue, restores lipid barriers, and shields cuticles from heat styling up to 450°F.",
    specifications: {
      volume: "100ml / 3.4 fl. oz",
      origin: "Formulated in France",
      keyIngredients: "Certified Organic Argania Spinosa Kernel Oil, Sclerocarya Birrea (Marula) Seed Oil, Camellia Japonica Seed Oil, Vitamin E Acetate",
      hairGrade: "Bespoke Extension & Wig Grade",
      longevity: "Shelf life: 24 Months after opening",
      texture: "Silky Lightweight Dry-Oil"
    },
    images: [
      "/images/products/care-elixir-1.jpg",
      "/images/products/care-elixir-2.jpg"
    ],
    variants: [
      { name: "100ml Glass Dropper Bottle", length: "", density: "", color: "Golden Amber", texture: "Elixir", price: 24500, stock: 50 },
      { name: "200ml Luxury Salon Refill", length: "", density: "", color: "Golden Amber", texture: "Elixir", price: 42000, stock: 25 }
    ],
    inStock: true,
    stockQuantity: 75,
    isFeatured: true,
    isBestseller: true,
    rating: 5.0,
    reviewsCount: 58,
    tags: ["hair oil", "argan", "marula", "shine", "heat protectant"]
  },
  {
    name: "Invisible Lace Melting Mist & Hold Spray",
    category: "hair-care",
    price: 18500,
    compareAtPrice: 22000,
    shortDescription: "Alcohol-free holding mist that melts HD and Swiss lace invisibly into the skin with zero white residue.",
    description: "Achieve the coveted 'melted into scalp' finish. Our proprietary fast-drying formula bonds lace seamlessly to skin while resisting humidity, sweat, and active movement. Easily washes away with water or micellar cleanser without snagging hair knots or damaging delicate Swiss lace.",
    specifications: {
      volume: "200ml / 6.8 fl. oz",
      origin: "Formulated in the UK",
      keyIngredients: "Hydrolyzed Silk Protein, Rosewater Distillate, Polyquaternium-11, Panthenol Provitamin B5",
      hairGrade: "Dermatologist Tested, Latex-Free",
      longevity: "24-48 hour secure hold",
      texture: "Fine Mist Aerosol Spray"
    },
    images: [
      "/images/products/care-spray-1.jpg",
      "/images/products/care-spray-2.jpg"
    ],
    variants: [
      { name: "200ml Daily Hold Spray", length: "", density: "", color: "Clear", texture: "Spray", price: 18500, stock: 60 }
    ],
    inStock: true,
    stockQuantity: 60,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 38,
    tags: ["melting spray", "lace hold", "glueless", "swiss lace"]
  },
  {
    name: "Silk Infusion Keratin Restorative Masque",
    category: "hair-care",
    price: 28000,
    compareAtPrice: 34000,
    shortDescription: "Deep conditioning restorative treatment infused with biomimetic keratin and shea butter for extensions.",
    description: "Rejuvenate tired virgin bundles and wigs back to their out-of-the-box silky perfection. This luxurious intensive hair masque penetrates the cortex to deposit essential amino acids and lipids lost through heat styling and environmental exposure.",
    specifications: {
      volume: "250ml / 8.5 oz",
      origin: "Formulated in France",
      keyIngredients: "Hydrolyzed Keratin Amino Acids, Nilotica Shea Butter, Biotin, Ceramide NP",
      hairGrade: "Deep Reconstructive Therapy",
      longevity: "Use bi-weekly for optimal results",
      texture: "Whipped Velvety Crème"
    },
    images: [
      "/images/products/care-masque-1.jpg",
      "/images/products/care-masque-2.jpg"
    ],
    variants: [
      { name: "250ml Luxury Jar", length: "", density: "", color: "Ivory Cream", texture: "Masque", price: 28000, stock: 40 }
    ],
    inStock: true,
    stockQuantity: 40,
    isFeatured: false,
    isBestseller: false,
    rating: 4.8,
    reviewsCount: 15,
    tags: ["hair masque", "keratin", "deep conditioner", "repair"]
  },
  {
    name: "Anti-Frizz High-Gloss Finishing Serum",
    category: "hair-care",
    price: 22000,
    compareAtPrice: 26000,
    shortDescription: "Featherlight finishing polish providing 48-hour humidity resistance and diamond shine.",
    description: "A single pump dispenses a featherweight micro-shield that eliminates flyaways, static, and frizz under any tropical climate. Scented with delicate notes of Bulgarian Rose and White Amber.",
    specifications: {
      volume: "80ml / 2.7 fl. oz",
      origin: "Formulated in Switzerland",
      keyIngredients: "Dimethiconol, Meadowfoam Seed Oil, Rose Damascena Flower Extract",
      hairGrade: "High Gloss Polish",
      longevity: "48-Hour Frizz Defiance",
      texture: "Featherlight Serum"
    },
    images: [
      "/images/products/care-serum-1.jpg"
    ],
    variants: [
      { name: "80ml Luxury Pump", length: "", density: "", color: "Crystal Clear", texture: "Serum", price: 22000, stock: 45 }
    ],
    inStock: true,
    stockQuantity: 45,
    isFeatured: false,
    isBestseller: false,
    rating: 4.9,
    reviewsCount: 20,
    tags: ["finishing serum", "anti-frizz", "shine", "luxury"]
  }
];

async function runSeed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxehair';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Connected. Clearing existing products and test users...');
    await Product.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@luxehair.com', 'customer@luxehair.com'] } });

    console.log('[Seed] Creating default store accounts...');
    // Admin account
    const adminUser = await User.create({
      name: 'LUXE Concierge Admin',
      email: 'admin@luxehair.com',
      password: 'admin123456',
      role: 'admin',
      phone: '+234 800 589 3424'
    });
    console.log(`[Seed] ✅ Admin created: admin@luxehair.com / admin123456`);

    // Customer account with sample saved address
    const customerUser = await User.create({
      name: 'Chioma Adeleke',
      email: 'customer@luxehair.com',
      password: 'customer123',
      role: 'customer',
      phone: '+234 812 345 6789',
      savedAddresses: [
        {
          fullName: 'Chioma Adeleke',
          phone: '+234 812 345 6789',
          street: '14 Admiralty Way, Lekki Phase 1',
          city: 'Lagos',
          state: 'Lagos State',
          isDefault: true
        }
      ]
    });
    console.log(`[Seed] ✅ Customer created: customer@luxehair.com / customer123`);

    console.log(`[Seed] Seeding ${sampleProducts.length} curated luxury hair products...`);
    // Pre-assign slugs since insertMany bypasses Mongoose pre-save hook
    sampleProducts.forEach(p => {
      p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    });
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seed] ✅ Successfully seeded ${createdProducts.length} luxury products!`);

    // Create 1 initial demo order for customer to see in order history
    await Order.deleteMany({ 'customerInfo.email': 'customer@luxehair.com' });
    const demoProduct = createdProducts[0];
    await Order.create({
      orderNumber: 'LXH-847291',
      customer: customerUser._id,
      customerInfo: {
        name: customerUser.name,
        email: customerUser.email,
        phone: customerUser.phone
      },
      items: [
        {
          product: demoProduct._id,
          name: demoProduct.name,
          image: demoProduct.images[0],
          price: demoProduct.price,
          quantity: 1,
          selectedVariant: demoProduct.variants[0]
        }
      ],
      shippingAddress: {
        fullName: 'Chioma Adeleke',
        phone: '+234 812 345 6789',
        street: '14 Admiralty Way, Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos State'
      },
      paymentMethod: 'paystack',
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      pricingBreakdown: {
        subtotal: demoProduct.price,
        shippingFee: 3500,
        discount: 0,
        total: demoProduct.price + 3500
      },
      paystackReference: 'LXH-PAY-1710582910-482',
      paystackPaidAt: new Date(Date.now() - 86400000),
      timeline: [
        { status: 'Order Placed', timestamp: new Date(Date.now() - 86400000), note: 'Paid via Paystack Card' },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 80000000), note: 'Verified by Luxe concierge' },
        { status: 'Dispatched', timestamp: new Date(Date.now() - 36000000), note: 'Assigned to DHL Express Courier (Tracking: DHL-NG-90182)' }
      ]
    });
    console.log('[Seed] ✅ Sample customer order created for account order history.');

    await mongoose.disconnect();
    console.log('[Seed] Database seeding completed successfully.');
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

runSeed();
