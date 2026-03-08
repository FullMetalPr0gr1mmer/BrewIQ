import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, Brain, Coffee, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageTransition from '../components/layout/PageTransition';
import { containerVariants, cardVariants } from '../lib/constants';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Coffee Expert',
    description: 'Chat with our AI barista — get brewing tips, bean recommendations, and menu suggestions instantly.',
  },
  {
    icon: BarChart3,
    title: 'Business Analytics',
    description: 'Real-time dashboards showing revenue, orders, customer engagement, and peak hours at a glance.',
  },
  {
    icon: Brain,
    title: 'Smart Insights',
    description: 'Data-driven decisions with trend analysis, customer satisfaction tracking, and exportable reports.',
  },
];

// Floating coffee bean particles for hero
const floatingItems = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: 10 + Math.random() * 20,
  delay: Math.random() * 5,
  duration: 6 + Math.random() * 8,
  opacity: 0.05 + Math.random() * 0.1,
}));

export default function LandingPage() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brew-900 via-brew-800 to-brew-700" />

        {/* Floating particles */}
        {floatingItems.map((item) => (
          <motion.div
            key={item.id}
            className="absolute rounded-full"
            style={{
              width: item.size,
              height: item.size,
              left: `${item.x}%`,
              bottom: '-5%',
              background: `rgba(212, 165, 116, ${item.opacity})`,
            }}
            animate={{
              y: [0, -1200],
              x: [0, (Math.random() - 0.5) * 100],
              rotate: [0, 360],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Steam effects */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-brew-300/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-brew-200/5 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-brew-900/30" />

        {/* Navbar */}
        <Navbar transparent />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
              <Coffee size={48} className="text-brew-200" />
            </div>
            <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-bold mb-4">
              BrewIQ
            </h1>
            <p className="text-xl sm:text-2xl text-brew-200 mb-2">
              Smart Coffee. Smarter Business.
            </p>
            <p className="text-brew-300 max-w-lg mx-auto mb-10 text-base sm:text-lg">
              Your AI-powered coffee assistant and business analytics platform — all in one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3.5 bg-brew-500 text-white rounded-full font-semibold hover:bg-brew-400 transition flex items-center justify-center gap-2 no-underline text-lg"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition no-underline text-lg"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-brew-800 mb-4">
              Everything Your Coffee Business Needs
            </h2>
            <p className="text-brew-500 max-w-2xl mx-auto text-lg">
              From customer engagement to business intelligence — BrewIQ has you covered.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="p-8 rounded-2xl border border-brew-100 bg-brew-50/50 hover:shadow-lg hover:border-brew-200 transition group"
              >
                <div className="w-14 h-14 bg-brew-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brew-200 transition">
                  <feature.icon size={28} className="text-brew-500" />
                </div>
                <h3 className="text-xl font-semibold text-brew-800 mb-3">{feature.title}</h3>
                <p className="text-brew-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brew-800 to-brew-900 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center px-4"
        >
          <h2 className="text-3xl sm:text-4xl font-playfair font-bold mb-4">
            Ready to Brew Smarter?
          </h2>
          <p className="text-brew-200 text-lg mb-10">
            Join BrewIQ today and transform how you run your coffee business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3.5 bg-brew-500 text-white rounded-full font-semibold hover:bg-brew-400 transition no-underline text-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition no-underline text-lg"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </PageTransition>
  );
}
