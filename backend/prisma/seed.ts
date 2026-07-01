import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FluxBless database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fluxbless.com' },
    update: {},
    create: {
      email: 'admin@fluxbless.com',
      password: adminPassword,
      name: 'FluxBless Admin',
      role: 'admin',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create categories
  const categories = [
    { nameZh: '玛瑙配饰', nameEn: 'Agate Accessories', slug: 'agate-accessories', description: 'Premium agate jewelry and accessories featuring classic designs' },
    { nameZh: '五行合香珠', nameEn: 'Five Elements Incense Beads', slug: 'five-elements-beads', description: 'Handcrafted incense beads balancing the five elements' },
    { nameZh: '琉璃手串', nameEn: 'Colored Glaze Bracelets', slug: 'colored-glaze-bracelets', description: 'Exquisite colored glaze bracelets with ancient artisanship' },
    { nameZh: '朱砂手串', nameEn: 'Cinnabar Bracelets', slug: 'cinnabar-bracelets', description: 'Traditional cinnabar bracelets with premium handcrafted quality' },
    { nameZh: '念珠与手编绳', nameEn: 'Prayer Beads & Hand Ropes', slug: 'prayer-beads', description: 'Classic multi-loop beads and hand-woven ropes for daily wear' },
    { nameZh: '白玉配饰', nameEn: 'White Jade Accessories', slug: 'white-jade', description: 'Pure white jade accessories symbolizing purity and grace' },
  ];

  const createdCategories: any[] = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
    console.log(`✅ Category: ${cat.nameZh} (${cat.nameEn})`);
  }

  // Create products
  const products = [
    // Agate Accessories
    {
      nameZh: '天然红玛瑙手链',
      nameEn: 'Natural Red Agate Bracelet',
      descriptionZh: '精选天然红玛瑙，色泽温润，象征热情与活力。每颗珠子经过精心打磨，光泽细腻，佩戴舒适。红玛瑙自古以来深受喜爱，佩戴可展现端庄大气的东方之美。',
      descriptionEn: 'Carefully selected natural red agate with warm tones symbolizing passion and vitality. Each bead is meticulously polished for a smooth finish. Red agate has been cherished since ancient times, displaying elegant classic Eastern aesthetics when worn.',
      price: 68.00,
      stock: 50,
      images: ['/products/red-agate-1.jpg', '/products/red-agate-2.jpg'],
      categorySlug: 'agate-accessories',
    },
    {
      nameZh: '冰种绿玛瑙吊坠',
      nameEn: 'Icy Green Agate Pendant',
      descriptionZh: '冰种绿玛瑙，通透如冰，绿意盎然。采用925纯银镶嵌，既保留了天然石材的灵动，又增添了时尚气质。适合日常佩戴与收藏。',
      descriptionEn: 'Translucent icy green agate with vibrant color. Set in 925 sterling silver, it preserves the natural stone\'s spirit while adding modern elegance. Perfect for everyday wear and collecting.',
      price: 128.00,
      stock: 30,
      images: ['/products/green-agate-1.jpg', '/products/green-agate-2.jpg'],
      categorySlug: 'agate-accessories',
    },
    {
      nameZh: '南红玛瑙雕件手串',
      nameEn: 'Southern Red Agate Carved Bracelet',
      descriptionZh: '南红玛瑙搭配经典貔貅造型，雕工细腻，古朴典雅。南红玛瑙产自云南保山，色泽浓郁，质地温润，是品味与佩戴的上佳之选。',
      descriptionEn: 'Southern red agate paired with a classic carved Pixiu ornament. Sourced from Baoshan, Yunnan, this accessory showcases rich color, warm texture, and exquisite craftsmanship.',
      price: 188.00,
      stock: 25,
      images: ['/products/south-red-agate-1.jpg', '/products/south-red-agate-2.jpg'],
      categorySlug: 'agate-accessories',
    },
    // Five Elements Incense Beads
    {
      nameZh: '五行合香珠手串·金木水火土',
      nameEn: 'Five Elements Incense Bead Bracelet',
      descriptionZh: '采用沉香、檀香、崖柏、降真香、花奇楠五种珍贵天然香材制成。每一颗香珠散发独特芬芳，佩戴可静心安神、芬芳怡人。',
      descriptionEn: 'Crafted from five precious aromatic materials including agarwood, sandalwood, cliff cypress, dalbergia, and kinam. Each bead radiates a natural, soothing fragrance for a calming sensory experience.',
      price: 298.00,
      stock: 20,
      images: ['/products/five-elements-1.jpg', '/products/five-elements-2.jpg'],
      categorySlug: 'five-elements-beads',
    },
    {
      nameZh: '沉香合香珠念珠',
      nameEn: 'Agarwood Incense Prayer Beads',
      descriptionZh: '精选越南芽庄沉香，搭配多种天然香料调和，108颗念珠设计。香气幽远绵长，适合禅修冥想，感受内心的宁静与平和。',
      descriptionEn: 'Premium Nha Trang agarwood blended with multiple natural fragrances in a 108-bead prayer design. The lingering aroma is perfect for Zen meditation, bringing inner peace and serenity.',
      price: 458.00,
      stock: 15,
      images: ['/products/agarwood-beads-1.jpg', '/products/agarwood-beads-2.jpg'],
      categorySlug: 'five-elements-beads',
    },
    {
      nameZh: '檀香合香珠手持',
      nameEn: 'Sandalwood Incense Hand Beads',
      descriptionZh: '印度老山檀香为主料，融合多种名贵香材，18颗手持设计。香气馥郁醇厚，回味悠长。既是修行法器，也是品味配饰。',
      descriptionEn: 'Indian old mountain sandalwood as the main ingredient, blended with precious aromatics in an 18-bead hand design. Rich and mellow fragrance with lasting aftertaste. Both a spiritual tool and a tasteful accessory.',
      price: 228.00,
      stock: 35,
      images: ['/products/sandalwood-beads-1.jpg', '/products/sandalwood-beads-2.jpg'],
      categorySlug: 'five-elements-beads',
    },
    // Colored Glaze Bracelets
    {
      nameZh: '古法琉璃手串·星河流光',
      nameEn: 'Ancient Glaze Bracelet - Galaxy Light',
      descriptionZh: '采用古法琉璃工艺，每颗珠子内含流光溢彩的色泽变化，仿若星河流转。独特的渐变效果使每串手串都是独一无二的艺术品。',
      descriptionEn: 'Crafted with ancient glaze techniques, each bead contains shifting colors like a flowing galaxy. The unique gradient effect makes every bracelet a one-of-a-kind work of art.',
      price: 168.00,
      stock: 40,
      images: ['/products/glaze-galaxy-1.jpg', '/products/glaze-galaxy-2.jpg'],
      categorySlug: 'colored-glaze-bracelets',
    },
    {
      nameZh: '琉璃莲花手串',
      nameEn: 'Glaze Lotus Bracelet',
      descriptionZh: '以莲花为设计灵感，琉璃珠内嵌莲花图案，象征出淤泥而不染的高洁品格。适合追求内心纯净与精神提升的修行者。',
      descriptionEn: 'Inspired by the lotus flower, with lotus patterns embedded within glaze beads, symbolizing purity rising from adversity. Ideal for spiritual seekers pursuing inner purity and elevation.',
      price: 198.00,
      stock: 30,
      images: ['/products/glaze-lotus-1.jpg', '/products/glaze-lotus-2.jpg'],
      categorySlug: 'colored-glaze-bracelets',
    },
    {
      nameZh: '七彩琉璃串珠手串',
      nameEn: 'Rainbow Glaze Beaded Bracelet',
      descriptionZh: '七种颜色的优质琉璃珠交相辉映，璀璨夺目。斑斓绚丽的色彩搭配，点缀日常生活，展现个性风采。',
      descriptionEn: 'Seven colors of premium glaze beads shine beautifully in this bracelet. The vibrant color palette offers a stylish and elegant daily accessory.',
      price: 148.00,
      stock: 45,
      images: ['/products/rainbow-glaze-1.jpg', '/products/rainbow-glaze-2.jpg'],
      categorySlug: 'colored-glaze-bracelets',
    },
    {
      nameZh: '琉璃瑞兽工艺手串',
      nameEn: 'Glaze Pixiu Craft Bracelet',
      descriptionZh: '琉璃材质打造的经典瑞兽造型手串，线条流畅，设计考究。通透亮丽的琉璃材质更显温婉灵动之美。',
      descriptionEn: 'A beautifully crafted bracelet featuring a classic glaze Pixiu motif. The translucent colored glaze adds a touch of light and elegant style.',
      price: 238.00,
      stock: 25,
      images: ['/products/glaze-pixiu-1.jpg', '/products/glaze-pixiu-2.jpg'],
      categorySlug: 'colored-glaze-bracelets',
    },
    // Cinnabar Bracelets
    {
      nameZh: '高品质朱砂手串',
      nameEn: 'Premium Cinnabar Bracelet',
      descriptionZh: '选用高品质天然朱砂，色泽沉稳朱红。精致的打磨工艺使每颗珠子手感细腻温润，是具有传统古典美感的经典饰品。',
      descriptionEn: 'Made from premium natural cinnabar featuring a rich red color. The smooth texture and classic design offer an elegant look perfect for daily styling.',
      price: 158.00,
      stock: 35,
      images: ['/products/cinnabar-premium-1.jpg', '/products/cinnabar-premium-2.jpg'],
      categorySlug: 'cinnabar-bracelets',
    },
    {
      nameZh: '朱砂经典雕刻手串',
      nameEn: 'Cinnabar Carved Motif Bracelet',
      descriptionZh: '朱砂珠上雕刻经典传统吉祥纹饰，将古朴质感与精细雕工完美结合，整体设计沉稳大气，极富雅趣。',
      descriptionEn: 'Cinnabar beads carved with traditional patterns, blending vintage texture with fine carving details. The sophisticated design adds a classic Eastern touch to any outfit.',
      price: 198.00,
      stock: 28,
      images: ['/products/cinnabar-mantra-1.jpg', '/products/cinnabar-mantra-2.jpg'],
      categorySlug: 'cinnabar-bracelets',
    },
    {
      nameZh: '紫金砂精制手串',
      nameEn: 'Purple Gold Sand Premium Bracelet',
      descriptionZh: '选用优质紫金砂材质，在光线下展现独特的紫金光泽。精致的做工与别致的色彩，让每一次佩戴都展现独特品味。',
      descriptionEn: 'Made of premium purple-gold cinnabar sand that reveals a subtle metallic luster. The elegant craftsmanship and unique hue showcase sophisticated personal taste.',
      price: 178.00,
      stock: 32,
      images: ['/products/purple-gold-sand-1.jpg', '/products/purple-gold-sand-2.jpg'],
      categorySlug: 'cinnabar-bracelets',
    },
    // Prayer Beads & Hand Ropes
    {
      nameZh: '108颗小叶紫檀多圈手串',
      nameEn: '108 Red Sandalwood Multi-loop Bracelet',
      descriptionZh: '精选高品质小叶紫檀，采用经典108颗多圈设计。木质细腻，随着日常佩戴与盘玩，会展现越发莹润的质感与色泽。',
      descriptionEn: 'Premium red sandalwood crafted in a classic 108-bead multi-loop design. The fine-grained wood texture develops a beautiful natural patina and deeper color over time.',
      price: 328.00,
      stock: 22,
      images: ['/products/sandalwood-108-1.jpg', '/products/sandalwood-108-2.jpg'],
      categorySlug: 'prayer-beads',
    },
    {
      nameZh: '手工编织幸运红绳',
      nameEn: 'Handwoven Classic Red Thread Bracelet',
      descriptionZh: '纯手工编织的经典红绳手链，采用优质棉线，结实耐用。经典绳结编织工整美观，红色象征着生活美满、万事如意。',
      descriptionEn: 'Pure handwoven classic red thread bracelet made from high-quality durable cord. The neat handcrafted knots and vibrant red color symbolize joy and auspiciousness.',
      price: 38.00,
      stock: 100,
      images: ['/products/vajra-knot-1.jpg', '/products/vajra-knot-2.jpg'],
      categorySlug: 'prayer-beads',
    },
    {
      nameZh: '菩提子手串',
      nameEn: 'Bodhi Seed Bracelet',
      descriptionZh: '精选天然星月菩提子，颗颗饱满圆润，展现质朴自然的本色。长期佩戴盘玩后色泽温润多变，具有独特的观赏与收藏价值。',
      descriptionEn: 'Selected natural star-moon Bodhi seeds, each bead round and full. With everyday wear and handling, they develop a warm, rich tone, offering high aesthetic and collectible value.',
      price: 88.00,
      stock: 60,
      images: ['/products/bodhi-seed-1.jpg', '/products/bodhi-seed-2.jpg'],
      categorySlug: 'prayer-beads',
    },
    // White Jade Accessories
    {
      nameZh: '和田白玉平安扣',
      nameEn: 'Hetian White Jade Safety Buckle',
      descriptionZh: '新疆和田白玉，质地温润如脂，色泽洁白无瑕。平安扣造型圆润，寓意平安顺遂、圆满和谐。可作为吊坠或车挂使用。',
      descriptionEn: 'Xinjiang Hetian white jade with a warm, creamy texture and flawless white color. The safety buckle\'s round design symbolizes peace, smoothness, and harmony. Can be worn as a pendant or car ornament.',
      price: 388.00,
      stock: 18,
      images: ['/products/hetian-jade-1.jpg', '/products/hetian-jade-2.jpg'],
      categorySlug: 'white-jade',
    },
    {
      nameZh: '白玉莲花手镯',
      nameEn: 'White Jade Lotus Bangle',
      descriptionZh: '优质白玉雕刻莲花纹理手镯，工艺精湛，线条流畅。莲花与白玉的结合，体现了东方美学的极致典雅。适合优雅女性日常佩戴。',
      descriptionEn: 'Premium white jade bangle with carved lotus patterns, featuring exquisite craftsmanship and flowing lines. The combination of lotus and white jade embodies the ultimate elegance of Eastern aesthetics.',
      price: 528.00,
      stock: 12,
      images: ['/products/jade-lotus-bangle-1.jpg', '/products/jade-lotus-bangle-2.jpg'],
      categorySlug: 'white-jade',
    },
    {
      nameZh: '白玉观音吊坠',
      nameEn: 'White Jade Guanyin Pendant',
      descriptionZh: '精雕细琢的白玉观音像吊坠，面容慈祥，雕工细腻入微。白玉质地温润，设计融合传统东方雕刻艺术，展现儒雅沉稳的气质。',
      descriptionEn: 'Meticulously carved white jade Guanyin pendant showing detailed craftsmanship. The premium white jade offers a warm texture and represents classic Eastern stone carving art.',
      price: 668.00,
      stock: 10,
      images: ['/products/jade-guanyin-1.jpg', '/products/jade-guanyin-2.jpg'],
      categorySlug: 'white-jade',
    },
  ];

  for (const product of products) {
    const category = createdCategories.find(
      (c) => c.slug === product.categorySlug,
    );
    if (!category) continue;

    const { categorySlug, ...productData } = product;

    // Check if the product already exists before creating it
    const existingProduct = await prisma.product.findFirst({
      where: { nameZh: product.nameZh },
    });
    if (existingProduct) {
      console.log(`ℹ️ Product already exists: ${product.nameZh}`);
      continue;
    }

    await prisma.product.create({
      data: {
        ...productData,
        categoryId: category.id,
      },
    });
    console.log(`✅ Product: ${product.nameZh} (${product.nameEn})`);
  }

  // Create default system settings
  const defaultSettings = [
    { key: 'header_logo_title', value: 'FluxBless' },
    { key: 'header_logo_subtitle', value: 'Eastern Aesthetics' },
    { key: 'top_slogan_zh', value: '传统东方美学，点缀精致生活' },
    { key: 'top_slogan_en', value: 'Traditional Eastern Aesthetics, Embellishing a Refined Life' },
    { key: 'hero_badge_zh', value: '探寻传统手工美学' },
    { key: 'hero_badge_en', value: 'Explore Traditional Craft Aesthetics' },
    { key: 'hero_title_zh', value: '传统东方美学，点缀精致生活' },
    { key: 'hero_title_en', value: 'Traditional Eastern Aesthetics, Embellishing a Refined Life' },
    { key: 'hero_desc_zh', value: 'FluxBless 为您甄选富含东方古典美学的精致配饰。我们专注古法琉璃、天然玛瑙、精选朱砂与白玉，为您的日常生活注入和谐、优雅与内心的平和。' },
    { key: 'hero_desc_en', value: 'FluxBless curates premium accessories reflecting classic Eastern aesthetics. We specialize in ancient colored glaze, natural agate, selected cinnabar, and white jade, bringing harmony, elegance, and inner peace into your daily life.' },
    { key: 'feature1_icon', value: 'Gem' },
    { key: 'feature1_title_zh', value: '天然原石' },
    { key: 'feature1_title_en', value: 'Natural Gems' },
    { key: 'feature1_desc_zh', value: '天然玉石与玛瑙' },
    { key: 'feature1_desc_en', value: '100% genuine crystals' },
    { key: 'feature2_icon', value: 'HeartHandshake' },
    { key: 'feature2_title_zh', value: '匠心手作' },
    { key: 'feature2_title_en', value: 'Handcrafted' },
    { key: 'feature2_desc_zh', value: '传统工艺纯手工打造' },
    { key: 'feature2_desc_en', value: 'Traditional handcrafted knots' },
    { key: 'feature3_icon', value: 'Sparkles' },
    { key: 'feature3_title_zh', value: '工艺精制' },
    { key: 'feature3_title_en', value: 'Sonic Cleaned' },
    { key: 'feature3_desc_zh', value: '手工多重清理净化' },
    { key: 'feature3_desc_en', value: 'Hand-cleaned and purified' },
    { key: 'feature4_icon', value: 'ShieldCheck' },
    { key: 'feature4_title_zh', value: '全球包邮' },
    { key: 'feature4_title_en', value: 'Free Shipping' },
    { key: 'feature4_desc_zh', value: '限时免运费直邮' },
    { key: 'feature4_desc_en', value: 'Free global delivery' },
    { key: 'footer_logo_title', value: 'FluxBless' },
    { key: 'footer_desc_zh', value: 'FluxBless 为您甄选富含东方古典美学的精致配饰。我们专注古法琉璃、天然玛瑙、精选朱砂与白玉，为您的日常生活注入和谐、优雅与内心的平和。' },
    { key: 'footer_desc_en', value: 'FluxBless curates premium accessories reflecting classic Eastern aesthetics. We specialize in ancient colored glaze, natural agate, selected cinnabar, and white jade, bringing harmony, elegance, and inner peace into your daily life.' },
    { key: 'footer_contact_email', value: 'contact@fluxbless.com' },
    { key: 'footer_copyright_zh', value: '© 2026 FluxBless. 保留所有权利。' },
    { key: 'footer_copyright_en', value: '© 2026 FluxBless. All rights reserved.' },
    { key: 'detail_wrist_size', value: '14cm – 18cm' },
    { key: 'detail_purification_zh', value: '每件商品出货前均经过细致的手工清洁与声波清洗，确保展现矿石天然纯净品质。' },
    { key: 'detail_purification_en', value: 'Every item is carefully hand-cleaned and ultrasonic-cleansed before shipping to ensure its pure, natural quality.' },
    { key: 'detail_sizing_desc_zh', value: '手串均带有微弹力，适合大多数手围佩戴（14cm-18cm）。如需特别定制，请联系客服。' },
    { key: 'detail_sizing_desc_en', value: 'The bracelets have slight elasticity and fit most wrist sizes (14cm-18cm). For custom requests, please contact customer support.' },
    { key: 'detail_review_subtext_zh', value: '真实买家购买后的真实评价，百分百真实可信。' },
    { key: 'detail_review_subtext_en', value: 'Authentic reviews from verified buyers.' },
    { key: 'top_slogan_link_coupon_code', value: 'WELCOME' },
  ];

  console.log('🌱 Seeding default system settings...');
  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ Seeded ${defaultSettings.length} system settings`);

  // Create default coupons
  console.log('🌱 Seeding default coupons...');
  const defaultCoupons = [
    {
      code: 'WELCOME',
      discountAmount: 10.00,
      minOrderAmount: 50.00,
      expiresAt: new Date('2036-07-01T00:00:00.000Z'),
      isActive: true,
    }
  ];

  for (const coupon of defaultCoupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }
  console.log(`✅ Seeded ${defaultCoupons.length} coupons`);

  console.log('\n🎉 Seeding complete!');
  console.log(`📊 Created: 1 admin, ${categories.length} categories, ${products.length} products, ${defaultCoupons.length} coupons`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
