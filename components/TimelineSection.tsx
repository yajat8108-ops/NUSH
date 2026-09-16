'use client';

import { motion } from 'framer-motion';
import SectionHead from './SectionHead';

const TIMELINE_EVENTS = [
  {
    id: 1,
    title: "First Date",
    desc: "Watching the very first Harry Potter movie together. The start of all the magic.",
    icon: "🪄"
  },
  {
    id: 2,
    title: "First Walk",
    desc: "Our very first walk together, right after the AIML exam. Best post-exam feeling ever.",
    icon: "🚶‍♂️"
  },
  {
    id: 3,
    title: "Teddy Yajat Delivery",
    desc: "When I gave you the bear, and you decided to literally name it 'Yajat' 😭🧸",
    icon: "🧸"
  },
  {
    id: 4,
    title: "The 8 PM Campus Escape",
    desc: "Open Audi at 8:00, getting kicked out by guards, walking through AB-1, Dr. Morphin's, and GB-2.",
    icon: "🏛️"
  },
  {
    id: 5,
    title: "The All-Night 2nd Month Call",
    desc: "You were all alone in your room on Aug 22, so we stayed on FaceTime from sunset to sunrise. 8+ hours listening to you breathe safely 🌙📱",
    icon: "🌙"
  },
  {
    id: 6,
    title: "Central Library Study Dates",
    desc: "Whispering jokes, passing secret sticky notes under the desk, 0% studying and 100% staring at you 📚🤫",
    icon: "📚"
  },
  {
    id: 7,
    title: "Deleting Music Apps",
    desc: "Deleted all music streaming apps because your velvety radio voice and my band are the only music in my world 🎙️❤️",
    icon: "🎙️"
  },
  {
    id: 8,
    title: "Quarter of a Year (Month 3)",
    desc: "90 days of pure happiness, crazy love, and knowing you're my forever wifeyyy 👑💖",
    icon: "🏆"
  },
];

export default function TimelineSection() {
  return (
    <section className="anniversary-section relative">
      <SectionHead 
        eyebrow="the story so far" 
        title="our timeline" 
        subtitle="every little moment that led us here." 
      />

      <div className="relative max-w-2xl mx-auto mt-12">
        {/* Vertical Line */}
        <div className="absolute left-[24px] sm:left-1/2 top-0 bottom-0 w-1 bg-[var(--pink)]/30 transform sm:-translate-x-1/2 rounded-full" />

        <div className="flex flex-col gap-12">
          {TIMELINE_EVENTS.map((evt, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div 
                key={evt.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`relative flex items-center ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'} flex-row`}
              >
                {/* Timeline Icon */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], boxShadow: ["0px 0px 0px 0px rgba(255, 92, 142, 0.4)", "0px 0px 10px 4px rgba(255, 92, 142, 0.4)", "0px 0px 0px 0px rgba(255, 92, 142, 0.4)"] }}
                  transition={{ repeat: Infinity, duration: 2, delay: idx * 0.2 }}
                  className="absolute left-[8px] sm:left-1/2 transform sm:-translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--white)] border-2 border-[var(--pink-deep)] shadow-md z-10 text-xl"
                >
                  {evt.icon}
                </motion.div>

                {/* Content Box */}
                <div className={`ml-16 sm:ml-0 w-full sm:w-1/2 ${isEven ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:text-left'}`}>
                  <div className="bg-[var(--white)] p-6 rounded-2xl shadow-[var(--card-shadow)] border border-[var(--pink)]/20 hover:scale-105 transition-transform">
                    <h3 className="font-caveat text-3xl text-[var(--pink-deep)] mb-2">{evt.title}</h3>
                    <p className="font-nunito text-[var(--plum-soft)] font-semibold leading-relaxed">
                      {evt.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
