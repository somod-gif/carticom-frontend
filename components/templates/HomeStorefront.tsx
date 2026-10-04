'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Home, Sofa, Lightbulb, PaintBucket, ChevronRight, Truck, Shield, RefreshCw } from 'lucide-react';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function HeroSection({ store }: { store: StoreDto }) {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-[#451a03] via-[#78350f] to-[#b45309]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,_rgba(245,158,11,0.08)_0%,_transparent_50%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#451a03] to-transparent" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Home className="h-3 w-3 text-white" />
                <span className="text-xs tracking-[0.15em] uppercase text-white font-medium">Your Sanctuary</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <h1 className="text-5xl md:text-7xl font-light text-white leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {store.name || 'Sanctuary'}
                <br />
                <span className="text-[#f59e0b]">Home & Soul</span>
              </h1>
            </FadeIn>
            {store.description && <FadeIn delay={0.6}><p className="text-lg text-white/70 leading-relaxed max-w-lg">{store.description}</p></FadeIn>}
            <FadeIn delay={0.8}>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-[#451a03] font-medium px-8 h-14 text-base group shadow-lg shadow-[rgba(245,158,11,0.2)]">
                  Explore Rooms <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 px-8 h-14 text-base">
                  Inspiration
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={1}>
              <div className="flex items-center gap-6 pt-4">
                {[{ icon: Truck, label: 'Free Delivery' }, { icon: Shield, label: 'Quality Guarantee' }, { icon: RefreshCw, label: '30-Day Returns' }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-white/60"><item.icon className="h-4 w-4" /><span className="text-xs tracking-wide">{item.label}</span></div>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.5} className="relative hidden lg:block">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              {store.bannerUrl ? <Image src={store.bannerUrl} alt="" fill className="object-cover" unoptimized /> : (
                <div className="w-full h-full bg-gradient-to-br from-[#b45309] to-[#451a03] flex items-center justify-center"><Sofa className="h-24 w-24 text-white/20" /></div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const cats = [
    { icon: Sofa, name: 'Living Room', desc: 'Sofas, tables, decor' },
    { icon: Lightbulb, name: 'Lighting', desc: 'Lamps, fixtures, bulbs' },
    { icon: PaintBucket, name: 'Decor', desc: 'Art, vases, textiles' },
    { icon: Home, name: 'Bedroom', desc: 'Beds, wardrobes, linens' },
  ];
  return (
    <section className="py-20 bg-[#fdfaf3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-12">
          <p className="text-[#b45309] text-xs tracking-[0.2em] uppercase mb-3 font-medium">Shop by Room</p>
          <h2 className="text-4xl font-light text-[#1c0f06]" style={{ fontFamily: "'DM Serif Display', serif" }}>Find Your Style</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {cats.map((cat, i) => (
            <FadeIn key={cat.name} delay={i * 0.1}>
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg hover:border-[#b45309]/20 transition-all cursor-pointer group">
                <cat.icon className="h-8 w-8 text-[#b45309] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">{cat.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{cat.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection({ products, onAddToCart, onViewProduct, addingToCart }: { products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  const fp = (p: number, c: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: c || 'NGN' }).format(p);
  return (
    <section className="py-24 bg-[#fdfaf3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-14">
          <p className="text-[#b45309] text-xs tracking-[0.2em] uppercase mb-3 font-medium">Featured</p>
          <h2 className="text-4xl font-light text-[#1c0f06]" style={{ fontFamily: "'DM Serif Display', serif" }}>Curated for You</h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.05}>
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
                <div className="aspect-[4/3] bg-[#f5f0ea] relative">
                  {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized /> : (
                    <div className="w-full h-full flex items-center justify-center"><Sofa className="h-10 w-10 text-gray-300" /></div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">View Product</span>
                  <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                    className="absolute bottom-3 right-3 w-11 h-11 rounded-lg bg-[#b45309] text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-[#b45309] font-semibold">{fp(product.price, 'NGN')}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-[#f59e0b]/10 to-[#b45309]/10 flex items-center justify-center">
              <Home className="h-32 w-32 text-[rgba(180,83,9,0.15)]" />
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="space-y-6">
            <p className="text-[#b45309] text-xs tracking-[0.25em] uppercase font-medium">Our Philosophy</p>
            <h2 className="text-4xl font-light text-[#1c0f06]" style={{ fontFamily: "'DM Serif Display', serif" }}>Every Home Tells a Story</h2>
            <div className="w-12 h-0.5 bg-[#b45309]" />
            <p className="text-gray-600 leading-relaxed">We believe your home should be a reflection of who you are. That&apos;s why we curate pieces that blend timeless craftsmanship with modern comfort, sourced from artisans around the world.</p>
            <p className="text-gray-500 leading-relaxed">From handwoven textiles in Ghana to hand-carved wooden furniture in Nigeria, each piece brings a unique story into your home.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-[#b45309] font-medium border-b border-[#b45309]/30 pb-1 hover:border-[#b45309] transition-colors">Read Our Story <ChevronRight className="h-4 w-4" /></Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="py-16 bg-[#451a03]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-light text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>The Sanctuary Journal</h3>
            <p className="text-white/60 text-sm mt-1">Design inspiration, styling tips, and new arrivals.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input type="email" placeholder="Your email" className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 min-w-[280px]" />
            <Button className="rounded-full bg-[#f59e0b] text-[#451a03] hover:bg-[#d97706] px-6">Subscribe</Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function HomeStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: { store: StoreDto; products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  return (
    <div className="min-h-screen bg-[#fdfaf3]">
      <HeroSection store={store} />
      <CategoriesSection />
      <ShowcaseSection products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} />
      <StorySection />
      <NewsletterSection />
    </div>
  );
}
