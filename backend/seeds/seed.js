require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
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
      "/images/products/wig-platinum-bust2.jpg",
      "/images/products/wig-deep-wave-1.jpg"
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
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
      "/images/products/wig-bone-straight-2.jpg"
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
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80",
      "/images/products/wig-deep-wave-2.jpg"
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
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
      "/images/products/wig-body-wave-1.jpg"
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
      "https://images.unsplash.com/photo-1595959183082-7b570b7e08cf?w=600&auto=format&fit=crop&q=80",
      "/images/products/wig-bob-1.jpg"
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
      "/images/products/wig-bone-straight-1.jpg",
      "/images/products/wig-bone-straight-2.jpg",
      "/images/products/wig-bone-straight-3.jpg",
      "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&auto=format&fit=crop&q=80"
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
      "/images/products/wig-brown-bust.jpg",
      "/images/products/wig-bone-straight-2.jpg"
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
    name: "The Noir Obsidian Jet Black Bone Straight Wig",
    category: "wigs",
    price: 280000,
    compareAtPrice: 335000,
    shortDescription: "Ultra-glossy jet black bone-straight long wig with mirror-like glass shine and seamless 13x6 HD frontal.",
    description: "Timeless, dramatic, and impossibly sleek. Sourced from premium single-donor raw Vietnamese hair in its purest natural jet black state — zero processing, zero chemicals — resulting in a luminous, glass-like mirror shine that photographs beautifully under studio and ambient light alike. Features a hand-tied 13x6 HD Swiss lace with micro-bleached knots.",
    specifications: {
      hairType: "100% Raw Unprocessed Single Donor Hair",
      origin: "Vietnam Highlands",
      laceType: "13x6 Ultra-Thin HD Swiss Frontal",
      hairGrade: "14A Double Drawn",
      capSize: "Medium (22.5\") with velvet grip band",
      longevity: "3 - 5 Years",
      texture: "Bone Straight",
      colorName: "Jet Black #1",
      colorHex: "#0A0A0A",
      availableColors: [
        { name: "Jet Black #1", hex: "#0A0A0A" },
        { name: "Natural Black #1B", hex: "#18181B" }
      ]
    },
    images: [
      "/images/products/wig-black-model.jpg",
      "/images/products/wig-black-bust.jpg",
      "/images/products/wig-bone-straight-1.jpg",
      "/images/products/wig-bone-straight-3.jpg"
    ],
    variants: [
      { name: '24" / 200% Density / Jet Black #1', length: '24"', density: '200%', color: 'Jet Black #1', texture: 'Bone Straight', price: 280000, stock: 12 },
      { name: '28" / 250% Density / Jet Black #1', length: '28"', density: '250%', color: 'Jet Black #1', texture: 'Bone Straight', price: 340000, stock: 8 },
      { name: '32" / 250% Density / Natural Black #1B', length: '32"', density: '250%', color: 'Natural Black #1B', texture: 'Bone Straight', price: 390000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 24,
    isFeatured: true,
    isBestseller: true,
    rating: 5.0,
    reviewsCount: 33,
    tags: ["black hair", "jet black", "bone straight", "hd lace", "glass shine", "raw"]
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
      "/images/products/wig-orange-bust.jpg",
      "/images/products/wig-body-wave-1.jpg",
      "/images/products/wig-body-wave-2.jpg"
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
      "/images/products/wig-auburn-bust.jpg",
      "/images/products/wig-bone-straight-2.jpg"
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
      "/images/products/wig-burgundy-bust.jpg",
      "/images/products/wig-deep-wave-1.jpg",
      "/images/products/wig-deep-wave-2.jpg"
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
      "/images/products/wig-body-wave-2.jpg"
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

  // --- WIGS: PRO TIER ---
  {
    name: "PRO | The Atelier Titanium Silk Press Wig",
    category: "wigs",
    price: 485000,
    compareAtPrice: 560000,
    shortDescription: "Top-tier 360 full lace bespoke silk press unit — featherweight, undetectable, and built for the stage.",
    description: "The crown jewel of our Pro Collection. Hand-sewn on a bespoke 360 full HD Swiss lace cap with individually ventilated knots for a completely scalp-like appearance from every angle. Single-donor Vietnamese raw hair, silk-pressed to a glass-like finish. Every unit comes with a dedicated installation kit and custom cap measurement service.",
    specifications: {
      hairType: "100% Single Donor Virgin Raw Hair — Pro Grade",
      origin: "Vietnam Premium Highlands",
      laceType: "360 Full HD Swiss Lace — Bespoke Cap",
      hairGrade: "15A Signature Double Drawn",
      capSize: "Custom-Made to Measurement",
      longevity: "5+ Years with Professional Care",
      texture: "Silk Press Straight",
      colorName: "Natural Jet Black #1 — Pro",
      colorHex: "#0A0A0A",
      availableColors: [
        { name: "Jet Black #1 Pro", hex: "#0A0A0A" },
        { name: "Espresso #2 Pro", hex: "#2C1A0E" }
      ]
    },
    images: [
      "/images/products/wig-black-model.jpg",
      "/images/products/wig-black-bust.jpg",
      "/images/products/wig-bone-straight-1.jpg",
      "/images/products/wig-bone-straight-3.jpg"
    ],
    variants: [
      { name: '26" / 250% Density / Jet Black Pro', length: '26"', density: '250%', color: 'Jet Black #1 Pro', texture: 'Silk Press', price: 485000, stock: 5 },
      { name: '30" / 300% Density / Jet Black Pro', length: '30"', density: '300%', color: 'Jet Black #1 Pro', texture: 'Silk Press', price: 560000, stock: 3 },
      { name: '28" / 250% Density / Espresso Pro', length: '28"', density: '250%', color: 'Espresso #2 Pro', texture: 'Silk Press', price: 510000, stock: 3 }
    ],
    inStock: true,
    stockQuantity: 11,
    isFeatured: true,
    isBestseller: true,
    rating: 5.0,
    reviewsCount: 14,
    tags: ["pro", "360 lace", "silk press", "bespoke", "full lace", "luxury", "black hair"]
  },
  {
    name: "PRO | The Imperial Raven Curly Crown Wig",
    category: "wigs",
    price: 520000,
    compareAtPrice: 610000,
    shortDescription: "Elite 360 full lace raven black kinky curl unit — ultimate density, maximum drama, zero compromise.",
    description: "Our boldest, most voluminous Pro offering. Crafted with Cambodian raw hair selected specifically for its naturally thick, coily texture. Hand-ventilated on a 360 full HD Swiss lace cap that moves naturally in all directions. The deep kinky curl pattern is set with our proprietary tension method for lasting shape and unrivalled bounce.",
    specifications: {
      hairType: "100% Raw Cambodian Premium Hair — Pro Grade",
      origin: "Cambodian Highlands — Single Donor",
      laceType: "360 Full Lace — Hand-Tied HD Swiss",
      hairGrade: "15A Premium Double Drawn",
      capSize: "Custom Fitted to Client Measurement",
      longevity: "5+ Years",
      texture: "Kinky Deep Curl",
      colorName: "Raven Jet Black #1",
      colorHex: "#050505",
      availableColors: [
        { name: "Raven Black #1", hex: "#050505" },
        { name: "Dark Espresso #2", hex: "#1A0A00" }
      ]
    },
    images: [
      "/images/products/wig-burgundy-model.jpg",
      "/images/products/wig-burgundy-bust.jpg",
      "/images/products/wig-deep-wave-1.jpg",
      "/images/products/wig-deep-wave-2.jpg"
    ],
    variants: [
      { name: '24" / 300% Density / Raven Black Pro', length: '24"', density: '300%', color: 'Raven Black #1', texture: 'Kinky Deep Curl', price: 520000, stock: 4 },
      { name: '28" / 350% Density / Raven Black Pro', length: '28"', density: '350%', color: 'Raven Black #1', texture: 'Kinky Deep Curl', price: 610000, stock: 2 }
    ],
    inStock: true,
    stockQuantity: 6,
    isFeatured: true,
    isBestseller: false,
    rating: 5.0,
    reviewsCount: 9,
    tags: ["pro", "360 lace", "kinky curl", "raven black", "full lace", "volume"]
  },
  {
    name: "PRO | The Couture Ombre Sunset Frontal Wig",
    category: "wigs",
    price: 445000,
    compareAtPrice: 510000,
    shortDescription: "Bespoke pro-grade ombre straight wig — black roots dissolving into blazing auburn copper tips on 13x6 HD lace.",
    description: "A hand-crafted Pro Series masterpiece. Rich natural black roots melt seamlessly through warm sienna mid-lengths into blazing copper-auburn tips, creating a naturally sun-kissed, three-dimensional ombre effect. Applied with professional hair colourists using zero-damage techniques on single-donor raw hair. The result is a flawless, dimensional colour that no mass-produced unit can replicate.",
    specifications: {
      hairType: "100% Single Donor Raw Vietnamese Hair — Pro Colour",
      origin: "Vietnam Highlands",
      laceType: "13x6 Ultra-Thin HD Swiss Frontal — Bespoke",
      hairGrade: "14A Double Drawn",
      capSize: "Medium (22.5\") with silk interior cap",
      longevity: "4+ Years",
      texture: "Bone Straight",
      colorName: "Black-to-Auburn Sunset Ombre",
      colorHex: "#8B3A00",
      availableColors: [
        { name: "Black to Auburn Sunset", hex: "#8B3A00" },
        { name: "Brown to Honey Gold", hex: "#C68A00" }
      ]
    },
    images: [
      "/images/products/wig-auburn-model.jpg",
      "/images/products/wig-auburn-bust.jpg",
      "/images/products/wig-bone-straight-2.jpg",
      "/images/products/wig-bone-straight-3.jpg"
    ],
    variants: [
      { name: '26" / 250% Density / Black-to-Auburn', length: '26"', density: '250%', color: 'Black to Auburn Sunset', texture: 'Bone Straight', price: 445000, stock: 6 },
      { name: '30" / 300% Density / Black-to-Auburn', length: '30"', density: '300%', color: 'Black to Auburn Sunset', texture: 'Bone Straight', price: 510000, stock: 3 },
      { name: '26" / 250% Density / Brown-to-Gold', length: '26"', density: '250%', color: 'Brown to Honey Gold', texture: 'Bone Straight', price: 460000, stock: 4 }
    ],
    inStock: true,
    stockQuantity: 13,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 11,
    tags: ["pro", "ombre", "auburn", "bone straight", "hd lace", "color"]
  },

  // --- WIGS: STANDARD TIER ---
  {
    name: "STANDARD | The Chérie Chestnut Body Wave Wig",
    category: "wigs",
    price: 195000,
    compareAtPrice: 235000,
    shortDescription: "Rich chestnut brown body wave frontal wig with full volume and a natural lace hairline — everyday elegance.",
    description: "Our Standard Series delivers undeniable quality at an accessible luxury price. The Chérie features lush chestnut brown body waves crafted from Grade 12A double-drawn hair on a 13x4 HD Swiss frontal. The soft, bouncy wave pattern retains its shape beautifully between washes without product build-up.",
    specifications: {
      hairType: "100% Virgin Human Hair",
      origin: "Southeast Asia",
      laceType: "13x4 HD Swiss Frontal",
      hairGrade: "12A Double Drawn",
      capSize: "Medium (22.5\") Adjustable",
      longevity: "2 - 3 Years",
      texture: "Body Wave",
      colorName: "Chestnut Brown #6",
      colorHex: "#6B3A2A",
      availableColors: [
        { name: "Chestnut Brown #6", hex: "#6B3A2A" },
        { name: "Dark Brown #2", hex: "#2C1A0E" }
      ]
    },
    images: [
      "/images/products/wig-brown-model.jpg",
      "/images/products/wig-brown-bust.jpg",
      "/images/products/wig-body-wave-1.jpg"
    ],
    variants: [
      { name: '20" / 180% Density / Chestnut Brown', length: '20"', density: '180%', color: 'Chestnut Brown #6', texture: 'Body Wave', price: 195000, stock: 14 },
      { name: '24" / 200% Density / Chestnut Brown', length: '24"', density: '200%', color: 'Chestnut Brown #6', texture: 'Body Wave', price: 235000, stock: 10 },
      { name: '20" / 180% Density / Dark Brown #2', length: '20"', density: '180%', color: 'Dark Brown #2', texture: 'Body Wave', price: 195000, stock: 10 }
    ],
    inStock: true,
    stockQuantity: 34,
    isFeatured: false,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 32,
    tags: ["standard", "chestnut", "brown", "body wave", "hd lace", "everyday"]
  },
  {
    name: "STANDARD | The Serena Midnight Body Wave Wig",
    category: "wigs",
    price: 175000,
    compareAtPrice: 210000,
    shortDescription: "Classic natural black long body wave frontal wig — effortless volume and natural movement for any occasion.",
    description: "The timeless go-to. Our Standard Serena is built on a 13x4 pre-plucked HD frontal with natural black hair in a beautiful, free-flowing body wave. Pre-bleached knots and a natural-density hairline make installation seamless. Suitable for all-day wear, heat styling, and colour treatments.",
    specifications: {
      hairType: "100% Virgin Human Hair",
      origin: "Southeast Asia",
      laceType: "13x4 Pre-Plucked HD Frontal",
      hairGrade: "12A Double Drawn",
      capSize: "Medium Adjustable Cap",
      longevity: "2 - 3 Years",
      texture: "Body Wave",
      colorName: "Natural Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Jet Black #1", hex: "#0A0A0A" }
      ]
    },
    images: [
      "/images/products/wig-black-model.jpg",
      "/images/products/wig-black-bust.jpg",
      "/images/products/wig-body-wave-2.jpg"
    ],
    variants: [
      { name: '20" / 180% Density / Natural Black', length: '20"', density: '180%', color: 'Natural Black #1B', texture: 'Body Wave', price: 175000, stock: 18 },
      { name: '24" / 200% Density / Natural Black', length: '24"', density: '200%', color: 'Natural Black #1B', texture: 'Body Wave', price: 210000, stock: 12 },
      { name: '28" / 200% Density / Natural Black', length: '28"', density: '200%', color: 'Natural Black #1B', texture: 'Body Wave', price: 240000, stock: 8 }
    ],
    inStock: true,
    stockQuantity: 38,
    isFeatured: false,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 45,
    tags: ["standard", "natural black", "body wave", "hd lace", "everyday", "classic"]
  },
  {
    name: "STANDARD | The Rosé Deep Wave Frontal Wig",
    category: "wigs",
    price: 220000,
    compareAtPrice: 265000,
    shortDescription: "Warm burgundy-rose deep wave frontal wig with voluminous spiral curls and 13x4 pre-plucked HD lace.",
    description: "A popular Standard Series bestseller. Rich rose-burgundy tones woven through deep spiral wave curls create a head-turning yet wearable everyday look. Built on a 13x4 pre-plucked HD frontal with comfortable medium-weight cap. The deep wave pattern is defined, frizz-resistant, and wash-and-go friendly.",
    specifications: {
      hairType: "100% Virgin Human Hair",
      origin: "Burmese Virgin",
      laceType: "13x4 Pre-Plucked HD Frontal",
      hairGrade: "12A Double Drawn",
      capSize: "Medium (22.5\") Adjustable",
      longevity: "2 - 3 Years",
      texture: "Deep Wave",
      colorName: "Rosé Burgundy Tinted",
      colorHex: "#7B2D4A",
      availableColors: [
        { name: "Rosé Burgundy Tinted", hex: "#7B2D4A" },
        { name: "Natural Black Deep Wave", hex: "#18181B" }
      ]
    },
    images: [
      "/images/products/wig-burgundy-model.jpg",
      "/images/products/wig-burgundy-bust.jpg",
      "/images/products/wig-deep-wave-1.jpg",
      "/images/products/wig-deep-wave-2.jpg"
    ],
    variants: [
      { name: '20" / 180% Density / Rosé Burgundy', length: '20"', density: '180%', color: 'Rosé Burgundy Tinted', texture: 'Deep Wave', price: 220000, stock: 12 },
      { name: '24" / 200% Density / Rosé Burgundy', length: '24"', density: '200%', color: 'Rosé Burgundy Tinted', texture: 'Deep Wave', price: 260000, stock: 8 },
      { name: '22" / 180% Density / Natural Black', length: '22"', density: '180%', color: 'Natural Black Deep Wave', texture: 'Deep Wave', price: 210000, stock: 10 }
    ],
    inStock: true,
    stockQuantity: 30,
    isFeatured: false,
    isBestseller: true,
    rating: 4.7,
    reviewsCount: 27,
    tags: ["standard", "rose", "burgundy", "deep wave", "hd lace", "curly"]
  },
  {
    name: "STANDARD | The Sahara Caramel Highlight Straight Wig",
    category: "wigs",
    price: 210000,
    compareAtPrice: 255000,
    shortDescription: "Lush dark brown base with warm caramel highlights — long silky straight frontal wig with effortless dimension.",
    description: "Sun-kissed dimension for everyday elegance. Our Standard Sahara features dark brown roots blended with scattered warm caramel highlights throughout, crafted on Grade 12A Vietnamese hair. The long silky straight texture lays flat and smooth with a healthy, natural sheen. A crowd favourite for its versatility across office, evening and casual wear.",
    specifications: {
      hairType: "100% Virgin Vietnamese Human Hair",
      origin: "Vietnam",
      laceType: "13x4 HD Swiss Frontal",
      hairGrade: "12A Double Drawn",
      capSize: "Medium Adjustable",
      longevity: "2 - 3 Years",
      texture: "Silky Straight",
      colorName: "Dark Brown with Caramel Highlights",
      colorHex: "#5C3317",
      availableColors: [
        { name: "Brown with Caramel Highlights", hex: "#5C3317" },
        { name: "Natural Black #1B", hex: "#18181B" }
      ]
    },
    images: [
      "/images/products/wig-brown-model.jpg",
      "/images/products/wig-brown-bust.jpg",
      "/images/products/wig-bone-straight-2.jpg"
    ],
    variants: [
      { name: '22" / 180% Density / Brown Caramel', length: '22"', density: '180%', color: 'Brown with Caramel Highlights', texture: 'Silky Straight', price: 210000, stock: 15 },
      { name: '26" / 200% Density / Brown Caramel', length: '26"', density: '200%', color: 'Brown with Caramel Highlights', texture: 'Silky Straight', price: 250000, stock: 10 }
    ],
    inStock: true,
    stockQuantity: 25,
    isFeatured: false,
    isBestseller: false,
    rating: 4.7,
    reviewsCount: 19,
    tags: ["standard", "caramel", "highlight", "brown", "silky straight", "hd lace"]
  },

  // --- WIGS: QUALITY TIER ---
  {
    name: "QUALITY | The Nova Natural Wave Glueless Wig",
    category: "wigs",
    price: 145000,
    compareAtPrice: 175000,
    shortDescription: "Beginner-friendly pre-cut glueless natural wave wig with 5x5 HD lace — install in under 60 seconds.",
    description: "Perfect for first-time wig wearers and busy lifestyles. The Nova Quality Series features a pre-cut 5x5 HD lace closure wig with a pre-installed elastic band and velvet grip. Zero glue, zero adhesive — just slip on and go. Natural black body wave that air-dries beautifully into soft, defined waves.",
    specifications: {
      hairType: "100% Virgin Human Hair",
      origin: "Southeast Asia",
      laceType: "5x5 Pre-Cut HD Glueless Closure",
      hairGrade: "11A Double Drawn",
      capSize: "Medium with Velvet Grip Band",
      longevity: "1.5 - 2 Years",
      texture: "Natural Wave",
      colorName: "Natural Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" }
      ]
    },
    images: [
      "/images/products/wig-body-wave-1.jpg",
      "/images/products/wig-body-wave-2.jpg",
      "/images/products/wig-bone-straight-1.jpg"
    ],
    variants: [
      { name: '18" / 150% Density / Natural Black', length: '18"', density: '150%', color: 'Natural Black #1B', texture: 'Natural Wave', price: 145000, stock: 25 },
      { name: '22" / 180% Density / Natural Black', length: '22"', density: '180%', color: 'Natural Black #1B', texture: 'Natural Wave', price: 175000, stock: 18 }
    ],
    inStock: true,
    stockQuantity: 43,
    isFeatured: false,
    isBestseller: true,
    rating: 4.7,
    reviewsCount: 51,
    tags: ["quality", "glueless", "natural wave", "beginner", "closure wig", "everyday"]
  },
  {
    name: "QUALITY | The Amber Deep Brown Kinky Straight Wig",
    category: "wigs",
    price: 135000,
    compareAtPrice: 165000,
    shortDescription: "Textured kinky straight wig in a rich dark brown for a natural, lived-in look — 13x4 frontal, quality grade.",
    description: "Designed to mimic the natural texture of relaxed African hair at its most natural state. The kinky straight pattern adds a realistic body and natural volume without appearing over-processed. Crafted from Grade 11A double-drawn hair on a 13x4 pre-plucked lace frontal. The deep brown tone is warm, universally flattering, and photograph beautifully.",
    specifications: {
      hairType: "100% Virgin Human Hair",
      origin: "Southeast Asia",
      laceType: "13x4 Pre-Plucked Lace Frontal",
      hairGrade: "11A Double Drawn",
      capSize: "Medium Adjustable Cap",
      longevity: "1.5 - 2 Years",
      texture: "Kinky Straight",
      colorName: "Deep Brown #4",
      colorHex: "#3D1C00",
      availableColors: [
        { name: "Deep Brown #4", hex: "#3D1C00" },
        { name: "Natural Black #1B", hex: "#18181B" }
      ]
    },
    images: [
      "/images/products/wig-brown-bust.jpg",
      "/images/products/wig-bone-straight-1.jpg",
      "/images/products/wig-bone-straight-2.jpg"
    ],
    variants: [
      { name: '18" / 150% Density / Deep Brown #4', length: '18"', density: '150%', color: 'Deep Brown #4', texture: 'Kinky Straight', price: 135000, stock: 22 },
      { name: '22" / 180% Density / Deep Brown #4', length: '22"', density: '180%', color: 'Deep Brown #4', texture: 'Kinky Straight', price: 165000, stock: 15 },
      { name: '18" / 150% Density / Natural Black', length: '18"', density: '150%', color: 'Natural Black #1B', texture: 'Kinky Straight', price: 135000, stock: 20 }
    ],
    inStock: true,
    stockQuantity: 57,
    isFeatured: false,
    isBestseller: false,
    rating: 4.6,
    reviewsCount: 38,
    tags: ["quality", "kinky straight", "brown", "natural", "frontal", "textured"]
  },
  {
    name: "QUALITY | The Tara Orange Ginger Bob Wig",
    category: "wigs",
    price: 125000,
    compareAtPrice: 150000,
    shortDescription: "Vibrant ginger orange short bob closure wig — bold, fun and effortlessly stylish for everyday confidence.",
    description: "Make a statement without breaking the bank. The Tara is a Quality Series gem — a vibrant ginger-orange blunt-cut bob on a 5x5 glueless closure cap. Pre-installed with a velvet grip band for fast, comfortable wear. The ginger orange shade is bold and photogenic, ideal for those wanting a bold pop of colour at an accessible price.",
    specifications: {
      hairType: "100% Virgin Human Hair",
      origin: "Southeast Asia",
      laceType: "5x5 HD Glueless Closure",
      hairGrade: "11A Double Drawn",
      capSize: "Medium with Grip Band",
      longevity: "1.5 - 2 Years",
      texture: "Straight Bob",
      colorName: "Ginger Orange",
      colorHex: "#C45000",
      availableColors: [
        { name: "Ginger Orange", hex: "#C45000" },
        { name: "Auburn Red #30", hex: "#8B3A00" }
      ]
    },
    images: [
      "/images/products/wig-orange-model.jpg",
      "/images/products/wig-orange-bust.jpg",
      "/images/products/wig-bob-1.jpg",
      "/images/products/wig-bob-2.jpg"
    ],
    variants: [
      { name: '10" / 150% Density / Ginger Orange', length: '10"', density: '150%', color: 'Ginger Orange', texture: 'Straight Bob', price: 125000, stock: 20 },
      { name: '12" / 180% Density / Ginger Orange', length: '12"', density: '180%', color: 'Ginger Orange', texture: 'Straight Bob', price: 145000, stock: 14 },
      { name: '10" / 150% Density / Auburn Red #30', length: '10"', density: '150%', color: 'Auburn Red #30', texture: 'Straight Bob', price: 125000, stock: 12 }
    ],
    inStock: true,
    stockQuantity: 46,
    isFeatured: false,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 29,
    tags: ["quality", "ginger", "orange", "bob", "closure", "glueless", "bold"]
  },
  {
    name: "QUALITY | The Ivy Blonde Straight Closure Wig",
    category: "wigs",
    price: 155000,
    compareAtPrice: 185000,
    shortDescription: "Radiant honey blonde straight closure wig with pre-bleached knots and natural-density hairline.",
    description: "Affordable blonde luxury — finally. The Ivy Quality Series offers a clean honey blonde straight unit on a 5x5 HD closure cap with pre-bleached knots and a naturally low-density hairline. Crafted from Grade 11A double-drawn hair that retains its blonde tone without brassiness. The long, straight silhouette is sleek, polished, and universally flattering.",
    specifications: {
      hairType: "100% Virgin Human Hair",
      origin: "Southeast Asia",
      laceType: "5x5 Pre-Cut HD Closure",
      hairGrade: "11A Double Drawn",
      capSize: "Medium Adjustable",
      longevity: "1.5 - 2 Years",
      texture: "Silky Straight",
      colorName: "Honey Blonde #27",
      colorHex: "#D4A017",
      availableColors: [
        { name: "Honey Blonde #27", hex: "#D4A017" },
        { name: "Light Blonde #613", hex: "#FACC15" }
      ]
    },
    images: [
      "/images/products/wig-blonde-model.jpg",
      "/images/products/wig-blonde-bust.jpg",
      "/images/products/wig-bone-straight-2.jpg"
    ],
    variants: [
      { name: '18" / 150% Density / Honey Blonde #27', length: '18"', density: '150%', color: 'Honey Blonde #27', texture: 'Silky Straight', price: 155000, stock: 18 },
      { name: '22" / 180% Density / Honey Blonde #27', length: '22"', density: '180%', color: 'Honey Blonde #27', texture: 'Silky Straight', price: 185000, stock: 12 },
      { name: '18" / 150% Density / Light Blonde #613', length: '18"', density: '150%', color: 'Light Blonde #613', texture: 'Silky Straight', price: 160000, stock: 10 }
    ],
    inStock: true,
    stockQuantity: 40,
    isFeatured: false,
    isBestseller: false,
    rating: 4.6,
    reviewsCount: 22,
    tags: ["quality", "blonde", "honey blonde", "closure", "straight", "everyday"]
  },

  // --- WIGS: FINE TIER ---
  {
    name: "FINE | The Zara Natural Wave Lace Closure Wig",
    category: "wigs",
    price: 89000,
    compareAtPrice: 110000,
    shortDescription: "Entry luxury natural wave closure wig — soft, full, and perfectly wearable for daily use.",
    description: "Luxury doesn't have to cost a fortune. The Zara Fine Series delivers a full, bouncy natural wave on a 4x4 HD lace closure, pre-plucked with a natural hairline at an accessible price point. Grade 10A double-drawn hair delivers surprising fullness and a clean, healthy appearance. Ideal for daily wear, protective styling, and beginners.",
    specifications: {
      hairType: "100% Human Hair",
      origin: "Southeast Asia",
      laceType: "4x4 HD Closure",
      hairGrade: "10A Double Drawn",
      capSize: "Medium Standard Cap",
      longevity: "1 - 1.5 Years",
      texture: "Natural Wave",
      colorName: "Natural Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" }
      ]
    },
    images: [
      "/images/products/wig-body-wave-1.jpg",
      "/images/products/wig-body-wave-2.jpg"
    ],
    variants: [
      { name: '16" / 130% Density / Natural Black', length: '16"', density: '130%', color: 'Natural Black #1B', texture: 'Natural Wave', price: 89000, stock: 30 },
      { name: '20" / 150% Density / Natural Black', length: '20"', density: '150%', color: 'Natural Black #1B', texture: 'Natural Wave', price: 110000, stock: 20 }
    ],
    inStock: true,
    stockQuantity: 50,
    isFeatured: false,
    isBestseller: true,
    rating: 4.5,
    reviewsCount: 68,
    tags: ["fine", "entry luxury", "natural wave", "closure", "beginner", "affordable"]
  },
  {
    name: "FINE | The Maya Straight Brown Closure Wig",
    category: "wigs",
    price: 82000,
    compareAtPrice: 100000,
    shortDescription: "Sleek brown silky straight 4x4 closure wig — clean, polished and great for everyday protective styling.",
    description: "Simple, clean, and dependable. The Maya Fine Series is our entry-level straight unit — a well-constructed 4x4 HD closure with Grade 10A straight brown hair. Pre-plucked for a natural hairline. Easy to style, wash, and maintain. A great starter unit or everyday protective option for those who want quality hair at a responsible price.",
    specifications: {
      hairType: "100% Human Hair",
      origin: "Southeast Asia",
      laceType: "4x4 HD Closure",
      hairGrade: "10A Double Drawn",
      capSize: "Medium Standard Cap",
      longevity: "1 - 1.5 Years",
      texture: "Silky Straight",
      colorName: "Medium Brown #4",
      colorHex: "#5C3317",
      availableColors: [
        { name: "Medium Brown #4", hex: "#5C3317" },
        { name: "Natural Black #1B", hex: "#18181B" }
      ]
    },
    images: [
      "/images/products/wig-brown-bust.jpg",
      "/images/products/wig-bone-straight-1.jpg",
      "/images/products/wig-bone-straight-2.jpg"
    ],
    variants: [
      { name: '16" / 130% Density / Medium Brown #4', length: '16"', density: '130%', color: 'Medium Brown #4', texture: 'Silky Straight', price: 82000, stock: 35 },
      { name: '20" / 150% Density / Medium Brown #4', length: '20"', density: '150%', color: 'Medium Brown #4', texture: 'Silky Straight', price: 100000, stock: 25 },
      { name: '16" / 130% Density / Natural Black', length: '16"', density: '130%', color: 'Natural Black #1B', texture: 'Silky Straight', price: 82000, stock: 30 }
    ],
    inStock: true,
    stockQuantity: 90,
    isFeatured: false,
    isBestseller: true,
    rating: 4.5,
    reviewsCount: 72,
    tags: ["fine", "affordable", "brown", "straight", "closure", "protective", "everyday"]
  },
  {
    name: "FINE | The Nina Bob Closure Wig",
    category: "wigs",
    price: 75000,
    compareAtPrice: 92000,
    shortDescription: "Short straight bob closure wig in natural black — clean, versatile and great for all face shapes.",
    description: "Our most affordable entry-point bob unit. The Nina Fine Series is a well-finished 4x4 HD closure wig cut into a classic short straight bob. Grade 10A natural black hair sits clean and full, with a pre-plucked hairline. Quick to install, easy to style, and incredibly lightweight — ideal for everyday wear and protective rotation.",
    specifications: {
      hairType: "100% Human Hair",
      origin: "Southeast Asia",
      laceType: "4x4 HD Closure",
      hairGrade: "10A Double Drawn",
      capSize: "Standard Medium Cap",
      longevity: "1 - 1.5 Years",
      texture: "Straight Bob",
      colorName: "Natural Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Jet Black #1", hex: "#0A0A0A" }
      ]
    },
    images: [
      "/images/products/wig-black-bust.jpg",
      "/images/products/wig-bob-1.jpg",
      "/images/products/wig-bob-2.jpg"
    ],
    variants: [
      { name: '10" / 130% Density / Natural Black', length: '10"', density: '130%', color: 'Natural Black #1B', texture: 'Straight Bob', price: 75000, stock: 40 },
      { name: '12" / 150% Density / Natural Black', length: '12"', density: '150%', color: 'Natural Black #1B', texture: 'Straight Bob', price: 92000, stock: 30 },
      { name: '10" / 130% Density / Jet Black #1', length: '10"', density: '130%', color: 'Jet Black #1', texture: 'Straight Bob', price: 75000, stock: 25 }
    ],
    inStock: true,
    stockQuantity: 95,
    isFeatured: false,
    isBestseller: true,
    rating: 4.5,
    reviewsCount: 88,
    tags: ["fine", "bob", "affordable", "natural black", "closure", "short", "everyday"]
  },
  {
    name: "FINE | The Layla Curly Closure Wig",
    category: "wigs",
    price: 85000,
    compareAtPrice: 105000,
    shortDescription: "Bouncy natural black deep wave closure wig — great curl definition and volume at an honest price.",
    description: "Curly, full, and fabulous on a budget. The Layla Fine Series features natural black deep wave human hair on a 4x4 HD closure. Grade 10A double-drawn hair delivers visible curl definition and a healthy body. Wash-and-go friendly — simply diffuse or air-dry for beautiful, defined curls. A reliable everyday companion for curl lovers.",
    specifications: {
      hairType: "100% Human Hair",
      origin: "Southeast Asia",
      laceType: "4x4 HD Closure",
      hairGrade: "10A Double Drawn",
      capSize: "Medium Standard Cap",
      longevity: "1 - 1.5 Years",
      texture: "Deep Wave",
      colorName: "Natural Black #1B",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" }
      ]
    },
    images: [
      "/images/products/wig-deep-wave-1.jpg",
      "/images/products/wig-deep-wave-2.jpg"
    ],
    variants: [
      { name: '16" / 130% Density / Natural Black', length: '16"', density: '130%', color: 'Natural Black #1B', texture: 'Deep Wave', price: 85000, stock: 35 },
      { name: '20" / 150% Density / Natural Black', length: '20"', density: '150%', color: 'Natural Black #1B', texture: 'Deep Wave', price: 105000, stock: 25 }
    ],
    inStock: true,
    stockQuantity: 60,
    isFeatured: false,
    isBestseller: false,
    rating: 4.4,
    reviewsCount: 55,
    tags: ["fine", "affordable", "deep wave", "curly", "closure", "natural black"]
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
      texture: "Natural Straight / Blowout",
      colorName: "Multi-Color Collection",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Emerald Jewel Green", hex: "#047857" },
        { name: "Honey Blonde #613", hex: "#FACC15" }
      ]
    },
    images: [
      "/images/products/attachment-clipin-emerald.jpg",
      "/images/products/attachment-clipin-blonde.jpg",
      "/images/products/attachment-tapein-natural.jpg",
      "/images/products/attachment-clipin-texture.jpg"
    ],
    variants: [
      { name: '20" / 160g / Natural Black #1B', length: '20"', density: '160g', color: 'Natural Black #1B', texture: 'Natural Straight', price: 95000, stock: 15 },
      { name: '24" / 200g / Emerald Green', length: '24"', density: '200g', color: 'Emerald Jewel Green', texture: 'Natural Straight', price: 140000, stock: 8 },
      { name: '24" / 200g / Honey Blonde #613', length: '24"', density: '200g', color: 'Honey Blonde #613', texture: 'Natural Straight', price: 140000, stock: 10 }
    ],
    inStock: true,
    stockQuantity: 33,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 42,
    tags: ["clip-ins", "seamless", "extensions", "colored", "natural straight"]
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
      texture: "Silky Straight",
      colorName: "Multi-Color Collection",
      colorHex: "#18181B",
      availableColors: [
        { name: "Natural Black #1B", hex: "#18181B" },
        { name: "Royal Sapphire Blue", hex: "#1D4ED8" }
      ]
    },
    images: [
      "/images/products/attachment-tapein-natural.jpg",
      "/images/products/attachment-tapein-sapphire.jpg",
      "/images/products/attachment-clipin-texture.jpg",
      "/images/products/attachment-clipin-1.jpg"
    ],
    variants: [
      { name: '22" / 100g (40 pcs) / Natural Black', length: '22"', density: '100g', color: 'Natural Black', texture: 'Straight', price: 140000, stock: 14 },
      { name: '26" / 120g (40 pcs) / Natural Black', length: '26"', density: '120g', color: 'Natural Black', texture: 'Straight', price: 175000, stock: 10 },
      { name: '22" / 100g (40 pcs) / Sapphire Blue', length: '22"', density: '100g', color: 'Royal Sapphire Blue', texture: 'Straight', price: 165000, stock: 8 }
    ],
    inStock: true,
    stockQuantity: 32,
    isFeatured: true,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 16,
    tags: ["tape-in", "semi-permanent", "extensions", "luxury", "blue hair"]
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
      "/images/products/attachment-ponytail-black.jpg",
      "/images/products/attachment-ponytail-platinum.jpg",
      "/images/products/attachment-ponytail-magenta.jpg",
      "/images/products/attachment-ponytail-lemon.jpg"
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
