'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Star } from 'lucide-react';
import { storefrontApi } from '@/features/onboarding/services/onboarding.service';
import { useProductReviews, useCreateReview } from '@/features/storefront/hooks';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getCustomerToken } from '@/features/storefront/services/customer-auth.service';
import type { ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { VariantSelector } from '@/components/storefront/VariantSelector';
import type { SelectedVariant } from '@/components/storefront/VariantSelector';
import { useCartStore } from '@/store/cart.store';
import { cn } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/axios';
import { toast } from 'sonner';

/** Read-only star row used for the average and each review. */
function StarDisplay({ value, className }: { value: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`${value} out of 5 stars`}
      className="inline-flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            className ?? 'h-4 w-4',
            star <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300 dark:text-gray-600'
          )}
        />
      ))}
    </span>
  );
}

function formatReviewDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);

  // Signed-in shoppers (owner session or store-customer session) can write a review.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [hasCustomerSession, setHasCustomerSession] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // Reviews load alongside the product — same page, separate query.
  const reviewsQuery = useProductReviews(id);
  const createReview = useCreateReview(id);

  useEffect(() => {
    setHasCustomerSession(!!getCustomerToken());
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await storefrontApi.getProductById(id);
        if (cancelled) return;
        if (!res.data.data) throw new Error('Product not found');
        setProduct(res.data.data);
      } catch {
        if (cancelled) return;
        setError('Failed to load product. It may have been removed.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, retryKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryKey((k) => k + 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      const ok = await useCartStore.getState().addToCart({
        storeId: product.storeId,
        productId: product.id,
        quantity,
        variantId: selectedVariants[0]?.id});
      if (ok) {
        toast.success(`${product.name} added to cart!`);
        setJustAdded(true);
      } else {
        toast.error(useCartStore.getState().lastError || 'Failed to add item to cart. Please try again.');
      }
    } catch (err) {
      toast.error(extractErrorMessage(err) || 'Failed to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating < 1) {
      toast.error('Please tap a star to choose your rating.');
      return;
    }
    createReview.mutate(
      { rating: reviewRating, comment: reviewComment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Thanks! Your review will show up once the store approves it.');
          setReviewRating(0);
          setReviewComment('');
        },
        onError: (err) => {
          toast.error(extractErrorMessage(err) || "We couldn't save your review. Please try again.");
        },
      }
    );
  };

  if (loading) return <LoadingState message="Loading product..." />;

  if (error) return <ErrorState title="Product not found" description={error} onRetry={handleRetry} />;

  if (!product) return <ErrorState title="Product not found" description="This product could not be found." />;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: product.currency || 'NGN',
      minimumFractionDigits: 2}).format(price);

  const productImages: string[] = [];
  if (product.imageUrl) productImages.push(product.imageUrl);
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) productImages.push(...parsed.filter(Boolean));
    } catch {
      // ignore parse errors
    }
  }

  const effectivePrice = selectedVariants.find(v => v.price != null)?.price ?? product.price;
  const effectiveStock = selectedVariants.length > 0
    ? selectedVariants.reduce((min, v) => Math.min(min, v.stock), Infinity)
    : product.quantity;
  const inStock = effectiveStock > 0;

  const reviewsData = reviewsQuery.data;
  const signedIn = isAuthenticated || hasCustomerSession;

  return (
    <div className="space-y-6 py-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
            {productImages.length > 0 ? (
              <Image
                src={productImages[0]}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          {productImages.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {productImages.map((img, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 relative"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>
            {product.sku && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                SKU: {product.sku}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-blue-600">
              {formatPrice(effectivePrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > effectivePrice && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                inStock
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {inStock ? `In Stock (${effectiveStock} available)` : 'Out of Stock'}
            </span>
          </div>

          <VariantSelector
            productId={product.id}
            onChange={setSelectedVariants}
          />

          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {inStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantity:
              </span>
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                  disabled={quantity >= effectiveStock}
                  className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={!inStock || adding}
            onClick={handleAddToCart}
          >
            {adding ? (
              'Adding...'
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart — {formatPrice(effectivePrice * quantity)}
              </>
            )}
          </Button>

          {justAdded && (
            <Button variant="outline" size="lg" asChild>
              <Link href={`/storefront/cart?store=${product.storeId}`}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Cart
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Customer reviews ──────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Customer reviews</h2>
          {reviewsData && reviewsData.aggregate.count > 0 && (
            <div className="flex items-center gap-2">
              <StarDisplay value={reviewsData.aggregate.average} className="h-5 w-5" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {reviewsData.aggregate.average.toFixed(1)} out of 5
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({reviewsData.aggregate.count}{' '}
                {reviewsData.aggregate.count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {reviewsQuery.isPending && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading reviews...</p>
        )}

        {reviewsQuery.isError && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We couldn&rsquo;t load the reviews right now.
            </p>
            <Button variant="outline" size="sm" onClick={() => reviewsQuery.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {reviewsQuery.isSuccess && reviewsData && (
          reviewsData.aggregate.count === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No reviews yet. Be the first to share what you think.
            </p>
          ) : (
            <ul className="space-y-5">
              {reviewsData.reviews.map((review) => (
                <li
                  key={review.id}
                  className="border-b border-gray-100 dark:border-gray-800 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {review.customerName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatReviewDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <StarDisplay value={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {review.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )
        )}

        {signedIn ? (
          <form
            onSubmit={handleSubmitReview}
            className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Write a review
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Your review appears on this page once the store approves it.
              </p>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
                >
                  <Star
                    className={cn(
                      'h-7 w-7 transition-colors',
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {reviewRating > 0 ? `${reviewRating} out of 5` : 'Tap a star to rate'}
              </span>
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="What did you like or dislike? Keep it helpful for other shoppers."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {reviewComment.length}/1000 characters
              </span>
              <Button type="submit" disabled={createReview.isPending || reviewRating < 1}>
                {createReview.isPending ? 'Sending...' : 'Submit review'}
              </Button>
            </div>
          </form>
        ) : (
          !authLoading && (
            <p className="border-t border-gray-100 dark:border-gray-800 pt-6 text-sm text-gray-600 dark:text-gray-400">
              <Link
                href={
                  product.storeId
                    ? `/storefront/login?storeId=${product.storeId}`
                    : '/storefront/login'
                }
                className="font-medium text-blue-600 hover:underline"
              >
                Sign in to leave a review
              </Link>
            </p>
          )
        )}
      </div>
    </div>
  );
}
