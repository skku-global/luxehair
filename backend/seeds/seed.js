require('dotenv').config({ path: __dirname + '/../.env' });
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e) {}
const mongoose = require('mongoose');
const { resolveMongoUri } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const sampleProducts = [
  // --- WIGS ---
  {
    name: "The Aurora Icy Platinum Deep Wave Frontal Wig",
    category: "wigs",
    price: 345000,
    compareAtPrice: 410000,
    shortDescription: "Signature icy silver platinum curls with bespoke 13x6 HD Swiss frontal, styled for royal high-fashion glamour.",
    description: "An awe-inspiring masterpiece of haute coiffure. Crafted from rare single-donor hair, gently lifted to a pristine, incandescent icy platinum silver while maintaining 100% cuticle integrity. Styled into luxurious, cascading ocean-deep curls that catch light from every angle. Melted undetectable onto ultra-thin HD lace and pre-plucked with microscopic bleached knots.",
    specifications: {
      hairType: "100% Single Donor Virgin Human Hair",
      origin: "Northern Slavic / European Raw",
      laceType: "13x6 Ultra-Thin HD Swiss Lace",
      hairGrade: "14A Double Drawn",
      capSize: "Medium (22.5\") with elastic band & combs",
      longevity: "3 - 5 Years with proper maintenance",
      texture: "Deep Wave Curly",
      colorName: "Icy Platinum Silver #60",
      colorHex: "#E5E7EB",
      availableColors: [
        { name: "Platinum Silver #60", hex: "#E5E7EB" },
        { name: "Smokey Charcoal Grey", hex: "#9CA3AF" }
      ]
    },
    images: [
      "/images/products/wig-platinum-model.jpg",
      "/images/products/wig-platinum-bust.jpg",
      "/images/products/wig-platinum-quarter.jpg",
      "/images/products/wig-platinum-side.jpg",
      "/images/products/wig-platinum-back.jpg",
      "/images/products/wig-platinum-detail.jpg"
    ],
    variants: [
      { name: '24" / 200% Density / Icy Platinum #60', length: '24"', density: '200%', color: 'Icy Platinum #60', texture: 'Deep Wave', price: 345000, stock: 8 },
      { name: '28" / 250% Density / Icy Platinum #60', length: '28"', density: '250%', color: 'Icy Platinum #60', texture: 'Deep Wave', price: 410000, stock: 5 },
      { name: '26" / 200% Density / Smokey Slate Grey', length: '26"', density: '200%', color: 'Smokey Slate Grey', texture: 'Deep Wave', price: 370000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 17,
    isFeatured: true,
    isBestseller: true,
    rating: 5.0,
    reviewsCount: 42,
    tags: ["platinum", "white hair", "silver curls", "deep wave", "hd lace", "luxury"]
  },
  {
    name: "The Riviera Magenta Rose Silk Straight Wig",
    category: "wigs",
    price: 295000,
    compareAtPrice: 350000,
    shortDescription: "Vibrant high-fashion ruby magenta silk straight hair crafted from single-donor virgin hair with invisible HD lace.",
    description: "Turn heads on every red carpet. Dyed in a multi-tonal, jewel-toned ruby magenta rose hue that emits an intoxicating mirror-like glass reflection. Crafted with our signature bone-straight raw donor hair that falls with liquid drape. Includes pre-cut invisible HD Swiss frontal and pre-customized hairline.",
    specifications: {
      hairType: "100% Single-Donor Raw Virgin Hair",
      origin: "Vietnamese Mountain Hair",
      laceType: "13x4 Melt HD Swiss Frontal",
      hairGrade: "13A Double Drawn",
      capSize: "Medium (22.5\") Breathable Silk Cap",
      longevity: "3+ Years",
      texture: "Bone Straight",
      colorName: "Vibrant Ruby Magenta Pink",
      colorHex: "#BE185D",
      availableColors: [
        { name: "Ruby Magenta Pink", hex: "#BE185D" },
        { name: "Pastel Blush Rose", hex: "#F472B6" }
      ]
    },
    images: [
      "/images/products/wig-magenta-model.jpg",
      "/images/products/wig-magenta-bust.jpg",
      "/images/products/wig-magenta-quarter.jpg",
      "/images/products/wig-magenta-side.jpg",
      "/images/products/wig-magenta-back.jpg"
    ],
    variants: [
      { name: '22" / 200% Density / Ruby Magenta', length: '22"', density: '200%', color: 'Ruby Magenta Pink', texture: 'Bone Straight', price: 295000, stock: 9 },
      { name: '26" / 250% Density / Ruby Magenta', length: '26"', density: '250%', color: 'Ruby Magenta Pink', texture: 'Bone Straight', price: 360000, stock: 6 },
      { name: '20" / 180% Density / Pastel Rose', length: '20"', density: '180%', color: 'Pastel Blush Rose', texture: 'Bone Straight', price: 275000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 19,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 38,
    tags: ["magenta", "pink hair", "ruby", "bone straight", "hd lace", "runway"]
  },
  {
    name: "The Côte d'Azur Royal Sapphire Blue Wave Wig",
    category: "wigs",
    price: 330000,
    compareAtPrice: 390000,
    shortDescription: "Opulent midnight sapphire blue body waves with radiant light-reflecting glass shine and pre-plucked HD hairline.",
    description: "Deep, mysterious, and effortlessly captivating. Sourced from single-donor raw hair and saturated with high-pigment sapphire midnight blue tones with subtle teal undertones that illuminate under ambient lights. Features ultra-soft undulating body wave pattern that retains high bounce.",
    specifications: {
      hairType: "100% Raw Virgin Hair",
      origin: "Burmese Raw Hair",
      laceType: "13x6 Bespoke HD Swiss Lace",
      hairGrade: "14A Double Drawn",
      capSize: "Medium (22.5\") with velvet grip band",
      longevity: "3 - 5 Years",
      texture: "Body Wave",
      colorName: "Royal Sapphire Blue",
      colorHex: "#1D4ED8",
      availableColors: [
        { name: "Royal Sapphire Blue", hex: "#1D4ED8" },
        { name: "Ocean Cyan Highlights", hex: "#0EA5E9" }
      ]
    },
    images: [
      "/images/products/wig-sapphire-model.jpg",
      "/images/products/wig-sapphire-bust.jpg",
      "/images/products/wig-sapphire-quarter.jpg",
      "/images/products/wig-sapphire-side.jpg",
      "/images/products/wig-sapphire-back.jpg"
    ],
    variants: [
      { name: '24" / 200% Density / Sapphire Blue', length: '24"', density: '200%', color: 'Royal Sapphire Blue', texture: 'Body Wave', price: 330000, stock: 8 },
      { name: '28" / 250% Density / Sapphire Blue', length: '28"', density: '250%', color: 'Royal Sapphire Blue', texture: 'Body Wave', price: 395000, stock: 5 }
    ],
    inStock: true,
    stockQuantity: 13,
    isFeatured: true,
    isBestseller: false,
    rating: 4.9,
    reviewsCount: 29,
    tags: ["sapphire", "blue hair", "body wave", "ocean", "hd lace"]
  },
  {
    name: "The Sovereign Emerald Jewel Body Wave Wig",
    category: "wigs",
    price: 320000,
    compareAtPrice: 380000,
    shortDescription: "Enchanting deep forest emerald jewel green undulating body waves with luxury couture velvet finish.",
    description: "An aristocratic shade of jewel green designed for the modern queen. Rich, lustrous forest tones combined with the softest Cambodian raw hair cuticles. The 13x6 HD Swiss frontal melts seamlessly into the hairline, giving the illusion of hair growing directly from the scalp.",
    specifications: {
      hairType: "100% Raw Cambodian Hair",
      origin: "Cambodian Highlands",
      laceType: "13x6 HD Swiss Frontal",
      hairGrade: "14A Double Drawn",
      capSize: "Medium Adjustable Cap",
      longevity: "3 - 5 Years",
      texture: "Body Wave",
      colorName: "Emerald Jewel Green",
      colorHex: "#047857",
      availableColors: [
        { name: "Emerald Forest Green", hex: "#047857" },
        { name: "Olive Bronze Sheen", hex: "#65A30D" }
      ]
    },
    images: [
      "/images/products/wig-emerald-model.jpg",
      "/images/products/wig-emerald-bust.jpg",
      "/images/products/wig-emerald-quarter.jpg",
      "/images/products/wig-emerald-side.jpg",
      "/images/products/wig-emerald-back.jpg"
    ],
    variants: [
      { name: '24" / 200% Density / Emerald Green', length: '24"', density: '200%', color: 'Emerald Jewel Green', texture: 'Body Wave', price: 320000, stock: 7 },
      { name: '28" / 250% Density / Emerald Green', length: '28"', density: '250%', color: 'Emerald Jewel Green', texture: 'Body Wave', price: 385000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 11,
    isFeatured: true,
    isBestseller: true,
    rating: 5.0,
    reviewsCount: 31,
    tags: ["emerald", "green hair", "jewel tone", "body wave", "cambodian"]
  },
  {
    name: "The Saint-Tropez Honey Lemon Blonde Bob",
    category: "wigs",
    price: 185000,
    compareAtPrice: 220000,
    shortDescription: "Ultra-sharp 12-inch precision blunt cut in luminous honey lemon platinum blonde #613 with pre-cut glueless HD closure.",
    description: "The epitome of chic French Riviera elegance. Features a high-gloss 12-inch blunt perimeter cut with 100% virgin cuticle-intact hair pre-bleached to clean #613 honey lemon blonde. Fitted with our glueless dome cap and velvet grip band for effortless, zero-glue 60-second installations.",
    specifications: {
      hairType: "100% Virgin Cuticle-Intact Human Hair",
      origin: "Brazilian Raw Donors",
      laceType: "5x5 Pre-Cut HD Glueless Closure",
      hairGrade: "12A Double Drawn",
      capSize: "Small-Medium with Snug Grip Band",
      longevity: "2 - 3 Years",
      texture: "Blunt Cut Bob",
      colorName: "Honey Lemon Blonde #613",
      colorHex: "#FACC15",
      availableColors: [
        { name: "Honey Lemon #613", hex: "#FACC15" },
        { name: "Champagne Cream", hex: "#FEF08A" }
      ]
    },
    images: [
      "/images/products/wig-lemon-model.jpg",
      "/images/products/wig-lemon-bust.jpg",
      "/images/products/wig-lemon-quarter.jpg",
      "/images/products/wig-lemon-side.jpg",
      "/images/products/wig-lemon-back.jpg"
    ],
    variants: [
      { name: '10" / 180% Density / Honey Lemon #613', length: '10"', density: '180%', color: 'Honey Lemon #613', texture: 'Blunt Bob', price: 175000, stock: 8 },
      { name: '12" / 200% Density / Honey Lemon #613', length: '12"', density: '200%', color: 'Honey Lemon #613', texture: 'Blunt Bob', price: 185000, stock: 12 },
      { name: '14" / 200% Density / Honey Lemon #613', length: '14"', density: '200%', color: 'Honey Lemon #613', texture: 'Blunt Bob', price: 205000, stock: 5 }
    ],
    inStock: true,
    stockQuantity: 25,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 26,
    tags: ["blonde", "lemon", "613 hair", "glueless", "bob", "short hair"]
  },
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
      texture: "Bone Straight",
      colorName: "Natural Jet Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Espresso Brown #2", hex: "#3E2723" }
      ]
    },
    images: [
      "/images/products/wig-black-editorial.jpg",
      "/images/products/wig-black-bust.jpg",
      "/images/products/wig-black-quarter.jpg",
      "/images/products/wig-black-side.jpg",
      "/images/products/wig-black-back.jpg"
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
    tags: ["bone straight", "hd lace", "raw hair", "vietnamese", "luxury", "black hair"]
  },
  {
    name: "The Maison Chocolat Rich Brown Silk Bob Wig",
    category: "wigs",
    price: 215000,
    compareAtPrice: 255000,
    shortDescription: "Luxurious single-donor chocolate brown sleek bob with pre-plucked invisible HD lace — effortlessly chic.",
    description: "Elegance in its purest form. Handcrafted from single-donor raw hair, deep-dyed to a flawless multi-tonal chocolate brown with warm caramel undertones. The precision-cut blunt bob drapes with liquid smoothness, complementing every skin tone. Finished with a pre-customised 13x4 HD Swiss frontal that melts perfectly into the hairline.",
    specifications: {
      hairType: "100% Single Donor Raw Virgin Hair",
      origin: "Vietnamese Highland Raw",
      laceType: "13x4 Melt HD Swiss Frontal",
      hairGrade: "13A Double Drawn",
      capSize: "Medium (22.5\") Breathable Cap",
      longevity: "3+ Years",
      texture: "Silky Straight Bob",
      colorName: "Rich Chocolate Brown #4",
      colorHex: "#5C3317",
      availableColors: [
        { name: "Chocolate Brown #4", hex: "#5C3317" },
        { name: "Caramel Toffee #6", hex: "#8B5E3C" }
      ]
    },
    images: [
      "/images/products/wig-brown-model.jpg",
      "/images/products/wig-brown-bust.jpg"
    ],
    variants: [
      { name: '12" / 180% Density / Chocolate Brown #4', length: '12"', density: '180%', color: 'Chocolate Brown #4', texture: 'Silky Straight Bob', price: 215000, stock: 10 },
      { name: '14" / 200% Density / Chocolate Brown #4', length: '14"', density: '200%', color: 'Chocolate Brown #4', texture: 'Silky Straight Bob', price: 235000, stock: 7 },
      { name: '14" / 200% Density / Caramel Toffee #6', length: '14"', density: '200%', color: 'Caramel Toffee #6', texture: 'Silky Straight Bob', price: 245000, stock: 5 }
    ],
    inStock: true,
    stockQuantity: 22,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 21,
    tags: ["brown", "chocolate", "bob", "silky straight", "hd lace", "natural"]
  },
  {
    name: "The Havana Flame Burnt Orange Body Wave Wig",
    category: "wigs",
    price: 310000,
    compareAtPrice: 370000,
    shortDescription: "Fiery burnt-orange long body waves with radiant warm-toned chromatic pigment and 13x6 HD Swiss frontal.",
    description: "Be the room. This statement piece is saturated in a vivid burnt mandarin-orange hue with multi-dimensional amber and rust undertones that glow under warm lighting. Crafted from Burmese raw hair — renowned for its naturally voluminous body wave pattern that retains shape wash after wash. Pre-installed with our Melt HD Swiss frontal.",
    specifications: {
      hairType: "100% Raw Burmese Virgin Hair",
      origin: "Myanmar / Burmese Highlands",
      laceType: "13x6 Melt HD Swiss Frontal",
      hairGrade: "14A Double Drawn",
      capSize: "Medium (22.5\") with adjustable band",
      longevity: "3 - 4 Years",
      texture: "Body Wave",
      colorName: "Burnt Mandarin Orange",
      colorHex: "#C45000",
      availableColors: [
        { name: "Burnt Mandarin Orange", hex: "#C45000" },
        { name: "Copper Rust Ombre", hex: "#A0522D" }
      ]
    },
    images: [
      "/images/products/wig-orange-model.jpg",
      "/images/products/wig-orange-bust.jpg"
    ],
    variants: [
      { name: '22" / 180% Density / Burnt Orange', length: '22"', density: '180%', color: 'Burnt Mandarin Orange', texture: 'Body Wave', price: 310000, stock: 8 },
      { name: '26" / 200% Density / Burnt Orange', length: '26"', density: '200%', color: 'Burnt Mandarin Orange', texture: 'Body Wave', price: 365000, stock: 6 },
      { name: '24" / 200% Density / Copper Rust Ombre', length: '24"', density: '200%', color: 'Copper Rust Ombre', texture: 'Body Wave', price: 345000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 18,
    isFeatured: true,
    isBestseller: false,
    rating: 4.8,
    reviewsCount: 17,
    tags: ["orange", "burnt orange", "body wave", "bold color", "hd lace", "statement"]
  },
  {
    name: "The Versailles Auburn Copper Silk Straight Wig",
    category: "wigs",
    price: 295000,
    compareAtPrice: 350000,
    shortDescription: "Glamorous rich auburn copper-red silk straight long wig — warm, opulent and endlessly photogenic.",
    description: "Channel autumn luxury with this deeply saturated auburn copper-red long straight unit. Multi-tonal pigmentation blends warm sienna, burnished copper, and deep russet tones for a breathtaking dimensional effect. Made from single-donor Vietnamese raw hair, pre-treated with cuticle-sealing amino acids for extreme shine and silkiness.",
    specifications: {
      hairType: "100% Single Donor Raw Vietnamese Hair",
      origin: "Vietnam Highlands",
      laceType: "13x4 Pre-Plucked HD Swiss Frontal",
      hairGrade: "13A Double Drawn",
      capSize: "Medium (22.5\") Silk Cap",
      longevity: "3+ Years",
      texture: "Silky Straight",
      colorName: "Rich Auburn Copper #30",
      colorHex: "#8B3A00",
      availableColors: [
        { name: "Rich Auburn Copper #30", hex: "#8B3A00" },
        { name: "Sienna Red Ombre", hex: "#922B21" }
      ]
    },
    images: [
      "/images/products/wig-auburn-model.jpg",
      "/images/products/wig-auburn-bust.jpg"
    ],
    variants: [
      { name: '22" / 200% Density / Auburn Copper #30', length: '22"', density: '200%', color: 'Rich Auburn Copper #30', texture: 'Silky Straight', price: 295000, stock: 9 },
      { name: '26" / 200% Density / Auburn Copper #30', length: '26"', density: '200%', color: 'Rich Auburn Copper #30', texture: 'Silky Straight', price: 345000, stock: 6 },
      { name: '24" / 200% Density / Sienna Red Ombre', length: '24"', density: '200%', color: 'Sienna Red Ombre', texture: 'Silky Straight', price: 325000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 19,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 24,
    tags: ["auburn", "copper", "red hair", "silk straight", "hd lace", "warm tones"]
  },
  {
    name: "The Bellissima Burgundy Wine Curl Wig",
    category: "wigs",
    price: 305000,
    compareAtPrice: 360000,
    shortDescription: "Sumptuous deep wine burgundy long curly wig with rich jewel-toned pigment and a lush, bouncy curl pattern.",
    description: "Opulence in every curl. This bordeaux-wine burgundy unit is saturated with multi-dimensional jewel-toned pigment — deep plum, crimson wine, and moody violet undertones — that shift beautifully in different lighting. Crafted from Cambodian raw hair, known for its naturally thick, voluminous curl pattern that holds shape beautifully without frizz.",
    specifications: {
      hairType: "100% Raw Cambodian Virgin Hair",
      origin: "Cambodian Highlands",
      laceType: "13x6 HD Swiss Lace Frontal",
      hairGrade: "14A Double Drawn",
      capSize: "Medium (22.5\") with elastic band",
      longevity: "3 - 5 Years",
      texture: "Deep Curly",
      colorName: "Bordeaux Wine Burgundy #99J",
      colorHex: "#6D0E2E",
      availableColors: [
        { name: "Bordeaux Wine Burgundy #99J", hex: "#6D0E2E" },
        { name: "Dark Plum Violet", hex: "#4A235A" }
      ]
    },
    images: [
      "/images/products/wig-burgundy-model.jpg",
      "/images/products/wig-burgundy-bust.jpg"
    ],
    variants: [
      { name: '22" / 200% Density / Burgundy #99J', length: '22"', density: '200%', color: 'Bordeaux Wine Burgundy #99J', texture: 'Deep Curly', price: 305000, stock: 8 },
      { name: '26" / 250% Density / Burgundy #99J', length: '26"', density: '250%', color: 'Bordeaux Wine Burgundy #99J', texture: 'Deep Curly', price: 365000, stock: 5 },
      { name: '24" / 200% Density / Dark Plum Violet', length: '24"', density: '200%', color: 'Dark Plum Violet', texture: 'Deep Curly', price: 335000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 17,
    isFeatured: true,
    isBestseller: false,
    rating: 4.9,
    reviewsCount: 19,
    tags: ["burgundy", "wine", "deep curly", "jewel tone", "hd lace", "plum"]
  },
  {
    name: "The Monaco Golden Honey Blonde Beach Wave Wig",
    category: "wigs",
    price: 325000,
    compareAtPrice: 385000,
    shortDescription: "Sun-kissed golden honey blonde long beach waves with luminous warmth and seamless HD frontal — pure coastal glamour.",
    description: "Escape to the French Riviera with every wear. Crafted from single-donor Brazilian raw hair and gently lifted to a golden honey blonde with warm caramel and butterscotch highlights throughout. The long beach wave pattern adds effortless volume and movement. Features a pre-plucked 13x6 HD Swiss frontal for a flawless natural hairline.",
    specifications: {
      hairType: "100% Raw Brazilian Single Donor Hair",
      origin: "Brazilian Raw Donors",
      laceType: "13x6 Pre-Plucked HD Swiss Frontal",
      hairGrade: "14A Double Drawn",
      capSize: "Medium (22.5\") with velvet grip band",
      longevity: "3 - 4 Years",
      texture: "Beach Wave",
      colorName: "Golden Honey Blonde #27",
      colorHex: "#D4A017",
      availableColors: [
        { name: "Golden Honey Blonde #27", hex: "#D4A017" },
        { name: "Butterscotch Caramel Ombre", hex: "#C68A00" }
      ]
    },
    images: [
      "/images/products/wig-blonde-model.jpg",
      "/images/products/wig-blonde-bust.jpg",
      "/images/products/wig-blonde-quarter.jpg",
      "/images/products/wig-blonde-side.jpg",
      "/images/products/wig-blonde-back.jpg"
    ],
    variants: [
      { name: '22" / 180% Density / Golden Honey Blonde', length: '22"', density: '180%', color: 'Golden Honey Blonde #27', texture: 'Beach Wave', price: 325000, stock: 8 },
      { name: '26" / 200% Density / Golden Honey Blonde', length: '26"', density: '200%', color: 'Golden Honey Blonde #27', texture: 'Beach Wave', price: 385000, stock: 5 },
      { name: '24" / 200% Density / Butterscotch Ombre', length: '24"', density: '200%', color: 'Butterscotch Caramel Ombre', texture: 'Beach Wave', price: 355000, stock: 5 }
    ],
    inStock: true,
    stockQuantity: 18,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 28,
    tags: ["blonde", "honey blonde", "beach wave", "golden", "hd lace", "summer"]
  },

  // --- ATTACHMENTS ---
  {
    name: "Genius Invisi Clip-In Extensions (7 Piece Set)",
    category: "attachments",
    price: 118000,
    compareAtPrice: 145000,
    shortDescription: "Completely invisible top-attachment clip-ins that sit flat against the scalp — no clips seen, no compromise on comfort.",
    description: "Our signature Genius Invisi Clip-Ins redefine the clip-in standard. Unlike conventional clip-ins, the Genius features a completely invisible top-attachment that sits flush against the scalp with zero bulk or ridge. 100% Remy human hair — can be curled, straightened, coloured, and styled exactly like your own hair. The 7-piece set (140g) provides full-head coverage from root to tip with a natural fall that blends invisibly into your natural hair.",
    specifications: {
      hairType: "100% Remy Human Hair",
      origin: "Indian Virgin",
      laceType: "Genius Invisible Top Attachment (Zero Clip-Bulk)",
      hairGrade: "12A Single Donor (140g — 7 Pieces)",
      capSize: "7 Piece Set: 1×4-clip | 2×3-clip | 2×2-clip | 2×1-clip",
      longevity: "12–18 Months with proper care",
      texture: "Natural Straight",
      attachmentType: "Clip-In",
      colorName: "Natural Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Chocolate Brown #4", hex: "#3D1C02" },
        { name: "Honey Balayage #27", hex: "#C9833B" },
        { name: "Icy Platinum #613", hex: "#F0E6D0" }
      ]
    },
    images: [
      "/images/products/attachment-genius-clipin.jpg",
      "/images/products/attachment-genius-clipin-detail.jpg",
      "/images/products/attachment-model-length.jpg"
    ],
    variants: [
      { name: '18" / 140g / Natural Black #1B', length: '18"', density: '140g', color: 'Natural Black #1B', texture: 'Natural Straight', price: 118000, stock: 18 },
      { name: '22" / 140g / Natural Black #1B', length: '22"', density: '140g', color: 'Natural Black #1B', texture: 'Natural Straight', price: 138000, stock: 14 },
      { name: '18" / 140g / Chocolate Brown #4', length: '18"', density: '140g', color: 'Chocolate Brown #4', texture: 'Natural Straight', price: 118000, stock: 12 },
      { name: '22" / 140g / Honey Balayage #27', length: '22"', density: '140g', color: 'Honey Balayage #27', texture: 'Natural Straight', price: 145000, stock: 9 },
      { name: '22" / 140g / Icy Platinum #613', length: '22"', density: '140g', color: 'Icy Platinum #613', texture: 'Natural Straight', price: 158000, stock: 7 }
    ],
    inStock: true,
    stockQuantity: 60,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 61,
    tags: ["clip-ins", "genius", "invisi", "seamless", "natural straight", "remy"]
  },
  {
    name: "Secret Weft — Invisible Machine Weft Extensions",
    category: "attachments",
    price: 155000,
    compareAtPrice: 190000,
    shortDescription: "Ultra-flat zero-return machine weft — the thinnest, most discreet weft extension on the market.",
    description: "The Secret Weft is engineered to be completely invisible once applied. A hand-stitched ultra-thin machine weft with zero weft-return hair — meaning no bulk, no bumps, no ridging. Applied by a professional using Beaded Rows or Sew-In method, the weft sits flush to the scalp and moves like your natural hair. 100% Remy cuticle-aligned hair, available in 18\" and 22\".",
    specifications: {
      hairType: "100% Remy Single-Donor Hair",
      origin: "South East Asian Virgin",
      laceType: "Micro-Thin Machine Weft (Zero Return Hair)",
      hairGrade: "13A Double Drawn (100g per Bundle)",
      capSize: "Single Bundle — 100g | 50cm wide weft",
      longevity: "Up to 3 Years with professional re-installs",
      texture: "Silky Straight",
      attachmentType: "Weft",
      colorName: "Natural Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Jet Black #1", hex: "#0A0A0A" },
        { name: "Chocolate Brown #4", hex: "#3D1C02" },
        { name: "Chocolate Caramel #8/27", hex: "#7B4A1E" }
      ]
    },
    images: [
      "/images/products/attachment-secret-weft.jpg",
      "/images/products/attachment-secret-weft-detail.jpg",
      "/images/products/attachment-model-length.jpg"
    ],
    variants: [
      { name: '18" / 100g / Natural Black #1B', length: '18"', density: '100g', color: 'Natural Black #1B', texture: 'Silky Straight', price: 155000, stock: 15 },
      { name: '22" / 100g / Natural Black #1B', length: '22"', density: '100g', color: 'Natural Black #1B', texture: 'Silky Straight', price: 178000, stock: 12 },
      { name: '25" / 100g / Natural Black #1B', length: '25"', density: '100g', color: 'Natural Black #1B', texture: 'Silky Straight', price: 198000, stock: 8 },
      { name: '22" / 100g / Chocolate Caramel #8/27', length: '22"', density: '100g', color: 'Chocolate Caramel #8/27', texture: 'Silky Straight', price: 185000, stock: 10 }
    ],
    inStock: true,
    stockQuantity: 45,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 38,
    tags: ["weft", "secret weft", "machine weft", "semi-permanent", "beaded row", "sew-in"]
  },
  {
    name: "Nano-Tip Micro Ring Extensions",
    category: "attachments",
    price: 175000,
    compareAtPrice: 210000,
    shortDescription: "50 strands of professional Nano-Tip extensions — the smallest, most discreet permanent attachment available.",
    description: "Nano-Tip extensions use a 2mm micro-ring (the smallest bond available) to attach individual strands of 100% Remy hair directly to your natural hair. No heat. No glue. No damage. The nano ring is 90% smaller than a micro ring, making it virtually undetectable even in fine hair. Applied by a trained professional, these last 3–4 months between maintenance appointments and can be re-used up to 3 times.",
    specifications: {
      hairType: "100% Remy Human Hair",
      origin: "Indian Virgin",
      laceType: "2mm Nano Copper Ring — No Heat, No Glue",
      hairGrade: "12A Double Drawn (50 Strands = ±50g)",
      capSize: "50 Individual Strand Pack",
      longevity: "3–4 Months per install | Reusable 2–3x",
      texture: "Natural Straight",
      attachmentType: "Nano-Tip",
      colorName: "Jet Black #1",
      colorHex: "#0A0A0A",
      availableColors: [
        { name: "Jet Black #1", hex: "#0A0A0A" },
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Dark Brown #2", hex: "#2C1503" },
        { name: "Chocolate Brown #4", hex: "#3D1C02" }
      ]
    },
    images: [
      "/images/products/attachment-nano-tip.jpg",
      "/images/products/attachment-nano-tip-detail.jpg",
      "/images/products/attachment-clipin-1.jpg"
    ],
    variants: [
      { name: '18" / 50 Strands / Jet Black #1', length: '18"', density: '50 strands', color: 'Jet Black #1', texture: 'Natural Straight', price: 175000, stock: 16 },
      { name: '22" / 50 Strands / Jet Black #1', length: '22"', density: '50 strands', color: 'Jet Black #1', texture: 'Natural Straight', price: 198000, stock: 12 },
      { name: '18" / 50 Strands / Natural Black #1B', length: '18"', density: '50 strands', color: 'Natural Black #1B', texture: 'Natural Straight', price: 175000, stock: 14 },
      { name: '22" / 50 Strands / Chocolate Brown #4', length: '22"', density: '50 strands', color: 'Chocolate Brown #4', texture: 'Natural Straight', price: 198000, stock: 8 }
    ],
    inStock: true,
    stockQuantity: 50,
    isFeatured: true,
    isBestseller: false,
    rating: 4.8,
    reviewsCount: 24,
    tags: ["nano-tip", "nano ring", "micro ring", "permanent extensions", "individual strands", "salon"]
  },
  {
    name: "Italian Keratin K-Tip Bond Extensions",
    category: "attachments",
    price: 185000,
    compareAtPrice: 225000,
    shortDescription: "50 strands of Italian keratin-tipped fusion extensions — the gold standard for seamless, long-lasting length.",
    description: "Keratin K-Tip extensions are the pinnacle of professional hair extension technology. Each strand is pre-tipped with an Italian keratin polymer bond that fuses to your natural hair with a heat wand, creating a strong, flat attachment that lasts 3–6 months. 100% cuticle-aligned Remy hair from a single donor — undetectable even in fine or bleached hair. The amber keratin bond dissolves cleanly with professional keratin remover, causing zero damage.",
    specifications: {
      hairType: "100% Single-Donor Remy Hair",
      origin: "European Remy Virgin",
      laceType: "Italian Keratin Flat-Tip Bond (Fusion Method)",
      hairGrade: "13A Double Drawn (50 Strands = ±50g)",
      capSize: "50 Individual K-Tip Strand Pack",
      longevity: "3–6 Months | Zero damage removal",
      texture: "Silky Straight",
      attachmentType: "Keratin",
      colorName: "Chocolate Brown #4",
      colorHex: "#3D1C02",
      availableColors: [
        { name: "Jet Black #1", hex: "#0A0A0A" },
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Dark Brown #2", hex: "#2C1503" },
        { name: "Chocolate Brown #4", hex: "#3D1C02" },
        { name: "Honey Balayage #27", hex: "#C9833B" }
      ]
    },
    images: [
      "/images/products/attachment-keratin-ktip.jpg",
      "/images/products/attachment-keratin-ktip-detail.jpg",
      "/images/products/attachment-clipin-1.jpg"
    ],
    variants: [
      { name: '18" / 50 Strands / Jet Black #1', length: '18"', density: '50 strands', color: 'Jet Black #1', texture: 'Silky Straight', price: 185000, stock: 12 },
      { name: '22" / 50 Strands / Jet Black #1', length: '22"', density: '50 strands', color: 'Jet Black #1', texture: 'Silky Straight', price: 215000, stock: 10 },
      { name: '22" / 50 Strands / Natural Black #1B', length: '22"', density: '50 strands', color: 'Natural Black #1B', texture: 'Silky Straight', price: 215000, stock: 10 },
      { name: '22" / 50 Strands / Honey Balayage #27', length: '22"', density: '50 strands', color: 'Honey Balayage #27', texture: 'Silky Straight', price: 225000, stock: 6 }
    ],
    inStock: true,
    stockQuantity: 38,
    isFeatured: true,
    isBestseller: false,
    rating: 4.9,
    reviewsCount: 19,
    tags: ["keratin", "k-tip", "fusion", "permanent extensions", "bond", "salon-only"]
  },
  {
    name: "Express Tape Weft Extensions (20\")",
    category: "attachments",
    price: 128000,
    compareAtPrice: 155000,
    shortDescription: "40-piece medical-grade PU tape weft — applied in under 30 minutes, lasting 6–8 weeks per application.",
    description: "The Express Tape Weft is the faster, smarter evolution of the traditional tape-in. Medical-grade hypoallergenic polyurethane skin wefts bond seamlessly to your natural hair in sandwiched sections. Zero heat required. Each piece is 4cm wide and pre-taped with our reusable adhesive system that holds for 6–8 weeks and lifts cleanly with no residue. Reusable up to 3 times with fresh adhesive tabs. Ideal for fine hair wanting added density without weight.",
    specifications: {
      hairType: "100% Remy Human Hair",
      origin: "Vietnamese Virgin",
      laceType: "Medical-Grade PU Skin Weft — Hypoallergenic Adhesive",
      hairGrade: "12A Double Drawn (40 pcs = 100g)",
      capSize: "40 Pieces | 4cm × 0.8cm Tabs | Reusable 3×",
      longevity: "6–8 Weeks per application | Reusable up to 2 Years",
      texture: "Silky Straight",
      attachmentType: "Tape-In",
      colorName: "Natural Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Jet Black #1", hex: "#0A0A0A" },
        { name: "Chocolate Brown #4", hex: "#3D1C02" },
        { name: "Honey Balayage #27", hex: "#C9833B" }
      ]
    },
    images: [
      "/images/products/attachment-express-tape.jpg",
      "/images/products/attachment-express-tape-detail.jpg",
      "/images/products/attachment-model-length.jpg"
    ],
    variants: [
      { name: '20" / 40pcs / 100g / Natural Black #1B', length: '20"', density: '100g', color: 'Natural Black #1B', texture: 'Silky Straight', price: 128000, stock: 20 },
      { name: '20" / 40pcs / 100g / Jet Black #1', length: '20"', density: '100g', color: 'Jet Black #1', texture: 'Silky Straight', price: 128000, stock: 16 },
      { name: '20" / 40pcs / 100g / Chocolate Brown #4', length: '20"', density: '100g', color: 'Chocolate Brown #4', texture: 'Silky Straight', price: 128000, stock: 14 },
      { name: '20" / 40pcs / 100g / Honey Balayage #27', length: '20"', density: '100g', color: 'Honey Balayage #27', texture: 'Silky Straight', price: 138000, stock: 11 }
    ],
    inStock: true,
    stockQuantity: 61,
    isFeatured: true,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 33,
    tags: ["tape-in", "express tape", "skin weft", "semi-permanent", "fine hair", "quick install"]
  },
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
      texture: "Natural Straight / Blowout",
      attachmentType: "Clip-In",
      colorName: "Multi-Color Collection",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Emerald Jewel Green", hex: "#047857" },
        { name: "Honey Blonde #613", hex: "#FACC15" }
      ]
    },
    images: [
      "/images/products/attachment-genius-clipin.jpg",
      "/images/products/attachment-genius-clipin-detail.jpg",
      "/images/products/attachment-model-length.jpg"
    ],
    variants: [
      { name: '20" / 160g / Natural Black #1B', length: '20"', density: '160g', color: 'Natural Black #1B', texture: 'Natural Straight', price: 95000, stock: 15 },
      { name: '24" / 200g / Emerald Green', length: '24"', density: '200g', color: 'Emerald Jewel Green', texture: 'Natural Straight', price: 140000, stock: 8 },
      { name: '24" / 200g / Honey Blonde #613', length: '24"', density: '200g', color: 'Honey Blonde #613', texture: 'Natural Straight', price: 140000, stock: 10 }
    ],
    inStock: true,
    stockQuantity: 33,
    isFeatured: false,
    isBestseller: false,
    rating: 4.8,
    reviewsCount: 42,
    tags: ["clip-ins", "seamless", "extensions", "colored", "natural straight"]
  },
  {
    name: "The Sovereign Sleek Wrap-Around Ponytail",
    category: "attachments",
    price: 85000,
    compareAtPrice: 105000,
    shortDescription: "Dramatic runway-length ponytail attachment with hidden comb and velcro wrap lock. Available in 4 vivid colors.",
    description: "Elevate your everyday high or low ponytail into a dramatic fashion editorial statement. Constructed on an ergonomic curved pocket with an integrated steel comb and matching hair-wrap tail that effortlessly hides all hair bands. Available in Natural Black, Icy Platinum Silver, Ruby Magenta, and Honey Lemon Blonde.",
    specifications: {
      hairType: "100% Raw Virgin Hair",
      origin: "Burma",
      laceType: "Breathable Pocket Weft",
      hairGrade: "13A Double Drawn",
      capSize: "One size fits all buns",
      longevity: "2+ Years",
      texture: "Bone Straight",
      attachmentType: "Ponytail",
      colorName: "Multi-Color Collection",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Icy Platinum Silver", hex: "#E5E7EB" },
        { name: "Ruby Magenta Pink", hex: "#BE185D" },
        { name: "Honey Lemon Blonde", hex: "#FACC15" }
      ]
    },
    images: [
      "/images/products/attachment-ponytail-1.jpg",
      "/images/products/attachment-ponytail-2.jpg",
      "/images/products/attachment-clipin-1.jpg"
    ],
    variants: [
      { name: '26" / 150g / Natural Black #1B', length: '26"', density: '150g', color: 'Natural Black #1B', texture: 'Bone Straight', price: 85000, stock: 20 },
      { name: '30" / 180g / Natural Black #1B', length: '30"', density: '180g', color: 'Natural Black #1B', texture: 'Bone Straight', price: 105000, stock: 12 },
      { name: '26" / 150g / Platinum Silver', length: '26"', density: '150g', color: 'Icy Platinum Silver', texture: 'Bone Straight', price: 95000, stock: 8 },
      { name: '26" / 150g / Ruby Magenta', length: '26"', density: '150g', color: 'Ruby Magenta Pink', texture: 'Bone Straight', price: 95000, stock: 10 },
      { name: '26" / 150g / Honey Lemon Blonde', length: '26"', density: '150g', color: 'Honey Lemon Blonde', texture: 'Bone Straight', price: 95000, stock: 9 }
    ],
    inStock: true,
    stockQuantity: 32,
    isFeatured: false,
    isBestseller: false,
    rating: 4.9,
    reviewsCount: 23,
    tags: ["ponytail", "wrap-around", "instant style", "runway"]
  },

  // --- HAIR CARE & FORMULATIONS ---
  {
    name: "Argan & Marula Golden Hair Elixir",
    category: "hair-care",
    price: 28500,
    compareAtPrice: 35000,
    shortDescription: "Cold-pressed liquid gold for wigs and extensions — delivers mirror shine, seals cuticles, and shields against 450°F heat damage.",
    description: "Formulated by cosmetic chemists in Grasse, France specifically for 100% raw virgin hair wigs and extensions. The Argan & Marula Elixir is a lightweight dry-oil fusion of three certified organic botanical oils — Moroccan Argan, Namibian Marula, and Japanese Camellia — that penetrates the hair cortex to restore lipid balance, eliminate frizz at the source, and deliver a high-definition glossy finish that lasts 4–6 washes. Two to three drops is all you need. Absorbs in seconds. Leaves zero greasy residue. Scented with a delicate accord of warm amber and sandalwood.",
    specifications: {
      volume: "100ml / 3.4 fl. oz (Glass Dropper Bottle)",
      origin: "Formulated in Grasse, France",
      keyIngredients: "Certified Organic Argania Spinosa Kernel Oil 38%, Sclerocarya Birrea (Marula) Seed Oil 22%, Camellia Japonica Seed Oil 18%, Vitamin E Tocopherol, Golden Jojoba Esters",
      productType: "Oil",
      hairGrade: "Virgin & Extension Grade — Safe for colored, bleached & heat-styled hair",
      longevity: "Shelf life 24 months | Use 2–3 drops per application",
      scentProfile: "Warm Amber · Sandalwood · Bergamot",
      texture: "Silky Dry-Oil — Absorbs in 30 seconds, zero residue"
    },
    images: [
      "/images/products/care-argan-oil.jpg",
      "/images/products/care-argan-oil-2.jpg",
      "/images/products/care-argan-oil.jpg"
    ],
    variants: [
      { name: "100ml Glass Dropper — Golden Amber", length: "", density: "", color: "Golden Amber", texture: "Dry-Oil Elixir", price: 28500, stock: 60 },
      { name: "200ml Salon Refill — Golden Amber", length: "", density: "", color: "Golden Amber", texture: "Dry-Oil Elixir", price: 48500, stock: 25 }
    ],
    inStock: true,
    stockQuantity: 85,
    isFeatured: true,
    isBestseller: true,
    rating: 5.0,
    reviewsCount: 72,
    tags: ["hair oil", "argan", "marula", "camellia", "shine", "heat protectant", "dry oil", "elixir"]
  },
  {
    name: "Night Recovery Keratin Repair Balm",
    category: "hair-care",
    price: 34000,
    compareAtPrice: 42000,
    shortDescription: "Overnight restorative sleeping treatment — wakes up your wig or extensions completely transformed: soft, silky, and full from root to tip.",
    description: "The Night Recovery Balm is our most intensive reconstructive treatment. Formulated for weekly overnight use on virgin wigs, bundles, and extensions that have been through heat styling, colour processing, or environmental exposure. A rich whipped crème fortified with biomimetic keratin amino acids, Nilotica shea butter, ceramide complex, and biotin that penetrates the hair shaft overnight to restore tensile strength, lock in moisture, and eliminate breakage. Apply a generous amount from mid-shaft to ends before bed. Wrap in a silk bonnet. Wake to silky, full, runway-finish hair.",
    specifications: {
      volume: "100ml / 3.4 fl. oz (Matte Black Jar with Gold Lid)",
      origin: "Formulated in Paris, France",
      keyIngredients: "Hydrolyzed Keratin Amino Acids 12%, Nilotica Shea Butter, Ceramide NP Complex, Biotin, Sweet Almond Oil, Provitamin B5 Panthenol",
      productType: "Masque",
      hairGrade: "Reconstructive — For chemically treated, heat-damaged or dry extensions",
      longevity: "Use once per week overnight | Shelf life 18 months",
      scentProfile: "Delicate Jasmine Musk · Vanilla · Coconut Milk",
      texture: "Whipped Velvety Crème — Melts on contact with hair heat"
    },
    images: [
      "/images/products/care-night-balm.jpg",
      "/images/products/care-night-balm-2.jpg",
      "/images/products/care-night-balm.jpg"
    ],
    variants: [
      { name: "100ml Matte Black Jar — Night Jasmine", length: "", density: "", color: "Ivory Cream", texture: "Overnight Masque", price: 34000, stock: 40 }
    ],
    inStock: true,
    stockQuantity: 40,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 34,
    tags: ["overnight", "night balm", "hair masque", "keratin", "deep conditioner", "repair", "sleeping treatment"]
  },
  {
    name: "Silk Protein & Camellia Glow Serum Duo",
    category: "hair-care",
    price: 26000,
    compareAtPrice: 32000,
    shortDescription: "Two amber precision serums: Silk Protein Serum for strength + Camellia Glow Serum for luminosity — the complete daily finishing ritual.",
    description: "Our bestselling two-serum system designed for daily use on human hair wigs and extensions. The Silk Protein Serum (nourish & restore) deposits hydrolyzed silk amino acids directly into the hair shaft to rebuild structural integrity — ideal for straight and body wave textures. The Camellia Glow Serum (illuminate & hydrate) is a lightweight botanical gloss that seals the cuticle and amplifies natural shine by up to 3× without weighing hair down. Use the Silk in the morning before styling; apply one drop of Camellia to finish. Both serums come in 30ml amber glass dropper bottles.",
    specifications: {
      volume: "2 × 30ml Amber Glass Dropper Bottles",
      origin: "Formulated in the UK",
      keyIngredients: "Hydrolyzed Silk Protein, Camellia Japonica Seed Oil, Jasmine Extract, Squalane, Vitamin E",
      productType: "Serum",
      hairGrade: "Daily Use — For all hair textures including coloured and bleached",
      longevity: "Each bottle lasts ~3 months daily use | Shelf life 24 months",
      scentProfile: "White Jasmine · Green Tea · Clean Musk",
      texture: "Ultra-lightweight serum — applies dry, no oiliness"
    },
    images: [
      "/images/products/care-silk-serum.jpg",
      "/images/products/care-serum-1.jpg"
    ],
    variants: [
      { name: "Silk Protein + Camellia Glow Duo (2 × 30ml)", length: "", density: "", color: "Amber Gold", texture: "Dual Serum", price: 26000, stock: 50 },
      { name: "Silk Protein Serum Only (30ml)", length: "", density: "", color: "Amber Gold", texture: "Serum", price: 14500, stock: 30 },
      { name: "Camellia Glow Serum Only (30ml)", length: "", density: "", color: "Amber Gold", texture: "Serum", price: 14500, stock: 30 }
    ],
    inStock: true,
    stockQuantity: 110,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 47,
    tags: ["serum", "silk protein", "camellia", "shine", "hydration", "daily care", "duo", "finishing serum"]
  },
  {
    name: "Invisible Lace Melt Mist",
    category: "hair-care",
    price: 19500,
    compareAtPrice: 24000,
    shortDescription: "Alcohol-free HD lace bonding mist — melts Swiss and HD lace invisibly into skin with a 24–48 hour hold and zero white residue.",
    description: "Achieve the coveted undetectable hairline in seconds. Our Invisible Lace Melt Mist bonds HD lace, Swiss lace, and thin-skin units seamlessly to the scalp using a proprietary film-forming complex that dries completely clear and colorless — even on deeper skin tones. Alcohol-free and latex-free, it resists humidity, sweat, and coastal heat while remaining gentle enough for daily use. Removes cleanly with warm water or micellar cleanser without snagging knots or damaging delicate HD lace. Formulated with hydrolyzed silk to condition and protect the hairline skin.",
    specifications: {
      volume: "200ml / 6.8 fl. oz (Frosted Glass Pump Bottle)",
      origin: "Formulated in London, UK",
      keyIngredients: "Hydrolyzed Silk Protein, Rosewater Distillate, Polyquaternium-11 Film Former, Panthenol Provitamin B5, Allantoin",
      productType: "Spray",
      hairGrade: "Dermatologist Tested | Latex-Free | Alcohol-Free | Fragrance-Free",
      longevity: "24–48 hour secure hold per application | Shelf life 18 months",
      scentProfile: "Fragrance-Free",
      texture: "Ultra-fine mist spray — dries invisible in 60 seconds"
    },
    images: [
      "/images/products/care-lace-spray.jpg",
      "/images/products/care-lace-spray-2.jpg",
      "/images/products/care-lace-spray.jpg"
    ],
    variants: [
      { name: "200ml Frosted Glass Pump — Fragrance Free", length: "", density: "", color: "Crystal Clear", texture: "Fine Mist Spray", price: 19500, stock: 65 },
      { name: "400ml Salon Refill Pump — Fragrance Free", length: "", density: "", color: "Crystal Clear", texture: "Fine Mist Spray", price: 34000, stock: 20 }
    ],
    inStock: true,
    stockQuantity: 85,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 53,
    tags: ["lace melt", "lace spray", "hd lace", "swiss lace", "glueless", "hold spray", "hairline"]
  },
  {
    name: "Anti-Frizz Diamond Gloss Finishing Serum",
    category: "hair-care",
    price: 22000,
    compareAtPrice: 27000,
    shortDescription: "48-hour frizz-defiant micro-serum that locks in diamond shine and eliminates flyaways in tropical humidity.",
    description: "One pump. Instant perfection. The Diamond Gloss Finishing Serum is the last step in your styling routine — a featherweight silicone micro-emulsion that deposits an invisible shield around every strand, eliminating frizz, static, and flyaways for up to 48 hours. Safe for use on straight, wavy, and lightly curled extensions. The lightweight formula won't flatten body-wave or loose-curl textures — it defines without heaviness. Scented with delicate notes of Bulgarian Rose and White Amber. The frosted pump bottle dispenses the exact right amount every press.",
    specifications: {
      volume: "80ml / 2.7 fl. oz (Frosted Pump Bottle)",
      origin: "Formulated in Zurich, Switzerland",
      keyIngredients: "Dimethiconol Micro-Silicone, Meadowfoam Seed Oil, Rose Damascena Flower Extract, Camellia Seed Oil, UV Absorber",
      productType: "Serum",
      hairGrade: "Finishing Gloss — For all textures, safe on colored and bleached hair",
      longevity: "48-hour frizz resistance | ~200 applications per bottle",
      scentProfile: "Bulgarian Rose · White Amber · Light Musk",
      texture: "Featherweight serum — absorbs instantly, non-greasy"
    },
    images: [
      "/images/products/care-silk-serum.jpg",
      "/images/products/care-serum-1.jpg"
    ],
    variants: [
      { name: "80ml Frosted Pump — Rose & White Amber", length: "", density: "", color: "Crystal Clear", texture: "Finishing Serum", price: 22000, stock: 45 }
    ],
    inStock: true,
    stockQuantity: 45,
    isFeatured: false,
    isBestseller: false,
    rating: 4.8,
    reviewsCount: 28,
    tags: ["finishing serum", "anti-frizz", "shine", "gloss", "flyaway control", "humidity", "tropical"]
  }

];

async function runSeed(shouldDisconnect = true) {
  try {
    const mongoUri = resolveMongoUri();
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri.replace(/:([^@]+)@/, ':***@')}`);
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
      vipTier: 'GOLD',
      addresses: [
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
    const defaultReviews = [
      {
        name: 'Chioma Adeleke',
        rating: 5,
        title: 'Absolute Perfection — The HD Lace Melts Seamlessly',
        comment: 'The hair quality exceeded all my expectations. The lace literally dissolved against my scalp with zero bleaching required. Hair remains silky and bouncy even after multiple washes.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        name: 'Zainab Balogun',
        rating: 5,
        title: 'Luxury in a Box — Worth Every Kobo',
        comment: 'Packaged like high jewelry! The texture is full from root to tip with zero shedding. I received compliments everywhere.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 7 * 86400000)
      },
      {
        name: 'Amara Nwosu',
        rating: 5,
        title: 'Silky, Tangle-Free and Lightweight',
        comment: 'I wore this unit to an evening gala. Heat styling held the curl pattern all night. 10/10 craftsmanship.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 12 * 86400000)
      }
    ];

    // Pre-assign slugs and reviews since insertMany bypasses Mongoose pre-save hook
    sampleProducts.forEach(p => {
      p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      p.reviews = defaultReviews;
      p.rating = 5.0;
      p.reviewsCount = defaultReviews.length;
    });
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seed] ✅ Successfully seeded ${createdProducts.length} luxury products!`);

    // Create 1 initial demo order for customer to see in order history
    await Order.deleteMany({ 'customerInfo.email': 'customer@luxehair.com' });
    const demoProduct = createdProducts[0];
    await Order.create({
      orderNumber: 'LXH-2026-8801',
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

    if (shouldDisconnect) {
      await mongoose.disconnect();
      console.log('[Seed] Database seeding completed successfully.');
    }
  } catch (err) {
    console.error('[Seed Error]:', err);
    if (shouldDisconnect) process.exit(1);
    throw err;
  }
}

if (require.main === module) {
  runSeed(true);
}

module.exports = { runSeed, sampleProducts };
