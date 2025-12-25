import dotenv from "dotenv";
import connectDB from "../config/database";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import Like from "../models/Like";
import Review from "../models/Review";
import Notification from "../models/Notification";
import Order from "../models/Order";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Drop all collections first
    console.log("Dropping all collections...");
    const mongoose = require("mongoose");
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      try {
        await db.collection(collection.name).drop();
        console.log(`Dropped collection: ${collection.name}`);
      } catch (error: any) {
        if (error.codeName !== "NamespaceNotFound") {
          console.error(`Error dropping ${collection.name}:`, error.message);
        }
      }
    }

    // Clear existing data (backup in case drop didn't work)
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await Order.deleteMany({});

    // Create users
    console.log("Creating users...");
    const users = await User.create([
      {
        email: "admin@example.com",
        password: "password123",
        username: "admin",
        firstName: "Адмін",
        lastName: "Користувач",
        role: "admin",
        isEmailVerified: true,
        bio: "Адміністратор платформи",
        location: "Київ, Україна",
        telegram: "@admin_sc",
        phone: "+380501234567",
      },
      {
        email: "john@example.com",
        password: "password123",
        username: "john_doe",
        firstName: "Іван",
        lastName: "Петренко",
        isEmailVerified: true,
        bio: "Ентузіаст моди та прихильник екологічної моди",
        location: "Львів, Україна",
        telegram: "@ivan_petrenko",
        phone: "+380501234568",
      },
      {
        email: "jane@example.com",
        password: "password123",
        username: "jane_smith",
        firstName: "Марія",
        lastName: "Коваленко",
        isEmailVerified: true,
        bio: "Люблю вінтажний одяг та екологічну моду",
        location: "Одеса, Україна",
        telegram: "@maria_kovalenko",
        phone: "+380501234569",
      },
      {
        email: "mike@example.com",
        password: "password123",
        username: "mike_wilson",
        firstName: "Олександр",
        lastName: "Мельник",
        isEmailVerified: true,
        bio: "Батько, шукаю дитячий одяг",
        location: "Харків, Україна",
        telegram: "@oleksandr_melnyk",
        phone: "+380501234570",
      },
      {
        email: "sarah@example.com",
        password: "password123",
        username: "sarah_jones",
        firstName: "Олена",
        lastName: "Шевченко",
        isEmailVerified: true,
        bio: "Блогерка про екологічну моду",
        location: "Дніпро, Україна",
        telegram: "@olena_shevchenko",
        phone: "+380501234571",
      },
    ]);

    console.log(`Created ${users.length} users`);

    // Create posts
    console.log("Creating posts...");
    const posts = await Post.create([
      // Чоловічий одяг (Men)
      {
        user: users[1]._id,
        title: "Вінтажна джинсова куртка - чудовий стан",
        description:
          "Чудова вінтажна джинсова куртка у відмінному стані. Майже не носилася, без плям та розривів. Ідеальна для весняного та осіннього сезонів. Розмір M, сидить як S-M.",
        images: [
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=800&fit=crop",
        ],
        category: "men",
        subcategory: "Jackets",
        size: "M",
        brand: "Levi's",
        material: "100% Cotton Denim",
        condition: "like-new",
        conditionDetails: "Носилася лише кілька разів, виглядає як нова",
        price: 45,
        color: "Blue",
        season: ["spring", "fall"],
        tags: ["vintage", "denim", "jacket", "levis", "eco-friendly"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 120,
        likesCount: 15,
        commentsCount: 5,
      },
      {
        user: users[1]._id,
        title: "Чоловіча біла сорочка - класичний стиль",
        description:
          "Елегантна біла сорочка для офісу або особливих випадків. Якісна бавовняна тканина, добре прасується. Розмір L.",
        images: [
          "https://images.unsplash.com/photo-1594938291221-94f18dd6d426?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&h=800&fit=crop",
        ],
        category: "men",
        subcategory: "Shirts",
        size: "L",
        brand: "Zara",
        material: "Cotton",
        condition: "like-new",
        conditionDetails: "Носилася кілька разів, добре доглянута",
        price: 25,
        color: "White",
        season: ["all-season"],
        tags: ["shirt", "formal", "office", "classic", "white"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 95,
        likesCount: 12,
        commentsCount: 3,
      },
      {
        user: users[1]._id,
        title: "Чоловічі джинси - сині класичні",
        description:
          "Класичні сині джинси прямого крою. Зручні та універсальні, підходять для будь-якого стилю. Розмір 32x32.",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
        ],
        category: "men",
        subcategory: "Jeans",
        size: "32x32",
        brand: "H&M",
        material: "98% Cotton, 2% Elastane",
        condition: "used",
        conditionDetails: "Звичайне носіння, невеликий знос на колінах",
        price: 30,
        color: "Blue",
        season: ["all-season"],
        tags: ["jeans", "denim", "casual", "classic", "blue"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 110,
        likesCount: 18,
        commentsCount: 4,
      },
      {
        user: users[1]._id,
        title: "Чоловічий светр - в'язаний",
        description:
          "Теплий в'язаний светр з шерсті. Ідеальний для осінньо-зимового сезону. М'який та затишний. Розмір M.",
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
        ],
        category: "men",
        subcategory: "Sweaters",
        size: "M",
        brand: "Uniqlo",
        material: "Wool Blend",
        condition: "like-new",
        conditionDetails: "Носився один сезон, виглядає як нова",
        price: 35,
        color: "Gray",
        season: ["fall", "winter"],
        tags: ["sweater", "knit", "warm", "winter", "cozy"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 85,
        likesCount: 14,
        commentsCount: 2,
      },
      {
        user: users[1]._id,
        title: "Чоловічий спортивний костюм",
        description:
          "Зручний спортивний костюм для тренувань або щоденного носіння. Добре дихає, зручний крій. Розмір L.",
        images: [
          "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=800&fit=crop",
        ],
        category: "men",
        subcategory: "Sportswear",
        size: "L",
        brand: "Adidas",
        material: "Polyester",
        condition: "used",
        conditionDetails: "Використовувався для тренувань, але в хорошому стані",
        price: 50,
        color: "Black",
        season: ["all-season"],
        tags: ["sportswear", "athletic", "gym", "comfortable", "adidas"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 75,
        likesCount: 10,
        commentsCount: 1,
      },
      {
        user: users[1]._id,
        title: "Чоловіча зимова куртка - пуховик",
        description:
          "Тепла зимова куртка-пуховик. Відмінно зігріває в морозну погоду. Водонепроникна тканина. Розмір XL.",
        images: [
          "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=800&fit=crop",
        ],
        category: "men",
        subcategory: "Jackets",
        size: "XL",
        brand: "The North Face",
        material: "Nylon, Down",
        condition: "used",
        conditionDetails: "Носилася два сезони, але все ще в хорошому стані",
        price: 120,
        color: "Black",
        season: ["winter"],
        tags: ["jacket", "winter", "warm", "down", "waterproof"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 140,
        likesCount: 22,
        commentsCount: 6,
      },
      // Жіночий одяг (Women)
      {
        user: users[2]._id,
        title: "Дизайнерська сумка - вживана",
        description:
          "Чудова дизайнерська сумка у хорошому стані. Невеликий знос на ручках, але загалом відмінний стан. Ідеальна для щоденного використання або особливих випадків.",
        images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop",
        ],
        category: "accessories",
        subcategory: "Handbags",
        size: "One Size",
        brand: "Coach",
        material: "Leather",
        condition: "used",
        conditionDetails:
          "Невеликий знос на ручках, внутрішня частина в ідеальному стані",
        price: 85,
        color: "Brown",
        season: ["all-season"],
        tags: ["designer", "handbag", "coach", "leather", "vintage"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 200,
        likesCount: 25,
        commentsCount: 8,
      },
      {
        user: users[2]._id,
        title: "Літня сукня - квітковий принт",
        description:
          "Чудова квіткова літня сукня, ідеальна для теплої погоди. Легка та повітряна тканина, дуже зручна. Розмір S.",
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=800&fit=crop",
        ],
        category: "women",
        subcategory: "Dresses",
        size: "S",
        brand: "H&M",
        material: "Cotton",
        condition: "like-new",
        conditionDetails: "Носилася один раз, виглядає як нова",
        price: 20,
        color: "Multi-color",
        season: ["spring", "summer"],
        tags: ["dress", "summer", "floral", "casual", "eco-friendly"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 150,
        likesCount: 20,
        commentsCount: 6,
      },
      {
        user: users[2]._id,
        title: "Жіноча блузка - біла з мереживом",
        description:
          "Елегантна біла блузка з мереживними деталями. Підходить для офісу або особливих випадків. Розмір M.",
        images: [
          "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=800&fit=crop",
        ],
        category: "women",
        subcategory: "Blouses",
        size: "M",
        brand: "Zara",
        material: "Polyester, Lace",
        condition: "like-new",
        conditionDetails: "Носилася кілька разів, добре доглянута",
        price: 22,
        color: "White",
        season: ["all-season"],
        tags: ["blouse", "white", "lace", "elegant", "office"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 130,
        likesCount: 16,
        commentsCount: 4,
      },
      {
        user: users[2]._id,
        title: "Жіночі джинси - slim fit",
        description:
          "Стильні джинси slim fit. Добре сидять, зручні для щоденного носіння. Розмір 28.",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
        ],
        category: "women",
        subcategory: "Jeans",
        size: "28",
        brand: "Levi's",
        material: "98% Cotton, 2% Elastane",
        condition: "used",
        conditionDetails: "Звичайне носіння, невеликий знос",
        price: 35,
        color: "Blue",
        season: ["all-season"],
        tags: ["jeans", "slim", "denim", "casual", "levis"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 125,
        likesCount: 19,
        commentsCount: 5,
      },
      {
        user: users[2]._id,
        title: "Жіноча зимова куртка - довга",
        description:
          "Тепла довга зимова куртка. Відмінно зігріває, має капюшон. Водонепроникна. Розмір S.",
        images: [
          "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=800&fit=crop",
        ],
        category: "women",
        subcategory: "Jackets",
        size: "S",
        brand: "H&M",
        material: "Polyester, Down",
        condition: "used",
        conditionDetails: "Носилася один сезон, в хорошому стані",
        price: 80,
        color: "Black",
        season: ["winter"],
        tags: ["jacket", "winter", "warm", "long", "waterproof"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 180,
        likesCount: 28,
        commentsCount: 7,
      },
      {
        user: users[2]._id,
        title: "Жіноча спідниця - міді",
        description:
          "Стильна міді спідниця з підкресленою талією. Підходить для офісу або особливих випадків. Розмір M.",
        images: [
          "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=800&fit=crop",
        ],
        category: "women",
        subcategory: "Skirts",
        size: "M",
        brand: "Mango",
        material: "Polyester",
        condition: "like-new",
        conditionDetails: "Носилася кілька разів, виглядає як нова",
        price: 28,
        color: "Navy",
        season: ["all-season"],
        tags: ["skirt", "midi", "office", "elegant", "navy"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 105,
        likesCount: 15,
        commentsCount: 3,
      },
      {
        user: users[4]._id,
        title: "Жіноча сукня - вечірня",
        description:
          "Елегантна вечірня сукня для особливих випадків. Добре сидить, стильна. Розмір M.",
        images: [
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=800&fit=crop",
        ],
        category: "women",
        subcategory: "Dresses",
        size: "M",
        brand: "Zara",
        material: "Polyester",
        condition: "like-new",
        conditionDetails: "Носилася один раз на подію",
        price: 45,
        color: "Black",
        season: ["all-season"],
        tags: ["dress", "evening", "elegant", "formal", "black"],
        location: "Дніпро, Україна",
        isPublic: true,
        status: "active",
        views: 160,
        likesCount: 24,
        commentsCount: 5,
      },
      {
        user: users[4]._id,
        title: "Жіночий светр - в'язаний з вовни",
        description:
          "Теплий в'язаний светр з натуральної вовни. М'який та затишний. Ідеальний для осені та зими. Розмір L.",
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
        ],
        category: "women",
        subcategory: "Sweaters",
        size: "L",
        brand: "H&M",
        material: "Wool",
        condition: "used",
        conditionDetails: "Носився один сезон, в хорошому стані",
        price: 30,
        color: "Beige",
        season: ["fall", "winter"],
        tags: ["sweater", "knit", "wool", "warm", "cozy"],
        location: "Дніпро, Україна",
        isPublic: true,
        status: "active",
        views: 115,
        likesCount: 17,
        commentsCount: 4,
      },
      // Дитячий одяг (Children)
      {
        user: users[3]._id,
        title: "Дитячі зимові чоботи - розмір 8",
        description:
          "Теплі та затишні зимові чоботи для дітей. Водонепроникні та у відмінному стані. Моя дитина з них виросла, але вони ще мають багато життя!",
        images: [
          "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=800&fit=crop",
        ],
        category: "children",
        subcategory: "Footwear",
        size: "8",
        brand: "Timberland",
        material: "Leather and Rubber",
        condition: "used",
        conditionDetails: "Добре доглянуті, чистилися після кожного використання",
        price: 30,
        color: "Brown",
        season: ["winter"],
        tags: ["kids", "boots", "winter", "waterproof", "timberland"],
        location: "Харків, Україна",
        isPublic: true,
        status: "active",
        views: 80,
        likesCount: 10,
        commentsCount: 3,
      },
      {
        user: users[3]._id,
        title: "Дитяча куртка - зимова",
        description:
          "Тепла зимова куртка для дитини. Яскравого кольору для безпеки. Водонепроникна. Розмір 6 років.",
        images: [
          "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=800&fit=crop",
        ],
        category: "children",
        subcategory: "Jackets",
        size: "6 years",
        brand: "H&M",
        material: "Polyester, Down",
        condition: "used",
        conditionDetails: "Носилася один сезон, в хорошому стані",
        price: 40,
        color: "Red",
        season: ["winter"],
        tags: ["kids", "jacket", "winter", "warm", "red"],
        location: "Харків, Україна",
        isPublic: true,
        status: "active",
        views: 70,
        likesCount: 8,
        commentsCount: 2,
      },
      {
        user: users[3]._id,
        title: "Дитячі джинси - розмір 5 років",
        description:
          "Зручні джинси для дитини. Міцні та практичні. Розмір 5 років.",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
        ],
        category: "children",
        subcategory: "Jeans",
        size: "5 years",
        brand: "H&M",
        material: "Cotton",
        condition: "used",
        conditionDetails: "Звичайне носіння, невеликий знос на колінах",
        price: 15,
        color: "Blue",
        season: ["all-season"],
        tags: ["kids", "jeans", "denim", "casual", "blue"],
        location: "Харків, Україна",
        isPublic: true,
        status: "active",
        views: 60,
        likesCount: 7,
        commentsCount: 1,
      },
      {
        user: users[3]._id,
        title: "Дитяча футболка - з принтом",
        description:
          "Яскрава футболка з мультяшним принтом. Зручна та м'яка. Розмір 4 років.",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        ],
        category: "children",
        subcategory: "T-shirts",
        size: "4 years",
        brand: "C&A",
        material: "Cotton",
        condition: "like-new",
        conditionDetails: "Носилася кілька разів, виглядає як нова",
        price: 8,
        color: "Yellow",
        season: ["spring", "summer"],
        tags: ["kids", "tshirt", "print", "casual", "yellow"],
        location: "Харків, Україна",
        isPublic: true,
        status: "active",
        views: 55,
        likesCount: 6,
        commentsCount: 1,
      },
      {
        user: users[3]._id,
        title: "Дитячі кросівки - розмір 9",
        description:
          "Зручні кросівки для дитини. Підходять для щоденного носіння та активних ігор. Розмір 9.",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
        ],
        category: "children",
        subcategory: "Footwear",
        size: "9",
        brand: "Nike",
        material: "Mesh and Rubber",
        condition: "used",
        conditionDetails: "Звичайне носіння, підошви мають знос",
        price: 25,
        color: "Pink",
        season: ["all-season"],
        tags: ["kids", "sneakers", "nike", "athletic", "pink"],
        location: "Харків, Україна",
        isPublic: true,
        status: "active",
        views: 65,
        likesCount: 9,
        commentsCount: 2,
      },
      // Аксесуари (Accessories)
      {
        user: users[2]._id,
        title: "Шарф - в'язаний з вовни",
        description:
          "Теплий в'язаний шарф з натуральної вовни. Довгий та затишний. Підходить для осені та зими.",
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
        ],
        category: "accessories",
        subcategory: "Scarves",
        size: "One Size",
        brand: "H&M",
        material: "Wool",
        condition: "like-new",
        conditionDetails: "Носився кілька разів, виглядає як нова",
        price: 12,
        color: "Gray",
        season: ["fall", "winter"],
        tags: ["scarf", "knit", "wool", "warm", "gray"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 90,
        likesCount: 11,
        commentsCount: 2,
      },
      {
        user: users[4]._id,
        title: "Сонцезахисні окуляри - дизайнерські",
        description:
          "Стильні сонцезахисні окуляри з якісними лінзами. В оригінальному футлярі. Без подряпин.",
        images: [
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
        ],
        category: "accessories",
        subcategory: "Sunglasses",
        size: "One Size",
        brand: "Ray-Ban",
        material: "Plastic, Glass",
        condition: "like-new",
        conditionDetails: "Використовувалися кілька разів, в ідеальному стані",
        price: 60,
        color: "Black",
        season: ["spring", "summer"],
        tags: ["sunglasses", "rayban", "designer", "summer", "black"],
        location: "Дніпро, Україна",
        isPublic: true,
        status: "active",
        views: 145,
        likesCount: 21,
        commentsCount: 5,
      },
      {
        user: users[2]._id,
        title: "Рюкзак - шкіряний",
        description:
          "Якісний шкіряний рюкзак для щоденного використання. Багато відділень, зручний. В хорошому стані.",
        images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
        ],
        category: "accessories",
        subcategory: "Backpacks",
        size: "One Size",
        brand: "Fjällräven",
        material: "Leather",
        condition: "used",
        conditionDetails: "Звичайне використання, невеликий знос",
        price: 70,
        color: "Brown",
        season: ["all-season"],
        tags: ["backpack", "leather", "practical", "brown", "quality"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 135,
        likesCount: 18,
        commentsCount: 4,
      },
      {
        user: users[4]._id,
        title: "Капелюх - літній",
        description:
          "Стильний літній капелюх для захисту від сонця. Легкий та зручний. Підходить для пляжу або міста.",
        images: [
          "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800&h=800&fit=crop",
        ],
        category: "accessories",
        subcategory: "Hats",
        size: "One Size",
        brand: "H&M",
        material: "Straw",
        condition: "like-new",
        conditionDetails: "Носився кілька разів, виглядає як нова",
        price: 15,
        color: "Beige",
        season: ["spring", "summer"],
        tags: ["hat", "summer", "beach", "straw", "beige"],
        location: "Дніпро, Україна",
        isPublic: true,
        status: "active",
        views: 100,
        likesCount: 13,
        commentsCount: 3,
      },
      {
        user: users[2]._id,
        title: "Ремінь - шкіряний",
        description:
          "Якісний шкіряний ремінь з металевою пряжкою. Класичний стиль, підходить для офісу. Розмір M.",
        images: [
          "https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=800&h=800&fit=crop",
        ],
        category: "accessories",
        subcategory: "Belts",
        size: "M",
        brand: "Zara",
        material: "Leather",
        condition: "used",
        conditionDetails: "Звичайне використання, невеликий знос на пряжці",
        price: 18,
        color: "Brown",
        season: ["all-season"],
        tags: ["belt", "leather", "classic", "office", "brown"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 85,
        likesCount: 10,
        commentsCount: 2,
      },
      // Взуття (Footwear)
      {
        user: users[1]._id,
        title: "Чоловічі бігові кросівки - розмір 10",
        description:
          "Зручні бігові кросівки у хорошому стані. Деякий знос на підошві, але ще багато життя залишилося. Чудові для щоденних пробіжок або тренувань у спортзалі.",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
        ],
        category: "footwear",
        subcategory: "Athletic",
        size: "10",
        brand: "Nike",
        material: "Mesh and Rubber",
        condition: "used",
        conditionDetails:
          "Звичайне носіння, підошви мають деякий знос, але все ще функціональні",
        price: 40,
        color: "Black/White",
        season: ["all-season"],
        tags: ["running", "shoes", "nike", "athletic", "sports"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 90,
        likesCount: 12,
        commentsCount: 4,
      },
      {
        user: users[2]._id,
        title: "Жіночі туфлі - на високому підборі",
        description:
          "Елегантні туфлі на високому підборі. Підходять для офісу або особливих випадків. Розмір 38.",
        images: [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop",
        ],
        category: "footwear",
        subcategory: "Heels",
        size: "38",
        brand: "Zara",
        material: "Leather",
        condition: "used",
        conditionDetails: "Носилася кілька разів, невеликий знос на підошві",
        price: 35,
        color: "Black",
        season: ["all-season"],
        tags: ["heels", "shoes", "elegant", "office", "black"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 120,
        likesCount: 16,
        commentsCount: 4,
      },
      {
        user: users[1]._id,
        title: "Чоловічі черевики - класичні",
        description:
          "Якісні класичні черевики для офісу. Шкіряна підошва, добре зроблені. Розмір 42.",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop",
        ],
        category: "footwear",
        subcategory: "Dress Shoes",
        size: "42",
        brand: "Clarks",
        material: "Leather",
        condition: "used",
        conditionDetails: "Носився для роботи, але в хорошому стані",
        price: 55,
        color: "Brown",
        season: ["all-season"],
        tags: ["dress", "shoes", "office", "leather", "brown"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 105,
        likesCount: 14,
        commentsCount: 3,
      },
      {
        user: users[4]._id,
        title: "Жіночі кеди - білі",
        description:
          "Класичні білі кеди для щоденного носіння. Зручні та універсальні. Розмір 37.",
        images: [
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
        ],
        category: "footwear",
        subcategory: "Sneakers",
        size: "37",
        brand: "Converse",
        material: "Canvas, Rubber",
        condition: "used",
        conditionDetails: "Звичайне носіння, невеликі плями",
        price: 30,
        color: "White",
        season: ["all-season"],
        tags: ["sneakers", "converse", "casual", "white", "classic"],
        location: "Дніпро, Україна",
        isPublic: true,
        status: "active",
        views: 115,
        likesCount: 17,
        commentsCount: 4,
      },
      {
        user: users[2]._id,
        title: "Жіночі босоніжки - літні",
        description:
          "Зручні літні босоніжки. Легкі та комфортні для прогулянок. Розмір 39.",
        images: [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop",
        ],
        category: "footwear",
        subcategory: "Sandals",
        size: "39",
        brand: "H&M",
        material: "Leather",
        condition: "like-new",
        conditionDetails: "Носилася кілька разів, виглядає як нова",
        price: 20,
        color: "Beige",
        season: ["spring", "summer"],
        tags: ["sandals", "summer", "comfortable", "beige", "casual"],
        location: "Одеса, Україна",
        isPublic: true,
        status: "active",
        views: 95,
        likesCount: 12,
        commentsCount: 2,
      },
      {
        user: users[1]._id,
        title: "Чоловічі кросівки - кежуал",
        description:
          "Стильні кросівки для щоденного носіння. Зручні та практичні. Розмір 43.",
        images: [
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
        ],
        category: "footwear",
        subcategory: "Sneakers",
        size: "43",
        brand: "Adidas",
        material: "Mesh, Rubber",
        condition: "used",
        conditionDetails: "Звичайне носіння, підошви мають знос",
        price: 45,
        color: "White/Black",
        season: ["all-season"],
        tags: ["sneakers", "adidas", "casual", "comfortable", "white"],
        location: "Львів, Україна",
        isPublic: true,
        status: "active",
        views: 100,
        likesCount: 15,
        commentsCount: 3,
      },
      {
        user: users[4]._id,
        title: "Жіночі чоботи - осінні",
        description:
          "Стильні осінні чоботи на невеликому каблуці. Підходять для дощу. Розмір 38.",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop",
        ],
        category: "footwear",
        subcategory: "Boots",
        size: "38",
        brand: "Zara",
        material: "Leather",
        condition: "like-new",
        conditionDetails: "Носилася кілька разів, виглядає як нова",
        price: 50,
        color: "Black",
        season: ["fall", "winter"],
        tags: ["boots", "autumn", "leather", "black", "waterproof"],
        location: "Дніпро, Україна",
        isPublic: true,
        status: "active",
        views: 140,
        likesCount: 20,
        commentsCount: 5,
      },
    ]);

    console.log(`Created ${posts.length} posts`);

    // Create comments
    console.log("Creating comments...");
    const comments = await Comment.create([
      {
        user: users[2]._id,
        post: posts[0]._id,
        content: "Це ще доступне? Який точний розмір?",
      },
      {
        user: users[3]._id,
        post: posts[0]._id,
        content: "Чудова куртка! Чи розглядаєте доставку?",
      },
      {
        user: users[1]._id,
        post: posts[6]._id,
        content: "Чудова сумка! Чи можна торгуватися за ціною?",
      },
      {
        user: users[2]._id,
        post: posts[7]._id,
        content: "Дуже гарна сукня! Який розмір точно?",
      },
      {
        user: users[4]._id,
        post: posts[8]._id,
        content: "Чи можна подивитися більше фото?",
      },
      {
        user: users[1]._id,
        post: posts[12]._id,
        content: "Чудова вечірня сукня! Чи можна приміряти?",
      },
      {
        user: users[2]._id,
        post: posts[20]._id,
        content: "Які розміри є?",
      },
      {
        user: users[3]._id,
        post: posts[14]._id,
        content: "Чи підходить для 5-річної дитини?",
      },
      {
        user: users[4]._id,
        post: posts[25]._id,
        content: "Чудові кеди! Чи можна торгуватися?",
      },
      {
        user: users[1]._id,
        post: posts[27]._id,
        content: "Який розмір точно? Чи можна приміряти?",
      },
    ]);

    // Update post comment counts
    for (const comment of comments) {
      await Post.findByIdAndUpdate(comment.post, {
        $inc: { commentsCount: 1 },
      });
    }

    console.log(`Created ${comments.length} comments`);

    // Create likes - додаємо лайки до різних постів
    console.log("Creating likes...");
    const likes = await Like.create([
      { user: users[2]._id, post: posts[0]._id },
      { user: users[3]._id, post: posts[0]._id },
      { user: users[4]._id, post: posts[0]._id },
      { user: users[1]._id, post: posts[1]._id },
      { user: users[2]._id, post: posts[1]._id },
      { user: users[3]._id, post: posts[1]._id },
      { user: users[1]._id, post: posts[6]._id },
      { user: users[3]._id, post: posts[6]._id },
      { user: users[4]._id, post: posts[6]._id },
      { user: users[1]._id, post: posts[7]._id },
      { user: users[2]._id, post: posts[7]._id },
      { user: users[3]._id, post: posts[7]._id },
      { user: users[4]._id, post: posts[7]._id },
      { user: users[2]._id, post: posts[8]._id },
      { user: users[3]._id, post: posts[8]._id },
      { user: users[1]._id, post: posts[9]._id },
      { user: users[2]._id, post: posts[9]._id },
      { user: users[4]._id, post: posts[9]._id },
      { user: users[1]._id, post: posts[10]._id },
      { user: users[3]._id, post: posts[10]._id },
      { user: users[2]._id, post: posts[12]._id },
      { user: users[3]._id, post: posts[12]._id },
      { user: users[4]._id, post: posts[12]._id },
      { user: users[1]._id, post: posts[13]._id },
      { user: users[2]._id, post: posts[13]._id },
      { user: users[1]._id, post: posts[14]._id },
      { user: users[2]._id, post: posts[14]._id },
      { user: users[4]._id, post: posts[14]._id },
      { user: users[1]._id, post: posts[15]._id },
      { user: users[2]._id, post: posts[15]._id },
      { user: users[1]._id, post: posts[16]._id },
      { user: users[3]._id, post: posts[16]._id },
      { user: users[4]._id, post: posts[16]._id },
      { user: users[1]._id, post: posts[17]._id },
      { user: users[2]._id, post: posts[17]._id },
      { user: users[2]._id, post: posts[18]._id },
      { user: users[3]._id, post: posts[18]._id },
      { user: users[4]._id, post: posts[18]._id },
      { user: users[1]._id, post: posts[19]._id },
      { user: users[3]._id, post: posts[19]._id },
      { user: users[1]._id, post: posts[20]._id },
      { user: users[2]._id, post: posts[20]._id },
      { user: users[4]._id, post: posts[20]._id },
      { user: users[2]._id, post: posts[21]._id },
      { user: users[3]._id, post: posts[21]._id },
      { user: users[1]._id, post: posts[22]._id },
      { user: users[2]._id, post: posts[22]._id },
      { user: users[3]._id, post: posts[22]._id },
      { user: users[4]._id, post: posts[22]._id },
      { user: users[1]._id, post: posts[23]._id },
      { user: users[2]._id, post: posts[23]._id },
      { user: users[1]._id, post: posts[24]._id },
      { user: users[3]._id, post: posts[24]._id },
      { user: users[4]._id, post: posts[24]._id },
      { user: users[2]._id, post: posts[25]._id },
      { user: users[3]._id, post: posts[25]._id },
      { user: users[1]._id, post: posts[26]._id },
      { user: users[2]._id, post: posts[26]._id },
      { user: users[4]._id, post: posts[26]._id },
      { user: users[1]._id, post: posts[27]._id },
      { user: users[2]._id, post: posts[27]._id },
      { user: users[3]._id, post: posts[27]._id },
      { user: users[4]._id, post: posts[27]._id },
    ]);

    // Update post like counts
    for (const like of likes) {
      await Post.findByIdAndUpdate(like.post, {
        $inc: { likesCount: 1 },
      });
    }

    console.log(`Created ${likes.length} likes`);

    // Create reviews
    console.log("Creating reviews...");
    await Review.create([
      {
        user: users[2]._id,
        post: posts[0]._id,
        postOwner: users[1]._id,
        rating: 5,
        comment:
          "Чудовий продавець! Товар був саме таким, як описано. Швидка комунікація.",
      },
      {
        user: users[3]._id,
        post: posts[6]._id,
        postOwner: users[2]._id,
        rating: 4,
        comment:
          "Хороший стан, невеликий знос, як згадувалося. Задоволений покупкою!",
      },
      {
        user: users[4]._id,
        post: posts[7]._id,
        postOwner: users[2]._id,
        rating: 5,
        comment:
          "Супер сукня! Виглядає ще краще, ніж на фото. Рекомендую!",
      },
      {
        user: users[1]._id,
        post: posts[14]._id,
        postOwner: users[3]._id,
        rating: 5,
        comment:
          "Чудові чоботи для дитини! Добре доглянуті, як нова. Дякую!",
      },
      {
        user: users[2]._id,
        post: posts[20]._id,
        postOwner: users[1]._id,
        rating: 4,
        comment:
          "Хороші кросівки, але трохи більші, ніж очікував. Все одно задоволений.",
      },
    ]);

    console.log("Created reviews");

    // Set up follow relationships
    console.log("Setting up follow relationships...");
    await User.findByIdAndUpdate(users[2]._id, {
      $push: { following: users[1]._id },
    });
    await User.findByIdAndUpdate(users[1]._id, {
      $push: { followers: users[2]._id },
    });

    console.log("Seed data created successfully!");
    console.log("\nSample login credentials:");
    console.log("Admin: admin@example.com / password123");
    console.log("User: john@example.com / password123");
    console.log("User: jane@example.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
