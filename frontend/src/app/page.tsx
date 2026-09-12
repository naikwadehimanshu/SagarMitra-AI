'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Waves, Map, ShieldAlert, Fish, Navigation, Database, AlertCircle, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: <Sparkles className="text-cyan-400" size={24}/>, title: 'Multi-Agent AI', desc: '10 specialized agents work together to analyze marine data.' },
    { icon: <Map className="text-blue-400" size={24}/>, title: 'Interactive Maps', desc: 'Real-time marine data visualization.' },
    { icon: <Fish className="text-green-400" size={24}/>, title: 'PFZ Intelligence', desc: 'Find the best and safest fishing zones.' },
    { icon: <ShieldAlert className="text-amber-400" size={24}/>, title: 'Safety Engine', desc: 'Risk assessment with explainable scoring.' },
    { icon: <Navigation className="text-purple-400" size={24}/>, title: 'Route Planning', desc: 'Optimized safe maritime routes.' },
    { icon: <Database className="text-red-400" size={24}/>, title: 'Satellite Data', desc: 'SST, chlorophyll, and ocean observations.' },
  ];

  return (
    <div className="min-h-screen bg-navy text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[128px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center pt-32 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Built for Smart India Hackathon
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="inline-block mr-4">🌊</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-600">
              Navik AI
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl font-medium text-slate-200 mb-4">
            Ask the Ocean. Understand the Risk. Navigate Smarter.
          </p>
          
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Agentic AI-powered Marine Intelligence & Decision Support Platform for fishermen, maritime operators, and coastal authorities.
          </p>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-cyan-500 hover:bg-cyan-400 text-navy font-bold py-4 px-8 rounded-full text-lg flex items-center gap-2 mx-auto transition-colors shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]"
            >
              Launch Marine Intelligence <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 w-full max-w-6xl"
        >
          <h2 className="text-3xl font-bold text-center mb-16">Powered by Multi-Agent Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="glass p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-32 w-full max-w-4xl text-center pb-20">
          <h2 className="text-2xl font-bold mb-8">How it works</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-300">
            <div className="glass p-4 rounded-xl w-48">1. Ask</div>
            <ArrowRight className="hidden md:block text-cyan-500 opacity-50" />
            <div className="glass p-4 rounded-xl w-48 border-cyan-500/30 bg-cyan-500/5 text-cyan-400">2. Analyze (Agents)</div>
            <ArrowRight className="hidden md:block text-cyan-500 opacity-50" />
            <div className="glass p-4 rounded-xl w-48">3. Recommend</div>
            <ArrowRight className="hidden md:block text-cyan-500 opacity-50" />
            <div className="glass p-4 rounded-xl w-48">4. Visualize</div>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 w-full overflow-hidden leading-0">
        <svg className="relative block w-full h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-navy opacity-20"></path>
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-ocean opacity-30"></path>
        </svg>
      </div>
    </div>
  );
}
