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
