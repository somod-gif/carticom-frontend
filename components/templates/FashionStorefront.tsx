'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star, Plus, Heart, Camera, ChevronRight, Sparkles, Shield, Truck, RotateCcw, Gem } from 'lucide-react';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface FashionStorefrontProps {
  store: StoreDto;
  products: ProductDto[];
  onAddToCart: (productId: string) => void;
  onViewProduct?: (id: string) => void;
  addingToCart: string | null;
}

function LiquidGlassCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl backdrop-blur-xl',
        'border border-[rgba(201,168,76,0.12)]',
        'bg-gradient-to-br from-white/40 to-white/10',
        'shadow-[0_8px_32px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(201,168,76,0.03)] via-transparent to-[rgba(201,168,76,0.03)] pointer-events-none" />
      {children}
    </motion.div>
  );
}

function HeroSection({ store }: { store: StoreDto }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#1a1a2e]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.08)_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.3)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.2)] to-transparent" />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 300 + i * 200,
              height: 300 + i * 200,
              background: `radial-gradient(circle, rgba(201,168,76,${0.02 - i * 0.005}) 0%, transparent 70%)`,
              top: `${30 + i * 15}%`,
              left: `${10 + i * 20}%`}}
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[rgba(201,168,76,0.2)]"
              >
                <Sparkles className="h-3 w-3 text-[#c9a84c]" />
                <span className="text-xs tracking-[0.2em] uppercase text-[#c9a84c] font-medium">
                  The New Luxury
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {store.name || 'LUXE'}
                <br />
                <span className="text-[#c9a84c]">ÉDITION</span>
              </motion.h1>

              {store.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="text-lg text-gray-400 leading-relaxed max-w-lg"
                >
                  {store.description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="rounded-full bg-[#c9a84c] hover:bg-[#a8892e] text-[#1a1a2e] font-medium px-8 h-14 text-base group"
                >
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/20 text-white hover:bg-white/5 px-8 h-14 text-base"
                >
                  Our Story
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="flex items-center gap-8 pt-4"
              >
                {[
                  { icon: Truck, label: 'Complimentary Shipping' },
                  { icon: RotateCcw, label: '30-Day Returns' },
                  { icon: Shield, label: 'Authentic Guarantee' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-gray-500">
                    <item.icon className="h-4 w-4 text-[#c9a84c]" />
                    <span className="text-xs tracking-wide">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(201,168,76,0.1)] via-transparent to-[rgba(201,168,76,0.05)] z-10" />
                {store.bannerUrl ? (
                  <Image src={store.bannerUrl} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2d2d3d] to-[#1a1a2e] flex items-center justify-center">
                    <Gem className="h-20 w-20 text-[rgba(201,168,76,0.15)]" />
                  </div>
                )}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <LiquidGlassCard className="p-4 !bg-white/10">
                    <p className="text-white/80 text-sm font-light">
                      &quot;Luxury is in each detail.&quot;
                    </p>
                    <p className="text-[#c9a84c] text-xs mt-1 tracking-widest uppercase">— Maison Collection</p>
                  </LiquidGlassCard>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ShowcaseSection({ products, onAddToCart, onViewProduct, addingToCart }: {
  products: ProductDto[];
  onAddToCart: (id: string) => void;
  onViewProduct?: (id: string) => void;
  addingToCart: string | null;
}) {
  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN', minimumFractionDigits: 2 }).format(price);

  const [, setActiveIndex] = useState(0);
  const displayProducts = products.slice(0, 6);

  return (
    <section className="py-24 md:py-32 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#c9a84c] text-xs tracking-[0.25em] uppercase mb-4 font-medium">Curated Selection</p>
          <h2 className="text-4xl md:text-5xl font-light text-[#1a1a2e]" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Collection
          </h2>
          <div className="w-12 h-px bg-[#c9a84c] mx-auto mt-6" />
        </motion.div>

        <div className="flex gap-4 mb-10 justify-center flex-wrap">
          {['All', 'New Arrivals', 'Best Sellers', 'Limited Edition'].map((tab) => (
            <button
              key={tab}
              onClick={() => {}} 
              className={cn(
                'px-6 py-2.5 rounded-full text-sm tracking-wide transition-all duration-300',
                tab === 'All'
                  ? 'bg-[#1a1a2e] text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              onMouseEnter={() => setActiveIndex(i)}
              className="group cursor-pointer"
              onClick={() => onViewProduct?.(product.id)}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#f0ede8] mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <span className="absolute bottom-5 left-4 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#1a1a2e] shadow-sm backdrop-blur-sm">View Product</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
                  disabled={addingToCart === product.id}
                  className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 duration-300"
                >
                  <Plus className="h-5 w-5 text-[#1a1a2e]" />
                </button>
                <button className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Heart className="h-4 w-4 text-gray-700" />
                </button>
                {i === 0 && (
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-[#c9a84c] text-[10px] tracking-widest uppercase text-white font-medium">
                    New
                  </div>
                )}
              </div>
              <div className="space-y-1.5 px-1">
                <p className="text-xs text-gray-500 tracking-widest uppercase">
                  {product.categoryId || 'Accessories'}
                </p>
                <h3 className="font-medium text-[#1a1a2e] text-sm leading-tight">{product.name}</h3>
                <p className="text-[#c9a84c] font-medium">{formatPrice(product.price, 'NGN')}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            href="/storefront"
            className="inline-flex items-center gap-2 text-[#1a1a2e] font-medium border-b border-[#1a1a2e] pb-1 hover:text-[#c9a84c] hover:border-[#c9a84c] transition-colors"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function StorytellingSection() {
  return (
    <section className="py-24 md:py-32 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.03)_0%,_transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(201,168,76,0.08)] to-transparent z-10" />
            <div className="w-full h-full bg-[#2d2d3d] flex items-center justify-center">
              <Gem className="h-24 w-24 text-[rgba(201,168,76,0.1)]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <p className="text-[#c9a84c] text-xs tracking-[0.25em] uppercase font-medium">Our Heritage</p>
            <h2 className="text-4xl md:text-5xl font-light text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Crafted with
              <br />
              <span className="text-[#c9a84c]">Purpose</span>
            </h2>
            <div className="w-16 h-px bg-[#c9a84c]" />
            <p className="text-gray-400 leading-relaxed text-lg">
              Every piece in our collection is born from a collaboration between master artisans and contemporary design.
              We source the finest materials from across Africa, honoring traditional craftsmanship while embracing
              modern aesthetics.
            </p>
            <p className="text-gray-500 leading-relaxed">
              From the ateliers of Lagos to the workshops of Marrakech, our supply chain is built on relationships
              of trust, fair wages, and shared passion for exceptional quality.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[#c9a84c] font-medium border-b border-[rgba(201,168,76,0.3)] pb-1 hover:border-[#c9a84c] transition-colors"
            >
              Discover Our Story
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const values = [
    {
      icon: Gem,
      title: 'Exceptional Quality',
      description: 'Every item is meticulously crafted using premium materials sourced from the world\'s finest suppliers.'},
    {
      icon: Truck,
      title: 'White-Glove Delivery',
      description: 'Complimentary express shipping with tracking, signature upon delivery, and elegant unboxing experience.'},
    {
      icon: Shield,
      title: 'Authenticity Guaranteed',
      description: 'Every purchase includes a certificate of authenticity. Our experts verify each piece before it ships.'},
    {
      icon: RotateCcw,
      title: 'Hassle-Free Returns',
      description: 'Extended 30-day return window with complimentary pickup. Your satisfaction is our standard.'},
  ];

  return (
    <section className="py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#c9a84c] text-xs tracking-[0.25em] uppercase mb-4 font-medium">Why Choose Us</p>
          <h2 className="text-4xl md:text-5xl font-light text-[#1a1a2e]" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Luxe Standard
          </h2>
          <div className="w-12 h-px bg-[#c9a84c] mx-auto mt-6" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <LiquidGlassCard key={value.title} delay={i * 0.1} className="p-8 text-center !bg-white">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(201,168,76,0.1)] to-[rgba(201,168,76,0.05)] flex items-center justify-center mx-auto mb-6 border border-[rgba(201,168,76,0.1)]">
                <value.icon className="h-6 w-6 text-[#c9a84c]" />
              </div>
              <h3 className="text-lg font-medium text-[#1a1a2e] mb-3">{value.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { text: 'Absolutely stunning quality. The attention to detail is remarkable — you can feel the craftsmanship in every stitch.', author: 'A.M.', title: 'Lagos, Nigeria', rating: 5 },
    { text: 'This is what luxury should feel like. From the packaging to the product itself, everything exudes elegance and sophistication.', author: 'S.K.', title: 'Nairobi, Kenya', rating: 5 },
    { text: 'I\'ve never experienced this level of service. The team helped me find the perfect piece, and the delivery was flawless.', author: 'T.O.', title: 'Accra, Ghana', rating: 5 },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#1a1a2e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#c9a84c] text-xs tracking-[0.25em] uppercase mb-4 font-medium">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Voices of Distinction
          </h2>
          <div className="w-12 h-px bg-[#c9a84c] mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <LiquidGlassCard key={i} delay={i * 0.1} className="p-8">
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#c9a84c] text-[#c9a84c]" />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed text-sm mb-8 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="border-t border-[rgba(201,168,76,0.1)] pt-4">
                <p className="text-white font-medium text-sm">{t.author}</p>
                <p className="text-gray-500 text-xs">{t.title}</p>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialSection() {
  const posts = [
    { id: 1, label: '@luxe_style', color: 'from-amber-900/40' },
    { id: 2, label: '#MaisonLuxe', color: 'from-blue-900/40' },
    { id: 3, label: '@elegance', color: 'from-emerald-900/40' },
    { id: 4, label: '#LuxuryEdit', color: 'from-rose-900/40' },
  ];

  return (
    <section className="py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-[#c9a84c] mb-4">
            <Camera className="h-5 w-5" />
            <span className="text-xs tracking-[0.25em] uppercase font-medium">Follow Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-[#1a1a2e]" style={{ fontFamily: "'Playfair Display', serif" }}>
            @LuxeEDIT
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium">{post.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MembershipSection() {
  return (
    <section className="py-24 md:py-32 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.05)_0%,_transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.2)] to-transparent" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[rgba(201,168,76,0.2)]">
            <Gem className="h-3 w-3 text-[#c9a84c]" />
            <span className="text-xs tracking-[0.2em] uppercase text-[#c9a84c] font-medium">Exclusive Access</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-light text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Join the
            <br />
            <span className="text-[#c9a84c]">Maison Circle</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Become a member and unlock early access to new collections, private shopping events, 
            complimentary styling consultations, and exclusive limited-edition pieces.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
            {[
              { title: 'Early Access', desc: 'Preview collections 48 hours before public release' },
              { title: 'Private Events', desc: 'Invitations to exclusive trunk shows and soirées' },
              { title: 'Concierge Styling', desc: 'Personal stylist for curated recommendations' },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-5 rounded-2xl border border-[rgba(201,168,76,0.1)] bg-white/5 backdrop-blur-sm"
              >
                <p className="text-white text-sm font-medium mb-1">{benefit.title}</p>
                <p className="text-gray-500 text-xs">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="rounded-full bg-[#c9a84c] hover:bg-[#a8892e] text-[#1a1a2e] font-medium px-10 h-14 text-base group"
            >
              Apply for Membership
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-gray-600 text-xs mt-4">Complimentary membership — limited to 1,000 founding members</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="py-16 bg-[#faf8f5] border-t border-[rgba(201,168,76,0.1)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-xl font-light text-[#1a1a2e]" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Luxe Edit
            </h3>
            <p className="text-gray-500 text-sm mt-1">Receive style notes, collection previews, and exclusive offers.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-5 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#c9a84c] transition-colors min-w-[280px]"
            />
            <Button className="rounded-full bg-[#1a1a2e] hover:bg-[#2d2d3d] text-white px-6">
              Subscribe
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function FashionStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: FashionStorefrontProps) {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <HeroSection store={store} />
      <ShowcaseSection products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} />
      <StorytellingSection />
      <ValuesSection />
      <TestimonialsSection />
      <SocialSection />
      <MembershipSection />
      <NewsletterSection />
    </div>
  );
}
