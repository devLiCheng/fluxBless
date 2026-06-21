---
name: fluxbless-db
description: Guidelines and specifications for the FluxBless MySQL database structure, TypeORM/Prisma models, migrations, and seeding scripts for accessories (手串, necklaces, jade, etc.).
---

# FluxBless Database Schema & Seeding Guidelines

This skill defines the database structure for the FluxBless e-commerce platform. It provides the database models, relationships, and seeding strategies.

## Technologies
- **Database**: MySQL 8.0
- **ORM**: Prisma (preferred for schema migration and type-safety) or TypeORM

## Schema Models

### 1. Category
```prisma
model Category {
  id          Int       @id @default(autoincrement())
  nameZh      String    // e.g., "琉璃手串"
  nameEn      String    // e.g., "Colored Glaze Bracelets"
  slug        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### 2. Product
```prisma
model Product {
  id          Int         @id @default(autoincrement())
  nameZh      String      // e.g., "五行合香珠手串"
  nameEn      String      // e.g., "Five Elements Incense Beads Bracelet"
  descriptionZh String    @db.Text
  descriptionEn String    @db.Text
  price       Decimal     @db.Decimal(10, 2)
  stock       Int         @default(0)
  images      String      // JSON array of image URLs
  categoryId  Int
  category    Category    @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]
  cartItems   CartItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

### 3. User
```prisma
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  password  String     // Hashed
  name      String?
  role      String     @default("user") // "user" or "admin"
  orders    Order[]
  cartItems CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

### 4. Order & OrderItem
```prisma
model Order {
  id            Int         @id @default(autoincrement())
  userId        Int
  user          User        @relation(fields: [userId], references: [id])
  totalAmount   Decimal     @db.Decimal(10, 2)
  status        String      // "pending", "paid", "shipped", "completed", "cancelled"
  paymentMethod String      // "stripe" or "paypal"
  paymentId     String?     // Stripe payment intent ID
  shippingAddress String    @db.Text
  contactPhone  String
  contactEmail  String
  items         OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2) // Price locked at order time
}
```

### 5. CartItem
```prisma
model CartItem {
  id        Int     @id @default(autoincrement())
  userId    Int
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
}
```

### 6. SystemLog
```prisma
model SystemLog {
  id        Int      @id @default(autoincrement())
  level     String   // "info", "warn", "error"
  message   String   @db.Text
  meta      String?  @db.Text // JSON metadata (stack trace, path, user agent)
  createdAt DateTime @default(now())
}
```

## Seeding Script Specification
Implement a seed script (`backend/prisma/seed.ts`) that populates initial product categories and items to support development:
- **Agate Accessories (玛瑙配饰)**
- **Five Elements Incense Beads (五行合香珠)**
- **Colored Glaze Bracelets (琉璃手串)**
- **Cinnabar Bracelets (朱砂手串)**
- **Prayer Beads & Hand Ropes (念珠与手编绳)**
- **White Jade Accessories (白玉配饰)**
