'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Palette, Heart, Sparkles, Scissors, Brush, Camera, ChevronRight, Users, Globe, Award } from 'lucide-react';
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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#2d1b0e] via-[#5c3d2e] to-[#8b5e3c]">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,165,116,0.08)_0%,_transparent_50%)]" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20">
                <Sparkles className="h-3 w-3 text-[#d4a574]" />
                <span className="text-xs tracking-[0.15em] uppercase text-[#d4a574] font-medium">Handmade with Love</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <h1 className="text-5xl md:text-7xl font-light text-white leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                {store.name || 'Atelier'}
                <br />
                <span className="text-[#d4a574]">Art & Craft</span>
              </h1>
            </FadeIn>
            {store.description && <FadeIn delay={0.6}><p className="text-lg text-white/70 leading-relaxed max-w-lg">{store.description}</p></FadeIn>}
            <FadeIn delay={0.8}>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-none bg-[#d4a574] hover:bg-[#c49464] text-[#2d1b0e] font-medium px-8 h-14 text-base group">
                  Browse Gallery <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-none border-white/30 text-white hover:bg-white/10 px-8 h-14 text-base">
                  Commission a Piece
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={1}>
              <div className="flex items-center gap-6 pt-4">
                {[{ icon: Users, label: '200+ Artisans' }, { icon: Globe, label: 'Pan-African' }, { icon: Award, label: 'Award-Winning' }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-white/60"><item.icon className="h-4 w-4" /><span className="text-xs tracking-wide">{item.label}</span></div>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.5} className="relative hidden lg:block">
            <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b0e] to-transparent z-10" />
              {store.bannerUrl ? <Image src={store.bannerUrl} alt="" fill className="object-cover" unoptimized /> : (
                <div className="w-full h-full bg-gradient-to-br from-[#8b5e3c] to-[#2d1b0e] flex items-center justify-center"><Palette className="h-24 w-24 text-white/15" /></div>
              )}
              <div className="absolute bottom-6 left-6 right-6 z-20 p-4 bg-white/10 backdrop-blur-sm border border-white/10">
                <p className="text-white text-sm font-light italic" style={{ fontFamily: "'Fraunces', serif" }}>&quot;Every piece tells a story of heritage and craftsmanship.&quot;</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="py-24 bg-[#fdf8f3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="aspect-square bg-[#f5ede4] flex items-center justify-center border border-[rgba(139,94,60,0.1)]">
              <Brush className="h-32 w-32 text-[rgba(139,94,60,0.12)]" />
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="space-y-6">
            <p className="text-[#8b5e3c] text-xs tracking-[0.25em] uppercase font-medium">Our Mission</p>
            <h2 className="text-4xl font-light text-[#2d1b0e]" style={{ fontFamily: "'Fraunces', serif" }}>Celebrating African Craftsmanship</h2>
            <div className="w-12 h-0.5 bg-[#8b5e3c]" />
            <p className="text-gray-600 leading-relaxed">We connect you with master artisans from across Africa — from beadworkers in Lagos to ceramicists in Nairobi. Every item is handmade, one of a kind, and steeped in cultural heritage.</p>
            <p className="text-gray-500 leading-relaxed">By supporting our artisans, you&apos;re preserving traditional crafts, empowering local communities, and bringing home a piece of Africa&apos;s soul.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-[#8b5e3c] font-medium border-b border-[#8b5e3c]/30 pb-1 hover:border-[#8b5e3c] transition-colors">
              Meet Our Artisans <ChevronRight className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection({ products, onAddToCart, onViewProduct, addingToCart }: { products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  const fp = (p: number, c: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: c || 'NGN' }).format(p);
  return (
    <section className="py-24 bg-[#fdf8f3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-14">
          <p className="text-[#8b5e3c] text-xs tracking-[0.2em] uppercase mb-3 font-medium">From the Workshop</p>
          <h2 className="text-4xl font-light text-[#2d1b0e]" style={{ fontFamily: "'Fraunces', serif" }}>Featured Creations</h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.05}>
              <div
                className="bg-white border border-gray-200 hover:shadow-lg transition-shadow group cursor-pointer"
                onClick={() => onViewProduct?.(product.id)}
              >
                <div className="aspect-square bg-[#f5ede4] relative">
                  {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized /> : (
                    <div className="w-full h-full flex items-center justify-center"><Scissors className="h-10 w-10 text-gray-300" /></div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm backdrop-blur-sm">View Product</span>
                  <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                    className="absolute bottom-3 right-3 w-11 h-11 bg-[#8b5e3c] text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-[#8b5e3c] font-medium mt-1">{fp(product.price, 'NGN')}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Heart, title: 'Fair Trade Certified', desc: 'Artisans receive 70% of the sale price — above fair trade standards.' },
            { icon: Globe, title: 'Sustainable Materials', desc: 'We use reclaimed wood, organic cotton, natural dyes, and recycled packaging.' },
            { icon: Award, title: 'Heritage Preservation', desc: 'Every purchase helps keep traditional African crafts alive for future generations.' },
          ].map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.1} className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5ede4] flex items-center justify-center mx-auto mb-5"><v.icon className="h-7 w-7 text-[#8b5e3c]" /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{v.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramSection() {
  return (
    <section className="py-20 bg-[#fdf8f3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[#8b5e3c] mb-3"><Camera className="h-5 w-5" /><span className="text-xs tracking-[0.2em] uppercase font-medium">Follow @AtelierAfrica</span></div>
          <h2 className="text-3xl font-light text-[#2d1b0e]" style={{ fontFamily: "'Fraunces', serif" }}>Art in Action</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Workshop', 'Materials', 'Process', 'Gallery'].map((label, i) => (
            <FadeIn key={label} delay={i * 0.05}>
              <div className="aspect-square bg-gradient-to-br from-[#f5ede4] to-[#e8d5c4] flex items-center justify-center cursor-pointer group relative">
                <Camera className="h-8 w-8 text-gray-400 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[#2d1b0e]/0 group-hover:bg-[#2d1b0e]/20 transition-colors flex items-end p-3">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
                </div>
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
    <section className="py-16 bg-[#2d1b0e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-light text-white" style={{ fontFamily: "'Fraunces', serif" }}>The Atelier Letter</h3>
            <p className="text-white/60 text-sm mt-1">Stories from the workshop, new collections, and artisan spotlights.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input type="email" placeholder="Your email" className="px-5 py-3 bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 min-w-[280px]" />
            <Button className="rounded-none bg-[#d4a574] text-[#2d1b0e] hover:bg-[#c49464] px-6 font-medium">Subscribe</Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function ArtsStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: { store: StoreDto; products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  return (
    <div className="min-h-screen bg-[#fdf8f3]">
      <HeroSection store={store} />
      <StorySection />
      <ShowcaseSection products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} />
      <ValuesSection />
      <InstagramSection />
      <NewsletterSection />
    </div>
  );
}
