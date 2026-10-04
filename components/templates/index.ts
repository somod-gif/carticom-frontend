import dynamic from 'next/dynamic';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';

const LazyFashionStorefront = dynamic(() => import('./FashionStorefront').then(m => ({ default: m.FashionStorefront })), { ssr: false });
const LazyElectronicsStorefront = dynamic(() => import('./ElectronicsStorefront').then(m => ({ default: m.ElectronicsStorefront })), { ssr: false });
const LazyFoodStorefront = dynamic(() => import('./FoodStorefront').then(m => ({ default: m.FoodStorefront })), { ssr: false });
const LazyHealthBeautyStorefront = dynamic(() => import('./HealthBeautyStorefront').then(m => ({ default: m.HealthBeautyStorefront })), { ssr: false });
const LazyHomeStorefront = dynamic(() => import('./HomeStorefront').then(m => ({ default: m.HomeStorefront })), { ssr: false });
const LazySportsStorefront = dynamic(() => import('./SportsStorefront').then(m => ({ default: m.SportsStorefront })), { ssr: false });
const LazyBooksStorefront = dynamic(() => import('./BooksStorefront').then(m => ({ default: m.BooksStorefront })), { ssr: false });
const LazyArtsStorefront = dynamic(() => import('./ArtsStorefront').then(m => ({ default: m.ArtsStorefront })), { ssr: false });
const LazyDynamicStorefront = dynamic(() => import('./DynamicStorefront').then(m => ({ default: m.DynamicStorefront })), { ssr: false });

export type StorefrontTemplateProps = { store: StoreDto; products: ProductDto[]; onAddToCart: (id: string, variantId?: string) => void; onViewProduct?: (id: string) => void; addingToCart: string | null };

export const TEMPLATE_MAP: Record<string, React.ComponentType<StorefrontTemplateProps>> = {
  'fashion-luxury': LazyFashionStorefront,
  'electronics-tech': LazyElectronicsStorefront,
  'food-beverage': LazyFoodStorefront,
  'health-beauty': LazyHealthBeautyStorefront,
  'home-living': LazyHomeStorefront,
  'sports-fitness': LazySportsStorefront,
  'books-media': LazyBooksStorefront,
  'arts-crafts': LazyArtsStorefront,
  'fashion-mode': LazyDynamicStorefront,
  'electronics-circuit': LazyDynamicStorefront,
  'food-bistro': LazyDynamicStorefront,
  'health-pure': LazyDynamicStorefront,
  'home-nest': LazyDynamicStorefront,
  'sports-stride': LazyDynamicStorefront,
  'books-folio': LazyDynamicStorefront,
  'arts-studio': LazyDynamicStorefront};

export function getTemplateComponent(slug: string | undefined) {
  if (slug && TEMPLATE_MAP[slug]) return TEMPLATE_MAP[slug];
  return LazyFashionStorefront;
}

export const TEMPLATE_COMPONENT_FALLBACK: React.ComponentType<StorefrontTemplateProps> = LazyFashionStorefront;

export function getTemplateByCategory(category: string) {
  const map: Record<string, string> = {
    FASHION: 'fashion-luxury',
    ELECTRONICS: 'electronics-tech',
    FOOD_BEVERAGE: 'food-beverage',
    HEALTH_BEAUTY: 'health-beauty',
    HOME_LIVING: 'home-living',
    SPORTS_FITNESS: 'sports-fitness',
    BOOKS_MEDIA: 'books-media',
    ARTS_CRAFTS: 'arts-crafts'};
  const normalized = category.toUpperCase().replace(/[\s&]+/g, '_');
  return map[normalized] || 'fashion-luxury';
}
