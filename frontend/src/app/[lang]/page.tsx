import React from 'react';
import { getDictionary } from '../../lib/dictionary';
import { ProductCatalog } from '../../components/ProductCatalog';
import * as Icons from 'lucide-react';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    nameZh: '天然红玛瑙手链',
    nameEn: 'Natural Red Agate Bracelet',
    descriptionZh: '精选天然红玛瑙，色泽温润，象征热情与活力。每颗珠子经过精心打磨，光泽细腻，佩戴舒适。',
    descriptionEn: 'Carefully selected natural red agate with warm tones symbolizing passion and vitality. Each bead is meticulously polished for a smooth finish.',
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
    descriptionZh: '融合金、木、水、火、土五行元素，采用沉香、檀香、崖柏、降真香、花奇楠五种珍贵香材制成。',
    descriptionEn: 'Combining the five elements of Metal, Wood, Water, Fire, and Earth. Crafted from five precious aromatic materials including agarwood, sandalwood, cliff cypress, dalbergia, and kinam.',
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
    descriptionZh: '采用古法琉璃工艺，每颗珠子内含流光溢彩的色泽变化，仿若星河流转。',
    descriptionEn: 'Crafted with ancient glaze techniques, each bead contains shifting colors like a flowing galaxy.',
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
    descriptionZh: '选用高品质天然朱砂，色泽沉稳朱红。精致的打磨工艺使每颗珠子手感细腻温润，是具有传统古典美感的经典饰品。',
    descriptionEn: 'Made from premium natural cinnabar featuring a rich red color. The smooth texture and classic design offer an elegant look perfect for daily styling.',
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
    descriptionZh: '精选印度小叶紫檀，108颗标准念珠设计。木质温润，纹理细密，随着盘玩时间增长，会形成美丽的包浆。',
    descriptionEn: 'Premium Indian red sandalwood in a standard 108-bead prayer design. Warm wood texture with fine grain that develops a beautiful patina over time.',
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
    descriptionZh: '新疆和田白玉，质地温润如脂，色泽洁白无瑕。平安扣造型导向平安顺遂、圆满和谐。',
    descriptionEn: 'Xinjiang Hetian white jade with a warm, creamy texture and flawless white color. The safety buckle\'s round design symbolizes peace and harmony.',
    price: 388.00,
    stock: 18,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'],
    categoryId: 6,
    category: { slug: 'white-jade', nameZh: '白玉配饰', nameEn: 'White Jade Accessories' }
  }
];

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ lang: 'zh' | 'en' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Fetch products from NestJS backend API
  let products = FALLBACK_PRODUCTS;
  try {
    const apiUrl = process.env.BACKEND_URL || 'http://backend:4000/api';
    const res = await fetch(`${apiUrl}/products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        products = data.items;
      } else if (Array.isArray(data) && data.length > 0) {
        products = data;
      }
    }
  } catch (err) {
    console.warn('Could not load products from API backend. Using fallback list.');
  }

  // Fetch settings from NestJS backend API
  let settings: Record<string, string> = {};
  try {
    const apiUrl = process.env.BACKEND_URL || 'http://backend:4000/api';
    const res = await fetch(`${apiUrl}/settings`, { cache: 'no-store' });
    if (res.ok) {
      settings = await res.json();
    }
  } catch (err) {
    console.warn('Could not load settings from API backend. Using default fallback.');
  }

  const getSetting = (key: string, fallback: string = ''): string => {
    return settings[key] !== undefined ? settings[key] : fallback;
  };

  const getSettingL = (keyBase: string, lang: 'zh' | 'en', fallback: string = ''): string => {
    const key = `${keyBase}_${lang}`;
    if (settings[key] !== undefined) return settings[key];
    if (settings[keyBase] !== undefined) return settings[keyBase];
    return fallback;
  };

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#121212] py-24 sm:py-32 border-b border-gold-primary/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
            {/* Spiritual Badge */}
            <div className="inline-flex items-center space-x-2 border border-gold-primary/20 rounded-md px-4 py-1.5 bg-black/60 backdrop-blur-md mb-8">
              <Icons.Sparkles className="w-4 h-4 text-gold-primary animate-pulse" />
              <span className="text-[10px] sm:text-xs tracking-[0.25em] text-gold-secondary font-serif uppercase">
                {getSettingL('hero_badge', lang, lang === 'zh' ? '探寻传统手工美学' : 'Explore Traditional Craft Aesthetics')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif tracking-widest text-gold-primary mb-6 leading-tight uppercase">
              <span className="gold-text-gradient block">{getSettingL('hero_title', lang, dict.hero.motto)}</span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed tracking-wider mb-10 max-w-2xl">
              {getSettingL('hero_desc', lang, dict.hero.description)}
            </p>

            <a
              href="#catalog"
              className="gold-gradient hover:gold-border-glow text-black font-semibold text-xs tracking-[0.25em] uppercase px-8 py-4 rounded-md transition-all duration-300 hover:scale-[1.01] shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
            >
              {dict.hero.shopNow}
            </a>
          </div>
        </div>

        {/* Dynamic Background visual details */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      </section>

      {/* Selling Points Bar */}
      <section className="bg-[#0D0D0D] border-b border-gold-primary/5 py-8 text-cream">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[1, 2, 3, 4].map((num) => {
            const iconName = getSetting(`feature${num}_icon`, num === 1 ? 'Gem' : num === 2 ? 'HeartHandshake' : num === 3 ? 'Sparkles' : 'ShieldCheck');
            const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
            const title = getSettingL(`feature${num}_title`, lang, num === 1 ? dict.hero.features.natural : num === 2 ? dict.hero.features.handcrafted : num === 3 ? dict.hero.features.spiritual : dict.hero.features.shipping);
            const desc = getSettingL(`feature${num}_desc`, lang, num === 1 ? (lang === 'zh' ? '天然玉石与玛瑙' : '100% genuine crystals') : num === 2 ? (lang === 'zh' ? '传统工艺纯手工打造' : 'Traditional handcrafted knots') : num === 3 ? (lang === 'zh' ? '手工多重清理净化' : 'Hand-cleaned and purified') : (lang === 'zh' ? '限时免运费直邮' : 'Free global delivery'));

            return (
              <div key={num} className="flex flex-col items-center">
                <IconComponent className="w-6 h-6 text-gold-primary mb-2" />
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-1">{title}</h4>
                <p className="text-[10px] text-zinc-500">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Catalog list */}
      <ProductCatalog products={products} dict={dict} lang={lang} />
    </div>
  );
}
