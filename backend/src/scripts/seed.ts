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
        user: users[4]._id,
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
        location: "Дніпро, Україна",
        isPublic: true,
        status: "active",
        views: 150,
        likesCount: 20,
        commentsCount: 6,
      },
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
        post: posts[1]._id,
        content: "Чудова сумка! Чи можна торгуватися за ціною?",
      },
    ]);

    // Update post comment counts
    for (const comment of comments) {
      await Post.findByIdAndUpdate(comment.post, {
        $inc: { commentsCount: 1 },
      });
    }

    console.log(`Created ${comments.length} comments`);

    // Create likes
    console.log("Creating likes...");
    const likes = await Like.create([
      { user: users[2]._id, post: posts[0]._id },
      { user: users[3]._id, post: posts[0]._id },
      { user: users[4]._id, post: posts[0]._id },
      { user: users[1]._id, post: posts[1]._id },
      { user: users[3]._id, post: posts[1]._id },
      { user: users[4]._id, post: posts[1]._id },
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
        post: posts[1]._id,
        postOwner: users[2]._id,
        rating: 4,
        comment:
          "Хороший стан, невеликий знос, як згадувалося. Задоволений покупкою!",
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
