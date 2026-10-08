'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2, X } from 'lucide-react';
import { firstProductSchema, type FirstProductFormData } from '@/features/onboarding/schemas';
import { useCreateProduct } from '@/features/onboarding/hooks/useOnboarding';
import { axiosInstance, extractErrorMessage } from '@/lib/axios';

interface FirstProductStepProps {
  onNext: () => void;
  onBack: () => void;
  storeId?: string;
  onProductCreated: (productId: string) => void;
}

export function FirstProductStep({ onNext, onBack, storeId, onProductCreated }: FirstProductStepProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }} = useForm<FirstProductFormData>({
    resolver: zodResolver(firstProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      quantity: ''}});

  const onSubmit = async (data: FirstProductFormData) => {
    setSubmitError(null);
    if (!storeId) {
      setSubmitError('Store not ready. Please complete the previous steps first.');
      return;
    }
    try {
      const product = await createProduct.mutateAsync({
        storeId: storeId,
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price),
        quantity: Number(data.quantity)});

      if (product?.id && images.length > 0) {
        const uploadedUrls: string[] = [];
        for (const image of images) {
          const formData = new FormData();
          formData.append('file', image);
          formData.append('folder', 'products');
          const res = await axiosInstance.post<{ data: { url: string } }>(
            '/api/v1/storage/upload',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          if (res.data?.data?.url) {
            uploadedUrls.push(res.data.data.url);
          }
        }
        if (uploadedUrls.length > 0) {
          // The update endpoint validates the full product payload (name and
          // price are required), so resend everything the seller typed along
          // with the first uploaded image — the backend stores one image only.
          await axiosInstance.put(`/api/v1/products/${product.id}`, {
            name: data.name,
            description: data.description || undefined,
            price: Number(data.price),
            quantity: Number(data.quantity),
            imageUrl: uploadedUrls[0]});
        }
      }

      if (product?.id) {
        onProductCreated(product.id);
      }
      onNext();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create Your First Product
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add your first product to start selling
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitError && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            <span className="mt-0.5 shrink-0">⚠</span>
            <p>{submitError}</p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" placeholder="My Awesome Product" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Product Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your product..."
            rows={4}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₦) *</Label>
            <Input id="price" type="number" placeholder="10000" {...register('price')} />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Stock Quantity *</Label>
            <Input id="quantity" type="number" placeholder="100" {...register('quantity')} />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Product Images</Label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Plus className="h-8 w-8 text-gray-500 dark:text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {images.length > 0 ? `${images.length} image(s) selected` : 'Click to upload product images'}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
              />
            </label>
          </div>
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((file, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Tip:</strong> You can add more products later from your dashboard. This is just to get you started!
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}