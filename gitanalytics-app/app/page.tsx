'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaGitAlt, FaChartLine, FaCodeBranch, FaHistory, FaStar, FaUsers } from 'react-icons/fa';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse"
             style={{ transform: `translateY(${scrollY * 0.5}px)` }} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"
             style={{ transform: `translateY(${-scrollY * 0.3}px)` }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FaGitAlt className="text-3xl text-indigo-600 dark:text-indigo-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">GitAnalytics</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/50">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
              Unlock Your Team's
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Git Potential
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              Evaluate versioning efficiency, rate contributors, and gain deep insights into your project's health with powerful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/60 transform hover:-translate-y-1">
                Start Analyzing
              </Link>
              <Link href="#features" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg border border-gray-200 dark:border-gray-700">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Hero Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<FaUsers />} value="1000+" label="Contributors Analyzed" color="indigo" />
                <StatCard icon={<FaCodeBranch />} value="5000+" label="Branches Tracked" color="purple" />
                <StatCard icon={<FaChartLine />} value="99.9%" label="Accuracy Rate" color="pink" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to understand your repository's health
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaStar className="text-4xl" />}
              title="Contributor Ratings"
              description="Rate contributors based on commit size, frequency, code integrity, and reworkability. Identify your top performers and areas for improvement."
              color="indigo"
              delay={0.1}
            />
            <FeatureCard
              icon={<FaCodeBranch className="text-4xl" />}
              title="Branch Categorization"
              description="Automatically categorize branches as 'stale', 'active', or 'dead'. Keep your repository clean and organized."
              color="purple"
              delay={0.2}
            />
            <FeatureCard
              icon={<FaHistory className="text-4xl" />}
              title="Historical Analysis"
              description="Track your project's evolution over time. Understand trends, patterns, and make data-driven decisions."
              color="pink"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Diagram Section - Git Flow Visualization */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Visualize Your Workflow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See how GitAnalytics tracks and analyzes your repository
            </p>
          </motion.div>

          <GitFlowDiagram />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Git Workflow?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join teams already using GitAnalytics to improve their development process
            </p>
            <Link href="/signup" className="inline-block px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-xl transform hover:-translate-y-1">
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaGitAlt className="text-3xl text-indigo-400" />
            <span className="text-2xl font-bold">GitAnalytics</span>
          </div>
          <p className="text-gray-400">
            © 2024 GitAnalytics. Empowering teams with data-driven insights.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  const colorClasses = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    pink: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30',
  };

  return (
    <div className="text-center">
      <div className={`inline-flex p-4 rounded-full ${colorClasses[color as keyof typeof colorClasses]} mb-4`}>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, delay }: { icon: React.ReactNode; title: string; description: string; color: string; delay: number }) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all transform hover:-translate-y-2"
    >
      <div className={`inline-flex p-4 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white mb-6`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function GitFlowDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
    >
      <div className="relative">
        {/* Git Flow Visualization */}
        <div className="flex flex-col gap-8">
          {/* Repository Input */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
              <FaGitAlt className="text-3xl text-white" />
            </div>
            <div className="flex-1">
              <div className="h-2 bg-gradient-to-r from-gray-300 to-indigo-300 dark:from-gray-600 dark:to-indigo-600 rounded-full" />
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-semibold">Your Repository</div>
          </motion.div>

          {/* Analysis Process */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="text-gray-700 dark:text-gray-300 font-semibold">CLI Analysis</div>
            <div className="flex-1">
              <div className="h-2 bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-600 dark:to-purple-600 rounded-full" />
            </div>
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-3xl text-white" />
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
          >
            <ResultBox icon={<FaStar />} label="Contributor Ratings" color="from-yellow-400 to-orange-500" />
            <ResultBox icon={<FaCodeBranch />} label="Branch Health" color="from-green-400 to-emerald-500" />
            <ResultBox icon={<FaHistory />} label="Historical Trends" color="from-blue-400 to-cyan-500" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function ResultBox({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold">{label}</div>
    </div>
  );
}
