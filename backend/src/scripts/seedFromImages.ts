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

// Helper function to parse CSV
function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

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
    values.push(current.trim());

    if (values.length >= headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        let value = values[index] || "";
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

// Download image from URL
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(filepath);
    let redirectCount = 0;
    const maxRedirects = 5;

    const download = (currentUrl: string) => {
      protocol
        .get(currentUrl, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            redirectCount++;
            if (redirectCount > maxRedirects) {
              file.close();
              if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
              }
              reject(new Error("Too many redirects"));
              return;
            }
            const redirectUrl = response.headers.location;
            if (!redirectUrl) {
              file.close();
              if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
              }
              reject(new Error("Redirect without location"));
              return;
            }
            const absoluteUrl = redirectUrl.startsWith("http")
              ? redirectUrl
              : new URL(redirectUrl, currentUrl).toString();
            file.close();
            download(absoluteUrl);
            return;
          }
          if (response.statusCode !== 200) {
            file.close();
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        })
        .on("error", (err) => {
          file.close();
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          reject(err);
        })
        .setTimeout(30000, () => {
          file.close();
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          reject(new Error("Download timeout"));
        });
    };

    download(url);
  });
}

// Analyze image with Gemini (with retry logic)
async function analyzeImageWithGemini(
  imagePath: string,
  retries = 3
): Promise<{
  category?: string;
  subcategory?: string;
  color?: string;
  brand?: string;
  material?: string;
  condition?: string;
  style?: string;
  title?: string;
  description?: string;
  suggestedTags?: string[];
}> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64 = imageBuffer.toString("base64");
      const mimeType = path.extname(imagePath).toLowerCase() === ".png" ? "image/png" : "image/jpeg";

    const prompt = `Ти професійний аналітик товарів для маркетплейсу секонд-хенду "Second Chance".
Проаналізуй це зображення товару та витягни всю можливу інформацію.

ВАЖЛИВО: Аналізуй ТІЛЬКИ те, що бачиш на зображенні. Не використовуй жодних припущень.

Витягни наступну інформацію:
1. Категорія: одна з "men", "women", "children", "accessories", або "footwear" (визначи на основі зображення)
2. Підкатегорія: конкретний тип товару українською (наприклад, "куртка", "футболка", "джинси", "сукня")
3. Колір: основний колір товару українською (наприклад, "чорний", "синій", "білий")
4. Бренд: назва бренду, якщо видно на етикетці, тегу або логотипі (null, якщо не видно)
5. Матеріал: тип матеріалу українською, якщо можна визначити (наприклад, "бавовна", "шкіра", "шерсть")
6. Стан: оціни стан як "new", "like-new", "used", або "with-defects"
7. Стиль: ключові слова стилю українською (наприклад, "повсякденний", "діловий", "спортивний")
8. Назва: приваблива назва товару українською (макс 100 символів)
9. Опис: детальний опис товару українською (макс 500 символів), який точно описує що видно на зображенні
10. Теги: масив релевантних тегів українською (3-5 тегів)

Поверни ЛИШЕ валідний JSON у цьому форматі:
{
  "category": "men" | "women" | "children" | "accessories" | "footwear" | null,
  "subcategory": "string or null",
  "color": "string or null",
  "brand": "string or null",
  "material": "string or null",
  "condition": "new" | "like-new" | "used" | "with-defects" | null,
  "style": "string or null",
  "title": "string",
  "description": "string",
  "suggestedTags": ["tag1", "tag2", ...] or []
}

Не включай жодного тексту до або після JSON. Поверни лише JSON об'єкт.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: parsed.category || undefined,
        subcategory: parsed.subcategory || undefined,
        color: parsed.color || undefined,
        brand: parsed.brand || undefined,
        material: parsed.material || undefined,
        condition: parsed.condition || "used",
        style: parsed.style || undefined,
        title: parsed.title || "Товар",
        description: parsed.description || "Опис товару",
        suggestedTags: parsed.suggestedTags || [],
      };
    }

      throw new Error("Failed to parse JSON from Gemini");
    } catch (error: any) {
      const errorMessage = error.message || "";
      const isRateLimit =
        errorMessage.includes("429") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("Too Many Requests") ||
        error.status === 429;

      if (isRateLimit && attempt < retries - 1) {
        const waitTime = Math.pow(2, attempt + 1) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Rate limit hit, waiting ${waitTime / 1000}s before retry ${attempt + 2}/${retries}...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (attempt === retries - 1) {
        console.error(`Error analyzing image ${imagePath} after ${retries} attempts:`, error.message);
        throw error;
      }
    }
  }
  throw new Error("Failed to analyze image after all retries");
}

// Generate size based on category
function generateSize(category: string): string {
  const sizes = {
    men: ["S", "M", "L", "XL"],
    women: ["XS", "S", "M", "L"],
    children: ["4 роки", "6 років", "8 років", "10 років"],
  };

  const categorySizes = sizes[category as keyof typeof sizes] || sizes.men;
  return categorySizes[Math.floor(Math.random() * categorySizes.length)];
}

// Generate price based on condition
function generatePrice(condition: string, subcategory: string): number {
  const basePrices: { [key: string]: number } = {
    куртка: 60,
    футболка: 15,
    сорочка: 25,
    джинси: 35,
    штани: 30,
    светр: 30,
    сукня: 40,
    топ: 20,
    спідниця: 25,
    курта: 35,
  };

  const basePrice = basePrices[subcategory?.toLowerCase() || ""] || 25;
  const multipliers: { [key: string]: number } = {
    new: 1.0,
    "like-new": 0.8,
    used: 0.6,
    "with-defects": 0.4,
  };

  return Math.max(5, Math.round(basePrice * (multipliers[condition] || 0.6)));
}

// Map season
function mapSeason(season: string): string[] {
  const seasonMap: { [key: string]: string } = {
    spring: "spring",
    summer: "summer",
    fall: "fall",
    autumn: "fall",
    winter: "winter",
  };

  const seasonLower = season.toLowerCase();
  if (seasonMap[seasonLower]) {
    return [seasonMap[seasonLower]];
  }
  return ["all-season"];
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

const seedFromImages = async () => {
  try {
    await connectDB();

    // Clean database
    console.log("Cleaning database...");
    await Post.deleteMany({});
    await User.deleteMany({});
    console.log("Database cleaned");

    // Read CSV
    console.log("Reading CSV file...");
    const csvPath = path.join(__dirname, "../data/clothes_data.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const rows = parseCSV(csvContent);

    // Filter for Apparel only
    const clothesRows = rows.filter((row) => row.masterCategory === "Apparel");
    console.log(`Found ${clothesRows.length} clothes items in CSV`);

    if (clothesRows.length === 0) {
      console.error("No clothes found in CSV!");
      process.exit(1);
    }

    // Get random 30 items
    const shuffled = clothesRows.sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, Math.min(30, shuffled.length));
    console.log(`Selected ${selectedItems.length} random items`);

    // Create temp directory for images
    const tempDir = path.join(__dirname, "../../temp_images");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create users
    console.log("Creating Ukrainian users...");
    const users = await createUkrainianUsers(30);
    const maleUsers = users.filter((u) => u._isMale);
    const femaleUsers = users.filter((u) => !u._isMale);
    console.log(`Created ${users.length} users (${maleUsers.length} men, ${femaleUsers.length} women)`);

    // Process items
    console.log("Processing items and analyzing images...");
    const posts = [];
    let maleItemIndex = 0;
    let femaleItemIndex = 0;

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      const imageUrl = item.image_link;

      if (!imageUrl || !imageUrl.trim()) {
        console.log(`Skipping item ${i + 1}: no image URL`);
        continue;
      }

      try {
        console.log(`\nProcessing item ${i + 1}/${selectedItems.length}...`);
        console.log(`Image URL: ${imageUrl}`);

        // Download image
        const imageExt = path.extname(new URL(imageUrl).pathname) || ".jpg";
        const tempImagePath = path.join(tempDir, `temp_${i}_${Date.now()}${imageExt}`);

        console.log("Downloading image...");
        await downloadImage(imageUrl, tempImagePath);
        console.log("Image downloaded");

        // Analyze with Gemini
        console.log("Analyzing image with Gemini...");
        const analysis = await analyzeImageWithGemini(tempImagePath);
        console.log("Analysis complete:", {
          category: analysis.category,
          subcategory: analysis.subcategory,
          color: analysis.color,
        });

        // Clean up temp image
        fs.unlinkSync(tempImagePath);

        // Determine user based on category
        let user;
        if (analysis.category === "women" && femaleUsers.length > 0) {
          user = femaleUsers[femaleItemIndex % femaleUsers.length];
          femaleItemIndex++;
        } else if (analysis.category === "children" && maleUsers.length > 0) {
          // Children items go to male users
          user = maleUsers[maleItemIndex % maleUsers.length];
          maleItemIndex++;
        } else if (maleUsers.length > 0) {
          // Default to male users for men/accessories/footwear
          user = maleUsers[maleItemIndex % maleUsers.length];
          maleItemIndex++;
        } else if (femaleUsers.length > 0) {
          // Fallback to female users if no male users
          user = femaleUsers[femaleItemIndex % femaleUsers.length];
          femaleItemIndex++;
        } else {
          console.error("No users available!");
          continue;
        }

        // Generate additional fields
        const size = generateSize(analysis.category || "men");
        const price = generatePrice(analysis.condition || "used", analysis.subcategory || "");
        const season = mapSeason(item.season);

        // Helper function to truncate string to max length
        const truncate = (str: string | undefined, maxLength: number): string => {
          if (!str) return "";
          return str.length > maxLength ? str.substring(0, maxLength) : str;
        };

        // Extract main color (first word or first 30 chars)
        const getMainColor = (colorStr: string | undefined): string => {
          if (!colorStr) return "Невідомий";
          // Try to get first color word (e.g., "білий" from "білий з рожевим")
          const firstWord = colorStr.split(" ")[0];
          if (firstWord.length <= 30) {
            return firstWord;
          }
          // If first word is too long, truncate the whole string
          return truncate(colorStr, 30);
        };

        // Create post
        const post = {
          user: user._id,
          title: truncate(analysis.title || "Товар", 100),
          description: truncate(analysis.description || "Опис товару", 2000),
          images: [imageUrl],
          category: (analysis.category as "men" | "women" | "children" | "accessories" | "footwear") || "men",
          subcategory: truncate(analysis.subcategory || "", 50),
          size: truncate(size, 20),
          brand: truncate(analysis.brand || "Невідомий", 50),
          material: truncate(analysis.material || "Бавовна", 100),
          condition: (analysis.condition as "new" | "like-new" | "used" | "with-defects") || "used",
          conditionDetails: truncate(analysis.style || "Звичайне використання", 500),
          price: price,
          color: getMainColor(analysis.color),
          season: season,
          tags: analysis.suggestedTags || ["екологічний", "second-hand", "сталий"],
          location: user.location || "Україна",
          isPublic: true,
          status: "active" as const,
          views: Math.floor(Math.random() * 200),
          likesCount: Math.floor(Math.random() * 30),
          commentsCount: Math.floor(Math.random() * 10),
        };

        posts.push(post);
        console.log(`✅ Item ${i + 1} processed successfully`);

        // Add delay to avoid rate limiting (2 seconds between requests)
        if (i < selectedItems.length - 1) {
          console.log("Waiting 2 seconds before next request...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.error(`❌ Error processing item ${i + 1}:`, error.message);
        // Continue with next item
        continue;
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
      fs.rmdirSync(tempDir);
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
    console.error("Error seeding from images:", error);
    process.exit(1);
  }
};

seedFromImages();

