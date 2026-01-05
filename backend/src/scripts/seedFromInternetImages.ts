import dotenv from "dotenv";
import connectDB from "../config/database";
import User from "../models/User";
import Post from "../models/Post";

dotenv.config();

// Pre-defined clothing items with Unsplash image URLs
const clothingItems = [
  // Men's clothing
  {
    category: "men",
    subcategory: "футболка",
    color: "білий",
    articleType: "tshirt",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
    style: "повсякденний",
  },
  {
    category: "men",
    subcategory: "сорочка",
    color: "синій",
    articleType: "shirt",
    imageUrl: "https://images.unsplash.com/photo-1594938291221-94f18e0e0e8a?w=800&h=800&fit=crop",
    style: "діловий",
  },
  {
    category: "men",
    subcategory: "куртка",
    color: "чорний",
    articleType: "jacket",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
    style: "повсякденний",
  },
  {
    category: "men",
    subcategory: "джинси",
    color: "синій",
    articleType: "jeans",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
    style: "повсякденний",
  },
  {
    category: "men",
    subcategory: "штани",
    color: "чорний",
    articleType: "trousers",
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop",
    style: "діловий",
  },
  {
    category: "men",
    subcategory: "світер",
    color: "сірий",
    articleType: "sweater",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
    style: "повсякденний",
  },
  {
    category: "men",
    subcategory: "толстовка",
    color: "сірий",
    articleType: "hoodie",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
    style: "спортивний",
  },
  {
    category: "men",
    subcategory: "шорти",
    color: "чорний",
    articleType: "shorts",
    imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=800&fit=crop",
    style: "спортивний",
  },
  {
    category: "men",
    subcategory: "піджак",
    color: "синій",
    articleType: "blazer",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop",
    style: "діловий",
  },
  {
    category: "men",
    subcategory: "пальто",
    color: "коричневий",
    articleType: "coat",
    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop",
    style: "класичний",
  },
  // Women's clothing
  {
    category: "women",
    subcategory: "сукня",
    color: "чорний",
    articleType: "dress",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop",
    style: "елегантний",
  },
  {
    category: "women",
    subcategory: "сукня",
    color: "білий",
    articleType: "dress",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=800&fit=crop",
    style: "літній",
  },
  {
    category: "women",
    subcategory: "спідниця",
    color: "чорний",
    articleType: "skirt",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop",
    style: "офісний",
  },
  {
    category: "women",
    subcategory: "блузка",
    color: "білий",
    articleType: "blouse",
    imageUrl: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=800&fit=crop",
    style: "діловий",
  },
  {
    category: "women",
    subcategory: "топ",
    color: "рожевий",
    articleType: "top",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop",
    style: "повсякденний",
  },
  {
    category: "women",
    subcategory: "куртка",
    color: "бежевий",
    articleType: "jacket",
    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop",
    style: "повсякденний",
  },
  {
    category: "women",
    subcategory: "джинси",
    color: "синій",
    articleType: "jeans",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
    style: "повсякденний",
  },
  {
    category: "women",
    subcategory: "світер",
    color: "бежевий",
    articleType: "sweater",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
    style: "затишний",
  },
  {
    category: "women",
    subcategory: "пальто",
    color: "бежевий",
    articleType: "coat",
    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop",
    style: "класичний",
  },
  {
    category: "women",
    subcategory: "топ",
    color: "білий",
    articleType: "top",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop",
    style: "літній",
  },
  // Children's clothing
  {
    category: "children",
    subcategory: "футболка",
    color: "синій",
    articleType: "tshirt",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
    style: "дитячий",
  },
  {
    category: "children",
    subcategory: "сукня",
    color: "рожевий",
    articleType: "dress",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=800&fit=crop",
    style: "дитячий",
  },
  {
    category: "children",
    subcategory: "шорти",
    color: "синій",
    articleType: "shorts",
    imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=800&fit=crop",
    style: "спортивний",
  },
  {
    category: "children",
    subcategory: "куртка",
    color: "червоний",
    articleType: "jacket",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
    style: "дитячий",
  },
  {
    category: "children",
    subcategory: "штани",
    color: "чорний",
    articleType: "trousers",
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop",
    style: "повсякденний",
  },
  // Accessories
  {
    category: "accessories",
    subcategory: "сумка",
    color: "чорний",
    articleType: "bag",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
    style: "елегантний",
  },
  {
    category: "accessories",
    subcategory: "сумка",
    color: "коричневий",
    articleType: "bag",
    imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop",
    style: "класичний",
  },
  {
    category: "accessories",
    subcategory: "ремінь",
    color: "чорний",
    articleType: "belt",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=800&h=800&fit=crop",
    style: "діловий",
  },
  // Footwear
  {
    category: "footwear",
    subcategory: "кросівки",
    color: "білий",
    articleType: "sneakers",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
    style: "спортивний",
  },
  {
    category: "footwear",
    subcategory: "туфлі",
    color: "чорний",
    articleType: "shoes",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop",
    style: "діловий",
  },
  {
    category: "footwear",
    subcategory: "черевики",
    color: "коричневий",
    articleType: "boots",
    imageUrl: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800&h=800&fit=crop",
    style: "класичний",
  },
];

// Generate description based on item data
function generateDescription(item: typeof clothingItems[0]): string {
  const conditionTexts: { [key: string]: string } = {
    new: "Новий товар, ніколи не носився. Відмінна якість та стан.",
    "like-new": "Відмінний стан, носився дуже мало. Виглядає як новий.",
    used: "Добре використовувався, але все ще в хорошому стані. Ідеально підходить для повсякденного носіння.",
    "with-defects": "Має невеликі дефекти, але все ще придатний до використання. Відмінна ціна для такого стану.",
  };

  const condition = ["new", "like-new", "used", "with-defects"][
    Math.floor(Math.random() * 4)
  ] as keyof typeof conditionTexts;

  return `${item.subcategory.charAt(0).toUpperCase() + item.subcategory.slice(1)} кольору ${item.color}. ${conditionTexts[condition]} Стиль: ${item.style}. Ідеально підходить для екологічно свідомих покупців, які хочуть дати речам другий шанс.`;
}

// Generate title
function generateTitle(item: typeof clothingItems[0]): string {
  const brandNames = [
    "Second Chance",
    "EcoStyle",
    "GreenWear",
    "ReFashion",
    "Vintage",
    "Classic",
  ];
  const brand = brandNames[Math.floor(Math.random() * brandNames.length)];
  return `${brand} ${item.subcategory} ${item.color}`;
}

// Generate size based on category
function generateSize(category: string): string {
  const sizes = {
    men: ["S", "M", "L", "XL"],
    women: ["XS", "S", "M", "L"],
    children: ["4 роки", "6 років", "8 років", "10 років"],
    accessories: ["Універсальний"],
    footwear: ["38", "39", "40", "41", "42"],
  };

  const categorySizes = sizes[category as keyof typeof sizes] || sizes.men;
  return categorySizes[Math.floor(Math.random() * categorySizes.length)];
}

// Generate price based on subcategory
function generatePrice(subcategory: string): number {
  const basePrices: { [key: string]: number } = {
    куртка: 60,
    футболка: 15,
    сорочка: 25,
    джинси: 35,
    штани: 30,
    світер: 30,
    сукня: 40,
    топ: 20,
    спідниця: 25,
    курта: 35,
    сумка: 25,
    ремінь: 15,
    кросівки: 45,
    туфлі: 35,
    черевики: 50,
  };

  const basePrice = basePrices[subcategory] || 25;
  const multipliers: { [key: string]: number } = {
    new: 1.0,
    "like-new": 0.8,
    used: 0.6,
    "with-defects": 0.4,
  };

  const condition = ["new", "like-new", "used", "with-defects"][
    Math.floor(Math.random() * 4)
  ] as keyof typeof multipliers;

  return Math.max(5, Math.round(basePrice * multipliers[condition]));
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
    "Галина", "Надія", "Лариса", "Ольга", "Інна", "Любов"
  ]
};

const ukrainianLastNames = [
  "Петренко", "Коваленко", "Шевченко", "Мельник", "Бондаренко", "Кравченко",
  "Ткаченко", "Мороз", "Коваль", "Шевчук", "Бондар", "Ткачук", "Кравчук",
  "Олійник", "Шевцов", "Поліщук", "Савченко", "Бондарчук", "Ковальчук",
  "Романенко", "Василенко", "Павленко", "Дмитренко", "Іваненко", "Сергієнко"
];

const ukrainianCities = [
  "Київ", "Харків", "Одеса", "Дніпро", "Львів", "Запоріжжя", "Вінниця",
  "Полтава", "Чернівці", "Хмельницький", "Рівне", "Івано-Франківськ",
  "Тернопіль", "Луцьк", "Ужгород", "Суми", "Черкаси", "Кропивницький",
  "Миколаїв", "Херсон", "Маріуполь", "Краматорськ", "Слов'янськ", "Мелітополь",
  "Бердянськ", "Кременчук", "Нікополь", "Біла Церква", "Житомир", "Чернігів"
];

// Create Ukrainian users
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

    let email: string;
    let emailCounter = 0;
    do {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailCounter > 0 ? emailCounter : ""}@example.com`;
      emailCounter++;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    let username: string;
    let usernameCounter = 0;
    do {
      username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${usernameCounter > 0 ? usernameCounter : ""}`;
      usernameCounter++;
    } while (usedUsernames.has(username));
    usedUsernames.add(username);

    const user = {
      email,
      password: "password123",
      username,
      firstName,
      lastName,
      isEmailVerified: true,
      bio: `Прихильник екологічної моди з ${city}. Даю речам другий шанс!`,
      location: `${city}, Україна`,
      telegram: `@${username}`,
      phone: `+380${Math.floor(100000000 + Math.random() * 900000000)}`,
      _isMale: isMale,
    };

    users.push(user);
  }

  const createdUsers = await User.insertMany(users);
  return createdUsers.map((user, index) => ({
    ...user.toObject(),
    _isMale: users[index]._isMale,
  }));
}

const seedFromInternetImages = async () => {
  try {
    await connectDB();

    // Clean database
    console.log("Cleaning database...");
    await Post.deleteMany({});
    await User.deleteMany({});
    console.log("Database cleaned");

    // Create users
    console.log("Creating Ukrainian users...");
    const users = await createUkrainianUsers(30);
    const maleUsers = users.filter((u) => u._isMale);
    const femaleUsers = users.filter((u) => !u._isMale);
    console.log(`Created ${users.length} users (${maleUsers.length} men, ${femaleUsers.length} women)`);

    // Process items
    console.log("Processing items...");
    const posts = [];
    let maleItemIndex = 0;
    let femaleItemIndex = 0;

    // Helper function to truncate string
    const truncate = (str: string | undefined, maxLength: number): string => {
      if (!str) return "";
      return str.length > maxLength ? str.substring(0, maxLength) : str;
    };

    // Helper function to get main color
    const getMainColor = (colorStr: string | undefined): string => {
      if (!colorStr) return "Невідомий";
      const firstWord = colorStr.split(" ")[0];
      if (firstWord.length <= 30) {
        return firstWord;
      }
      return truncate(colorStr, 30);
    };

    for (let i = 0; i < clothingItems.length; i++) {
      const item = clothingItems[i];

      // Determine user based on category
      let user;
      if (item.category === "women" && femaleUsers.length > 0) {
        user = femaleUsers[femaleItemIndex % femaleUsers.length];
        femaleItemIndex++;
      } else if (item.category === "children" && maleUsers.length > 0) {
        user = maleUsers[maleItemIndex % maleUsers.length];
        maleItemIndex++;
      } else if (maleUsers.length > 0) {
        user = maleUsers[maleItemIndex % maleUsers.length];
        maleItemIndex++;
      } else if (femaleUsers.length > 0) {
        user = femaleUsers[femaleItemIndex % femaleUsers.length];
        femaleItemIndex++;
      } else {
        console.error("No users available!");
        continue;
      }

      // Generate fields
      const condition = ["new", "like-new", "used", "with-defects"][
        Math.floor(Math.random() * 4)
      ] as "new" | "like-new" | "used" | "with-defects";
      const size = generateSize(item.category);
      const price = generatePrice(item.subcategory);
      const title = generateTitle(item);
      const description = generateDescription(item);

      // Create post
      const post = {
        user: user._id,
        title: truncate(title, 100),
        description: truncate(description, 2000),
        images: [item.imageUrl],
        category: item.category as "men" | "women" | "children" | "accessories" | "footwear",
        subcategory: truncate(item.subcategory, 50),
        size: truncate(size, 20),
        brand: truncate("Second Chance", 50),
        material: truncate("Бавовна", 100),
        condition: condition,
        conditionDetails: truncate(item.style, 500),
        price: price,
        color: getMainColor(item.color),
        season: ["all-season"],
        tags: [item.style, "екологічний", "second-hand", "сталий"],
        location: user.location || "Україна",
        isPublic: true,
        status: "active" as const,
        views: Math.floor(Math.random() * 200),
        likesCount: Math.floor(Math.random() * 30),
        commentsCount: Math.floor(Math.random() * 10),
      };

      posts.push(post);
      console.log(`✅ Item ${i + 1}/${clothingItems.length} processed: ${item.subcategory} ${item.color}`);
    }

    // Insert posts
    if (posts.length > 0) {
      console.log(`\nInserting ${posts.length} posts into database...`);
      const createdPosts = await Post.insertMany(posts);
      console.log(`✅ Successfully created ${createdPosts.length} posts!`);
      console.log("\nSummary:");
      console.log(`- Posts created: ${createdPosts.length}`);
      console.log(`- Users: ${users.length}`);
      console.log(`- Categories: ${new Set(createdPosts.map((p) => p.category)).size} unique`);
    } else {
      console.log("No posts were created");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding from internet images:", error);
    process.exit(1);
  }
};

seedFromInternetImages();

