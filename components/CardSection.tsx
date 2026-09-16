'use client';

import { motion } from 'framer-motion';
import SectionHead from './SectionHead';

export default function CardSection() {
  return (
    <section id="card" className="anniversary-section">
      <SectionHead 
        eyebrow="exhibit d, handwritten" 
        title="the one that came with the teddy" 
        subtitle="first attempt at card-making. she kept it anyway." 
      />
      <div className="card-wrap">
        <motion.figure
          className="real-card"
          initial={{ opacity: 0, y: 80, rotate: -8, scale: 0.85 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          whileHover={{ rotate: 1, scale: 1.03, transition: { duration: 0.3 } }}
        >
          <img src="/photos/card.jpg" alt="Handwritten birthday card from Yajat to Anushka" />
          <motion.figcaption
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            16 days in, and already worth every word
          </motion.figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
