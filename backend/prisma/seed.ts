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
    { nameZh: '玛瑙配饰', nameEn: 'Agate Accessories', slug: 'agate-accessories', description: 'Premium agate jewelry and accessories with natural healing energy' },
    { nameZh: '五行合香珠', nameEn: 'Five Elements Incense Beads', slug: 'five-elements-beads', description: 'Handcrafted incense beads balancing the five elements' },
    { nameZh: '琉璃手串', nameEn: 'Colored Glaze Bracelets', slug: 'colored-glaze-bracelets', description: 'Exquisite colored glaze bracelets with ancient artisanship' },
    { nameZh: '朱砂手串', nameEn: 'Cinnabar Bracelets', slug: 'cinnabar-bracelets', description: 'Traditional cinnabar bracelets believed to ward off negative energy' },
    { nameZh: '念珠与手编绳', nameEn: 'Prayer Beads & Hand Ropes', slug: 'prayer-beads', description: 'Spiritual prayer beads and hand-woven ropes for meditation' },
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
      descriptionZh: '精选天然红玛瑙，色泽温润，象征热情与活力。每颗珠子经过精心打磨，光泽细腻，佩戴舒适。红玛瑙自古以来被视为护身符，能带来勇气与自信。',
      descriptionEn: 'Carefully selected natural red agate with warm tones symbolizing passion and vitality. Each bead is meticulously polished for a smooth finish. Red agate has been revered as an amulet bringing courage and confidence since ancient times.',
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
      nameZh: '南红玛瑙貔貅手串',
      nameEn: 'Southern Red Agate Pixiu Bracelet',
      descriptionZh: '南红玛瑙配貔貅造型，寓意招财纳福、辟邪挡煞。南红玛瑙产自云南保山，色泽浓郁，质地温润，是收藏与佩戴的上佳之选。',
      descriptionEn: 'Southern red agate paired with Pixiu (fortune beast) design, symbolizing wealth attraction and evil protection. Sourced from Baoshan, Yunnan, this agate features rich color and warm texture.',
      price: 188.00,
      stock: 25,
      images: ['/products/south-red-agate-1.jpg', '/products/south-red-agate-2.jpg'],
      categorySlug: 'agate-accessories',
    },
    // Five Elements Incense Beads
    {
      nameZh: '五行合香珠手串·金木水火土',
      nameEn: 'Five Elements Incense Bead Bracelet',
      descriptionZh: '融合金、木、水、火、土五行元素，采用沉香、檀香、崖柏、降真香、花奇楠五种珍贵香材制成。每一颗香珠散发独特芬芳，佩戴可静心安神、调和气场。',
      descriptionEn: 'Combining the five elements of Metal, Wood, Water, Fire, and Earth. Crafted from five precious aromatic materials including agarwood, sandalwood, cliff cypress, dalbergia, and kinam. Each bead emanates a unique fragrance for tranquility and energy balance.',
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
      nameZh: '七彩琉璃转运珠',
      nameEn: 'Rainbow Glaze Fortune Beads',
      descriptionZh: '七种颜色琉璃珠串联，对应七轮能量中心。彩虹色泽璀璨夺目，寓意好运连连、万事顺遂。',
      descriptionEn: 'Seven colored glaze beads linked together, corresponding to seven chakra energy centers. Dazzling rainbow colors symbolize continuous fortune and smooth sailing in all matters.',
      price: 148.00,
      stock: 45,
      images: ['/products/rainbow-glaze-1.jpg', '/products/rainbow-glaze-2.jpg'],
      categorySlug: 'colored-glaze-bracelets',
    },
    {
      nameZh: '琉璃貔貅招财手串',
      nameEn: 'Glaze Pixiu Wealth Bracelet',
      descriptionZh: '琉璃材质打造的貔貅造型手串，貔貅为古代瑞兽，只进不出，象征财源广进。通透的琉璃增添灵动之美。',
      descriptionEn: 'Pixiu-shaped bracelet crafted from glaze material. Pixiu is an ancient fortune beast that only attracts wealth without letting go. The translucent glaze adds spiritual beauty.',
      price: 238.00,
      stock: 25,
      images: ['/products/glaze-pixiu-1.jpg', '/products/glaze-pixiu-2.jpg'],
      categorySlug: 'colored-glaze-bracelets',
    },
    // Cinnabar Bracelets
    {
      nameZh: '高品质朱砂手串',
      nameEn: 'Premium Cinnabar Bracelet',
      descriptionZh: '选用高品质天然朱砂，含砂量高，色泽鲜红如血。朱砂自古被认为具有镇宅辟邪、安神定魄的功效，是传统文化中的护身圣物。',
      descriptionEn: 'Made from premium natural cinnabar with high mineral content and vivid blood-red color. Cinnabar has been revered since ancient times for its protective and calming properties.',
      price: 158.00,
      stock: 35,
      images: ['/products/cinnabar-premium-1.jpg', '/products/cinnabar-premium-2.jpg'],
      categorySlug: 'cinnabar-bracelets',
    },
    {
      nameZh: '朱砂六字真言手串',
      nameEn: 'Cinnabar Six-Syllable Mantra Bracelet',
      descriptionZh: '朱砂珠上雕刻六字真言"唵嘛呢叭咪吽"，将佛教经典与传统辟邪材料完美结合。每日佩戴念诵，感受内心的宁静与力量。',
      descriptionEn: 'Cinnabar beads carved with the Six-Syllable Mantra "Om Mani Padme Hum," perfectly combining Buddhist classics with traditional protective materials. Daily wear and recitation bring inner peace and strength.',
      price: 198.00,
      stock: 28,
      images: ['/products/cinnabar-mantra-1.jpg', '/products/cinnabar-mantra-2.jpg'],
      categorySlug: 'cinnabar-bracelets',
    },
    {
      nameZh: '紫金砂转运手串',
      nameEn: 'Purple Gold Sand Fortune Bracelet',
      descriptionZh: '紫金砂朱砂材质，在光线下呈现神秘的紫金色光泽。精致的做工与独特的色彩，让每一次佩戴都充满仪式感。',
      descriptionEn: 'Purple gold sand cinnabar material that reveals a mysterious purple-gold luster under light. Exquisite craftsmanship and unique coloring make every wear a ceremonial experience.',
      price: 178.00,
      stock: 32,
      images: ['/products/purple-gold-sand-1.jpg', '/products/purple-gold-sand-2.jpg'],
      categorySlug: 'cinnabar-bracelets',
    },
    // Prayer Beads & Hand Ropes
    {
      nameZh: '108颗小叶紫檀念珠',
      nameEn: '108 Red Sandalwood Prayer Beads',
      descriptionZh: '精选印度小叶紫檀，108颗标准念珠设计。木质温润，纹理细密，随着盘玩时间增长，会形成美丽的包浆。适合日常诵经与静心冥想。',
      descriptionEn: 'Premium Indian red sandalwood in a standard 108-bead prayer design. Warm wood texture with fine grain that develops a beautiful patina over time. Perfect for daily sutra chanting and meditation.',
      price: 328.00,
      stock: 22,
      images: ['/products/sandalwood-108-1.jpg', '/products/sandalwood-108-2.jpg'],
      categorySlug: 'prayer-beads',
    },
    {
      nameZh: '手编金刚结红绳',
      nameEn: 'Hand-woven Vajra Knot Red Rope',
      descriptionZh: '纯手工编织金刚结红绳，采用优质棉线，结实耐用。金刚结在藏传佛教中具有加持力量，红色象征吉祥如意。',
      descriptionEn: 'Pure handwoven Vajra knot red rope made from quality cotton thread. The Vajra knot holds blessing power in Tibetan Buddhism, while red symbolizes auspiciousness.',
      price: 38.00,
      stock: 100,
      images: ['/products/vajra-knot-1.jpg', '/products/vajra-knot-2.jpg'],
      categorySlug: 'prayer-beads',
    },
    {
      nameZh: '菩提子手串',
      nameEn: 'Bodhi Seed Bracelet',
      descriptionZh: '天然星月菩提子，颗颗饱满圆润。菩提子是佛教圣物，象征觉悟与智慧。长期盘玩后色泽变化丰富，极具收藏价值。',
      descriptionEn: 'Natural star-moon Bodhi seeds, each full and round. Bodhi seeds are Buddhist sacred objects symbolizing enlightenment and wisdom. Rich color changes over time make them highly collectible.',
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
      descriptionZh: '精雕细琢的白玉观音像吊坠，面容慈祥，神态安详。观音菩萨象征慈悲与救苦救难，佩戴可保平安、增智慧。配送精美礼盒。',
      descriptionEn: 'Finely carved white jade Guanyin pendant with a compassionate expression. Guanyin Bodhisattva symbolizes mercy and salvation. Wearing brings safety and wisdom. Comes in an elegant gift box.',
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

    await prisma.product.create({
      data: {
        ...productData,
        categoryId: category.id,
      },
    });
    console.log(`✅ Product: ${product.nameZh} (${product.nameEn})`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`📊 Created: 1 admin, ${categories.length} categories, ${products.length} products`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
