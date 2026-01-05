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
  image_link: string;
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

// Map gender to category
function mapGenderToCategory(gender: string): "men" | "women" | "children" {
  const genderLower = gender.toLowerCase();
  if (genderLower === "men" || genderLower === "boys") {
    return genderLower === "boys" ? "children" : "men";
  }
  if (genderLower === "women" || genderLower === "girls") {
    return genderLower === "girls" ? "children" : "women";
  }
  // Default to women for Unisex or unknown
  return "women";
}

// Map season
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
  const sizes = {
    men: {
      Tshirts: ["S", "M", "L", "XL"],
      Shirts: ["S", "M", "L", "XL"],
      Jackets: ["M", "L", "XL"],
      Jeans: ["30x32", "32x32", "34x32", "36x32"],
      Trousers: ["30", "32", "34", "36"],
      Sweaters: ["M", "L", "XL"],
      Kurtas: ["M", "L", "XL"],
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
    },
    children: {
      Tshirts: ["4 years", "6 years", "8 years", "10 years"],
      Tops: ["4 years", "6 years", "8 years"],
      Dresses: ["4 years", "6 years", "8 years"],
      Jackets: ["4 years", "6 years", "8 years"],
      Jeans: ["4 years", "6 years", "8 years"],
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
  };

  const basePrice = basePrices[articleType] || 25;
  const conditionMultiplier: { [key: string]: number } = {
    new: 1.0,
    "like-new": 0.8,
    used: 0.6,
    "with-defects": 0.4,
  };

  const price = Math.round(
    basePrice * (conditionMultiplier[condition] || 0.6)
  );
  return Math.max(5, price); // Minimum 5
}

// Generate Ukrainian description from CSV data
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
  const translatedSeason = season ? `Сезон: ${season}.` : "";

  // Use product name from CSV as base, translate parts
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

// Ukrainian first names
const ukrainianFirstNames = {
  male: [
    "Олександр", "Дмитро", "Андрій", "Максим", "Владислав", "Іван", "Олег",
    "Роман", "Сергій", "Михайло", "Володимир", "Тарас", "Богдан", "Ярослав",
    "Василь", "Петро", "Микола", "Юрій", "Олексій", "Віталій", "Артем",
    "Денис", "Станіслав", "Ігор", "Віктор"
  ],
  female: [
    "Олена", "Марія", "Анна", "Наталія", "Оксана", "Тетяна", "Ірина",
    "Юлія", "Катерина", "Вікторія", "Світлана", "Валентина", "Людмила",
    "Галина", "Надія", "Лариса", "Ольга", "Інна", "Тамara", "Любов",
    "Оксана", "Світлана", "Наталія", "Олена", "Марія"
  ]
};

// Ukrainian last names
const ukrainianLastNames = [
  "Петренко", "Коваленко", "Шевченко", "Мельник", "Бондаренко", "Кравченко",
  "Ткаченко", "Мороз", "Коваль", "Шевчук", "Бондар", "Ткачук", "Кравчук",
  "Олійник", "Шевцов", "Поліщук", "Савченко", "Бондарчук", "Ковальчук",
  "Романенко", "Василенко", "Павленко", "Дмитренко", "Іваненко", "Сергієнко"
];

// Ukrainian cities
const ukrainianCities = [
  "Київ", "Харків", "Одеса", "Дніпро", "Львів", "Запоріжжя", "Вінниця",
  "Полтава", "Чернівці", "Хмельницький", "Рівне", "Івано-Франківськ",
  "Тернопіль", "Луцьк", "Ужгород", "Суми", "Черкаси", "Кропивницький",
  "Миколаїв", "Херсон", "Маріуполь", "Краматорськ", "Слов'янськ", "Мелітополь",
  "Бердянськ", "Кременчук", "Нікополь", "Біла Церква", "Житомир", "Чернігів"
];

// Translation dictionaries
const articleTypeTranslations: { [key: string]: string } = {
  "Tshirts": "Футболка",
  "Shirts": "Сорочка",
  "Jackets": "Куртка",
  "Jeans": "Джинси",
  "Trousers": "Штани",
  "Sweaters": "Светр",
  "Dresses": "Сукня",
  "Tops": "Топ",
  "Skirts": "Спідниця",
  "Kurtas": "Курта",
  "Kurtis": "Курті",
  "Tunics": "Туніка",
  "Sweatshirts": "Світшот",
  "Capris": "Капрі",
  "Jeggings": "Джеггінси",
  "Shorts": "Шорти",
  "Track Pants": "Спортивні штани",
  "Tracksuits": "Спортивний костюм",
  "Innerwear": "Білизна",
  "Briefs": "Труси",
  "Bra": "Бюстгальтер",
  "Trunk": "Труси-боксери",
  "Loungewear": "Домашній одяг",
  "Nightdress": "Нічна сорочка",
  "Lounge Pants": "Домашні штани",
  "Lounge Shorts": "Домашні шорти",
};

const colorTranslations: { [key: string]: string } = {
  "Black": "Чорний",
  "White": "Білий",
  "Blue": "Синій",
  "Red": "Червоний",
  "Green": "Зелений",
  "Brown": "Коричневий",
  "Grey": "Сірий",
  "Grey Melange": "Сірий меланж",
  "Navy Blue": "Темно-синій",
  "Pink": "Рожевий",
  "Purple": "Фіолетовий",
  "Yellow": "Жовтий",
  "Orange": "Помаранчевий",
  "Beige": "Бежевий",
  "Cream": "Кремовий",
  "Silver": "Сріблястий",
  "Gold": "Золотий",
  "Maroon": "Бордовий",
  "Lavender": "Лавандовий",
  "Turquoise Blue": "Бірюзовий",
  "Peach": "Персиковий",
  "Magenta": "Пурпурний",
  "Teal": "Бірюзовий",
  "Olive": "Оливковий",
  "Charcoal": "Вугільний",
  "Rust": "Іржавий",
  "Off White": "Кремово-білий",
  "Multi": "Багатокольоровий",
  "Multi-color": "Багатокольоровий",
  "Multi Coloured": "Багатокольоровий",
};

const usageTranslations: { [key: string]: string } = {
  "Casual": "Повсякденний",
  "Formal": "Діловий",
  "Sports": "Спортивний",
  "Ethnic": "Етнічний",
  "Party": "Вечірній",
  "Travel": "Подорожі",
};

const subCategoryTranslations: { [key: string]: string } = {
  "Topwear": "Верхній одяг",
  "Bottomwear": "Нижній одяг",
  "Dress": "Сукні",
  "Innerwear": "Білизна",
  "Loungewear and Nightwear": "Домашній та нічний одяг",
  "Apparel Set": "Комплект одягу",
  "Saree": "Сарі",
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

// Generate Ukrainian title
function generateUkrainianTitle(productName: string, articleType: string, color: string): string {
  const translatedType = translateArticleType(articleType);
  const translatedColor = translateColor(color);
  
  // Try to extract brand from product name
  const words = productName.split(" ");
  const brand = words[0] || "";
  
  return `${translatedType} ${translatedColor.toLowerCase()}${brand ? ` - ${brand}` : ""}`;
}

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

const seedClothes = async () => {
  try {
    await connectDB();

    // Drop existing posts and users (clean database)
    console.log("Cleaning database...");
    await Post.deleteMany({});
    await User.deleteMany({});
    console.log("Database cleaned");

    console.log("Reading CSV file...");
    const csvPath = path.join(__dirname, "../data/clothes_data.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    console.log("Parsing CSV...");
    const rows = parseCSV(csvContent);

    // Filter for Apparel only (clothes)
    console.log("Filtering for clothes (Apparel)...");
    const clothesRows = rows.filter(
      (row) => row.masterCategory === "Apparel"
    );

    console.log(`Found ${clothesRows.length} clothes items in CSV`);

    if (clothesRows.length === 0) {
      console.error("No clothes found in CSV!");
      process.exit(1);
    }

    // Get random 100 items
    const shuffled = clothesRows.sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, Math.min(100, shuffled.length));

    console.log(`Selected ${selectedItems.length} random clothes items`);

    // Create 50 Ukrainian users
    console.log("Creating 50 Ukrainian users...");
    const users = await createUkrainianUsers(50);
    console.log(`Created ${users.length} users`);

    // Separate users by gender
    const maleUsers = users.filter(u => u._isMale);
    const femaleUsers = users.filter(u => !u._isMale);
    
    console.log(`Using ${users.length} users for seeding (${maleUsers.length} men, ${femaleUsers.length} women)`);
    
    // Separate items by category
    const menItems: typeof selectedItems = [];
    const womenItems: typeof selectedItems = [];
    const childrenItems: typeof selectedItems = [];
    
    for (const item of selectedItems) {
      const category = mapGenderToCategory(item.gender);
      if (category === "men") {
        menItems.push(item);
      } else if (category === "women") {
        womenItems.push(item);
      } else {
        childrenItems.push(item);
      }
    }
    
    console.log(`Items distribution: ${menItems.length} men, ${womenItems.length} women, ${childrenItems.length} children`);

    // Create posts
    console.log("Creating posts...");
    const posts = [];
    
    // Distribute items: men users get men/children items, women users get women items
    const maleUserCounts = new Array(maleUsers.length).fill(0);
    const femaleUserCounts = new Array(femaleUsers.length).fill(0);
    
    // Combine men and children items for male users
    const menAndChildrenItems = [...menItems, ...childrenItems];
    
    // Distribute men/children items to male users
    for (const item of menAndChildrenItems) {
      const category = mapGenderToCategory(item.gender);
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
        item.season,
        condition,
        conditionDetails
      );
      const tags = generateTags(
        item.articleType,
        item.baseColour,
        item.usage,
        item.subCategory
      );

      // Find male user with least items assigned
      let userIndex = 0;
      let minCount = maleUserCounts[0];
      for (let i = 1; i < maleUsers.length; i++) {
        if (maleUserCounts[i] < minCount) {
          minCount = maleUserCounts[i];
          userIndex = i;
        }
      }
      const randomUser = maleUsers[userIndex];
      maleUserCounts[userIndex]++;
      
      // Use product name from CSV, translate only parts
      const translatedTitle = item.productDisplayName 
        ? item.productDisplayName.replace(/\b(Women|Men|Unisex|Boys|Girls)\b/g, (match) => {
            const translations: { [key: string]: string } = {
              "Women": "Жіночий",
              "Men": "Чоловічий",
              "Unisex": "Унісекс",
              "Boys": "Хлопчики",
              "Girls": "Дівчатка"
            };
            return translations[match] || match;
          })
        : generateUkrainianTitle(
            item.productDisplayName || "",
            item.articleType,
            item.baseColour
          );
      const translatedSubcategory = translateSubCategory(item.subCategory);
      const translatedColor = translateColor(item.baseColour);
      
      const post = {
        user: randomUser._id,
        title: translatedTitle,
        description: description,
        images: item.image_link && item.image_link.trim() !== ""
          ? [item.image_link.trim()]
          : ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop"],
        category: category,
        subcategory: translatedSubcategory || translateArticleType(item.articleType),
        size: size,
        brand: item.productDisplayName.split(" ")[0] || "Невідомий",
        material: "Бавовна", // Default material in Ukrainian
        condition: condition,
        conditionDetails: conditionDetails,
        price: price,
        color: translatedColor,
        season: season,
        tags: tags,
        location: randomUser.location || "Україна",
        isPublic: true,
        status: "active" as const,
        views: Math.floor(Math.random() * 200),
        likesCount: Math.floor(Math.random() * 30),
        commentsCount: Math.floor(Math.random() * 10),
      };

      posts.push(post);
    }
    
    // Distribute women items to female users
    for (const item of womenItems) {
      const category = mapGenderToCategory(item.gender);
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
        item.season,
        condition,
        conditionDetails
      );
      const tags = generateTags(
        item.articleType,
        item.baseColour,
        item.usage,
        item.subCategory
      );

      // Find female user with least items assigned
      let userIndex = 0;
      let minCount = femaleUserCounts[0];
      for (let i = 1; i < femaleUsers.length; i++) {
        if (femaleUserCounts[i] < minCount) {
          minCount = femaleUserCounts[i];
          userIndex = i;
        }
      }
      const randomUser = femaleUsers[userIndex];
      femaleUserCounts[userIndex]++;

      // Use product name from CSV, translate only parts
      const translatedTitle = item.productDisplayName 
        ? item.productDisplayName.replace(/\b(Women|Men|Unisex|Boys|Girls)\b/g, (match) => {
            const translations: { [key: string]: string } = {
              "Women": "Жіночий",
              "Men": "Чоловічий",
              "Unisex": "Унісекс",
              "Boys": "Хлопчики",
              "Girls": "Дівчатка"
            };
            return translations[match] || match;
          })
        : generateUkrainianTitle(
            item.productDisplayName || "",
            item.articleType,
            item.baseColour
          );
      const translatedSubcategory = translateSubCategory(item.subCategory);
      const translatedColor = translateColor(item.baseColour);
      
      const post = {
        user: randomUser._id,
        title: translatedTitle,
        description: description,
        images: item.image_link && item.image_link.trim() !== ""
          ? [item.image_link.trim()]
          : ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop"],
        category: category,
        subcategory: translatedSubcategory || translateArticleType(item.articleType),
        size: size,
        brand: item.productDisplayName.split(" ")[0] || "Невідомий",
        material: "Бавовна", // Default material in Ukrainian
        condition: condition,
        conditionDetails: conditionDetails,
        price: price,
        color: translatedColor,
        season: season,
        tags: tags,
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
    console.log("Inserting posts into database...");
    const createdPosts = await Post.insertMany(posts);

    console.log(`✅ Successfully created ${createdPosts.length} clothes posts!`);
    console.log("\nSummary:");
    console.log(`- Total items processed: ${selectedItems.length}`);
    console.log(`- Posts created: ${createdPosts.length}`);
    console.log(`- Users: ${users.length} (with Ukrainian names and locations)`);
    console.log(`- Categories: ${new Set(createdPosts.map(p => p.category)).size} unique`);
    
    // Show distribution of posts per user
    const postsPerUser = new Map();
    createdPosts.forEach(post => {
      const userId = post.user.toString();
      postsPerUser.set(userId, (postsPerUser.get(userId) || 0) + 1);
    });
    console.log(`- Posts per user: min ${Math.min(...Array.from(postsPerUser.values()))}, max ${Math.max(...Array.from(postsPerUser.values()))}, avg ${(createdPosts.length / users.length).toFixed(1)}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding clothes:", error);
    process.exit(1);
  }
};

seedClothes();

