'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { ShoppingBag, ArrowRight, Zap, Star, Trophy, Flame, Users, Dumbbell, TrendingUp, Shield } from 'lucide-react';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function HeroSection({ store }: { store: StoreDto }) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#020617]">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[rgba(239,68,68,0.06)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(239,68,68,0.3)] to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                <Zap className="h-3 w-3 text-[#ef4444]" />
                <span className="text-xs tracking-[0.15em] uppercase text-[#ef4444] font-bold">Unleash Your Potential</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <h1 className="text-6xl md:text-8xl font-bold text-white leading-[0.9] uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {store.name || 'PULSE'}
                <br />
                <span className="text-[#ef4444]">FITNESS</span>
              </h1>
            </FadeIn>
            {store.description && <FadeIn delay={0.6}><p className="text-lg text-gray-400 leading-relaxed max-w-lg">{store.description}</p></FadeIn>}
            <FadeIn delay={0.8}>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-none bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold px-10 h-14 text-base uppercase tracking-wider group">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-none border-gray-700 text-gray-300 hover:bg-white/5 px-10 h-14 text-base uppercase tracking-wider">
                  Join the Team
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={1}>
              <div className="flex items-center gap-8 pt-4">
                {[{ icon: Trophy, label: 'Pro Grade' }, { icon: TrendingUp, label: 'Results Guaranteed' }, { icon: Shield, label: 'Lifetime Warranty' }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-gray-500"><item.icon className="h-4 w-4 text-[#ef4444]" /><span className="text-xs tracking-wide font-medium">{item.label}</span></div>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.5} className="relative hidden lg:block">
            <div className="relative aspect-[4/5] overflow-hidden border border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent z-10" />
              {store.bannerUrl ? <Image src={store.bannerUrl} alt="" fill className="object-cover" unoptimized /> : (
                <div className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#020617] flex items-center justify-center"><Dumbbell className="h-24 w-24 text-[rgba(239,68,68,0.1)]" /></div>
              )}
              <div className="absolute bottom-6 left-6 right-6 z-20 p-4 bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-white text-sm font-bold uppercase tracking-wider">Go Hard or Go Home</p>
                <p className="text-gray-400 text-xs mt-1">— Premium athletic gear</p>
              </div>
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
    <section className="py-24 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-14">
          <p className="text-[#ef4444] text-xs tracking-[0.2em] uppercase mb-3 font-bold">Bestsellers</p>
          <h2 className="text-5xl font-bold text-white uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Top Performers</h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.05}>
              <div className="bg-[#0f172a] border border-gray-800 hover:border-[#ef4444]/30 transition-all group cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
                <div className="aspect-square bg-[#1e293b] relative">
                  {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized /> : (
                    <div className="w-full h-full flex items-center justify-center"><Dumbbell className="h-10 w-10 text-gray-700" /></div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">View Product</span>
                  <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                    className="absolute bottom-3 right-3 w-12 h-12 bg-[#ef4444] text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <ShoppingBag className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{product.name}</h3>
                  <p className="text-[#ef4444] font-bold mt-1">{fp(product.price, 'NGN')}</p>
                </div>
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
    <section className="py-20 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-3 gap-0 border border-gray-800">
          {[
            { icon: Trophy, title: 'Compete-Ready', desc: 'Trusted by 50+ professional athletes across Africa' },
            { icon: Flame, title: 'Built to Last', desc: 'Reinforced stitching, premium materials, extreme durability' },
            { icon: Users, title: 'Community', desc: 'Join 10,000+ members in our training programs' },
          ].map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1}>
              <div className="p-8 text-center border-b md:border-b-0 md:border-r border-gray-800 last:border-r-0">
                <f.icon className="h-8 w-8 text-[#ef4444] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{f.title}</h3>
                <p className="text-gray-500 text-sm mt-2">{f.desc}</p>
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
    <section className="py-20 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Athlete Approved</h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { text: 'Best gear I\'ve ever trained in. The durability is unmatched.', author: 'Tunde A.', tag: 'Marathon Runner' },
            { text: 'From the gym to the pitch, this kit performs at every level.', author: 'Kelechi N.', tag: 'Professional Footballer' },
            { text: 'The compression technology is next-level. Huge difference in recovery.', author: 'Aisha M.', tag: 'CrossFit Athlete' },
          ].map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="p-6 bg-[#0f172a] border border-gray-800">
                <div className="flex gap-1 mb-4">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-[#ef4444] text-[#ef4444]" />)}</div>
                <p className="text-gray-400 text-sm mb-6">&ldquo;{t.text}&rdquo;</p>
                <p className="text-white font-bold uppercase text-sm tracking-wider">{t.author}</p>
                <p className="text-gray-500 text-xs">{t.tag}</p>
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
    <section className="py-24 bg-[#ef4444]">
      <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
        <FadeIn className="space-y-6">
          <Trophy className="h-12 w-12 text-white/80 mx-auto" />
          <h2 className="text-5xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Join the PULSE Elite</h2>
          <p className="text-white/80 max-w-lg mx-auto">Exclusive access to limited drops, athlete collabs, and members-only pricing. Free to join.</p>
          <Button size="lg" className="rounded-none bg-white text-[#ef4444] hover:bg-white/90 font-bold px-10 h-14 text-base uppercase tracking-wider">Get Elite Access</Button>
        </FadeIn>
      </div>
    </section>
  );
}

export function SportsStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: { store: StoreDto; products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  return (
    <div className="min-h-screen bg-[#020617]">
      <HeroSection store={store} />
      <ShowcaseSection products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} />
      <FeaturesSection />
      <TestimonialsSection />
      <MembershipSection />
    </div>
  );
}
