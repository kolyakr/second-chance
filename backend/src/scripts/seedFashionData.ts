import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import connectDB from "../config/database";
import User from "../models/User";
import Post from "../models/Post";

dotenv.config();

interface CSVRow {
  id: string;
  gender: string;
  masterCategory: string;
  subCategory: string;
  articleType: string;
  baseColour: string;
  season: string;
  year: string;
  usage: string;
  productDisplayName: string;
  image_path: string;
}

// Helper function to parse CSV (handles quoted fields)
function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV parsing - split by comma but handle quoted fields
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value

    if (values.length >= headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        let value = values[index] || "";
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        row[header] = value.trim();
      });
      rows.push(row as CSVRow);
    }
  }

  return rows;
}

// Map gender and masterCategory to category
function mapToCategory(gender: string, masterCategory: string): "men" | "women" | "children" | "accessories" | "footwear" {
  const genderLower = gender.toLowerCase();
  const categoryLower = masterCategory.toLowerCase();

  // Accessories, Footwear, Free Items, and Personal Care are separate categories
  if (categoryLower === "accessories" || categoryLower === "free items" || categoryLower === "personal care") return "accessories";
  if (categoryLower === "footwear") return "footwear";

  // For Apparel, map by gender
  if (genderLower === "men") return "men";
  if (genderLower === "women") return "women";
  if (genderLower === "boys" || genderLower === "girls") return "children";
  
  // Unisex defaults based on masterCategory
  if (genderLower === "unisex") {
    if (categoryLower === "accessories" || categoryLower === "free items" || categoryLower === "personal care") return "accessories";
    if (categoryLower === "footwear") return "footwear";
    // For apparel, randomly assign to men or women
    return Math.random() > 0.5 ? "men" : "women";
  }

  // Default
  return "women";
}

// Map season (keep English for filters)
function mapSeason(season: string): string[] {
  const seasonLower = season.toLowerCase();
  const seasonMap: { [key: string]: string } = {
    spring: "spring",
    summer: "summer",
    fall: "fall",
    autumn: "fall",
    winter: "winter",
  };

  if (seasonMap[seasonLower]) {
    return [seasonMap[seasonLower]];
  }
  return ["all-season"];
}

// Generate condition
function generateCondition(): "new" | "like-new" | "used" | "with-defects" {
  const rand = Math.random();
  if (rand < 0.1) return "new";
  if (rand < 0.4) return "like-new";
  if (rand < 0.9) return "used";
  return "with-defects";
}

// Generate size based on category and article type
function generateSize(category: string, articleType: string): string {
  const sizes: { [key: string]: { [key: string]: string[] } } = {
    men: {
      Tshirts: ["S", "M", "L", "XL"],
      Shirts: ["S", "M", "L", "XL"],
      Jackets: ["M", "L", "XL"],
      Jeans: ["30x32", "32x32", "34x32", "36x32"],
      Trousers: ["30", "32", "34", "36"],
      Sweaters: ["M", "L", "XL"],
      Kurtas: ["M", "L", "XL"],
      Briefs: ["M", "L", "XL"],
      Trunk: ["M", "L", "XL"],
      Innerwear: ["M", "L", "XL"],
    },
    women: {
      Tshirts: ["XS", "S", "M", "L"],
      Tops: ["XS", "S", "M", "L"],
      Dresses: ["XS", "S", "M", "L"],
      Jackets: ["S", "M", "L"],
      Jeans: ["26", "28", "30", "32"],
      Skirts: ["XS", "S", "M", "L"],
      Sweaters: ["S", "M", "L"],
      Kurtas: ["S", "M", "L"],
      Kurtis: ["S", "M", "L"],
      Capris: ["XS", "S", "M", "L"],
      Jeggings: ["XS", "S", "M", "L"],
      Bra: ["32B", "34B", "36B", "38B"],
      Briefs: ["XS", "S", "M", "L"],
      Nightdress: ["S", "M", "L"],
    },
    children: {
      Tshirts: ["4 роки", "6 років", "8 років", "10 років"],
      Tops: ["4 роки", "6 років", "8 років"],
      Dresses: ["4 роки", "6 років", "8 років"],
      Jackets: ["4 роки", "6 років", "8 років"],
      Jeans: ["4 роки", "6 років", "8 років"],
    },
    accessories: {
      Handbags: ["Універсальний"],
      Backpacks: ["Універсальний"],
      Wallets: ["Універсальний"],
      Belts: ["M", "L", "XL"],
      Headwear: ["Універсальний"],
      Caps: ["Універсальний"],
      Headband: ["Універсальний"],
      Sunglasses: ["Універсальний"],
      Watches: ["Універсальний"],
      Jewellery: ["Універсальний"],
      Earrings: ["Універсальний"],
      Ring: ["Універсальний"],
      Bracelet: ["Універсальний"],
      Ties: ["Універсальний"],
      Socks: ["38-40", "41-43", "44-46"],
      Scarves: ["Універсальний"],
      Clutches: ["Універсальний"],
      Messenger: ["Універсальний"],
      Bag: ["Універсальний"],
      "Perfume and Body Mist": ["Універсальний"],
      Deodorant: ["Універсальний"],
      "Nail Polish": ["Універсальний"],
      "Highlighter and Blush": ["Універсальний"],
      "Lip Gloss": ["Універсальний"],
      Lipstick: ["Універсальний"],
      "Free Gifts": ["Універсальний"],
    },
    footwear: {
      Shoes: ["38", "39", "40", "41", "42", "43"],
      "Sports Shoes": ["38", "39", "40", "41", "42"],
      "Casual Shoes": ["38", "39", "40", "41", "42"],
      "Formal Shoes": ["38", "39", "40", "41", "42"],
      Flats: ["36", "37", "38", "39", "40"],
      Heels: ["36", "37", "38", "39", "40"],
      Sandals: ["38", "39", "40", "41", "42"],
      "Flip Flops": ["38", "39", "40", "41", "42"],
      Sandal: ["38", "39", "40", "41", "42"],
    },
  };

  const categorySizes = sizes[category as keyof typeof sizes];
  if (categorySizes) {
    const typeSizes = categorySizes[articleType as keyof typeof categorySizes];
    if (typeSizes && typeSizes.length > 0) {
      return typeSizes[Math.floor(Math.random() * typeSizes.length)];
    }
  }
  return "M";
}

// Generate price based on condition and article type
function generatePrice(
  condition: string,
  articleType: string
): number {
  const basePrices: { [key: string]: number } = {
    Tshirts: 15,
    Shirts: 25,
    Jackets: 60,
    Jeans: 35,
    Trousers: 30,
    Sweaters: 30,
    Dresses: 40,
    Tops: 20,
    Skirts: 25,
    Kurtas: 35,
    Kurtis: 35,
    Capris: 25,
    Jeggings: 30,
    Briefs: 10,
    Trunk: 12,
    Bra: 15,
    Nightdress: 20,
    Innerwear: 12,
    Handbags: 30,
    Backpacks: 35,
    Wallets: 15,
    Belts: 15,
    Headwear: 10,
    Caps: 12,
    Headband: 8,
    Sunglasses: 20,
    Watches: 50,
    Earrings: 25,
    Ring: 20,
    Bracelet: 30,
    Ties: 15,
    Socks: 5,
    Scarves: 12,
    Clutches: 20,
    Shoes: 40,
    "Sports Shoes": 45,
    "Casual Shoes": 35,
    "Formal Shoes": 50,
    Flats: 30,
    Heels: 35,
    Sandals: 25,
    "Flip Flops": 15,
    "Perfume and Body Mist": 30,
    Deodorant: 8,
    "Nail Polish": 5,
    "Highlighter and Blush": 15,
    "Lip Gloss": 8,
    Lipstick: 12,
    "Free Gifts": 0,
  };

  const basePrice = basePrices[articleType] || 25;
  const conditionMultiplier: { [key: string]: number } = {
    new: 1.0,
    "like-new": 0.8,
    used: 0.6,
    "with-defects": 0.4,
  };

  // Free Gifts should be free
  if (articleType === "Free Gifts") {
    return 0;
  }

  const price = Math.round(
    basePrice * (conditionMultiplier[condition] || 0.6)
  );
  return Math.max(5, price); // Minimum 5 (except for Free Gifts)
}

// Translation dictionaries
const articleTypeTranslations: { [key: string]: string } = {
  Tshirts: "Футболка",
  Shirts: "Сорочка",
  Jackets: "Куртка",
  Jeans: "Джинси",
  Trousers: "Штани",
  Sweaters: "Світер",
  Dresses: "Сукня",
  Tops: "Топ",
  Skirts: "Спідниця",
  Kurtas: "Курта",
  Kurtis: "Курті",
  Tunics: "Туніка",
  Sweatshirts: "Світшот",
  Capris: "Капрі",
  Jeggings: "Джеггінси",
  Shorts: "Шорти",
  "Track Pants": "Спортивні штани",
  Tracksuits: "Спортивний костюм",
  Innerwear: "Білизна",
  Briefs: "Труси",
  Bra: "Бюстгальтер",
  Trunk: "Труси-боксери",
  Loungewear: "Домашній одяг",
  Nightdress: "Нічна сорочка",
  "Lounge Pants": "Домашні штани",
  "Lounge Shorts": "Домашні шорти",
  Handbags: "Сумка",
  Backpacks: "Рюкзак",
  Wallets: "Гаманець",
  Belts: "Ремінь",
  Headwear: "Головний убір",
  Caps: "Кепка",
  Headband: "Пов'язка",
  Sunglasses: "Сонцезахисні окуляри",
  Watches: "Годинник",
  Jewellery: "Прикраси",
  Earrings: "Сережки",
  Ring: "Кільце",
  Bracelet: "Браслет",
  Ties: "Краватка",
  Socks: "Шкарпетки",
  Scarves: "Шарф",
  Clutches: "Клатч",
  Messenger: "Сумка-послання",
  Bag: "Сумка",
  Shoes: "Взуття",
  "Sports Shoes": "Кросівки",
  "Casual Shoes": "Кеди",
  "Formal Shoes": "Туфлі",
  Flats: "Балетки",
  Heels: "Туфлі на підборах",
  Sandals: "Сандалі",
  "Flip Flops": "Шльопанці",
  Sandal: "Сандалі",
  "Perfume and Body Mist": "Парфуми",
  Deodorant: "Дезодорант",
  "Nail Polish": "Лак для нігтів",
  "Highlighter and Blush": "Хайлайтер та рум'яна",
  "Lip Gloss": "Блиск для губ",
  Lipstick: "Помада",
  "Free Gifts": "Подарунок",
};

const colorTranslations: { [key: string]: string } = {
  Black: "Чорний",
  White: "Білий",
  Blue: "Синій",
  Red: "Червоний",
  Green: "Зелений",
  Brown: "Коричневий",
  Grey: "Сірий",
  "Grey Melange": "Сірий меланж",
  "Navy Blue": "Темно-синій",
  Pink: "Рожевий",
  Purple: "Фіолетовий",
  Yellow: "Жовтий",
  Orange: "Помаранчевий",
  Beige: "Бежевий",
  Cream: "Кремовий",
  Silver: "Сріблястий",
  Gold: "Золотий",
  Maroon: "Бордовий",
  Lavender: "Лавандовий",
  "Turquoise Blue": "Бірюзовий",
  Peach: "Персиковий",
  Magenta: "Пурпурний",
  Teal: "Бірюзовий",
  Olive: "Оливковий",
  Charcoal: "Вугільний",
  Rust: "Іржавий",
  "Off White": "Кремово-білий",
  Multi: "Багатокольоровий",
  "Multi-color": "Багатокольоровий",
  "Multi Coloured": "Багатокольоровий",
  "Fluorescent Green": "Флуоресцентний зелений",
  Copper: "Мідно-червоний",
  Skin: "Тілесний",
  Steel: "Сталевий",
};

const usageTranslations: { [key: string]: string } = {
  Casual: "Повсякденний",
  Formal: "Діловий",
  Sports: "Спортивний",
  Ethnic: "Етнічний",
  Party: "Вечірній",
  Travel: "Подорожі",
};

const subCategoryTranslations: { [key: string]: string } = {
  Topwear: "Верхній одяг",
  Bottomwear: "Нижній одяг",
  Dress: "Сукні",
  Innerwear: "Білизна",
  "Loungewear and Nightwear": "Домашній та нічний одяг",
  "Apparel Set": "Комплект одягу",
  Saree: "Сарі",
  Bags: "Сумки",
  Headwear: "Головний убір",
  Belts: "Ремені",
  Eyewear: "Окуляри",
  Watches: "Годинники",
  Jewellery: "Прикраси",
  Wallets: "Гаманці",
  Ties: "Краватки",
  Socks: "Шкарпетки",
  Scarves: "Шарфи",
  "Shoe Accessories": "Аксесуари для взуття",
  "Free Gifts": "Подарунки",
  Shoes: "Взуття",
  Sandal: "Сандалі",
  "Flip Flops": "Шльопанці",
  Fragrance: "Парфуми",
  "Personal Care": "Догляд",
  Makeup: "Макіяж",
  Nails: "Манікюр",
  Lips: "Губи",
  "Perfume and Body Mist": "Парфуми та туалетна вода",
  Deodorant: "Дезодорант",
  "Nail Polish": "Лак для нігтів",
  "Lip Gloss": "Блиск для губ",
  Lipstick: "Помада",
  "Highlighter and Blush": "Хайлайтер та рум'яна",
};

// Translate article type to Ukrainian
function translateArticleType(articleType: string): string {
  return articleTypeTranslations[articleType] || articleType;
}

// Translate color to Ukrainian
function translateColor(color: string): string {
  if (!color) return "Невідомий";
  return colorTranslations[color] || color;
}

// Translate usage to Ukrainian
function translateUsage(usage: string): string {
  if (!usage) return "Повсякденний";
  return usageTranslations[usage] || usage;
}

// Translate subcategory to Ukrainian
function translateSubCategory(subCategory: string): string {
  if (!subCategory) return "";
  return subCategoryTranslations[subCategory] || subCategory;
}

// Generate Ukrainian description
function generateDescription(
  productDisplayName: string,
  articleType: string,
  color: string,
  usage: string,
  season: string,
  condition: string,
  conditionDetails: string
): string {
  const conditionText: { [key: string]: string } = {
    new: "Новий товар, ніколи не носився.",
    "like-new": "Відмінний стан, носився дуже мало.",
    used: "Добре використовувався, але все ще в хорошому стані.",
    "with-defects": "Має невеликі дефекти, але все ще придатний до використання.",
  };

  const translatedType = translateArticleType(articleType);
  const translatedColor = translateColor(color);
  const translatedUsage = translateUsage(usage);
  const seasonMap: { [key: string]: string } = {
    spring: "весна",
    summer: "літо",
    fall: "осінь",
    winter: "зима",
  };
  const translatedSeason = season
    ? `Сезон: ${seasonMap[season.toLowerCase()] || season}.`
    : "";

  const baseDescription = productDisplayName
    ? `${productDisplayName}. ${translatedType} кольору ${translatedColor.toLowerCase()}.`
    : `${translatedType} кольору ${translatedColor.toLowerCase()}.`;

  return `${baseDescription} ${translatedUsage ? `Стиль: ${translatedUsage.toLowerCase()}.` : ""} ${translatedSeason} ${conditionText[condition]} ${conditionDetails || ""} Ідеально підходить для екологічно свідомих покупців, які хочуть дати речам другий шанс.`;
}

// Generate tags in Ukrainian
function generateTags(
  articleType: string,
  color: string,
  usage: string,
  subCategory: string
): string[] {
  const tags: string[] = [];

  // Add article type (translated)
  const translatedType = translateArticleType(articleType);
  tags.push(translatedType.toLowerCase());

  // Add color (translated)
  if (color) {
    const translatedColor = translateColor(color);
    tags.push(translatedColor.toLowerCase());
  }

  // Add usage (translated)
  if (usage) {
    const translatedUsage = translateUsage(usage);
    tags.push(translatedUsage.toLowerCase());
  }

  // Add subcategory (translated)
  if (subCategory) {
    const translatedSub = translateSubCategory(subCategory);
    if (translatedSub) {
      tags.push(translatedSub.toLowerCase());
    }
  }

  // Add eco-friendly tags in Ukrainian
  tags.push("екологічний");
  tags.push("second-hand");
  tags.push("сталий");
  tags.push("переробка");

  return tags;
}

// Generate condition details
function generateConditionDetails(condition: string): string {
  const details: { [key: string]: string[] } = {
    new: [
      "Абсолютно новий, з тегами.",
      "Новий товар, не використовувався.",
      "В оригінальній упаковці.",
    ],
    "like-new": [
      "Носився кілька разів, виглядає як нова.",
      "Відмінний стан, мінімальне використання.",
      "Добре доглянута, без видимих слідів носіння.",
    ],
    used: [
      "Звичайне носіння, невеликий знос.",
      "Добре використовувався, але в хорошому стані.",
      "Можливі невеликі плями або знос.",
    ],
    "with-defects": [
      "Має невеликі дефекти, але функціональний.",
      "Помітний знос, але все ще можна носити.",
      "Потрібен невеликий ремонт або чищення.",
    ],
  };

  const options = details[condition] || details.used;
  return options[Math.floor(Math.random() * options.length)];
}

// Extract brand from product name
function extractBrand(productDisplayName: string): string {
  if (!productDisplayName) return "Невідомий";
  const words = productDisplayName.split(" ");
  // Usually brand is first word
  const brand = words[0];
  // Remove common gender prefixes
  if (["Women", "Men", "Unisex", "Boys", "Girls"].includes(brand)) {
    return words[1] || "Невідомий";
  }
  return brand || "Невідомий";
}

// Generate Ukrainian title
function generateUkrainianTitle(
  productDisplayName: string,
  articleType: string,
  color: string
): string {
  const translatedType = translateArticleType(articleType);
  const translatedColor = translateColor(color);

  // Try to translate product name
  if (productDisplayName) {
    let translated = productDisplayName
      .replace(/\b(Women|Men|Unisex|Boys|Girls)\b/g, (match) => {
        const translations: { [key: string]: string } = {
          Women: "Жіночий",
          Men: "Чоловічий",
          Unisex: "Унісекс",
          Boys: "Хлопчики",
          Girls: "Дівчатка",
        };
        return translations[match] || match;
      })
      .replace(/\b(Solid|Printed|Casual|Sports|Formal|Ethnic)\b/g, (match) => {
        const translations: { [key: string]: string } = {
          Solid: "Однотонний",
          Printed: "Принтований",
          Casual: "Повсякденний",
          Sports: "Спортивний",
          Formal: "Діловий",
          Ethnic: "Етнічний",
        };
        return translations[match] || match;
      });

    // If translation is too long, use shorter version
    if (translated.length > 100) {
      return `${translatedType} ${translatedColor.toLowerCase()}`;
    }
    return translated;
  }

  return `${translatedType} ${translatedColor.toLowerCase()}`;
}

// Ukrainian first names
const ukrainianFirstNames = {
  male: [
    "Олександр", "Дмитро", "Андрій", "Максим", "Владислав", "Іван", "Олег",
    "Роман", "Сергій", "Михайло", "Володимир", "Тарас", "Богдан", "Ярослав",
    "Василь", "Петро", "Микола", "Юрій", "Олексій", "Віталій", "Артем",
    "Денис", "Станіслав", "Ігор", "Віктор", "Євген", "Віктор", "Олександр",
    "Дмитро", "Андрій", "Максим", "Владислав", "Іван", "Олег", "Роман",
  ],
  female: [
    "Олена", "Марія", "Анна", "Наталія", "Оксана", "Тетяна", "Ірина",
    "Юлія", "Катерина", "Вікторія", "Світлана", "Валентина", "Людмила",
    "Галина", "Надія", "Лариса", "Ольга", "Інна", "Тамara", "Любов",
    "Оксана", "Світлана", "Наталія", "Олена", "Марія", "Анна", "Вікторія",
    "Юлія", "Катерина", "Оксана", "Тетяна", "Ірина", "Олена", "Марія",
  ],
};

// Ukrainian last names
const ukrainianLastNames = [
  "Петренко", "Коваленко", "Шевченко", "Мельник", "Бондаренко", "Кравченко",
  "Ткаченко", "Мороз", "Коваль", "Шевчук", "Бондар", "Ткачук", "Кравчук",
  "Олійник", "Шевцов", "Поліщук", "Савченко", "Бондарчук", "Ковальчук",
  "Романенко", "Василенко", "Павленко", "Дмитренко", "Іваненко", "Сергієнко",
  "Марченко", "Лисенко", "Тарасенко", "Білоус", "Гриценко", "Кравцов",
  "Максименко", "Овчаренко", "Панченко", "Семененко", "Федоренко", "Харченко",
];

// Ukrainian cities
const ukrainianCities = [
  "Київ", "Харків", "Одеса", "Дніпро", "Львів", "Запоріжжя", "Вінниця",
  "Полтава", "Чернівці", "Хмельницький", "Рівне", "Івано-Франківськ",
  "Тернопіль", "Луцьк", "Ужгород", "Суми", "Черкаси", "Кропивницький",
  "Миколаїв", "Херсон", "Маріуполь", "Краматорськ", "Слов'янськ", "Мелітополь",
  "Бердянськ", "Кременчук", "Нікополь", "Біла Церква", "Житомир", "Чернігів",
];

// Generate Ukrainian users with gender tracking
async function createUkrainianUsers(count: number) {
  const users: any[] = [];
  const usedEmails = new Set<string>();
  const usedUsernames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = ukrainianFirstNames[isMale ? "male" : "female"][
      Math.floor(Math.random() * ukrainianFirstNames[isMale ? "male" : "female"].length)
    ];
    const lastName = ukrainianLastNames[
      Math.floor(Math.random() * ukrainianLastNames.length)
    ];
    const city = ukrainianCities[
      Math.floor(Math.random() * ukrainianCities.length)
    ];

    // Generate unique email
    let email: string;
    let emailCounter = 0;
    do {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailCounter > 0 ? emailCounter : ""}@example.com`;
      emailCounter++;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // Generate unique username
    let username: string;
    let usernameCounter = 0;
    do {
      username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${usernameCounter > 0 ? usernameCounter : ""}`;
      usernameCounter++;
    } while (usedUsernames.has(username));
    usedUsernames.add(username);

    const user = {
      email,
      password: "password123", // Will be hashed by User model
      username,
      firstName,
      lastName,
      isEmailVerified: true,
      bio: `Прихильник екологічної моди з ${city}. Даю речам другий шанс!`,
      location: `${city}, Україна`,
      telegram: `@${username}`,
      phone: `+380${Math.floor(100000000 + Math.random() * 900000000)}`,
      _isMale: isMale, // Track gender for matching
    };

    users.push(user);
  }

  const createdUsers = await User.insertMany(users);
  // Add gender tracking to created users
  return createdUsers.map((user, index) => ({
    ...user.toObject(),
    _isMale: users[index]._isMale,
  }));
}

const seedFashionData = async () => {
  try {
    await connectDB();

    // Drop existing posts and users (clean database)
    console.log("Очищення бази даних...");
    await Post.deleteMany({});
    await User.deleteMany({});
    console.log("База даних очищена");

    console.log("Читання CSV файлу...");
    const csvPath = path.join(__dirname, "../data/fashion_data_with_links.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    console.log("Парсинг CSV...");
    const rows = parseCSV(csvContent);
    console.log(`Знайдено ${rows.length} записів у CSV`);

    if (rows.length === 0) {
      console.error("CSV файл порожній!");
      process.exit(1);
    }

    // Create 180 Ukrainian users
    console.log("Створення 180 українських користувачів...");
    const users = await createUkrainianUsers(180);
    console.log(`Створено ${users.length} користувачів`);

    // Separate users by gender
    const maleUsers = users.filter((u) => u._isMale);
    const femaleUsers = users.filter((u) => !u._isMale);
    console.log(
      `Користувачі: ${maleUsers.length} чоловіків, ${femaleUsers.length} жінок`
    );

    // Separate items by category
    const menItems: typeof rows = [];
    const womenItems: typeof rows = [];
    const childrenItems: typeof rows = [];
    const accessoriesItems: typeof rows = [];
    const footwearItems: typeof rows = [];

    for (const item of rows) {
      const category = mapToCategory(item.gender, item.masterCategory);
      if (category === "men") {
        menItems.push(item);
      } else if (category === "women") {
        womenItems.push(item);
      } else if (category === "children") {
        childrenItems.push(item);
      } else if (category === "accessories") {
        accessoriesItems.push(item);
      } else if (category === "footwear") {
        footwearItems.push(item);
      }
    }

    console.log(
      `Розподіл товарів: ${menItems.length} чоловічих, ${womenItems.length} жіночих, ${childrenItems.length} дитячих, ${accessoriesItems.length} аксесуарів, ${footwearItems.length} взуття`
    );

    // Create posts
    console.log("Створення оголошень...");
    const posts = [];

    // Distribute items to users
    const userCounts = new Array(users.length).fill(0);

    // Combine all items
    const allItems = [
      ...menItems,
      ...womenItems,
      ...childrenItems,
      ...accessoriesItems,
      ...footwearItems,
    ];

    // Shuffle items for random distribution
    const shuffledItems = allItems.sort(() => 0.5 - Math.random());

    for (const item of shuffledItems) {
      const category = mapToCategory(item.gender, item.masterCategory);
      const condition = generateCondition();
      const conditionDetails = generateConditionDetails(condition);
      const size = generateSize(category, item.articleType);
      const price = generatePrice(condition, item.articleType);
      const season = mapSeason(item.season);
      const description = generateDescription(
        item.productDisplayName,
        item.articleType,
        item.baseColour,
        item.usage,
        season[0] || "",
        condition,
        conditionDetails
      );
      const tags = generateTags(
        item.articleType,
        item.baseColour,
        item.usage,
        item.subCategory
      );

      // Find user with least items assigned
      let userIndex = 0;
      let minCount = userCounts[0];
      for (let i = 1; i < users.length; i++) {
        if (userCounts[i] < minCount) {
          minCount = userCounts[i];
          userIndex = i;
        }
      }
      const randomUser = users[userIndex];
      userCounts[userIndex]++;

      const translatedTitle = generateUkrainianTitle(
        item.productDisplayName,
        item.articleType,
        item.baseColour
      );
      const translatedSubcategory = translateSubCategory(item.subCategory);
      const translatedColor = translateColor(item.baseColour);
      const brand = extractBrand(item.productDisplayName);

      const post = {
        user: randomUser._id,
        title: translatedTitle.length > 100 ? translatedTitle.substring(0, 100) : translatedTitle,
        description: description.length > 2000 ? description.substring(0, 2000) : description,
        images:
          item.image_path && item.image_path.trim() !== ""
            ? [item.image_path.trim()]
            : [
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop",
              ],
        category: category,
        subcategory:
          translatedSubcategory.length > 50
            ? translatedSubcategory.substring(0, 50)
            : translatedSubcategory || translateArticleType(item.articleType),
        size: size.length > 20 ? size.substring(0, 20) : size,
        brand: brand.length > 50 ? brand.substring(0, 50) : brand,
        material: "Бавовна", // Default material in Ukrainian
        condition: condition,
        conditionDetails:
          conditionDetails.length > 500
            ? conditionDetails.substring(0, 500)
            : conditionDetails,
        price: price,
        color:
          translatedColor.length > 30
            ? translatedColor.substring(0, 30)
            : translatedColor,
        season: season, // Keep English for filters
        tags: tags.map((tag) => tag.toLowerCase().substring(0, 50)),
        location: randomUser.location || "Україна",
        isPublic: true,
        status: "active" as const,
        views: Math.floor(Math.random() * 200),
        likesCount: Math.floor(Math.random() * 30),
        commentsCount: Math.floor(Math.random() * 10),
      };

      posts.push(post);
    }

    // Insert posts
    console.log("Вставка оголошень в базу даних...");
    const createdPosts = await Post.insertMany(posts);

    console.log(`✅ Успішно створено ${createdPosts.length} оголошень!`);
    console.log("\nПідсумок:");
    console.log(`- Всього товарів оброблено: ${allItems.length}`);
    console.log(`- Оголошень створено: ${createdPosts.length}`);
    console.log(
      `- Користувачів: ${users.length} (з українськими іменами та локаціями)`
    );
    console.log(
      `- Категорій: ${new Set(createdPosts.map((p) => p.category)).size} унікальних`
    );

    // Show distribution of posts per user
    const postsPerUser = new Map();
    createdPosts.forEach((post) => {
      const userId = post.user.toString();
      postsPerUser.set(userId, (postsPerUser.get(userId) || 0) + 1);
    });
    const postCounts = Array.from(postsPerUser.values());
    console.log(
      `- Оголошень на користувача: мін ${Math.min(...postCounts)}, макс ${Math.max(...postCounts)}, середнє ${(createdPosts.length / users.length).toFixed(1)}`
    );

    // Show category distribution
    const categoryCounts = new Map();
    createdPosts.forEach((post) => {
      categoryCounts.set(
        post.category,
        (categoryCounts.get(post.category) || 0) + 1
      );
    });
    console.log("\nРозподіл по категоріях:");
    categoryCounts.forEach((count, category) => {
      console.log(`  ${category}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Помилка при заповненні бази даних:", error);
    process.exit(1);
  }
};

seedFashionData();

