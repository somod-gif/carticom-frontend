import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/HeroSection';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { AISection } from '@/components/marketing/AISection';
import { SocialMediaSection } from '@/components/marketing/SocialMediaSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { DashboardShowcase } from '@/components/marketing/DashboardShowcase';
import { PricingSection } from '@/components/marketing/PricingSection';
import { WhyCarticom } from '@/components/marketing/WhyCarticom';
import { WaitlistSection } from '@/components/marketing/WaitlistSection';
import { CTASection } from '@/components/marketing/CTASection';
import { FooterSection } from '@/components/marketing/FooterSection';

export const metadata: Metadata = {
  title: 'Carticom - AI Commerce Operating System for Africa',
  description: 'Carticom is the AI commerce operating system for African businesses. Turn WhatsApp and social-media conversations into sales while managing products, customers, orders and operations from one platform.',
  keywords: ['ai commerce', 'africa', 'ecommerce', 'payments', 'ai', 'business', 'store builder', 'nigeria', 'saas', 'sell online', 'whatsapp commerce', 'social commerce'],
  openGraph: {
    title: 'Carticom - AI Commerce Operating System for Africa',
    description: 'Turn WhatsApp and social-media conversations into sales. AI-powered commerce for African businesses.',
    type: 'website',
    locale: 'en_NG',
    siteName: 'Carticom',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carticom - AI Commerce Operating System for Africa',
    description: 'Turn WhatsApp and social-media conversations into sales. AI-powered commerce for African businesses.',
  },
};

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <AISection />
      <SocialMediaSection />
      <HowItWorksSection />
      <DashboardShowcase />
      <PricingSection />
      <WhyCarticom />
      <WaitlistSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
