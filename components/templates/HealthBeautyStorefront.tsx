'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { ShoppingBag, ArrowRight, Sparkles, Star, Heart, Droplets, Shield, Sun, Gem } from 'lucide-react';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';


function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function HeroSection({ store }: { store: StoreDto }) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[rgba(219,39,119,0.04)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[rgba(244,114,182,0.04)] rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-[rgba(219,39,119,0.15)]">
                <Sparkles className="h-3 w-3 text-[#db2777]" />
                <span className="text-xs tracking-[0.15em] uppercase text-[#db2777] font-medium">Clean Beauty</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <h1 className="text-5xl md:text-7xl font-light text-[#1f0a18] leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                {store.name || 'Glow'}
                <br />
                <span className="text-[#db2777]">Radiance Within</span>
              </h1>
            </FadeIn>
            {store.description && <FadeIn delay={0.6}><p className="text-lg text-gray-600 leading-relaxed max-w-lg">{store.description}</p></FadeIn>}
            <FadeIn delay={0.8}>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-[#db2777] hover:bg-[#be185d] text-white font-medium px-8 h-14 text-base group shadow-lg shadow-[rgba(219,39,119,0.2)]">
                  Discover Products <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-gray-300 text-gray-700 hover:bg-white/60 px-8 h-14 text-base">
                  Take the Quiz
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={1}>
              <div className="flex items-center gap-6 pt-4">
                {[{ icon: Droplets, label: 'Clean Ingredients' }, { icon: Shield, label: 'Dermatologist Tested' }, { icon: Sun, label: 'SPF 50+ Available' }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-gray-500"><item.icon className="h-4 w-4 text-[#db2777]" /><span className="text-xs tracking-wide">{item.label}</span></div>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.5} className="relative hidden lg:block">
            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-xl border border-white/50">
              {store.bannerUrl ? <Image src={store.bannerUrl} alt="" fill className="object-cover" unoptimized /> : (
                <div className="w-full h-full bg-gradient-to-br from-[#fbcfe8] to-[#fdf2f8] flex items-center justify-center"><Gem className="h-24 w-24 text-[rgba(219,39,119,0.1)]" /></div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection({ products, onAddToCart, onViewProduct, addingToCart }: { products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  const fp = (p: number, c: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: c || 'NGN' }).format(p);
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-14">
          <p className="text-[#db2777] text-xs tracking-[0.2em] uppercase mb-3 font-medium">Our Bestsellers</p>
          <h2 className="text-4xl font-light text-[#1f0a18]" style={{ fontFamily: "'Sora', sans-serif" }}>Love Your Skin</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.slice(0, 8).map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.05}>
              <div className="group cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
                <div className="aspect-[3/4] rounded-2xl bg-[#fdf2f8] relative overflow-hidden mb-3">
                  {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized /> : (
                    <div className="w-full h-full flex items-center justify-center"><Sparkles className="h-10 w-10 text-gray-300" /></div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">View Product</span>
                  <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                    className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#db2777] text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg">
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-[#db2777] font-medium text-sm mt-0.5">{fp(product.price, 'NGN')}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 bg-[#fdf2f8]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Droplets, title: '100% Clean', desc: 'No parabens, sulfates, or synthetic fragrances. Ever.' },
            { icon: Heart, title: 'Cruelty-Free', desc: 'Never tested on animals. Certified by Leaping Bunny.' },
            { icon: Shield, title: 'Dermatologist Approved', desc: 'Formulated with experts for all skin types.' },
          ].map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1}>
              <div className="text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-5"><f.icon className="h-6 w-6 text-[#db2777]" /></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-12"><h2 className="text-3xl font-light text-[#1f0a18]" style={{ fontFamily: "'Sora', sans-serif" }}>Real Results</h2></FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { text: 'My skin has never looked this good. The serum is absolutely life-changing!', author: 'Zainab K.', rating: 5 },
            { text: 'Finally, a brand that actually cares about ingredients. My sensitive skin loves this.', author: 'Folake A.', rating: 5 },
            { text: 'The moisturizer is so lightweight yet incredibly hydrating. Obsessed!', author: 'Temilade O.', rating: 5 },
          ].map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="p-6 rounded-2xl bg-[#fdf2f8]">
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-[#db2777] text-[#db2777]" />)}</div>
                <p className="text-gray-600 text-sm mb-6">&ldquo;{t.text}&rdquo;</p>
                <p className="text-gray-900 font-medium text-sm">{t.author}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function MembershipSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#db2777] to-[#be185d] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
      <div className="max-w-3xl mx-auto px-4 md:px-8 text-center relative z-10">
        <FadeIn className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
            <Gem className="h-3 w-3 text-white" />
            <span className="text-xs tracking-[0.15em] uppercase text-white font-medium">Glow Circle</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-white leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>Your Beauty Ritual,<br />Curated Monthly</h2>
          <p className="text-white/70 max-w-lg mx-auto">Join the Glow Circle and receive personalized product selections, early access to new launches, and exclusive member pricing.</p>
          <Button size="lg" className="rounded-full bg-white text-[#db2777] hover:bg-white/90 font-medium px-10 h-14 text-base">Join the Circle</Button>
        </FadeIn>
      </div>
    </section>
  );
}

export function HealthBeautyStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: { store: StoreDto; products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection store={store} />
      <ShowcaseSection products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} />
      <FeaturesSection />
      <TestimonialsSection />
      <MembershipSection />
    </div>
  );
}
