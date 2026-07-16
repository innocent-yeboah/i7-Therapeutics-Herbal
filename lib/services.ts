export type ServiceIconType =
  | "massage"
  | "cupping"
  | "sports-injury"
  | "stroke-recovery"
  | "lymphatic"
  | "meridian"
  | "nmt"
  | "herbal-oil";

export type HealingService = {
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  indications?: string[];
  subtypes?: { name: string; indications: string[] }[];
  icon: ServiceIconType;
  category: "Traditional Healing Therapies";
  image: string;
  durationMinutes: number;
  priceGhs: number;
  bookable: boolean;
  metaTitle: string;
  metaDescription: string;
};

export type ComingSoonOffering = {
  slug: string;
  name: string;
  description: string;
  icon: "tea" | "oil" | "meditation" | "self-healing";
  image: string;
};

export const SERVICE_CATEGORY = "Traditional Healing Therapies" as const;

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

export const HEALING_SERVICES: HealingService[] = [
  {
    slug: "hand-foot-massage",
    name: "Hand and Foot Massage",
    shortDescription:
      "Stimulates blood flow, balances the nervous system, and promotes deep relaxation through focused hand and foot work.",
    fullDescription:
      "Our hand and foot massage uses targeted pressure and flowing strokes on the extremities — where tension often accumulates and where reflex points connect to the whole body. This therapy is ideal for anyone who stands long hours, types frequently, or simply needs a grounding reset.",
    benefits: [
      "Stimulates blood flow",
      "Balances the nervous system",
      "Relieves muscle tension",
      "Promotes deep relaxation",
    ],
    icon: "massage",
    category: SERVICE_CATEGORY,
    image: unsplash("photo-1600334129128-685c5582fd35"),
    durationMinutes: 45,
    priceGhs: 120,
    bookable: true,
    metaTitle: "Hand and Foot Massage | i7 Therapeutics Herbal",
    metaDescription:
      "Hand and foot massage in Accra — stimulates circulation, relieves tension, and promotes deep relaxation. Book your session at i7 Therapeutics Herbal.",
  },
  {
    slug: "head-neck-shoulder-massage",
    name: "Head, Neck & Shoulder Massage",
    shortDescription:
      "Relieves physical and mental stress, eases tension headaches, and improves scalp health and sleep quality.",
    fullDescription:
      "Focused work on the head, neck, and shoulders releases the weight many of us carry from daily stress. Gentle yet purposeful techniques ease tight muscles, calm the mind, and support better rest — leaving you lighter and more at ease.",
    benefits: [
      "Relieves physical and mental stress",
      "Reduces anxiety and tension headaches",
      "Improves scalp and hair health",
      "Improves blood flow",
      "Promotes sleep quality",
    ],
    icon: "massage",
    category: SERVICE_CATEGORY,
    image: unsplash("photo-1544161515-4ab6ce6db874"),
    durationMinutes: 45,
    priceGhs: 130,
    bookable: true,
    metaTitle: "Head, Neck & Shoulder Massage | i7 Therapeutics Herbal",
    metaDescription:
      "Relieve stress, tension headaches, and neck stiffness with a focused head, neck, and shoulder massage in Accra. Book at i7 Therapeutics Herbal.",
  },
  {
    slug: "spine-back-massage",
    name: "Spine and Back Massage",
    shortDescription:
      "Relaxes deep muscle tension, improves posture, and enhances mobility and flexibility along the spine.",
    fullDescription:
      "The spine is the body's central support — and often where stress settles deepest. Our spine and back massage targets the muscles along the vertebral column with techniques that release chronic holding patterns, restore alignment awareness, and help you move with greater ease.",
    benefits: [
      "Relaxes deep muscle tension",
      "Improves posture",
      "Enhances mobility and flexibility",
      "Reduces stress and anxiety",
    ],
    icon: "massage",
    category: SERVICE_CATEGORY,
    image: unsplash("photo-1519823551278-64ac92734fb1"),
    durationMinutes: 60,
    priceGhs: 180,
    bookable: true,
    metaTitle: "Spine and Back Massage | i7 Therapeutics Herbal",
    metaDescription:
      "Spine and back massage in Accra — release deep tension, improve posture, and restore mobility. Book your session at i7 Therapeutics Herbal.",
  },
  {
    slug: "cupping-therapy",
    name: "Cupping Therapy",
    shortDescription:
      "Ancient suction therapy for pain relief, muscle stiffness, and whole-body recovery — available as dry or wet cupping.",
    fullDescription:
      "Cupping therapy uses carefully placed cups to create gentle suction on the skin, drawing blood flow to targeted areas and releasing fascial restrictions. We offer both dry cupping for musculoskeletal concerns and wet cupping (hijama) for deeper systemic support, always tailored to your health profile.",
    benefits: [
      "Relieves muscle stiffness and pain",
      "Supports sports and injury recovery",
      "Reduces tension headaches",
      "Promotes circulation and detoxification",
    ],
    subtypes: [
      {
        name: "Dry Cupping",
        indications: [
          "Neck, back, shoulder and knee pain",
          "Muscle stiffness",
          "Tension headaches",
          "Sports and injury management",
        ],
      },
      {
        name: "Wet Cupping",
        indications: [
          "Skin conditions",
          "Blood disorders",
          "Hypertension and high cholesterol",
          "Fibromyalgia and arthritis",
          "Fertility issues",
          "Digestive issues",
          "Immunity support",
        ],
      },
    ],
    icon: "cupping",
    category: SERVICE_CATEGORY,
    image: unsplash("photo-1544367567-0f2fcb009e0b"),
    durationMinutes: 60,
    priceGhs: 200,
    bookable: true,
    metaTitle: "Cupping Therapy (Dry & Wet) | i7 Therapeutics Herbal",
    metaDescription:
      "Dry and wet cupping therapy in Accra for pain, stiffness, sports recovery, and holistic wellness. Book at i7 Therapeutics Herbal.",
  },
  {
    slug: "sports-injury-management",
    name: "Sports Injury Management",
    shortDescription:
      "Targeted soft-tissue therapy to treat, rehabilitate, and prevent sports injuries while restoring mobility.",
    fullDescription:
      "Sports injury management at i7 Therapeutics is a targeted therapy designed to treat, rehabilitate, and prevent injuries by manipulating soft tissues. Integrated into physical therapy principles, it accelerates healing, restores mobility, and corrects muscular imbalances — whether you are returning from an acute injury or managing chronic strain.",
    benefits: [
      "Accelerates healing of soft-tissue injuries",
      "Restores mobility and range of motion",
      "Corrects muscular imbalances",
      "Supports injury prevention",
      "Integrated rehabilitation approach",
    ],
    icon: "sports-injury",
    category: SERVICE_CATEGORY,
    image: unsplash("photo-1571019614242-c5c5dee9f50b"),
    durationMinutes: 60,
    priceGhs: 220,
    bookable: true,
    metaTitle: "Sports Injury Management | i7 Therapeutics Herbal",
    metaDescription:
      "Sports injury rehabilitation and soft-tissue therapy in Accra. Restore mobility and prevent re-injury at i7 Therapeutics Herbal.",
  },
  {
    slug: "stroke-recovery-management",
    name: "Stroke Recovery Management",
    shortDescription:
      "Complementary therapy to improve motor function, reduce spasticity, and boost circulation alongside medical care.",
    fullDescription:
      "Stroke recovery management is a complementary approach that improves motor function, reduces spasticity, relieves pain, and boosts circulation. Our therapists work gently and consistently to support your rehabilitation journey. This therapy should always be used alongside standard medical care and physiotherapy — never as a replacement.",
    benefits: [
      "Improves motor function",
      "Reduces spasticity",
      "Relieves pain",
      "Boosts circulation",
      "Supports overall rehabilitation",
    ],
    icon: "stroke-recovery",
    category: SERVICE_CATEGORY,
    image: unsplash("photo-1576091160399-112ba8d25d1d"),
    durationMinutes: 60,
    priceGhs: 200,
    bookable: true,
    metaTitle: "Stroke Recovery Management | i7 Therapeutics Herbal",
    metaDescription:
      "Complementary stroke recovery therapy in Accra — motor function, spasticity relief, and circulation support alongside medical care.",
  },
  {
    slug: "lymphatic-drainage-massage",
    name: "Lymphatic Drainage Massage",
    shortDescription:
      "Gentle rhythmic strokes to stimulate lymph flow, reduce fluid retention, and support immune function.",
    fullDescription:
      "Lymphatic drainage massage uses gentle, rhythmic strokes to stimulate lymph flow, reduce fluid retention, and support the immune system. It is commonly used to treat swelling (lymphedema), aid in post-surgical recovery, and alleviate inflammation — offering a deeply calming experience that supports the body's natural detoxification pathways.",
    benefits: [
      "Stimulates lymph flow",
      "Reduces fluid retention and swelling",
      "Supports the immune system",
      "Aids post-surgical recovery",
      "Alleviates inflammation",
    ],
    icon: "lymphatic",
    category: SERVICE_CATEGORY,
    image: "/services/lymphatic-drainage-massage.jpg",
    durationMinutes: 60,
    priceGhs: 190,
    bookable: true,
    metaTitle: "Lymphatic Drainage Massage | i7 Therapeutics Herbal",
    metaDescription:
      "Lymphatic drainage massage in Accra — reduce swelling, support immunity, and aid recovery. Book at i7 Therapeutics Herbal.",
  },
  {
    slug: "meridian-massage",
    name: "Meridian Massage",
    shortDescription:
      "Holistic bodywork addressing physical, mental, and emotional balance through qi flow restoration.",
    fullDescription:
      "Meridian massage considers the body as an interconnected system — taking into account physical, mental, and emotional aspects of wellbeing. Our therapists focus on identifying imbalances in qi flow and selecting proper techniques to address your individual needs, creating a session that feels both restorative and deeply personal.",
    benefits: [
      "Restores energetic balance",
      "Addresses physical and emotional tension",
      "Supports digestive health",
      "Reduces anxiety and mental stress",
      "Strengthens overall vitality",
    ],
    indications: [
      "Digestive issues",
      "Emotional imbalance",
      "Anxiety disorder",
      "Mental and physical stress",
      "General body weakness",
    ],
    icon: "meridian",
    category: SERVICE_CATEGORY,
    image: unsplash("photo-1505751172876-fa1923c5c528"),
    durationMinutes: 75,
    priceGhs: 210,
    bookable: true,
    metaTitle: "Meridian Massage | i7 Therapeutics Herbal",
    metaDescription:
      "Meridian massage in Accra — holistic bodywork for qi balance, stress relief, and emotional wellbeing. Book at i7 Therapeutics Herbal.",
  },
  {
    slug: "advanced-deep-tissue-nmt",
    name: "Advanced Deep Tissue / Neuromuscular Therapy (NMT)",
    shortDescription:
      "Specialized technique releasing chronic muscle tension, trigger points, and fascial restrictions.",
    fullDescription:
      "Advanced Deep Tissue and Neuromuscular Therapy (NMT) is a specialized technique focused on releasing chronic muscle tension, targeting specific trigger points, and manipulating connective tissues (fascia) beneath the muscles. Ideal for persistent pain patterns, postural issues, and athletes who need precise, results-oriented bodywork.",
    benefits: [
      "Releases chronic muscle tension",
      "Deactivates trigger points",
      "Manipulates fascial restrictions",
      "Improves range of motion",
      "Addresses persistent pain patterns",
    ],
    icon: "nmt",
    category: SERVICE_CATEGORY,
    image: "/services/advanced-deep-tissue-nmt.jpg",
    durationMinutes: 75,
    priceGhs: 240,
    bookable: true,
    metaTitle: "Deep Tissue & Neuromuscular Therapy | i7 Therapeutics Herbal",
    metaDescription:
      "Advanced deep tissue and NMT in Accra — release chronic tension, trigger points, and fascial restrictions. Book at i7 Therapeutics Herbal.",
  },
  {
    slug: "herbal-oil-relaxation-massage",
    name: "Herbal Oil Relaxation Massage",
    shortDescription:
      "Aromatherapy-infused massage with gentle flowing strokes to calm the nervous system and ease muscle tension.",
    fullDescription:
      "Herbal oil relaxation massage combines therapeutic touch with aromatherapy to reduce stress, ease muscle tension, and improve sleep. Using gentle, rhythmic, and flowing strokes with our botanical oil blends, this session deeply calms the nervous system, lowers stress hormones like cortisol, and eases muscle tension without intense pressure — perfect for those seeking pure restoration.",
    benefits: [
      "Reduces stress and cortisol levels",
      "Eases muscle tension gently",
      "Improves sleep quality",
      "Combines aromatherapy benefits",
      "Deeply calms the nervous system",
    ],
    icon: "herbal-oil",
    category: SERVICE_CATEGORY,
    image: unsplash("photo-1608571423902-eed4a5ad8108"),
    durationMinutes: 60,
    priceGhs: 170,
    bookable: true,
    metaTitle: "Herbal Oil Relaxation Massage | i7 Therapeutics Herbal",
    metaDescription:
      "Herbal oil relaxation massage with aromatherapy in Accra — calm your nervous system and ease tension. Book at i7 Therapeutics Herbal.",
  },
];

export const COMING_SOON_OFFERINGS: ComingSoonOffering[] = [
  {
    slug: "herbal-teas",
    name: "Herbal Teas",
    description:
      "Curated loose-leaf botanical blends for daily wellness, calm, and restorative support — crafted with the same care as our in-clinic therapies.",
    icon: "tea",
    image: unsplash("photo-1564890369478-c89ca6d9cde9"),
  },
  {
    slug: "herbal-oils",
    name: "Herbal Oils",
    description:
      "Therapeutic-grade botanical oil blends for skin, muscle recovery, and aromatherapy — extending your healing journey beyond the treatment room.",
    icon: "oil",
    image: unsplash("photo-1608571423902-eed4a5ad8108"),
  },
  {
    slug: "meditation-practice",
    name: "Meditation Practice",
    description:
      "Guided meditation sessions to cultivate inner stillness, nervous system balance, and mindful awareness — individually or in small groups.",
    icon: "meditation",
    image: unsplash("photo-1506126613408-eca07ce68773"),
  },
  {
    slug: "self-healing",
    name: "Self Healing",
    description:
      "Empowering workshops and guided practices that teach you sustainable self-care techniques, breathwork, and herbal knowledge for daily life.",
    icon: "self-healing",
    image: unsplash("photo-1545205597-3d9d02c29597"),
  },
];

export function getServiceBySlug(slug: string): HealingService | undefined {
  return HEALING_SERVICES.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return HEALING_SERVICES.map((s) => s.slug);
}

export function getServiceBookingHref(_slug?: string, _supabaseId?: string | null): string {
  return "/consultation";
}

export function getServiceInquireHref(serviceName: string): string {
  const message = encodeURIComponent(
    `Hello, I would like to inquire about ${serviceName}. Please share availability and pricing.`
  );
  return `https://wa.me/233552473681?text=${message}`;
}
