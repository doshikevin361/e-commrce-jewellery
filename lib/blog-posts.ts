/**
 * Editorial blog posts for Jewel Manas — used on /blog and /blog/[id].
 * Each entry includes listing fields plus full article body for SEO and reading experience.
 */

export type BlogSection = {
  heading?: string;
  paragraphs: string[];
};

export type BlogPost = {
  id: number;
  img: string;
  category: string;
  date: string;
  title: string;
  /** Short excerpt for cards and meta description */
  desc: string;
  readTime: string;
  sections: BlogSection[];
};

export const blogCards: BlogPost[] = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
    category: 'Design',
    date: 'Apr 2, 2026',
    title: 'Match your mood with metal',
    desc: 'Discover how to pair precious metals with your daily mood, skin tone, and wardrobe—so every Jewel Manas piece feels made for you.',
    readTime: '6 min read',
    sections: [
      {
        heading: 'Why metal choice matters',
        paragraphs: [
          'Gold is never just gold. The alloy behind your jewellery—whether rich yellow, soft rose, or crisp white—changes how a piece catches light and how it sits against your skin. At Jewel Manas, we help customers move beyond trends and choose metals that feel personal and wearable every day.',
          'Yellow gold has long been the heart of Indian fine jewellery: warm, celebratory, and flattering on a wide range of skin tones. Rose gold adds a romantic, contemporary softness that pairs beautifully with both ethnic and minimal outfits. White gold (often rhodium-finished) gives a cool, refined look that works especially well with diamonds and office-friendly stacks.',
        ],
      },
      {
        heading: 'Skin undertone as a gentle guide',
        paragraphs: [
          'A simple way to decide is to notice whether silver-toned or gold-toned accessories have historically suited you. Warmer undertones often glow beside yellow and rose gold; cooler undertones may gravitate toward white gold or platinum-style finishes. There are no strict rules—the best metal is the one you reach for instinctively.',
          'If you love contrast, mixing metals in a single stack—think a thin yellow chain with a white-gold pendant—can look intentional and modern. The key is balance: one dominant metal and one accent so the ensemble feels curated, not cluttered.',
        ],
      },
      {
        heading: 'Mood and occasion',
        paragraphs: [
          'Quiet workdays might call for subtle pieces: small hoops, a slim chain, or a solitaire that does not compete with tailoring. Festive evenings are where heavier gold weight, temple-inspired motifs, or layered necklaces can shine without apology.',
          'Whatever your mood, start with comfort and proportion. Jewellery should move with you, not weigh you down. When you shop Jewel Manas, use metal as a language: warm metals for warmth, cool metals for crisp lines—and always choose what makes you feel most like yourself.',
        ],
      },
    ],
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&q=80',
    category: 'Stories',
    date: 'Mar 28, 2026',
    title: 'Behind the scenes at Jewel Manas',
    desc: 'From sketch to showcase: how our teams balance tradition, quality checks, and modern design for every collection.',
    readTime: '7 min read',
    sections: [
      {
        heading: 'Where ideas begin',
        paragraphs: [
          'Every Jewel Manas collection starts as a conversation—between designers, master craftspeople, and the practical realities of how jewellery is worn in real homes and real celebrations. We sketch motifs inspired by heritage, but we edit them for today’s lighter weights, ergonomic clasps, and versatile layering.',
          'We are careful about proportion: a necklace should sit cleanly on the collarbone, a bangle should turn without catching, an earring should balance all day. Those details are not glamorous in a brochure, but they define whether a piece becomes a favourite or stays in the box.',
        ],
      },
      {
        heading: 'Craft and quality control',
        paragraphs: [
          'Before any design is scaled, samples are reviewed for stone setting security, polish consistency, and clasp strength. Our quality checkpoints mirror what you would look for at home—only under brighter lights and with calipers. We reject ambiguity: if a prong looks marginal, it is reset.',
          'Artisans we work with combine hand finishing with calibrated tools so that matching sets (earrings and pendant, for example) feel like siblings, not cousins. That discipline is how we protect both beauty and durability.',
        ],
      },
      {
        heading: 'Made for you',
        paragraphs: [
          'Jewellery is emotional purchase. Whether you are marking a promotion, a wedding, or a quiet personal milestone, we want the story behind the metal to feel honest. Our team is trained to explain purity, certification, and care in plain language—so confidence in your choice lasts as long as the piece itself.',
          'When you wear Jewel Manas, you are wearing that chain of decisions: design, craft, inspection, and care. That is the story we are proudest to tell.',
        ],
      },
    ],
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1600&q=80',
    category: 'Craft',
    date: 'Mar 15, 2026',
    title: 'How metals are finished at Jewel Manas',
    desc: 'A clear look at alloys, polishing, rhodium plating, and hallmarks—so you know what you are buying.',
    readTime: '8 min read',
    sections: [
      {
        heading: 'Understanding gold alloys',
        paragraphs: [
          'Pure gold (24 karat) is soft and deep yellow. For wearable jewellery, it is alloyed with metals like copper and silver to improve strength and to create colour variations—hence 22K, 18K, and 14K, each with its own balance of purity and durability.',
          'At Jewel Manas, we are transparent about karatage and weight. When you compare two pieces, look beyond the tag: check thickness of bands, security of links, and finish. A lower karat piece with excellent construction can outlast a softer high-karat piece that is too thin for daily wear.',
        ],
      },
      {
        heading: 'Polish and rhodium',
        paragraphs: [
          'Polishing is the final sculpting step. A high polish maximizes reflectivity; a satin or brushed finish softens glare and hides micro-scratches from everyday life. White gold is often rhodium-plated for a bright white sheen; over years, that plate can wear and reveal a slightly warmer tone underneath—replating is a normal part of maintenance.',
          'We recommend professional polish for heavy scratches; at home, storage and gentle cleaning do more than aggressive rubbing.',
        ],
      },
      {
        heading: 'Hallmarks and trust',
        paragraphs: [
          'In India, BIS hallmarking confirms the purity of gold jewellery. Always look for the hallmark alongside the Jewel Manas invoice and certificate where applicable. That combination is your assurance that what you paid for is what you hold.',
          'If you ever have a question about a finish or a stamp, our support team can walk you through it. Education is part of the product.',
        ],
      },
    ],
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1600&q=80',
    category: 'Trends',
    date: 'Apr 8, 2026',
    title: 'Timeless pieces for modern elegance',
    desc: 'Classic silhouettes are back—reimagined for lighter weights, stacking, and everyday confidence.',
    readTime: '6 min read',
    sections: [
      {
        heading: 'The new classic',
        paragraphs: [
          '“Timeless” does not mean boring. It means forms that survived decades of fashion because they flatter the face and the hand: solitaire studs, tennis-line bracelets, signet-inspired rings, and clean pendant drops. Jewel Manas focuses on these anchors so your wardrobe has a spine of pieces you can repeat without thinking.',
          'The modern twist is scale and layering. Instead of one heavy set, many customers now invest in three thin bangles that chime together, or two complementary chains at different lengths. Flexibility is the luxury.',
        ],
      },
      {
        heading: 'Pearls and diamonds together',
        paragraphs: [
          'Pearls have returned in force—not only in traditional strings but as baroque drops and mixed with diamond accents for evening. The contrast of organic pearl surface with precise diamond flash feels fresh on sarees and blazers alike.',
          'If you are building a capsule jewellery box, prioritize one strong earring, one versatile necklace, and one ring or bracelet stack you can split or combine. That trio covers most of life’s calendar.',
        ],
      },
      {
        heading: 'Buy fewer, wear more',
        paragraphs: [
          'Trends will keep moving, but proportion, metal quality, and comfort do not go out of date. When in doubt, choose the piece you will actually wear on a Tuesday—not only the one reserved for the camera.',
          'Jewel Manas collections are edited with that Tuesday-to-wedding range in mind—so elegance is never locked away waiting for “the right day.”',
        ],
      },
    ],
  },
  {
    id: 5,
    img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1600&q=80',
    category: 'Guide',
    date: 'Mar 22, 2026',
    title: 'Caring for your precious gems and gold',
    desc: 'Practical steps to protect shine, settings, and stones—plus when to visit your jeweller for a professional check.',
    readTime: '7 min read',
    sections: [
      {
        heading: 'Daily habits that help',
        paragraphs: [
          'Put jewellery on after perfume, lotion, and hairspray—these products can build up behind stones and dull metal over time. For rings, remove them during gym work, swimming in chlorinated pools, or heavy cleaning with harsh chemicals.',
          'Soft fabric pouches or lined compartments prevent chains from tangling and reduce scratches. Keeping pieces dry before storage avoids tarnish on certain alloys and protects thread-based pearl knots.',
        ],
      },
      {
        heading: 'Cleaning at home',
        paragraphs: [
          'For most gold without porous gems, a short soak in lukewarm water with a drop of mild dish soap, followed by a soft-bristle baby brush, can lift everyday grime. Rinse well, pat dry with a lint-free cloth, and air-dry before storing.',
          'Pearls, emeralds, opals, and many treated stones need gentler care—often just a damp cloth on the metal parts and a specialist clean for the stones. When unsure, ask us before experimenting.',
        ],
      },
      {
        heading: 'When to see a professional',
        paragraphs: [
          'If a prong looks lifted, a stone wiggles, or a clasp no longer clicks securely, stop wearing the piece and book a service visit. Early tightening is inexpensive; lost stones are not.',
          'Jewel Manas recommends an annual check for frequently worn rings and bracelets—think of it like a dental visit for your jewellery: small adjustments prevent big problems.',
        ],
      },
      {
        paragraphs: [
          'Fine jewellery is made to last generations if treated with respect. A few mindful habits—plus expert help when needed—keep every piece as meaningful as the day you chose it.',
        ],
      },
    ],
  },
];
