'use client';

import { useRef, useMemo } from 'react';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShoppingBag, ArrowRight, Star, Plus, Heart, Sparkles, Shield,
  Truck, RotateCcw, ChevronRight, Leaf, Quote, Mail, Layers
} from 'lucide-react';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getTemplate } from '@/features/templates/registry';
import type { TemplateConfig } from '@/features/templates/types';

interface DynamicStorefrontProps {
  store: StoreDto;
  products: ProductDto[];
  onAddToCart: (productId: string) => void;
  onViewProduct?: (id: string) => void;
  addingToCart: string | null;
}

function useTemplateConfig(templateSlug?: string, store?: StoreDto): TemplateConfig {
  const config = useMemo(() => {
    const t = getTemplate(templateSlug || '');
    const base = t || getTemplate('fashion-luxury')!;
    if (!store || (!store.primaryColor && !store.secondaryColor && !store.fontFamily)) return base;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: store.primaryColor || base.colors.primary,
        accent: store.secondaryColor || base.colors.accent,
      },
      typography: {
        ...base.typography,
        headingFont: store.fontFamily || base.typography.headingFont,
        bodyFont: store.fontFamily || base.typography.bodyFont,
      },
    };
  }, [templateSlug, store]);
  return config;
}

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const BADGE_DATA: Record<string, { icon: typeof Shield; label: string }[]> = {
  FASHION: [{ icon: Truck, label: 'Free Shipping' }, { icon: RotateCcw, label: 'Easy Returns' }, { icon: Shield, label: 'Authentic' }],
  ELECTRONICS: [{ icon: Shield, label: '1-Year Warranty' }, { icon: Truck, label: 'Fast Delivery' }, { icon: RotateCcw, label: '7-Day Returns' }],
  FOOD_BEVERAGE: [{ icon: Leaf, label: 'Farm Fresh' }, { icon: Truck, label: 'Same-Day Delivery' }, { icon: Shield, label: 'Quality Guarantee' }],
  HEALTH_BEAUTY: [{ icon: Leaf, label: 'Natural Ingredients' }, { icon: Shield, label: 'Dermatologist Tested' }, { icon: Truck, label: 'Free Shipping' }],
  HOME_LIVING: [{ icon: Truck, label: 'Free Delivery' }, { icon: RotateCcw, label: '30-Day Returns' }, { icon: Shield, label: 'Quality Assured' }],
  SPORTS_FITNESS: [{ icon: Truck, label: 'Free Shipping' }, { icon: RotateCcw, label: 'Easy Returns' }, { icon: Shield, label: 'Durable Guarantee' }],
  BOOKS_MEDIA: [{ icon: Truck, label: 'Free Shipping' }, { icon: Shield, label: 'Satisfaction Guarantee' }, { icon: RotateCcw, label: 'Easy Returns' }],
  ARTS_CRAFTS: [{ icon: Truck, label: 'Hand-Delivered' }, { icon: Heart, label: 'Handmade with Love' }, { icon: Shield, label: 'Satisfaction Guaranteed' }]};

const HERO_OVERLAYS: Record<string, string> = {
  'gradient-mesh': 'bg-gradient-to-br from-transparent via-white/5 to-transparent',
  'liquid-glass': 'bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.03]',
  geometric: 'bg-gradient-to-br from-transparent via-white/[0.02] to-transparent',
  minimal: 'bg-gradient-to-t from-black/20 via-transparent to-transparent',
  cinematic: 'bg-gradient-to-t from-black/40 via-transparent to-black/10',
  playful: 'bg-gradient-to-br from-white/5 via-transparent to-white/10',
  natural: 'bg-gradient-to-t from-black/10 via-transparent to-black/5',
  vibrant: 'bg-gradient-to-br from-white/10 via-transparent to-white/5',
  craft: 'bg-gradient-to-t from-black/20 via-transparent to-transparent'};

const CARD_STYLES: Record<string, string> = {
  glass: 'backdrop-blur-xl bg-white/10 border border-white/20',
  elevated: 'shadow-xl shadow-black/10 bg-white',
  bordered: 'border-2 bg-white',
  minimal: 'bg-white',
  rounded: 'bg-white shadow-md'};

const BTN_STYLES: Record<string, string> = {
  pill: 'rounded-full',
  sharp: 'rounded-lg',
  soft: 'rounded-xl'};

function HeroDynamic({ store, template }: { store: StoreDto; template: TemplateConfig }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const op = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[85vh] flex items-center overflow-hidden"
      style={{ backgroundColor: template.colors.secondary }}>
      <div className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 30% 20%, ${template.colors.primary}22 0%, transparent 60%)` }} />
      <div className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 70% 80%, ${template.colors.accent}15 0%, transparent 50%)` }} />
      <div className={HERO_OVERLAYS[template.effects.heroEffect] || HERO_OVERLAYS.minimal} />

      <motion.div style={{ y, opacity: op }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8">
              <FadeIn delay={0.2}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: `${template.colors.primary}20`, borderColor: `${template.colors.primary}30`, borderWidth: 1 }}>
                  <Sparkles className="h-3 w-3" style={{ color: template.colors.primary }} />
                  <span className="text-xs tracking-[0.15em] uppercase font-medium"
                    style={{ color: template.colors.primary }}>{template.name}</span>
                </div>
              </FadeIn>
              <FadeIn delay={0.4}>
                <h1 className="text-5xl md:text-7xl leading-tight" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
                  {store.name || 'Your Store'}
                  <br />
                  <span style={{ color: template.colors.primary }}>Discover</span>
                </h1>
              </FadeIn>
              {store.description && (
                <FadeIn delay={0.6}>
                  <p className="text-lg leading-relaxed max-w-lg" style={{ color: template.colors.muted }}>{store.description}</p>
                </FadeIn>
              )}
              <FadeIn delay={0.8}>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg"
                    className={`${BTN_STYLES[template.effects.buttonStyle]} font-medium px-8 h-14 text-base group`}
                    style={{ backgroundColor: template.colors.primary, color: '#fff' }}>
                    Shop Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button size="lg" variant="outline"
                    className={`${BTN_STYLES[template.effects.buttonStyle]} px-8 h-14 text-base`}
                    style={{ borderColor: `${template.colors.text}20`, color: template.colors.text }}>
                    Learn More
                  </Button>
                </div>
              </FadeIn>
              <FadeIn delay={1}>
                <div className="flex items-center gap-6 pt-4">
                  {(BADGE_DATA[template.category] || BADGE_DATA.FASHION).map((item) => (
                    <div key={item.label} className="flex items-center gap-2" style={{ color: template.colors.muted }}>
                      <item.icon className="h-4 w-4" style={{ color: template.colors.primary }} />
                      <span className="text-xs tracking-wide">{item.label}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.6}>
              <div className="relative hidden lg:block aspect-square rounded-3xl overflow-hidden"
                style={{ backgroundColor: `${template.colors.primary}10` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Layers className="h-24 w-24" style={{ color: `${template.colors.primary}20` }} />
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl backdrop-blur-xl"
                  style={{ backgroundColor: `${template.colors.background}80`, borderColor: `${template.colors.border}`, borderWidth: 1 }}>
                  <p className="text-sm font-medium" style={{ color: template.colors.text }}>
                    Premium quality products curated for you.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ShowcaseDynamic({ products, onAddToCart, onViewProduct, addingToCart, template }: {
  products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null; template: TemplateConfig;
}) {
  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN', minimumFractionDigits: 0 }).format(price);

  const displayProducts = products.slice(0, 6);

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: template.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase mb-4 font-medium" style={{ color: template.colors.primary }}>Featured Products</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
              Best Sellers
            </h2>
            <div className="w-12 h-px mx-auto mt-6" style={{ backgroundColor: template.colors.primary }} />
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayProducts.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onViewProduct?.(product.id)}>
              <div className={cn(
                'relative aspect-[4/5] rounded-2xl overflow-hidden mb-4',
                CARD_STYLES[template.effects.cardStyle] || CARD_STYLES.elevated
              )} style={{ backgroundColor: template.colors.surface }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12" style={{ color: `${template.colors.muted}44` }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <span className="absolute bottom-5 left-4 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm backdrop-blur-sm">View Product</span>
                <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                  className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 duration-300"
                  style={{ backgroundColor: template.colors.primary, color: '#fff' }}>
                  <Plus className="h-5 w-5" />
                </button>
                {i === 0 && (
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase text-white font-medium"
                    style={{ backgroundColor: template.colors.primary }}>New</div>
                )}
              </div>
              <div className="space-y-1.5 px-1">
                <p className="text-xs tracking-widest uppercase" style={{ color: template.colors.muted }}>
                  {product.categoryId || 'Collection'}
                </p>
                <h3 className="font-medium text-sm leading-tight" style={{ color: template.colors.text }}>{product.name}</h3>
                <p className="font-medium" style={{ color: template.colors.primary }}>{formatPrice(product.price, 'NGN')}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <FadeIn>
          <div className="text-center mt-14">
            <Link href="/storefront" className="inline-flex items-center gap-2 font-medium pb-1 hover:opacity-70 transition-opacity"
              style={{ color: template.colors.text, borderBottomColor: template.colors.primary, borderBottomWidth: 1 }}>
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function StorytellingDynamic({ template }: { template: TemplateConfig }) {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ backgroundColor: template.colors.secondary }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${template.colors.primary}08 0%, transparent 60%)` }} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative aspect-square rounded-3xl overflow-hidden"
              style={{ backgroundColor: `${template.colors.primary}10` }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Quote className="h-20 w-20" style={{ color: `${template.colors.primary}15` }} />
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="space-y-6">
              <p className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: template.colors.primary }}>Our Story</p>
              <h2 className="text-4xl md:text-5xl" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
                Crafted with Purpose
              </h2>
              <div className="w-12 h-px" style={{ backgroundColor: template.colors.primary }} />
              <p className="leading-relaxed" style={{ color: template.colors.muted }}>
                Every product in our collection is carefully selected to bring you the best quality and value.
                We believe in sustainable practices, ethical sourcing, and building lasting relationships
                with our customers and community.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: template.colors.primary }}>
                Read More <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function TestimonialsDynamic({ template }: { template: TemplateConfig }) {
  const reviews = [
    { name: 'Amara C.', text: 'Absolutely love the quality! Fast shipping and excellent customer service.', rating: 5 },
    { name: 'Tunde B.', text: 'Best shopping experience online. The product exceeded my expectations.', rating: 5 },
    { name: 'Zainab K.', text: 'I&apos;m a repeat customer for a reason. Consistent quality every time.', rating: 5 },
  ];

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: template.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase mb-4 font-medium" style={{ color: template.colors.primary }}>Testimonials</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
              What Our Customers Say
            </h2>
          </FadeIn>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.1}>
              <div className={cn('p-8 rounded-2xl', CARD_STYLES[template.effects.cardStyle] || CARD_STYLES.elevated)}
                style={{ backgroundColor: template.colors.surface, borderColor: template.colors.border }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" style={{ color: template.colors.primary }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: template.colors.muted }}>&ldquo;{r.text}&rdquo;</p>
                <p className="text-sm font-semibold" style={{ color: template.colors.text }}>{r.name}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterDynamic({ template }: { template: TemplateConfig }) {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ backgroundColor: template.colors.primary }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${template.colors.secondary}33 0%, transparent 60%)` }} />
      <div className="max-w-2xl mx-auto px-4 md:px-8 text-center relative z-10">
        <FadeIn>
          <Mail className="h-10 w-10 mx-auto mb-6" style={{ color: `${template.colors.background}88` }} />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Stay in the Loop</h2>
          <p className="text-white/70 mb-8">Subscribe for exclusive offers, new arrivals, and insider access.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-5 py-3 rounded-xl border-0 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
            <button className="px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap" style={{ backgroundColor: template.colors.secondary, color: '#fff' }}>
              Subscribe
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function DynamicStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: DynamicStorefrontProps) {
  const template = useTemplateConfig(store.template, store);
  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroDynamic key="hero" store={store} template={template} />,
    showcase: <ShowcaseDynamic key="showcase" products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} template={template} />,
    storytelling: <StorytellingDynamic key="storytelling" template={template} />,
    testimonials: <TestimonialsDynamic key="testimonials" template={template} />,
    newsletter: <NewsletterDynamic key="newsletter" template={template} />};

  return (
    <div className="min-h-screen" style={{ fontFamily: template.typography.bodyFont }}>
      {template.sections.map((section) => sectionComponents[section] || null)}
    </div>
  );
}
