import React from 'react';
import { getDictionary } from '../../../../lib/dictionary';
import { ProductDetails } from '../../../../components/ProductDetails';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    nameZh: '天然红玛瑙手链',
    nameEn: 'Natural Red Agate Bracelet',
    descriptionZh: '精选天然红玛瑙，色泽温润，象征热情与活力。每颗珠子经过精心打磨，光泽细腻，佩戴舒适。红玛瑙自古以来被视为护身符，能带来勇气与自信。',
    descriptionEn: 'Carefully selected natural red agate with warm tones symbolizing passion and vitality. Each bead is meticulously polished for a smooth finish. Red agate has been revered as an amulet bringing courage and confidence since ancient times.',
    price: 68.00,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'],
    categoryId: 1,
    category: { slug: 'agate-accessories', nameZh: '玛瑙配饰', nameEn: 'Agate Accessories' }
  },
  {
    id: 4,
    nameZh: '五行合香珠手串·金木水火土',
    nameEn: 'Five Elements Incense Bead Bracelet',
    descriptionZh: '融合金、木、水、火、土五行元素，采用沉香、檀香、崖柏、降真香、花奇楠五种珍贵香材制成。每一颗香珠散发独特芬芳，佩戴可静心安神、调和气场。',
    descriptionEn: 'Combining the five elements of Metal, Wood, Water, Fire, and Earth. Crafted from five precious aromatic materials including agarwood, sandalwood, cliff cypress, dalbergia, and kinam. Each bead emanates a unique fragrance for tranquility and energy balance.',
    price: 298.00,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1611085583191-a3b1a3075af4?q=80&w=800&auto=format&fit=crop'],
    categoryId: 2,
    category: { slug: 'five-elements-beads', nameZh: '五行合香珠', nameEn: 'Five Elements Incense Beads' }
  },
  {
    id: 7,
    nameZh: '古法琉璃手串·星河流光',
    nameEn: 'Ancient Glaze Bracelet - Galaxy Light',
    descriptionZh: '采用古法琉璃工艺，每颗珠子内含流光溢彩的色泽变化，仿若星河流转。独特的渐变效果使每串手串都是独一无二的艺术品。',
    descriptionEn: 'Crafted with ancient glaze techniques, each bead contains shifting colors like a flowing galaxy. The unique gradient effect makes every bracelet a one-of-a-kind work of art.',
    price: 168.00,
    stock: 40,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop'],
    categoryId: 3,
    category: { slug: 'colored-glaze-bracelets', nameZh: '琉璃手串', nameEn: 'Colored Glaze Bracelets' }
  },
  {
    id: 10,
    nameZh: '高品质朱砂手串',
    nameEn: 'Premium Cinnabar Bracelet',
    descriptionZh: '选用高品质天然朱砂，含砂量高，色泽鲜红如血。朱砂自古被认为具有镇宅辟邪、安神定魄的功效，是传统文化中的护身圣物。',
    descriptionEn: 'Made from premium natural cinnabar with high mineral content and vivid blood-red color. Cinnabar has been revered since ancient times for its protective and calming properties.',
    price: 158.00,
    stock: 35,
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop'],
    categoryId: 4,
    category: { slug: 'cinnabar-bracelets', nameZh: '朱砂手串', nameEn: 'Cinnabar Bracelets' }
  },
  {
    id: 13,
    nameZh: '108颗小叶紫檀念珠',
    nameEn: '108 Red Sandalwood Prayer Beads',
    descriptionZh: '精选印度小叶紫檀，108颗标准念珠设计。木质温润，纹理细密，随着盘玩时间增长，会形成美丽的包浆。适合日常诵经与静心冥想。',
    descriptionEn: 'Premium Indian red sandalwood in a standard 108-bead prayer design. Warm wood texture with fine grain that develops a beautiful patina over time. Perfect for daily sutra chanting and meditation.',
    price: 328.00,
    stock: 22,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop'],
    categoryId: 5,
    category: { slug: 'prayer-beads', nameZh: '念珠与手编绳', nameEn: 'Prayer Beads & Hand Ropes' }
  },
  {
    id: 16,
    nameZh: '和田白玉平安扣',
    nameEn: 'Hetian White Jade Safety Buckle',
    descriptionZh: '新疆和田白玉，质地温润如脂，色泽洁白无瑕。平安扣造型圆润，寓意平安顺遂、圆满和谐。可作为吊坠或车挂使用。',
    descriptionEn: 'Xinjiang Hetian white jade with a warm, creamy texture and flawless white color. The safety buckle\'s round design symbolizes peace, smoothness, and harmony. Can be worn as a pendant or car ornament.',
    price: 388.00,
    stock: 18,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'],
    categoryId: 6,
    category: { slug: 'white-jade', nameZh: '白玉配饰', nameEn: 'White Jade Accessories' }
  }
];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ lang: 'zh' | 'en'; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const productId = parseInt(id);

  // Fetch from NestJS backend API
  let product = FALLBACK_PRODUCTS.find((p) => p.id === productId);
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/products/${productId}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) {
        product = data;
      }
    }
  } catch (err) {
    console.warn(`Could not load product ID ${productId} from API backend. Using fallback product.`);
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-[#121212] text-cream">
        <h2 className="text-xl font-serif tracking-widest text-gold-primary mb-4 uppercase">
          {lang === 'zh' ? '商品未找到' : 'Product Not Found'}
        </h2>
        <a
          href={`/${lang}`}
          className="text-xs text-zinc-400 hover:text-gold-primary border-b border-gold-primary/30 pb-1 tracking-widest uppercase"
        >
          {lang === 'zh' ? '返回首页' : 'Return Home'}
        </a>
      </div>
    );
  }

  return <ProductDetails product={product} dict={dict} lang={lang} />;
}
