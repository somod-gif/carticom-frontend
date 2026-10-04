'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Leaf, Star, Sun, Droplets, ChevronRight, Truck } from 'lucide-react';
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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#2d4a22] via-[#4a7c3f] to-[#8fbc6b]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(255,255,255,0.08)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#2d4a22] to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Leaf className="h-3 w-3 text-white" />
                <span className="text-xs tracking-[0.15em] uppercase text-white font-medium">Farm to Table</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <h1 className="text-5xl md:text-7xl font-light text-white leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {store.name || 'Harvest'}
                <br />
                <span className="italic">Fresh. Organic. Yours.</span>
              </h1>
            </FadeIn>
            {store.description && <FadeIn delay={0.6}><p className="text-lg text-white/70 leading-relaxed max-w-lg">{store.description}</p></FadeIn>}
            <FadeIn delay={0.8}>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-white text-[#2d4a22] hover:bg-white/90 font-medium px-8 h-14 text-base group">
                  Shop Fresh <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 px-8 h-14 text-base">
                  Our Promise
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={1}>
              <div className="flex items-center gap-6 pt-4">
                {[{ icon: Truck, label: 'Farm Direct' }, { icon: Sun, label: 'Sun-Ripened' }, { icon: Droplets, label: 'Chemical Free' }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-white/60"><item.icon className="h-4 w-4" /><span className="text-xs tracking-wide">{item.label}</span></div>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.5} className="relative hidden lg:block">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-10 rounded-[3rem]" />
              {store.bannerUrl ? <Image src={store.bannerUrl} alt="" fill className="object-cover" unoptimized /> : (
                <div className="w-full h-full bg-gradient-to-br from-[#8fbc6b] to-[#2d4a22] flex items-center justify-center"><Leaf className="h-24 w-24 text-white/20" /></div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const categories = ['Fresh Produce', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Pantry Staples', 'Organic Snacks'];
  return (
    <section className="py-20 bg-[#fcfaf5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-[#1a2e15]" style={{ fontFamily: "'Instrument Serif', serif" }}>Shop by Category</h2>
        </FadeIn>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat, i) => (
            <FadeIn key={cat} delay={i * 0.05}>
              <button className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:border-[#4a7c3f] hover:text-[#4a7c3f] hover:bg-[#f0f7ed] transition-all">
                {cat}
              </button>
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
    <section className="py-20 bg-[#fcfaf5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-12">
          <p className="text-[#4a7c3f] text-xs tracking-[0.2em] uppercase mb-3 font-medium">Fresh Picks</p>
          <h2 className="text-3xl md:text-4xl font-light text-[#1a2e15]" style={{ fontFamily: "'Instrument Serif', serif" }}>Today&apos;s Selection</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.05}>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
                <div className="aspect-square bg-[#f5f7f0] relative">
                  {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized /> : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-gray-300" /></div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">View Product</span>
                  <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                    className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#4a7c3f] text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg">
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-[#4a7c3f] font-semibold mt-1">{fp(product.price, 'NGN')}</p>
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
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-[#8fbc6b]/20 to-[#4a7c3f]/20 flex items-center justify-center">
              <Leaf className="h-32 w-32 text-[rgba(74,124,63,0.15)]" />
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="space-y-6">
            <p className="text-[#4a7c3f] text-xs tracking-[0.25em] uppercase font-medium">Our Story</p>
            <h2 className="text-4xl font-light text-[#1a2e15]" style={{ fontFamily: "'Instrument Serif', serif" }}>From African Soil to Your Table</h2>
            <div className="w-12 h-0.5 bg-[#4a7c3f]" />
            <p className="text-gray-600 leading-relaxed">We partner directly with smallholder farms across Nigeria, Ghana, and Kenya to bring you the freshest organic produce. Every item is harvested at peak ripeness and delivered within 24 hours.</p>
            <p className="text-gray-500 leading-relaxed">Our commitment to sustainable agriculture means you get better-tasting food while supporting farming communities and protecting the environment.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-[#4a7c3f] font-medium border-b border-[#4a7c3f]/30 pb-1 hover:border-[#4a7c3f] transition-colors">
              Meet Our Farmers <ChevronRight className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#fcfaf5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl font-light text-[#1a2e15]" style={{ fontFamily: "'Instrument Serif', serif" }}>What Our Community Says</h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { text: 'The freshest vegetables I\'ve ever had. You can taste the difference!', author: 'Ngozi A.', role: 'Home Chef' },
            { text: 'My kids love the organic fruits. I love knowing exactly where our food comes from.', author: 'Chidi O.', role: 'Parent' },
            { text: 'Supporting local farmers while getting premium quality — it\'s a win-win.', author: 'Yetunde B.', role: 'Nutritionist' },
          ].map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white p-6 rounded-2xl border border-gray-100">
                <div className="flex gap-1 mb-4">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-[#8fbc6b] text-[#8fbc6b]" />)}</div>
                <p className="text-gray-600 text-sm mb-6">&ldquo;{t.text}&rdquo;</p>
                <p className="text-gray-900 text-sm font-medium">{t.author}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="py-16 bg-[#2d4a22]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-light text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>The Harvest Journal</h3>
            <p className="text-white/60 text-sm mt-1">Weekly recipes, seasonal picks, and farm stories.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input type="email" placeholder="Your email" className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 min-w-[280px]" />
            <Button className="rounded-full bg-white text-[#2d4a22] hover:bg-white/90 px-6">Subscribe</Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function FoodStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: { store: StoreDto; products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  return (
    <div className="min-h-screen bg-[#fcfaf5]">
      <HeroSection store={store} />
      <CategoriesSection />
      <ShowcaseSection products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} />
      <StorySection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
