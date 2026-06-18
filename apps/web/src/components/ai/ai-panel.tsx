'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAIStore } from '@/lib/store';
import { Sparkles } from 'lucide-react';
import { AIChatPanel } from './ai-chat-panel';

/** Floating AI panel for non-learn pages. Learn pages embed AIChatPanel inline. */
export function AIPanel() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useAIStore();

  if (pathname?.startsWith('/learn/')) return null;

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg shadow-lg shadow-purple-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
        title="Open AI assistant"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        className="fixed top-0 right-0 h-full w-[min(400px,90vw)] z-50 shadow-2xl"
      >
        <AIChatPanel onClose={close} className="glass" />
      </motion.div>
    </AnimatePresence>
  );
}
