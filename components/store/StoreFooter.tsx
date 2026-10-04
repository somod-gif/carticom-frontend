'use client';

import type { StoreDto } from '@/features/onboarding/types';
import { FaFacebookF, FaInstagram, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';

interface StoreFooterProps {
  store: StoreDto;
}

/**
 * Shared storefront footer — renders below every template.
 * Social icons only appear for links the merchant saved in
 * Dashboard → Store → Social Media Connect.
 */
export function StoreFooter({ store }: StoreFooterProps) {
  const whatsappHref = store.whatsappNumber
    ? `https://wa.me/${store.whatsappNumber.replace(/[^\d]/g, '')}`
    : '';

  const links = [
    { url: store.facebookUrl, label: 'Facebook', Icon: FaFacebookF },
    { url: store.instagramUrl, label: 'Instagram', Icon: FaInstagram },
    { url: store.twitterUrl, label: 'X (Twitter)', Icon: FaXTwitter },
    { url: whatsappHref, label: 'WhatsApp', Icon: FaWhatsapp },
  ].filter((l) => !!l.url);

  return (
    <footer className="border-t border-black/10 bg-white/70 px-5 py-7 text-center backdrop-blur-sm dark:border-white/10 dark:bg-black/30">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{store.name}</p>
      {store.description ? (
        <p className="mx-auto mt-1 max-w-md text-xs text-gray-500 dark:text-gray-400">
          {store.description}
        </p>
      ) : null}
      {links.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {links.map(({ url, label, Icon }) => (
            <a
              key={label}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-white dark:hover:text-white"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      )}
      <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
        Powered by Carticom
      </p>
    </footer>
  );
}
