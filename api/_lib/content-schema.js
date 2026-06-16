export const collections = {
  works: {
    label: "Portfolio reels",
    sheetName: "Works",
    columns: ["id", "title", "category", "views", "url", "image", "alt", "active", "sort"],
  },
  services: {
    label: "Services",
    sheetName: "Services",
    columns: ["id", "title", "description", "icon", "active", "sort"],
  },
  pricing: {
    label: "Pricing",
    sheetName: "Pricing",
    columns: ["id", "title", "duration", "price", "featured", "active", "sort"],
  },
};

export const fallbackContent = {
  works: [
    {
      id: "work-shiva",
      title: "Shiva, Reimagined",
      category: "mythology",
      views: "785K views",
      url: "https://www.instagram.com/kathavishesham/reel/DZdBaEfyYDN/",
      image: "/assets/reel-shiva-785k.png",
      alt: "Shiva cinematic Instagram reel preview",
      active: true,
      sort: 10,
    },
    {
      id: "work-jesus",
      title: "Sacred Heart Visual",
      category: "devotional",
      views: "789K views",
      url: "https://www.instagram.com/kathavishesham/reel/DZelLDWSuIa/",
      image: "/assets/reel-jesus-789k.png",
      alt: "Jesus devotional Instagram reel preview",
      active: true,
      sort: 20,
    },
    {
      id: "work-sage",
      title: "Ancient Wisdom",
      category: "wisdom",
      views: "676K views",
      url: "https://www.instagram.com/kathavishesham/reel/DZNIoVtS5-Q/",
      image: "/assets/reel-sage-676k.png",
      alt: "Classical sage Instagram reel preview",
      active: true,
      sort: 30,
    },
    {
      id: "work-chanakya",
      title: "Chanakya Lens",
      category: "wisdom",
      views: "415K views",
      url: "https://www.instagram.com/kathavishesham/reel/DZK4yj3ypRE/",
      image: "/assets/reel-chanakya-415k.png",
      alt: "Chanakya portrait Instagram reel preview",
      active: true,
      sort: 40,
    },
    {
      id: "work-character",
      title: "Character Story",
      category: "character",
      views: "531K views",
      url: "https://www.instagram.com/kathavishesham/reel/DYlkoZhSC2K/",
      image: "/assets/reel-wisdom-531k.png",
      alt: "Malayalam character story Instagram reel preview",
      active: true,
      sort: 50,
    },
    {
      id: "work-buddha",
      title: "Buddha Calm",
      category: "devotional",
      views: "194K views",
      url: "https://www.instagram.com/kathavishesham/reel/DZSfiJCy0t0/",
      image: "/assets/reel-buddha-194k.png",
      alt: "Buddha devotional Instagram reel preview",
      active: true,
      sort: 60,
    },
  ],
  services: [
    {
      id: "service-birthday",
      title: "Birthday & Memory Videos",
      description: "Emotions, beautifully remembered.",
      icon: "film",
      active: true,
      sort: 10,
    },
    {
      id: "service-ai-video",
      title: "AI Video Production",
      description: "High-quality AI videos with cinematic touch.",
      icon: "clapper",
      active: true,
      sort: 20,
    },
    {
      id: "service-concept",
      title: "Concept-Driven Visual Stories",
      description: "Ideas that inspire. Stories that connect.",
      icon: "pen",
      active: true,
      sort: 30,
    },
    {
      id: "service-mythology",
      title: "Mythological & Fantasy Content",
      description: "Timeless tales. Visually epic.",
      icon: "trident",
      active: true,
      sort: 40,
    },
    {
      id: "service-wedding",
      title: "Wedding Creatives",
      description: "Save the date, invites & highlights.",
      icon: "rings",
      active: true,
      sort: 50,
    },
    {
      id: "service-theatre",
      title: "Theatre Ads / Brand Films",
      description: "Bold visuals that demand attention.",
      icon: "megaphone",
      active: true,
      sort: 60,
    },
    {
      id: "service-logo",
      title: "Logo Design / Branding",
      description: "Identity with lasting impact.",
      icon: "gem",
      active: true,
      sort: 70,
    },
  ],
  pricing: [
    {
      id: "price-festival",
      title: "Festival Wishes",
      duration: "Below 30 sec",
      price: "₹3000",
      featured: false,
      active: true,
      sort: 10,
    },
    {
      id: "price-30-no-voice",
      title: "AI Video without voice-over",
      duration: "Below 30 sec",
      price: "₹4000",
      featured: false,
      active: true,
      sort: 20,
    },
    {
      id: "price-30-voice",
      title: "AI Video with voice-over",
      duration: "Below 30 sec",
      price: "₹5000",
      featured: false,
      active: true,
      sort: 30,
    },
    {
      id: "price-1-no-voice",
      title: "AI Video without voice-over",
      duration: "Below 1 min",
      price: "₹7500",
      featured: false,
      active: true,
      sort: 40,
    },
    {
      id: "price-1-voice",
      title: "AI Video with voice-over",
      duration: "Below 1 min",
      price: "₹10000",
      featured: false,
      active: true,
      sort: 50,
    },
    {
      id: "price-2-no-voice",
      title: "AI Video without voice-over",
      duration: "2 min",
      price: "₹15000",
      featured: false,
      active: true,
      sort: 60,
    },
    {
      id: "price-2-voice",
      title: "AI Video with voice-over",
      duration: "2 min",
      price: "₹22000",
      featured: true,
      active: true,
      sort: 70,
    },
  ],
};

export const collectionKeys = Object.keys(collections);

export const isTruthy = (value) => {
  if (typeof value === "boolean") return value;
  return ["true", "yes", "1", "active", "featured"].includes(String(value).trim().toLowerCase());
};

export const sortItems = (items) =>
  [...items].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0) || String(a.title).localeCompare(String(b.title)));

export const activeItems = (items) => sortItems(items.filter((item) => isTruthy(item.active)));

export const normalizeContent = (content) =>
  collectionKeys.reduce((normalized, key) => {
    normalized[key] = activeItems(Array.isArray(content?.[key]) ? content[key] : []);
    return normalized;
  }, {});

export const rowToItem = (row, columns) =>
  columns.reduce((item, column, index) => {
    const raw = row[index] ?? "";
    if (["active", "featured"].includes(column)) {
      item[column] = raw === "" ? false : isTruthy(raw);
    } else if (column === "sort") {
      item[column] = Number(raw || 0);
    } else {
      item[column] = String(raw);
    }
    return item;
  }, {});

export const itemToRow = (item, columns) =>
  columns.map((column) => {
    if (["active", "featured"].includes(column)) return isTruthy(item[column]) ? "TRUE" : "FALSE";
    return item[column] ?? "";
  });

export const sanitizeCollection = (key) => {
  if (!collections[key]) {
    throw new Error(`Unknown collection: ${key}`);
  }
  return key;
};
