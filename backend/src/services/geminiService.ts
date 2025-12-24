import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Lazy initialization - get API key when needed
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set in environment variables. Please add it to your .env file."
    );
  }
  return new GoogleGenerativeAI(apiKey);
};

// Helper to convert image to base64
const imageToBase64 = (imagePath: string): string => {
  // Handle both full paths (/uploads/filename.jpg) and just filenames
  const filename = imagePath.startsWith("/uploads/")
    ? imagePath.replace("/uploads/", "")
    : imagePath;
  const fullPath = path.join(process.env.UPLOAD_PATH || "./uploads", filename);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Image not found: ${fullPath}`);
  }

  const imageBuffer = fs.readFileSync(fullPath);
  return imageBuffer.toString("base64");
};

// Helper to get mime type from file extension
const getMimeType = (filePath: string): string => {
  // Extract filename from path
  const filename = filePath.includes("/") ? path.basename(filePath) : filePath;
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimeTypes[ext] || "image/jpeg";
};

export const geminiService = {
  // Generate product description from images and basic info
  generateDescription: async (
    imagePaths: string[],
    productInfo: {
      category?: string;
      condition?: string;
      brand?: string;
      material?: string;
      color?: string;
    }
  ): Promise<{ title: string; description: string }> => {
    try {
      const genAI = getGenAI();
      // Use gemini-2.5-flash for fast image analysis and description generation
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Prepare image parts
      const imageParts = imagePaths.slice(0, 4).map((imgPath) => {
        const base64 = imageToBase64(imgPath);
        const mimeType = getMimeType(imgPath);
        return {
          inlineData: {
            data: base64,
            mimeType,
          },
        };
      });

      const prompt = `Ти професійний копірайтер для маркетплейсу секонд-хенду "Second Chance".
Проаналізуй ці зображення товару та згенеруй як привабливу назву, так і детальний опис товару.

Інформація про товар:
- Категорія: ${productInfo.category || "не вказано"}
- Стан: ${productInfo.condition || "не вказано"}
- Бренд: ${productInfo.brand || "не вказано"}
- Матеріал: ${productInfo.material || "не вказано"}
- Колір: ${productInfo.color || "не вказано"}

Вимоги:
1. Згенеруй назву (макс 100 символів), яка є привабливою, описовою та включає ключові деталі
2. Згенеруй опис (макс 500 символів), який:
   - Чесно та точно описує стан товару
   - Підкреслює ключові переваги та унікальні особливості
   - Описує стиль, посадку та зовнішній вигляд
   - Згадує якість матеріалу, якщо видно
   - Включає будь-які видимі деталі (ґудзики, блискавки, візерунки тощо)
   - Є професійним, але дружнім
3. Пиши українською мовою
4. НЕ використовуй markdown форматування (ніяких **, ##, *, списків з - або 1.)
5. Описи мають бути у звичайному тексті, без форматування

Поверни результат у цьому точному JSON форматі:
{
  "title": "Згенерована назва тут",
  "description": "Згенерований опис тут"
}

Не включай жодного тексту до або після JSON. Поверни лише JSON об'єкт.`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = result.response;
      const text = response.text();

      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || "",
          description: parsed.description || "",
        };
      }

      // Fallback: if JSON parsing fails, try to extract title and description
      // This is a backup in case the AI doesn't return proper JSON
      const lines = text.split("\n").filter((line) => line.trim());
      const title = lines[0]?.substring(0, 100) || "";
      const description =
        lines.slice(1).join("\n").substring(0, 2000) || text.substring(0, 2000);

      return { title, description };
    } catch (error: any) {
      // Check for rate limiting errors
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("429") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("Too Many Requests") ||
        error.status === 429
      ) {
        throw new Error("429 Too Many Requests - Rate limit exceeded");
      }
      throw new Error(
        `Failed to generate description: ${errorMessage || "Unknown error"}`
      );
    }
  },

  // Analyze images to extract product information
  analyzeImages: async (
    imagePaths: string[]
  ): Promise<{
    category?: string;
    subcategory?: string;
    color?: string;
    brand?: string;
    material?: string;
    condition?: string;
    style?: string;
    suggestedTags?: string[];
  }> => {
    try {
      const genAI = getGenAI();
      // Use gemini-2.5-flash for fast image analysis and description generation
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Prepare image parts
      const imageParts = imagePaths.slice(0, 4).map((imgPath) => {
        const base64 = imageToBase64(imgPath);
        const mimeType = getMimeType(imgPath);
        return {
          inlineData: {
            data: base64,
            mimeType,
          },
        };
      });

      const prompt = `Проаналізуй ці зображення товару з маркетплейсу секонд-хенду та витягни інформацію про товар.

Витягни наступну інформацію:
1. Категорія: одна з "men", "women", "children", "accessories", або "footwear"
2. Підкатегорія: конкретний тип (наприклад, "dress", "jacket", "shoes", "handbag")
3. Колір: назва основного кольору
4. Бренд: назва бренду, якщо видно на етикетці, тегу або логотипі (поверни null, якщо не видно)
5. Матеріал: тип матеріалу, якщо можна визначити (наприклад, "cotton", "wool", "leather")
6. Стан: оціни стан як "new", "like-new", "used", або "with-defects"
7. Стиль: ключові слова стилю (наприклад, "casual", "formal", "vintage", "sporty")
8. Запропоновані теги: масив релевантних тегів (3-5 тегів)

ВАЖЛИВО: Поверни ЛИШЕ валідний JSON у цьому точному форматі:
{
  "category": "men" | "women" | "children" | "accessories" | "footwear" | null,
  "subcategory": "string or null",
  "color": "string or null",
  "brand": "string or null",
  "material": "string or null",
  "condition": "new" | "like-new" | "used" | "with-defects" | null,
  "style": "string or null",
  "suggestedTags": ["tag1", "tag2", ...] or []
}

Не включай жодного тексту до або після JSON. Поверни лише JSON об'єкт.`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = result.response;
      const text = response.text();

      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || undefined,
          subcategory: parsed.subcategory || undefined,
          color: parsed.color || undefined,
          brand: parsed.brand || undefined,
          material: parsed.material || undefined,
          condition: parsed.condition || undefined,
          style: parsed.style || undefined,
          suggestedTags: parsed.suggestedTags || [],
        };
      }

      throw new Error("Failed to parse JSON response from Gemini");
    } catch (error: any) {
      // Check for rate limiting errors
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("429") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("Too Many Requests") ||
        error.status === 429
      ) {
        throw new Error("429 Too Many Requests - Rate limit exceeded");
      }
      throw new Error(
        `Failed to analyze images: ${errorMessage || "Unknown error"}`
      );
    }
  },

  // Enhance search query to structured filters
  enhanceSearch: async (
    query: string
  ): Promise<{
    category?: string;
    condition?: string[];
    tags?: string[];
    color?: string;
    season?: string[];
    material?: string;
    searchTerms?: string;
  }> => {
    try {
      const genAI = getGenAI();
      // Use gemini-2.5-flash for fast search enhancement
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are a search assistant for a second-hand clothing marketplace "Second Chance".
Convert the user's search query into structured filters.

User Query: "${query}"

Available categories: "men", "women", "children", "accessories", "footwear"
Available conditions: "new", "like-new", "used", "with-defects"
Available seasons: "spring", "summer", "fall", "winter", "all-season"

IMPORTANT: The query can be in Ukrainian. Interpret it correctly:

CATEGORIES (Ukrainian → English):
- "чоловіче", "чоловічий", "для чоловіків" → "men"
- "жіноче", "жіночий", "для жінок" → "women"
- "дитяче", "для дітей", "дитячий" → "children"
- "аксесуари", "сумка", "рюкзак", "шарф", "капелюх", "шапка", "рукавиці", "перчатки", "ремінь", "пояс" → "accessories"
- "взуття", "чоботи", "кросівки", "кеди", "туфлі", "ботинки", "сандалі", "шльопанці" → "footwear"

SEASONS (Ukrainian → English):
- "зима", "зимовий", "зимова", "тепле", "теплий", "для зими", "на зиму", "зимовий одяг" → ["winter"]
- "літо", "літній", "літня", "легке", "легкий", "для літа", "на літо" → ["summer"]
- "весна", "весняний", "весняна", "для весни", "на весну" → ["spring"]
- "осінь", "осінній", "осіння", "для осені", "на осінь" → ["fall"]

EXAMPLES:
- "рюкзак" → {"category": "accessories", "searchTerms": "рюкзак backpack bag"}
- "щось тепле на зиму" → {"season": ["winter"], "searchTerms": "тепле куртка пальто шуба jacket coat warm winter"}
- "зимова куртка" → {"season": ["winter"], "searchTerms": "куртка зимова jacket coat winter"}
- "чоловічі кросівки" → {"category": "men", "searchTerms": "кросівки чоловічі sneakers shoes"}
- "жіноча сукня" → {"category": "women", "searchTerms": "сукня жіноча dress"}
- "дитячі чоботи" → {"category": "children", "searchTerms": "чоботи дитячі boots shoes"}

Extract and return:
1. category: if gender or item type is mentioned (for "рюкзак" → "accessories", for "кросівки" → "footwear")
2. condition: array of acceptable conditions (can be multiple, or null)
3. tags: array of relevant style/type tags (e.g., "elegant", "casual", "formal", "vintage", "sporty")
4. color: if color is mentioned (e.g., "чорний" → "black", "білий" → "white")
5. season: array of seasons if mentioned (e.g., ["winter"] for "тепле на зиму")
6. material: if material is mentioned (e.g., "шкіра" → "leather", "бавовна" → "cotton")
7. searchTerms: key search terms for text search - MUST include original query + English equivalents of Ukrainian words (e.g., "рюкзак" → "рюкзак backpack bag", "куртка" → "куртка jacket coat")

CRITICAL RULES:
- searchTerms MUST include both Ukrainian and English words for better search
- If query is vague (e.g., "щось тепле"), use searchTerms to describe needed items
- Return ONLY valid JSON in this exact format:

{
  "category": "men" | "women" | "children" | "accessories" | "footwear" | null,
  "condition": ["new", "like-new"] or null,
  "tags": ["tag1", "tag2"] or null,
  "color": "string or null",
  "season": ["winter", "summer"] or null,
  "material": "string or null",
  "searchTerms": "string or null"
}

Do not include any text before or after JSON. Return only the JSON object.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Try to extract JSON from response
      // Remove markdown code blocks if present
      let cleanedText = text.trim();
      cleanedText = cleanedText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "");

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            category: parsed.category || undefined,
            condition: parsed.condition || undefined,
            tags: parsed.tags || undefined,
            color: parsed.color || undefined,
            season: parsed.season || undefined,
            material: parsed.material || undefined,
            searchTerms: parsed.searchTerms || undefined,
          };
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Response text:", text);
          throw new Error("Failed to parse JSON response from Gemini");
        }
      }

      console.error("No JSON found in response:", text);
      throw new Error("Failed to parse JSON response from Gemini");
    } catch (error: any) {
      // Check for rate limiting errors
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("429") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("Too Many Requests") ||
        error.status === 429
      ) {
        throw new Error("429 Too Many Requests - Rate limit exceeded");
      }
      throw new Error(
        `Failed to enhance search: ${errorMessage || "Unknown error"}`
      );
    }
  },
};
