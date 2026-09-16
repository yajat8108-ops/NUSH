'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import Image from 'next/image';
import { SoundEngine } from '@/lib/audio';
import { useProgressStore } from '@/lib/progressStore';

const PHOTOS = [
  '/photos/photo-1.jpg',
  '/photos/photo-new-1.jpg',
  '/photos/photo-5.jpg',
  '/photos/photo-new-2.jpg',
  '/photos/photo-9.jpg',
  '/photos/photo-new-3.jpg',
];

type CardType = {
  id: string;
  photoId: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function MemoryGame() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { addProgress } = useProgressStore();

  // Initialize game
  const initializeGame = () => {
    SoundEngine.pop();
    const shuffledPhotos = [...PHOTOS, ...PHOTOS]
      .sort(() => Math.random() - 0.5)
      .map((photo, index) => ({
        id: `card-${index}`,
        photoId: PHOTOS.indexOf(photo),
        imageUrl: photo,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledPhotos);
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setIsAnimating(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isGameOver) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver]);

  // Handle card click
  const handleCardClick = (clickedCardId: string) => {
    if (isAnimating || !isPlaying) return;

    // Check if card is already flipped or matched
    const clickedCard = cards.find((c) => c.id === clickedCardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    SoundEngine.pop();

    // Flip the clicked card
    const newCards = cards.map((c) =>
      c.id === clickedCardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, clickedCardId];
    setFlippedCards(newFlippedCards);

    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setIsAnimating(true);
      setMoves((prev) => prev + 1);

      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = newCards.find((c) => c.id === firstCardId);
      const secondCard = newCards.find((c) => c.id === secondCardId);

      if (firstCard?.photoId === secondCard?.photoId) {
        // Match!
        SoundEngine.chime();
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedCards([]);
          setIsAnimating(false);
          
          // Check win condition
          if (newCards.filter((c) => c.isMatched).length + 2 === cards.length) {
            setIsGameOver(true);
            setIsPlaying(false);
            SoundEngine.confettiPop();
            addProgress('memory_match', 20, 'Memory Match Champion!');
          }
        }, 500); // Small delay for glow effect to show
      } else {
        // No match - shake and flip back
        SoundEngine.error();
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsAnimating(false);
        }, 800);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStars = () => {
    if (moves <= 12) return 3;
    if (moves <= 18) return 2;
    return 1;
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
      <SectionHead 
        eyebrow="mini game"
        title="Match Our Memories"
        subtitle="flip the cards and find the matching pairs"
      />

      <div className="w-full mb-6 flex justify-between items-center px-4 max-w-md mx-auto font-nunito text-[var(--plum)] font-semibold text-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏳</span>
          <span className="bg-[var(--pink)] px-3 py-1 rounded-full shadow-sm">{formatTime(time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎲</span>
          <span className="bg-[var(--pink)] px-3 py-1 rounded-full shadow-sm">{moves} moves</span>
        </div>
      </div>

      <div className="relative w-full max-w-2xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 perspective-1000">
          {cards.map((card) => {
            const isWrongMatch = flippedCards.length === 2 && 
              flippedCards.includes(card.id) && 
              cards.find((c) => c.id === flippedCards[0])?.photoId !== cards.find((c) => c.id === flippedCards[1])?.photoId;

            return (
              <motion.div
                key={card.id}
                className="relative aspect-[3/4] w-full cursor-pointer transform-style-3d"
                onClick={() => handleCardClick(card.id)}
                animate={{
                  rotateY: card.isFlipped ? 180 : 0,
                  x: isWrongMatch ? [-5, 5, -5, 5, 0] : 0,
                }}
                transition={{
                  rotateY: { duration: 0.5, ease: "easeInOut" },
                  x: { duration: 0.4, ease: "easeInOut" }
                }}
                whileHover={!card.isFlipped && !isAnimating ? { scale: 1.05 } : {}}
                whileTap={!card.isFlipped && !isAnimating ? { scale: 0.95 } : {}}
              >
                {/* Front (Face Down) */}
                <div 
                  className={`absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-md border-2 border-white/50 flex items-center justify-center
                    bg-gradient-to-br from-[var(--pink)] to-[var(--lav)] transition-opacity duration-300
                    ${card.isFlipped ? 'opacity-0' : 'opacity-100'}`}
                >
                  <span className="text-4xl">🩷</span>
                </div>

                {/* Back (Face Up - Photo) */}
                <div 
                  className={`absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg border-2 overflow-hidden transform rotate-y-180
                    ${card.isMatched ? 'border-[var(--butter)] shadow-[0_0_15px_var(--butter)]' : 'border-white'}
                    ${!card.isFlipped ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={card.imageUrl}
                      alt="Memory"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 25vw"
                    />
                    {card.isMatched && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-white/20 z-10 pointer-events-none"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30 rounded-2xl"
            >
              <div className="bg-white/90 p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-[var(--pink)]">
                <h3 className="font-caveat text-4xl text-[var(--plum)] mb-2">
                  You found all our memories! 🩷
                </h3>
                
                <div className="flex justify-center gap-2 mb-6 mt-4">
                  {[1, 2, 3].map((star) => (
                    <motion.span
                      key={star}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: star * 0.2 }}
                      className={`text-4xl ${star <= getStars() ? 'text-[var(--butter)] drop-shadow-md' : 'text-gray-300 grayscale opacity-50'}`}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>

                <div className="font-nunito space-y-2 text-lg text-[var(--mocha)] mb-8 bg-[var(--cream)] p-4 rounded-xl">
                  <p>Moves taken: <span className="font-bold text-[var(--plum)]">{moves}</span></p>
                  <p>Time: <span className="font-bold text-[var(--plum)]">{formatTime(time)}</span></p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={initializeGame}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[var(--pink-deep)] to-[var(--plum)] text-white font-nunito font-bold rounded-full shadow-lg text-lg"
                >
                  Play Again 🔄
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}} />
    </section>
  );
}
