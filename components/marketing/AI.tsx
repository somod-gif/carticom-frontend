'use client';


import { motion } from 'framer-motion';
import { Bot, MessageSquare, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/button';

export function AI() {
  return (
    <section id="ai" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
              <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Carticom AI Assistant</p>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    Online
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-4 w-4 text-gray-600" aria-hidden="true" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-2">
                      <p className="text-sm text-gray-700">Where is my order #12345?</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="bg-indigo-50 rounded-2xl rounded-tl-none px-4 py-2">
                      <p className="text-sm text-gray-700">Your order #12345 is out for delivery and will arrive today by 6 PM. Track it here: carticom.cv/track/12345</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-4 w-4 text-gray-600" aria-hidden="true" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-2">
                      <p className="text-sm text-gray-700">Can I change the delivery address?</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="bg-indigo-50 rounded-2xl rounded-tl-none px-4 py-2">
                      <p className="text-sm text-gray-700">I&apos;ve updated the delivery address to 15 Victoria Island, Lagos. You&apos;ll receive a confirmation SMS shortly.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Sparkles className="h-3 w-3 text-indigo-500" aria-hidden="true" />
                    <span>Powered by Carticom AI</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-6"
            >
              <Bot className="h-4 w-4" aria-hidden="true" />
              AI Automation
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Automate everything with intelligent AI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600 mb-8"
            >
              Let AI handle customer support, order tracking, and marketing campaigns via WhatsApp. Focus on growing your business while our AI works 24/7.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4 mb-8"
            >
              {[
                'WhatsApp Business automation for orders and support',
                'AI-powered order tracking and delivery notifications',
                'Smart product recommendations for customers',
                'Automated abandoned cart recovery messages',
                'Multilingual support for 20+ African languages',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button size="lg" className="gap-2" asChild>
                <a href="#pricing">
                  Try AI Features
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}