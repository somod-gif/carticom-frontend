'use client';

// ============================================================
// Mode A — template gallery demo (the original `/store/preview/[slug]`
// behaviour). Renders a demo storefront built from mock data with the
// "Preview Mode" banner and a back link.
//
// Add `?studio=1` to enter studio mode instead (see `studio-preview.tsx`).
// ============================================================

import { useMemo, useState, useCallback, createElement } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { getTemplate } from '@/features/templates/registry';
import { TEMPLATE_MAP, TEMPLATE_COMPONENT_FALLBACK } from '@/components/templates';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { ErrorState } from '@/components/dashboard/shared/StateComponents';

const NAMES: Record<string, string> = {
  'fashion-luxury': 'Luxe EDIT',
  'fashion-mode': 'Mode',
  'electronics-tech': 'NEO Tech',
  'electronics-circuit': 'Circuit',
  'food-beverage': 'Harvest',
  'food-bistro': 'Bistro',
  'health-beauty': 'Glow',
  'health-pure': 'Pure',
  'home-living': 'Sanctuary',
  'home-nest': 'Nest',
  'sports-fitness': 'Pulse',
  'sports-stride': 'Stride',
  'books-media': 'Page & Pixel',
  'books-folio': 'Folio',
  'arts-crafts': 'Atelier',
  'arts-studio': 'Studio'};

const DEMO_PRODUCTS: Record<string, { name: string; price: number; image?: string }[]> = {
  'fashion-luxury': [
    { name: 'Signature Silk Dress', price: 85000 },
    { name: 'Tailored Wool Blazer', price: 120000 },
    { name: 'Italian Leather Handbag', price: 195000 },
    { name: 'Precious Gem Necklace', price: 250000 },
    { name: 'Cashmere Scarf', price: 45000 },
    { name: 'Designer Sunglasses', price: 65000 },
  ],
  'fashion-mode': [
    { name: 'Oversized Hoodie', price: 35000 },
    { name: 'Cargo Pants', price: 28000 },
    { name: 'Graphic Tee', price: 15000 },
    { name: 'Denim Jacket', price: 55000 },
    { name: 'Bucket Hat', price: 12000 },
    { name: 'Crossbody Bag', price: 25000 },
  ],
  'electronics-tech': [
    { name: 'Wireless Noise-Cancelling Headphones', price: 85000 },
    { name: 'Smartwatch Pro', price: 120000 },
    { name: 'Portable Bluetooth Speaker', price: 35000 },
    { name: 'USB-C Hub 7-in-1', price: 15000 },
    { name: 'Mechanical Keyboard', price: 45000 },
    { name: '4K Webcam', price: 55000 },
  ],
  'electronics-circuit': [
    { name: 'Phone Stand with Charger', price: 12000 },
    { name: 'LED Strip Lights', price: 8500 },
    { name: 'Wireless Earbuds', price: 25000 },
    { name: 'Smart Plug', price: 9500 },
    { name: 'Cable Organizer Kit', price: 6500 },
    { name: 'Laptop Sleeve', price: 15000 },
  ],
  'food-beverage': [
    { name: 'Organic Honey Bundle', price: 8500 },
    { name: 'Artisan Coffee Beans (1kg)', price: 12000 },
    { name: 'Cold-Pressed Juice Pack', price: 6500 },
    { name: 'Premium Green Tea Set', price: 9500 },
    { name: 'Dark Chocolate Collection', price: 7500 },
    { name: 'Natural Granola (500g)', price: 4500 },
  ],
  'food-bistro': [
    { name: 'Truffle Pasta Kit', price: 15000 },
    { name: 'Artisan Sourdough Bread', price: 4500 },
    { name: 'Smoked Salmon Pack', price: 12000 },
    { name: 'Herb Infused Olive Oil', price: 8500 },
    { name: 'Gourmet Cheese Board', price: 18000 },
    { name: 'Craft Beer Selection', price: 15000 },
  ],
  'health-beauty': [
    { name: 'Vitamin C Serum', price: 15000 },
    { name: 'Organic Shea Butter', price: 8500 },
    { name: 'Rosehip Oil (30ml)', price: 12000 },
    { name: 'Hyaluronic Acid Moisturizer', price: 18000 },
    { name: 'Natural Lip Balm Set', price: 6500 },
    { name: 'Charcoal Face Mask', price: 9500 },
  ],
  'health-pure': [
    { name: 'SPF 50 Sunscreen', price: 12000 },
    { name: 'Retinol Night Cream', price: 22000 },
    { name: 'Niacinamide Serum', price: 15000 },
    { name: 'Eye Cream with Caffeine', price: 18000 },
    { name: 'Glycolic Acid Toner', price: 14000 },
    { name: 'Peptide Lip Treatment', price: 9500 },
  ],
  'home-living': [
    { name: 'Linen Couch Cover', price: 45000 },
    { name: 'Ceramic Vase Set', price: 22000 },
    { name: 'Wool Throw Blanket', price: 35000 },
    { name: 'Scented Candle Trio', price: 15000 },
    { name: 'Bamboo Serving Board', price: 12000 },
    { name: 'Macrame Wall Hanging', price: 8500 },
  ],
  'home-nest': [
    { name: 'Minimalist Desk Lamp', price: 25000 },
    { name: 'Cotton Throw Pillow', price: 12000 },
    { name: 'Boho Rug 4x6', price: 55000 },
    { name: 'Wall Shelf Set', price: 18000 },
    { name: 'Clay Planter Pot', price: 8500 },
    { name: 'Woven Storage Basket', price: 15000 },
  ],
  'sports-fitness': [
    { name: 'Performance Running Shoes', price: 65000 },
    { name: 'Compression Leggings', price: 25000 },
    { name: 'Adjustable Dumbbell Set', price: 85000 },
    { name: 'Yoga Mat Premium', price: 15000 },
    { name: 'Resistance Band Set', price: 8500 },
    { name: 'Insulated Water Bottle', price: 12000 },
  ],
  'sports-stride': [
    { name: 'Quick-Dry Running Tee', price: 12000 },
    { name: 'Trail Running Shorts', price: 15000 },
    { name: 'GPS Running Watch', price: 95000 },
    { name: 'Compression Socks 3-Pack', price: 8500 },
    { name: 'Running Cap', price: 6500 },
    { name: 'Hydration Vest', price: 35000 },
  ],
  'books-media': [
    { name: 'The Art of Storytelling', price: 12000 },
    { name: 'Creative Journal', price: 4500 },
    { name: 'Vintage Fountain Pen', price: 18000 },
    { name: 'Book Lover Candle', price: 6500 },
    { name: 'Reading Glasses Case', price: 3500 },
    { name: 'Notebook Collection', price: 8500 },
  ],
  'books-folio': [
    { name: 'Design Annual 2026', price: 35000 },
    { name: 'Typography Today', price: 25000 },
    { name: 'Art Print Set', price: 15000 },
    { name: 'Magazine Subscription', price: 45000 },
    { name: 'Bookmark Collection', price: 4500 },
    { name: 'Reading Light', price: 8500 },
  ],
  'arts-crafts': [
    { name: 'Watercolor Paint Set', price: 15000 },
    { name: 'Premium Sketchbook', price: 6500 },
    { name: 'Wood Carving Tool Kit', price: 25000 },
    { name: 'Pottery Clay Bundle', price: 12000 },
    { name: 'Calligraphy Pen Set', price: 8500 },
    { name: 'Canvas Panel Pack', price: 9500 },
  ],
  'arts-studio': [
    { name: 'Minimalist Vase', price: 25000 },
    { name: 'Abstract Print', price: 18000 },
    { name: 'Ceramic Mug Set', price: 12000 },
    { name: 'Sculpture Tool Kit', price: 22000 },
    { name: 'Art Apron', price: 8500 },
    { name: 'Printmaking Starter Kit', price: 35000 },
  ]};

export function TemplateGalleryPreview({ slug }: { slug: string }) {
  const template = useMemo(() => getTemplate(slug), [slug]);

  const mockStore = useMemo<StoreDto>(() => {
    const templateName = template?.name || NAMES[slug] || 'My Store';
    const category = template?.category || 'FASHION';
    return {
      id: 'preview-store',
      name: templateName,
      slug: slug,
      description: `Experience the ${templateName} template — a professionally designed storefront for your ${category.toLowerCase().replace('_', ' & ')} business.`,
      logoUrl: undefined,
      bannerUrl: undefined,
      ownerId: 'preview',
      status: 'ACTIVE',
      currency: 'NGN',
      country: 'NG',
      timezone: 'Africa/Lagos',
      tenantId: 'preview',
      template: slug,
      businessCategory: category,
      primaryColor: template?.colors.primary,
      secondaryColor: template?.colors.secondary,
      instagramUrl: 'https://instagram.com/carticom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()} as StoreDto;
  }, [slug, template]);

  const mockProducts = useMemo<ProductDto[]>(() => {
    const products = DEMO_PRODUCTS[slug] || DEMO_PRODUCTS['fashion-luxury'] || [];
    return products.map((p, i) => ({
      id: `preview-product-${i}`,
      storeId: 'preview-store',
      name: p.name,
      description: `Premium ${p.name.toLowerCase()} — perfect for your customers.`,
      price: p.price,
      currency: 'NGN',
      quantity: 50,
      active: true,
      digital: false,
      tenantId: 'preview',
      imageUrl: p.image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()} as ProductDto));
  }, [slug]);

  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = useCallback(async (_productId: string) => {
    setAddingToCart(_productId);
    await new Promise((r) => setTimeout(r, 800));
    setAddingToCart(null);
  }, []);

  if (!template) return <ErrorState title="We couldn't open this preview" description="This preview link is missing a template." />;

  return (
    <>
      <div className="sticky top-0 z-50 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-10">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Eye className="h-3.5 w-3.5" />
            Preview Mode — This is a demo storefront. No real transactions.
          </div>
          <Link href="/register" className="text-xs font-semibold underline underline-offset-2 hover:text-blue-100 transition-colors">
            Create Your Store
          </Link>
        </div>
      </div>
      <Link
        href="/"
        className="fixed top-14 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>
      {createElement(TEMPLATE_MAP[slug] ?? TEMPLATE_COMPONENT_FALLBACK, {
        store: mockStore,
        products: mockProducts,
        onAddToCart: handleAddToCart,
        addingToCart,
      })}
    </>
  );
}
