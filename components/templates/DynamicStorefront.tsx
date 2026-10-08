'use client';

import { useRef, useMemo } from 'react';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShoppingBag, ArrowRight, Star, Plus, Heart, Sparkles, Shield,
  Truck, RotateCcw, ChevronRight, ChevronDown, Leaf, Quote, Mail, Layers,
  Users, Tag, MessageCircle, Package, CreditCard, Clock, BadgeCheck,
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getTemplate } from '@/features/templates/registry';
import type { TemplateConfig } from '@/features/templates/types';
import { parseSectionConfig, resolveTemplateSections } from '@/features/templates/sectionConfig';

interface DynamicStorefrontProps {
  store: StoreDto;
  products: ProductDto[];
  onAddToCart: (productId: string) => void;
  onViewProduct?: (id: string) => void;
  addingToCart: string | null;
}

interface SectionProps {
  store: StoreDto;
  products: ProductDto[];
  template: TemplateConfig;
  onAddToCart: (productId: string) => void;
  onViewProduct?: (id: string) => void;
  addingToCart: string | null;
}

/**
 * Merge the registry template with the merchant's brand overrides.
 * Store colors/fonts always win over the template defaults so the
 * rendered inline styles and CSS variables stay consistent.
 */
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
        secondary: store.secondaryColor || base.colors.secondary,
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

/** Pick an ink color that stays readable on top of `color`. */
function readableOn(color: string): string {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const match = full.match(/^([0-9a-f]{6})/i);
  if (!match) return '#ffffff';
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111827' : '#ffffff';
}

function whatsappHref(store: StoreDto): string {
  const digits = (store.whatsappNumber || '').replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : '';
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

// ─── Header (logo + store name) ────────────────────────────────

function StoreHeaderDynamic({ store, template, showShopLink }: { store: StoreDto; template: TemplateConfig; showShopLink: boolean }) {
  return (
    <header className="relative z-40 border-b" style={{ backgroundColor: template.colors.background, borderColor: template.colors.border }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={`${store.name || 'Store'} logo`}
              className="h-8 w-auto max-w-[180px] shrink-0 object-contain md:h-10"
              loading="lazy"
            />
          ) : null}
          <span
            className="truncate text-base font-semibold md:text-lg"
            style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
            {store.name || 'Store'}
          </span>
        </div>
        {showShopLink && (
          <Link
            href="#shop"
            className={cn('shrink-0 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90', BTN_STYLES[template.effects.buttonStyle] || 'rounded-full')}
            style={{ backgroundColor: template.colors.primary, color: readableOn(template.colors.primary) }}>
            Shop
          </Link>
        )}
      </div>
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────────────

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
                    style={{ backgroundColor: template.colors.primary, color: readableOn(template.colors.primary) }}>
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
                {store.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.bannerUrl} alt={store.name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layers className="h-24 w-24" style={{ color: `${template.colors.primary}20` }} />
                  </div>
                )}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl backdrop-blur-xl"
                  style={{ backgroundColor: `${template.colors.background}80`, borderColor: `${template.colors.border}`, borderWidth: 1 }}>
                  <p className="text-sm font-medium" style={{ color: template.colors.text }}>
                    {store.description || 'Quality products, carefully packed and promptly delivered.'}
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

// ─── Showcase ──────────────────────────────────────────────────

function ShowcaseDynamic({ products, onAddToCart, onViewProduct, addingToCart, template }: SectionProps) {
  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN', minimumFractionDigits: 0 }).format(price);

  const displayProducts = products.slice(0, 6);

  return (
    <section id="shop" className="py-24 md:py-32 scroll-mt-20" style={{ backgroundColor: template.colors.background }}>
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
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12" style={{ color: `${template.colors.muted}44` }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <span className="absolute bottom-5 left-4 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm backdrop-blur-sm">View Product</span>
                <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                  className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 duration-300"
                  style={{ backgroundColor: template.colors.primary, color: readableOn(template.colors.primary) }}>
                  <Plus className="h-5 w-5" />
                </button>
                {i === 0 && (
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase text-white font-medium"
                    style={{ backgroundColor: template.colors.primary }}>New</div>
                )}
              </div>
              <div className="space-y-1.5 px-1">
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

// ─── Storytelling ──────────────────────────────────────────────

function StorytellingDynamic({ store, template }: SectionProps) {
  const contactHref = whatsappHref(store) || (store.phone ? `tel:${store.phone}` : store.email ? `mailto:${store.email}` : '');
  const contactLabel = whatsappHref(store) ? 'Chat with Us' : store.phone ? 'Call Us' : store.email ? 'Email Us' : '';

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
                {store.description ? `About ${store.name}` : 'Crafted with Purpose'}
              </h2>
              <div className="w-12 h-px" style={{ backgroundColor: template.colors.primary }} />
              <p className="leading-relaxed" style={{ color: template.colors.muted }}>
                {store.description ||
                  'Every product in our collection is carefully selected to bring you the best quality and value.'}
              </p>
              <p className="leading-relaxed" style={{ color: template.colors.muted }}>
                From the first order to the last mile, we keep things simple: honest descriptions,
                careful packaging, and support that answers.
              </p>
              {contactHref && (
                <a href={contactHref} target={contactHref.startsWith('mailto:') || contactHref.startsWith('tel:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: template.colors.primary }}>
                  {contactLabel} <ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Values ────────────────────────────────────────────────────

type ValueTile = { icon: typeof Shield; title: string; description: string };

const VALUE_LIBRARY: { keys: string[]; tile: ValueTile }[] = [
  { keys: ['handmade', 'hand-made', 'crafted', 'craft', 'artisan', 'atelier'], tile: { icon: Heart, title: 'Made with Care', description: 'Pieces are made and checked by hand, so quality never gets lost between us and you.' } },
  { keys: ['sustainab', 'eco', 'organic', 'natural', 'environment', 'green'], tile: { icon: Leaf, title: 'Responsible by Design', description: 'We choose materials and processes that are kinder to people and to the planet.' } },
  { keys: ['quality', 'premium', 'durable', 'luxury', 'fine'], tile: { icon: BadgeCheck, title: 'Quality First', description: 'If a product would not meet our own standard, it does not make it onto this store.' } },
  { keys: ['fast', 'delivery', 'shipping', 'same-day', 'quick', 'dispatch'], tile: { icon: Truck, title: 'Reliable Delivery', description: 'Orders are packed promptly and sent with tracking, so nothing catches you by surprise.' } },
  { keys: ['affordable', 'value', 'budget', 'fair price', 'cheap', 'wholesale'], tile: { icon: Tag, title: 'Fair, Honest Pricing', description: 'Straightforward prices with no hidden charges waiting for you at checkout.' } },
  { keys: ['local', 'community', 'africa', 'nigerian', 'nigeria', 'lagos', 'made in'], tile: { icon: Users, title: 'Rooted in Community', description: 'We work with local makers and suppliers, and grow by keeping the people around us happy.' } },
];

const NEUTRAL_VALUES: ValueTile[] = [
  { icon: Shield, title: 'Trusted Quality', description: 'We only sell products we are happy to use and recommend ourselves.' },
  { icon: Users, title: 'Customer First', description: 'Real people answer your questions and see your order through to delivery.' },
  { icon: RotateCcw, title: 'Straightforward Returns', description: 'If something is not right, tell us and we will sort it out quickly.' },
  { icon: Clock, title: 'Prompt Handling', description: 'Orders are reviewed and prepared the same or next business day.' },
];

function ValuesDynamic({ store, template }: SectionProps) {
  const values = useMemo(() => {
    const description = (store.description || '').toLowerCase();
    const matched = VALUE_LIBRARY.filter((entry) => entry.keys.some((key) => description.includes(key))).map((e) => e.tile);
    const picked = matched.slice(0, 3);
    for (const tile of NEUTRAL_VALUES) {
      if (picked.length >= 4) break;
      if (picked.some((t) => t.title === tile.title)) continue;
      picked.push(tile);
    }
    return picked.slice(0, 4);
  }, [store.description]);

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: template.colors.surface }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase mb-4 font-medium" style={{ color: template.colors.primary }}>Why Shop With Us</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
              What We Stand For
            </h2>
            <div className="w-12 h-px mx-auto mt-6" style={{ backgroundColor: template.colors.primary }} />
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <FadeIn key={value.title} delay={i * 0.1}>
              <div className={cn('p-8 text-center h-full', CARD_STYLES[template.effects.cardStyle] || CARD_STYLES.elevated)}
                style={{ backgroundColor: template.colors.background, borderColor: template.colors.border }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 border"
                  style={{ backgroundColor: `${template.colors.primary}10`, borderColor: `${template.colors.primary}20` }}>
                  <value.icon className="h-6 w-6" style={{ color: template.colors.primary }} />
                </div>
                <h3 className="text-lg font-medium mb-3" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>{value.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: template.colors.muted }}>{value.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Membership (WhatsApp community) ───────────────────────────

function MembershipDynamic({ store, template }: SectionProps) {
  const href = whatsappHref(store);
  if (!href) return null;

  const ink = readableOn(template.colors.secondary);
  const benefits = [
    { title: 'Restock Alerts', desc: 'Know first when new stock lands' },
    { title: 'Member Offers', desc: 'Deals shared with the community only' },
    { title: 'Direct Support', desc: 'Quick answers from the team on WhatsApp' },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ backgroundColor: template.colors.secondary }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top, ${template.colors.primary}14 0%, transparent 55%)` }} />
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
        <FadeIn>
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{ borderColor: `${template.colors.primary}40`, backgroundColor: `${template.colors.primary}15` }}>
              <MessageCircle className="h-3 w-3" style={{ color: template.colors.primary }} />
              <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: template.colors.primary }}>Stay Close</span>
            </div>

            <h2 className="text-4xl md:text-6xl leading-tight" style={{ fontFamily: template.typography.headingFont, color: ink }}>
              Join the
              <br />
              <span style={{ color: template.colors.primary }}>{store.name} Community</span>
            </h2>

            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: ink, opacity: 0.7 }}>
              Get restock alerts, member-only offers, and direct support in one WhatsApp thread —
              no spam, just the things worth knowing.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
              {benefits.map((benefit, i) => (
                <FadeIn key={benefit.title} delay={0.1 + i * 0.1}>
                  <div className="p-5 rounded-2xl border h-full" style={{ borderColor: `${template.colors.primary}25`, backgroundColor: `${template.colors.primary}0d` }}>
                    <p className="text-sm font-medium mb-1" style={{ color: ink }}>{benefit.title}</p>
                    <p className="text-xs" style={{ color: ink, opacity: 0.65 }}>{benefit.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <div className="pt-4">
              <Button size="lg"
                className={`${BTN_STYLES[template.effects.buttonStyle]} font-medium px-10 h-14 text-base group`}
                style={{ backgroundColor: template.colors.primary, color: readableOn(template.colors.primary) }}
                onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}>
                <FaWhatsapp className="mr-2 h-5 w-5" />
                Join on WhatsApp
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────

function TestimonialsDynamic({ template }: SectionProps) {
  const reviews = [
    { name: 'Amara C.', text: 'Absolutely love the quality! Fast shipping and excellent customer service.', rating: 5 },
    { name: 'Tunde B.', text: 'Best shopping experience online. The product exceeded my expectations.', rating: 5 },
    { name: 'Zainab K.', text: 'I’m a repeat customer for a reason. Consistent quality every time.', rating: 5 },
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
              <div className={cn('p-8 rounded-2xl h-full', CARD_STYLES[template.effects.cardStyle] || CARD_STYLES.elevated)}
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

// ─── Features / benefits ───────────────────────────────────────

function FeaturesDynamic({ store, template }: SectionProps) {
  const energetic = template.effects.animationPreset === 'energetic' || template.effects.animationPreset === 'bold';
  const supportLine = store.whatsappNumber
    ? `Message us on WhatsApp at ${store.whatsappNumber} and a real person will reply.`
    : store.phone
      ? `Call ${store.phone} and our team will help you directly.`
      : 'Reach the team through the contact details on this page and we will get back to you.';

  const features = [
    {
      icon: energetic ? Package : Truck,
      title: energetic ? 'Same-Day Dispatch' : 'Fast, Tracked Delivery',
      text: energetic
        ? 'Orders placed in business hours leave our hands quickly, with tracking from door to door.'
        : 'We prepare orders promptly and ship them with tracking, so you always know where your purchase is.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      text: 'Payments are processed securely at checkout — your card details are never stored by this store.',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      text: supportLine,
    },
    {
      icon: RotateCcw,
      title: energetic ? 'No-Fuss Returns' : 'Easy Returns',
      text: energetic
        ? 'Changed your mind? Tell us within 7 days and we will handle the rest.'
        : 'If an item is not right, reach out within 7 days and we will make the return simple.',
    },
  ];

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: template.colors.surface }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase mb-4 font-medium" style={{ color: template.colors.primary }}>The Essentials</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
              Shopping Made Simple
            </h2>
            <div className="w-12 h-px mx-auto mt-6" style={{ backgroundColor: template.colors.primary }} />
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.1}>
              <div className={cn('p-7 h-full', CARD_STYLES[template.effects.cardStyle] || CARD_STYLES.elevated)}
                style={{ backgroundColor: template.colors.background, borderColor: template.colors.border }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border"
                  style={{ backgroundColor: `${template.colors.primary}12`, borderColor: `${template.colors.primary}22` }}>
                  <feature.icon className="h-5 w-5" style={{ color: template.colors.primary }} />
                </div>
                <h3 className="font-medium mb-2" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: template.colors.muted }}>{feature.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Categories (derived from real products) ───────────────────

const CATEGORY_STOP_WORDS = new Set(['the', 'a', 'an', 'for', 'and', 'of', 'with', 'in', 'on', 'set', 'pack', 'new']);

function productPrefix(name: string): string {
  for (const word of (name || '').split(/[\s\-_/|,]+/)) {
    const cleaned = word.replace(/[^A-Za-z0-9&']/g, '');
    if (!cleaned || CATEGORY_STOP_WORDS.has(cleaned.toLowerCase())) continue;
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }
  return '';
}

function sortByCount(entries: Map<string, number>): { label: string; count: number }[] {
  return Array.from(entries.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Derive shopable categories from the product list.
 * `ProductDto.categoryId` is an opaque id, so it is used for grouping
 * and readable labels come from the product names themselves.
 */
function deriveCategories(products: ProductDto[]): { label: string; count: number }[] {
  const byPrefix = new Map<string, number>();
  for (const product of products) {
    const prefix = productPrefix(product.name);
    if (prefix) byPrefix.set(prefix, (byPrefix.get(prefix) || 0) + 1);
  }

  const categoryIds = new Set(products.map((p) => p.categoryId).filter(Boolean));
  if (categoryIds.size >= 2) {
    const grouped = new Map<string, Map<string, number>>();
    for (const product of products) {
      if (!product.categoryId) continue;
      const prefix = productPrefix(product.name);
      if (!prefix) continue;
      const inner = grouped.get(product.categoryId) || new Map<string, number>();
      inner.set(prefix, (inner.get(prefix) || 0) + 1);
      grouped.set(product.categoryId, inner);
    }
    const labelled = new Map<string, number>();
    for (const inner of grouped.values()) {
      let best = '';
      let bestCount = -1;
      for (const [label, count] of inner) {
        if (count > bestCount) {
          best = label;
          bestCount = count;
        }
      }
      if (best) labelled.set(best, (labelled.get(best) || 0) + bestCount);
    }
    if (labelled.size >= 2) return sortByCount(labelled).slice(0, 8);
  }

  return sortByCount(byPrefix).slice(0, 8);
}

function CategoriesDynamic({ products, template }: SectionProps) {
  const categories = useMemo(() => deriveCategories(products), [products]);
  if (categories.length < 2) return null;

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: template.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase mb-4 font-medium" style={{ color: template.colors.primary }}>Browse</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
              Shop by Category
            </h2>
            <div className="w-12 h-px mx-auto mt-6" style={{ backgroundColor: template.colors.primary }} />
          </FadeIn>
        </div>

        <FadeIn>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <span key={category.label}
                className={cn('inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border', BTN_STYLES[template.effects.buttonStyle] || 'rounded-full')}
                style={{ backgroundColor: template.colors.surface, borderColor: `${template.colors.primary}33`, color: template.colors.text }}>
                {category.label}
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${template.colors.primary}18`, color: template.colors.primary }}>
                  {category.count}
                </span>
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Social / Instagram ────────────────────────────────────────

function InstagramDynamic({ store, template }: SectionProps) {
  const links = [
    { url: store.instagramUrl, label: 'Instagram', Icon: FaInstagram },
    { url: store.facebookUrl, label: 'Facebook', Icon: FaFacebookF },
    { url: store.twitterUrl, label: 'X (Twitter)', Icon: FaXTwitter },
  ].filter((link) => !!link.url);

  if (links.length === 0) return null;

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: template.colors.surface }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 mb-4" style={{ color: template.colors.primary }}>
            <FaInstagram className="h-4 w-4" />
            <span className="text-xs tracking-[0.25em] uppercase font-medium">Follow Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
            Stay in Touch with {store.name}
          </h2>
          <p className="text-sm leading-relaxed max-w-xl mx-auto mb-8" style={{ color: template.colors.muted }}>
            New arrivals, behind-the-scenes, and offers — first on our social pages.
            Follow along and never miss a drop.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {links.map(({ url, label, Icon }) => (
              <a key={label} href={url!} target="_blank" rel="noopener noreferrer"
                className={cn('inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-opacity hover:opacity-85', BTN_STYLES[template.effects.buttonStyle] || 'rounded-full')}
                style={{ backgroundColor: `${template.colors.primary}14`, borderColor: `${template.colors.primary}33`, borderWidth: 1, color: template.colors.primary }}>
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────

function FaqDynamic({ store, template }: SectionProps) {
  const supportAnswer = store.whatsappNumber
    ? `Message us on WhatsApp at ${store.whatsappNumber} — a real person will reply during business hours.`
    : store.phone
      ? `Call us on ${store.phone} during business hours and we will help right away.`
      : store.email
        ? `Email ${store.email} and we will get back to you within one business day.`
        : 'Use the contact details on this page — a real person will reply during business hours.';

  const faqs = [
    {
      question: 'How long will my order take?',
      answer: 'Most orders are prepared within one business day and delivered in 2–5 working days, depending on your location. You will receive an update as soon as yours is on the way.',
    },
    {
      question: 'What is your return policy?',
      answer: 'If something is not right, contact us within 7 days of delivery and we will arrange a return or exchange — items simply need to be unused and in their original packaging.',
    },
    {
      question: 'Which payment methods can I use?',
      answer: 'You can pay securely at checkout by card or bank transfer. Your payment is only confirmed once your order has been accepted.',
    },
    {
      question: 'How do I get help with my order?',
      answer: supportAnswer,
    },
  ];

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: template.colors.background }}>
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase mb-4 font-medium" style={{ color: template.colors.primary }}>Good to Know</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: template.typography.headingFont, color: template.colors.text }}>
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-px mx-auto mt-6" style={{ backgroundColor: template.colors.primary }} />
          </FadeIn>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={faq.question} delay={i * 0.05}>
              <details className="group rounded-xl border overflow-hidden"
                style={{ backgroundColor: template.colors.surface, borderColor: template.colors.border }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-medium"
                  style={{ color: template.colors.text }}>
                  <span>{faq.question}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: template.colors.primary }} />
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: template.colors.muted }}>
                  {faq.answer}
                </p>
              </details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ────────────────────────────────────────────────

function NewsletterDynamic({ store, template }: SectionProps) {
  const ink = readableOn(template.colors.primary);
  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ backgroundColor: template.colors.primary }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${template.colors.secondary}33 0%, transparent 60%)` }} />
      <div className="max-w-2xl mx-auto px-4 md:px-8 text-center relative z-10">
        <FadeIn>
          <Mail className="h-10 w-10 mx-auto mb-6" style={{ color: ink, opacity: 0.6 }} />
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: ink }}>Stay in the Loop</h2>
          <p className="mb-8" style={{ color: ink, opacity: 0.75 }}>
            Subscribe for {store.name} updates, new arrivals, and offers worth opening.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-xl border-0 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
            <button className="px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap"
              style={{ backgroundColor: template.colors.secondary, color: readableOn(template.colors.secondary) }}>
              Subscribe
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Root ──────────────────────────────────────────────────────

export function DynamicStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: DynamicStorefrontProps) {
  const template = useTemplateConfig(store.template, store);

  const configuredSections = useMemo(() => parseSectionConfig(store.sectionConfig), [store.sectionConfig]);
  const sections = useMemo(
    () => resolveTemplateSections(template.sections, configuredSections),
    [template.sections, configuredSections]
  );

  const sectionProps: SectionProps = { store, products, template, onAddToCart, onViewProduct, addingToCart };
  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroDynamic key="hero" {...sectionProps} />,
    showcase: <ShowcaseDynamic key="showcase" {...sectionProps} />,
    storytelling: <StorytellingDynamic key="storytelling" {...sectionProps} />,
    values: <ValuesDynamic key="values" {...sectionProps} />,
    membership: <MembershipDynamic key="membership" {...sectionProps} />,
    testimonials: <TestimonialsDynamic key="testimonials" {...sectionProps} />,
    features: <FeaturesDynamic key="features" {...sectionProps} />,
    categories: <CategoriesDynamic key="categories" {...sectionProps} />,
    instagram: <InstagramDynamic key="instagram" {...sectionProps} />,
    faq: <FaqDynamic key="faq" {...sectionProps} />,
    newsletter: <NewsletterDynamic key="newsletter" {...sectionProps} />};

  // Resolved brand values: store wins, template is the fallback.
  const primaryColor = store.primaryColor || template.colors.primary;
  const secondaryColor = store.secondaryColor || template.colors.secondary;
  const bodyFont = store.fontFamily || template.typography.bodyFont;

  const containerStyle = {
    fontFamily: bodyFont,
    '--store-primary': primaryColor,
    '--store-secondary': secondaryColor,
    '--store-font': bodyFont,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen" style={containerStyle}>
      <StoreHeaderDynamic store={store} template={template} showShopLink={sections.includes('showcase')} />
      {sections.map((section) => sectionComponents[section] || null)}
    </div>
  );
}
