import type { Product } from "./products"

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "syra-ring-01",
    name: "Classic Aurelia Band",
    kind: "Ring",
    caption: "The essence of minimalist luxury.",
    price: 12000,
    metals: ["18k Gold", "White Gold"],
    stones: ["Diamond"],
    sizes: ["6", "7", "8"],
    tag: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1603561591411-0e7320b97d17?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1602751584412-7013a11a5b5a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1603912627214-1213fe5144e0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "A timeless 18k gold band featuring a single hand-set diamond. Engineered with PVD anti-tarnish technology for daily wear.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  },
  {
    id: "syra-necklace-01",
    name: "Luna Pearl Drop",
    kind: "Necklace",
    caption: "A whisper of elegance.",
    price: 18500,
    metals: ["18k Gold"],
    stones: ["Pearl"],
    sizes: [],
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611085583191-a3b1a20a7931?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611935839934-22df674699f0?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "Ethically sourced pearls suspended from a delicate anti-tarnish gold chain. Waterproof and sweat-proof.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  },
  {
    id: "syra-nose-01",
    name: "Minimalist Nose Stud",
    kind: "Nose ring",
    caption: "Subtle. Sophisticated.",
    price: 4500,
    metals: ["Sterling", "18k Gold"],
    stones: ["Diamond"],
    sizes: [],
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1629224316170-f612b5999330?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "A surgical-grade nose stud designed for comfort and longevity. Hypoallergenic and anti-tarnish.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  },
  {
    id: "syra-bracelet-01",
    name: "Solstice Cuff",
    kind: "Bracelet",
    caption: "Heirloom in the making.",
    price: 24000,
    metals: ["18k Gold", "Rose Gold"],
    stones: ["None"],
    sizes: [],
    tag: "ONE OF ONE",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611085797613-fc3734ed8a6a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611591437243-7f283a042973?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611935839934-22df674699f0?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "Hand-finished 18k rose gold cuff. Sleek, minimal, and engineered for a lifetime of brilliance.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  },
  {
    id: "syra-earring-01",
    name: "Astra Diamond Studs",
    kind: "Earrings",
    caption: "Celestial brilliance.",
    price: 9500,
    metals: ["White Gold", "Sterling"],
    stones: ["Diamond"],
    sizes: [],
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1590548784585-643d2b9f2915?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1630019058353-5246f760300f?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "Brilliant-cut diamonds set in a minimal four-prong white gold mount. Perfect for everyday luxury.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  },
  {
    id: "syra-ring-02",
    name: "Onyx Sovereign Ring",
    kind: "Ring",
    caption: "Bold. Timeless.",
    price: 15000,
    metals: ["18k Gold"],
    stones: ["Onyx"],
    sizes: ["7", "8", "9", "10"],
    tag: "ONE OF ONE",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1603561591411-0e7320b97d17?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1602751584412-7013a11a5b5a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1603912627214-1213fe5144e0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "A statement signet ring featuring a polished black onyx stone set in heavy 18k gold plating.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  },
  {
    id: "syra-necklace-02",
    name: "Emerald Vine Choker",
    kind: "Necklace",
    caption: "Nature, refined.",
    price: 32000,
    metals: ["18k Gold"],
    stones: ["Emerald"],
    sizes: [],
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611085583191-a3b1a20a7931?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611935839934-22df674699f0?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "Interlocking gold vines set with brilliant-cut emeralds. A centerpiece for any formal evening.",
    rental: { enabled: true, daily_rate: 1500, security_deposit: 5000, durations: [3, 7] }
  },
  {
    id: "syra-bracelet-02",
    name: "Infinite Link Bracelet",
    kind: "Bracelet",
    caption: "Fluidity in gold.",
    price: 11000,
    metals: ["18k Gold", "Sterling"],
    stones: ["None"],
    sizes: [],
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611085797613-fc3734ed8a6a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611591437243-7f283a042973?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611935839934-22df674699f0?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "Intertwined gold links that move gracefully with the wrist. Fully anti-tarnish and waterproof.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  },
  {
    id: "syra-nose-02",
    name: "Golden Petal Hoop",
    kind: "Nose ring",
    caption: "Delicate. Daring.",
    price: 3800,
    metals: ["18k Gold", "Rose Gold"],
    stones: ["None"],
    sizes: [],
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1629224316170-f612b5999330?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "A ultra-fine gold hoop with a textured petal finish. Designed for comfortable, all-day wear.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  },
  {
    id: "syra-necklace-03",
    name: "Solitaire Float",
    kind: "Necklace",
    caption: "Weightless radiance.",
    price: 14500,
    metals: ["White Gold", "18k Gold"],
    stones: ["Diamond"],
    sizes: [],
    tag: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611085583191-a3b1a20a7931?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611935839934-22df674699f0?auto=format&fit=crop&q=80&w=800"
    ],
    desc: "A single, brilliant-cut diamond that appears to float on the neck. Suspended from an invisible-link chain.",
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] }
  }
]
