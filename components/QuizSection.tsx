'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';

type Option = {
  text: string;
  isCorrect: boolean;
  feedback: string;
};

type Question = {
  id: number;
  question: string;
  options: Option[];
};

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is my absolute favorite color?",
    options: [
      { text: "Red", isCorrect: false, feedback: "Nope! Way too aggressive." },
      { text: "Blue", isCorrect: true, feedback: "Yes! Blue! 💙 (Though I know your fav is brown 🤎)" },
      { text: "Green", isCorrect: false, feedback: "Not quite, though nature is cool." },
      { text: "Pink", isCorrect: false, feedback: "That's your color, not mine! 😂" },
    ]
  },
  {
    id: 2,
    question: "What is my all-time favorite movie series?",
    options: [
      { text: "Marvel Cinematic Universe", isCorrect: false, feedback: "Good, but not my absolute favorite." },
      { text: "Star Wars", isCorrect: false, feedback: "Nah, I'm not that much of a Jedi." },
      { text: "Harry Potter", isCorrect: true, feedback: "10 points to Gryffindor! ⚡👓" },
      { text: "The Lord of the Rings", isCorrect: false, feedback: "Too much walking." },
    ]
  },
  {
    id: 3,
    question: "If I have free time, what are my favorite hobbies?",
    options: [
      { text: "Sleeping and eating", isCorrect: false, feedback: "Tempting, but no!" },
      { text: "Coding and Music", isCorrect: true, feedback: "Exactly! Writing code and vibing to music. 💻🎵" },
      { text: "Playing sports", isCorrect: false, feedback: "I prefer keyboard cardio." },
      { text: "Reading books", isCorrect: false, feedback: "Only if it's documentation! 😂" },
    ]
  },
  {
    id: 4,
    question: "What is my shoe size?",
    options: [
      { text: "Size 7", isCorrect: false, feedback: "Too small! My feet aren't that tiny." },
      { text: "Size 8", isCorrect: true, feedback: "Spot on! Size 8 it is. 👟" },
      { text: "Size 9", isCorrect: false, feedback: "Too big, I'd trip over myself." },
      { text: "Size 10", isCorrect: false, feedback: "Do I look like Bigfoot to you?!" },
    ]
  },
  {
    id: 5,
    question: "What is our absolute, undisputed perfect date?",
    options: [
      { text: "Going to a crowded noisy mall", isCorrect: false, feedback: "Eww no, too many people and way too loud! 😂" },
      { text: "Fancy 5-star dinner with tiny portions", isCorrect: false, feedback: "Pretentious food? Nah, I'd rather have 2 AM Maggi with you!" },
      { text: "Late-night stargazing under the open sky 🌌✨", isCorrect: true, feedback: "YES! 1000% YES! Just you and me, lying under the stars, talking about forever 🥹❤️" },
      { text: "Doing homework in awkward silence", isCorrect: false, feedback: "I mean I love being near you, but that's definitely not our dream date! 💀" },
    ]
  }
];

export default function QuizSection() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionClick = (optionIdx: number, isCorrect: boolean) => {
    if (selectedOption !== null) return; // prevent multiple clicks
    setSelectedOption(optionIdx);
    
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      setSelectedOption(null);
      if (currentQ < QUIZ_QUESTIONS.length - 1) {
        setCurrentQ(c => c + 1);
      } else {
        setShowResult(true);
      }
    }, 2500); // Wait to show feedback before moving on
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
  };

  const getResultFeedback = () => {
    if (score === QUIZ_QUESTIONS.length) return "Okay, you officially know me better than I know myself. Perfect score for the perfect girl! 🩷🐻";
    if (score >= QUIZ_QUESTIONS.length - 1) return "Almost perfect! You definitely pay attention to my rambling... most of the time! 🥰";
    if (score >= Math.floor(QUIZ_QUESTIONS.length / 2)) return "Halfway there... I guess I need to talk about myself more! 😂";
    return "Who are you and what have you done with Nush?! 😭 (Just kidding, I still love you, but try again!)";
  };

  const q = QUIZ_QUESTIONS[currentQ];

  // Trigger confetti for high scores when result is shown
  React.useEffect(() => {
    if (showResult && score >= QUIZ_QUESTIONS.length - 1) {
      import('canvas-confetti').then((mod) => {
        const confetti = mod.default;
        if (score === QUIZ_QUESTIONS.length) {
          // Massive perfect score confetti
          const duration = 3000;
          const end = Date.now() + duration;
          const frame = () => {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF5C8E', '#FF9EC9', '#B9AEF5', '#FFDD8C'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF5C8E', '#FF9EC9', '#B9AEF5', '#FFDD8C'] });
            if (Date.now() < end) requestAnimationFrame(frame);
          };
          frame();
        } else {
          // Small burst for almost perfect
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FF5C8E', '#FF9EC9'] });
        }
      });
    }
  }, [showResult, score]);

  return (
    <section id="quiz" className="anniversary-section">
      <SectionHead 
        eyebrow="Pop Quiz" 
        title="How Well Do You Know Me?" 
        subtitle="Let's test your knowledge about your favorite person (me)." 
      />
      
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-[var(--white)] rounded-3xl p-6 md:p-10 shadow-lg border-2 border-[var(--pink)] relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-nunito font-bold text-[var(--plum-soft)]/50">
                    Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-sm font-nunito font-bold text-[var(--pink-deep)]">
                    Score: {score}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-caveat text-[var(--plum)] mb-8 leading-tight">
                  {q.question}
                </h3>

                <div className="space-y-3">
                  {q.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const showCorrect = selectedOption !== null && opt.isCorrect;
                    const showWrong = isSelected && !opt.isCorrect;

                    let btnClass = "w-full text-left p-4 rounded-xl font-nunito font-semibold transition-all border-2 ";
                    
                    if (selectedOption === null) {
                      btnClass += "border-[var(--pink)]/30 hover:border-[var(--pink-deep)] hover:bg-[var(--pink)]/10 text-[var(--plum-soft)]";
                    } else if (showCorrect) {
                      btnClass += "border-green-400 bg-green-50 text-green-700";
                    } else if (showWrong) {
                      btnClass += "border-red-400 bg-red-50 text-red-700";
                    } else {
                      btnClass += "border-gray-200 bg-gray-50 text-gray-400 opacity-50";
                    }

                    return (
                      <div key={idx}>
                        <button
                          onClick={() => handleOptionClick(idx, opt.isCorrect)}
                          disabled={selectedOption !== null}
                          className={btnClass}
                        >
                          {opt.text}
                        </button>
                        
                        {/* Feedback Message */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className={`mt-2 px-2 text-sm font-bold ${opt.isCorrect ? 'text-green-600' : 'text-red-500'}`}
                            >
                              {opt.feedback}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 flex flex-col items-center"
              >
                {/* Score-based animated emoji */}
                <motion.div 
                  className="text-7xl mb-6"
                  animate={
                    score === QUIZ_QUESTIONS.length ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, -10, 0],
                      filter: ['drop-shadow(0 0 0px rgba(255,215,0,0))', 'drop-shadow(0 0 30px rgba(255,215,0,0.8))', 'drop-shadow(0 0 0px rgba(255,215,0,0))']
                    } : score >= QUIZ_QUESTIONS.length - 1 ? {
                      y: [0, -20, 0],
                      scale: [1, 1.1, 1]
                    } : score >= Math.floor(QUIZ_QUESTIONS.length / 2) ? {
                      rotate: [0, -5, 5, -5, 0]
                    } : {
                      y: [0, 5, 0, 5, 0],
                      rotate: [0, 5, -5, 0]
                    }
                  }
                  transition={{ 
                    duration: score === QUIZ_QUESTIONS.length ? 1.5 : 0.8, 
                    repeat: score === QUIZ_QUESTIONS.length ? Infinity : 2 
                  }}
                >
                  {score === QUIZ_QUESTIONS.length ? '🏆' : score >= QUIZ_QUESTIONS.length - 1 ? '👏' : score >= Math.floor(QUIZ_QUESTIONS.length / 2) ? '👀' : '😅'}
                </motion.div>

                <h3 className="text-4xl md:text-5xl font-caveat text-[var(--pink-deep)] mb-3">
                  {score === QUIZ_QUESTIONS.length ? 'Flawless Victory!' : 'Quiz Completed!'}
                </h3>
                
                <p className="text-2xl font-nunito font-bold text-[var(--plum)] mb-4">
                  You scored {score} out of {QUIZ_QUESTIONS.length}
                </p>
                
                <p className="text-lg text-[var(--plum-soft)] mb-10 max-w-sm">
                  {getResultFeedback()}
                </p>
                
                <button
                  onClick={resetQuiz}
                  className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-8 py-3 rounded-full font-nunito font-bold shadow-md hover:scale-105 hover:shadow-lg transition-all"
                >
                  Retake Quiz 🔄
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
