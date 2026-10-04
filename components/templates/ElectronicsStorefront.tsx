'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { ShoppingBag, ArrowRight, Cpu, Zap, Shield, Headphones, Star, Layers, TrendingUp, Package } from 'lucide-react';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function GlassCard({ children, className, delay = 0, onClick }: { children: React.ReactNode; className?: string; delay?: number; onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className={cn('relative overflow-hidden rounded-2xl bg-[#111827]/80 backdrop-blur-xl border border-[rgba(0,212,255,0.08)] hover:border-[rgba(0,212,255,0.2)] transition-all duration-300', className)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,212,255,0.03)] via-transparent to-[rgba(124,58,237,0.03)] pointer-events-none" />
      {children}
    </motion.div>
  );
}

function HeroSection({ store }: { store: StoreDto }) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0b1120]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(0,212,255,0.06)_0%,_transparent_50%),radial-gradient(ellipse_at_80%_50%,_rgba(124,58,237,0.04)_0%,_transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.2)] to-transparent" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)]">
              <Zap className="h-3 w-3 text-[#00d4ff]" />
              <span className="text-xs tracking-[0.15em] uppercase text-[#00d4ff] font-medium">Next-Gen Technology</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {store.name || 'NEO'}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">TECH</span>
            </motion.h1>
            {store.description && (
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg text-gray-400 leading-relaxed max-w-lg">{store.description}</motion.p>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] hover:from-[#00d4ff]/90 hover:to-[#7c3aed]/90 text-white font-medium px-8 h-14 text-base group shadow-lg shadow-[rgba(0,212,255,0.2)]">
                Shop Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg border-gray-700 text-gray-300 hover:bg-white/5 px-8 h-14 text-base">
                View Specs
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1 }}
              className="flex items-center gap-8 pt-4">
              {[{ icon: Shield, label: '2-Year Warranty' }, { icon: Zap, label: 'Fast Shipping' }, { icon: Headphones, label: '24/7 Support' }].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-gray-500"><item.icon className="h-4 w-4 text-[#00d4ff]" /><span className="text-xs tracking-wide">{item.label}</span></div>
              ))}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="relative hidden lg:block">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[rgba(0,212,255,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,212,255,0.05)] to-[rgba(124,58,237,0.05)] z-10" />
              {store.bannerUrl ? <Image src={store.bannerUrl} alt="" fill className="object-cover" unoptimized /> : (
                <div className="w-full h-full bg-gradient-to-br from-[#111827] to-[#0a1628] flex items-center justify-center"><Cpu className="h-24 w-24 text-[rgba(0,212,255,0.1)]" /></div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 bg-[#0b1120] border-t border-[rgba(0,212,255,0.05)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Cpu, label: 'Latest Chipsets', desc: 'Powered by Gen-4 processors' },
            { icon: Layers, label: 'Premium Build', desc: 'Aerospace-grade materials' },
            { icon: TrendingUp, label: 'Best Value', desc: 'Price-match guaranteed' },
            { icon: Package, label: 'Free Delivery', desc: 'Same-day in major cities' },
          ].map((f, i) => (
            <GlassCard key={f.label} delay={i * 0.05} className="p-5 text-center">
              <f.icon className="h-6 w-6 text-[#00d4ff] mx-auto mb-3" />
              <p className="text-white text-sm font-medium">{f.label}</p>
              <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection({ products, onAddToCart, onViewProduct, addingToCart }: { products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  const formatPrice = (p: number, c: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: c || 'NGN' }).format(p);
  return (
    <section className="py-24 bg-[#0b1120]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[#00d4ff] text-xs tracking-[0.2em] uppercase mb-3 font-medium">Featured Products</p>
          <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Top Picks</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.slice(0, 8).map((product, i) => (
            <GlassCard key={product.id} delay={i * 0.05} className="group cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
              <div className="aspect-square bg-[#1a2744] relative overflow-hidden">
                {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized /> : (
                  <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-10 w-10 text-gray-600" /></div>
                )}
                <span className="absolute bottom-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">View Product</span>
                <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                  className="absolute bottom-3 right-3 w-11 h-11 rounded-lg bg-[#00d4ff] flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <ShoppingBag className="h-4 w-4 text-[#0a1628]" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-medium text-white line-clamp-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-[#00d4ff] font-bold">{formatPrice(product.price, 'NGN')}</p>
                  {product.quantity <= 5 && product.quantity > 0 && (
                    <span className="text-[10px] uppercase tracking-wider text-orange-400 font-medium">Low Stock</span>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>What Our Customers Say</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { text: 'Incredible quality for the price. The device exceeded all my expectations.', author: 'Chioma O.', rating: 5 },
            { text: 'Fastest delivery I\'ve ever experienced. Ordered at 8am, arrived by 2pm!', author: 'Emeka N.', rating: 5 },
            { text: 'Customer support helped me set up everything within minutes. Amazing team.', author: 'Amina S.', rating: 5 },
          ].map((t, i) => (
            <GlassCard key={i} delay={i * 0.1} className="p-6">
              <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-[#00d4ff] text-[#00d4ff]" />)}</div>
              <p className="text-gray-400 text-sm mb-6">&ldquo;{t.text}&rdquo;</p>
              <p className="text-white text-sm font-medium">{t.author}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="py-16 bg-[#0b1120] border-t border-[rgba(0,212,255,0.05)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Stay Ahead</h3>
            <p className="text-gray-500 text-sm mt-1">Get early access to drops, tech news, and exclusive deals.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input type="email" placeholder="Enter your email" className="px-5 py-3 rounded-lg bg-[#111827] border border-gray-800 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00d4ff] transition-colors min-w-[280px]" />
            <Button className="rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] hover:from-[#00d4ff]/90 hover:to-[#7c3aed]/90 text-white px-6">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ElectronicsStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: { store: StoreDto; products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  return (
    <div className="min-h-screen bg-[#0b1120]">
      <HeroSection store={store} />
      <FeaturesSection />
      <ShowcaseSection products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
