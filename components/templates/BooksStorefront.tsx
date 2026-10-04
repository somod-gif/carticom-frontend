'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Book, Star, BookOpen, Feather, Heart, Layers, Clock, MessageCircle } from 'lucide-react';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.3, 0.1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function HeroSection({ store }: { store: StoreDto }) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#fafaf9]">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[rgba(214,211,209,0.3)] to-transparent" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[#1c1917]" />
                <span className="text-xs tracking-[0.2em] uppercase text-[#1c1917] font-medium">Curated Reading</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <h1 className="text-5xl md:text-7xl font-light text-[#1c1917] leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {store.name || 'Page & Pixel'}
                <br />
                <span className="italic text-gray-500">Where Words Find Home</span>
              </h1>
            </FadeIn>
            {store.description && <FadeIn delay={0.6}><p className="text-lg text-gray-600 leading-relaxed max-w-lg font-serif">{store.description}</p></FadeIn>}
            <FadeIn delay={0.8}>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-none bg-[#1c1917] hover:bg-[#292524] text-white font-medium px-8 h-14 text-base group">
                  Browse Books <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-none border-gray-300 text-gray-700 hover:bg-white px-8 h-14 text-base">
                  Staff Picks
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={1}>
              <div className="flex items-center gap-6 pt-4 text-gray-500 text-sm">
                <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" /> 10,000+ Titles</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Same-Day Delivery</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Reader Community</span>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.5} className="relative hidden lg:block">
            <div className="relative aspect-[3/4] border border-gray-200 bg-white p-8 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-[#f5f5f4] to-[#e7e5e4] flex items-center justify-center">
                <Book className="h-32 w-32 text-[rgba(28,25,23,0.06)]" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-gray-200 -z-10 bg-white" />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const cats = ['Fiction', 'Non-Fiction', 'African Literature', 'Poetry', 'Children\'s Books', 'Academic', 'Comics', 'Self-Development'];
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap justify-center gap-3">
          {cats.map((cat, i) => (
            <FadeIn key={cat} delay={i * 0.03}>
              <button className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-serif hover:border-[#1c1917] hover:text-[#1c1917] transition-all">
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
    <section className="py-24 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3 font-medium">Featured</p>
          <h2 className="text-4xl font-light text-[#1c1917]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>New & Noteworthy</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.05}>
              <div className="group cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
                <div className="aspect-[2/3] bg-white border border-gray-200 relative overflow-hidden mb-3 p-4 shadow-sm hover:shadow-md transition-shadow">
                  {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-2" unoptimized /> : (
                    <div className="w-full h-full flex items-center justify-center"><Book className="h-12 w-12 text-gray-300" /></div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm backdrop-blur-sm">View Product</span>
                  <button onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }} disabled={addingToCart === product.id}
                    className="absolute bottom-3 right-3 w-11 h-11 bg-[#1c1917] text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-sm font-medium text-gray-900 font-serif line-clamp-1">{product.name}</h3>
                <p className="text-[#1c1917] font-medium text-sm mt-0.5">{fp(product.price, 'NGN')}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="text-center mt-12">
          <Link href="/storefront" className="inline-flex items-center gap-2 text-[#1c1917] font-medium border-b border-[#1c1917] pb-1 hover:text-gray-600 hover:border-gray-400 transition-colors">
            Browse All Titles <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <FadeIn className="space-y-8">
          <Feather className="h-10 w-10 text-gray-300 mx-auto" />
          <h2 className="text-4xl font-light text-[#1c1917]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>A Haven for Readers</h2>
          <div className="w-12 h-0.5 bg-gray-300 mx-auto" />
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto font-serif text-lg">
            Since 2020, Page &amp; Pixel has been curating the finest selection of books for African readers. 
            We believe in the power of stories to transform, educate, and connect. Every title on our shelves 
            is chosen with care by our team of passionate readers.
          </p>
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            {[
              { icon: BookOpen, stat: '10,000+', label: 'Titles Available' },
              { icon: Heart, stat: '5,000+', label: 'Happy Readers' },
              { icon: Star, stat: '500+', label: 'African Authors' },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.1}>
                <div className="p-6">
                  <s.icon className="h-6 w-6 text-gray-400 mx-auto mb-3" />
                  <p className="text-2xl font-light text-[#1c1917]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.stat}</p>
                  <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="py-16 bg-[#1c1917]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>The Reader&apos;s Digest</h3>
            <p className="text-gray-400 text-sm mt-1 font-serif">Weekly recommendations, author interviews, and exclusive previews.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input type="email" placeholder="Your email address" className="px-5 py-3 bg-white/5 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-500 min-w-[280px]" />
            <Button className="rounded-none bg-white text-[#1c1917] hover:bg-gray-100 px-6 font-medium">Subscribe</Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function BooksStorefront({ store, products, onAddToCart, onViewProduct, addingToCart }: { store: StoreDto; products: ProductDto[]; onAddToCart: (id: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null }) {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <HeroSection store={store} />
      <CategoriesSection />
      <ShowcaseSection products={products} onAddToCart={onAddToCart} onViewProduct={onViewProduct} addingToCart={addingToCart} />
      <StorySection />
      <NewsletterSection />
    </div>
  );
}
