'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';

// Define the shape of our conversation messages
interface Message {
  id: string;
  sender: 'user' | 'yajat';
  text: string;
  engine?: string;
  isTyping?: boolean;
}

const quickAskChips = [
  "What's our perfect date? 🌌",
  "Who loves who more? ❤️",
  "Kitna pyar karte ho? 💍",
  "Why did you delete your music apps? 📻",
  "The Fake Dating Pact 👑",
  "Open Audi 8 PM Guard Chase 🏃‍♂️",
  "Will you make me Maggi? 🍜",
  "Are you mad at me? 🥺",
  "Our AB-2 first kiss 💋",
  "FaceTime till 4:23 AM 🌙",
  "Central Library study dates 📚",
  "Tell me a secret 🤫",
  "I\'m sad today, comfort me 🫢"
];

const fallbackResponses = [
  "Heyyy my prettiest girl! 🌸 Every single day with you feels like a gift I didn't deserve. What are you thinking about right now? 🥰",
  "My brain says 'compute'... but my heart just says 'go hug Anushka'. You make everything in my world better just by existing ❤️",
  "Whatever you asked, the true answer is: I love you more than words, code, or scientific calculators could ever express 🌸✨",
  "You are the sweetest, most precious part of my life. Come here and take a forehead kiss right now 😘",
  "Every time you text me, I smile like an idiot at my screen. Tell me more, what's on your mind? 💭❤️",
  "Areyyy meri Nushi 🥹 You're the best thing that ever happened to me. Never forget that, okay? ❤️"
];

export default function AskYajatConsole() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'yajat',
      text: 'Connection established. Welcome to the Yajat Neural Terminal.',
      isTyping: false
    },
    {
      id: 'init-2',
      sender: 'yajat',
      text: "Ask me anything, bbg. What's on your mind? 💭❤️",
      isTyping: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [lastEngine, setLastEngine] = useState<string>('yajat-neural-persona');

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // Load custom API key from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ask_yajat_custom_api_key');
      if (saved) {
        setCustomApiKey(saved);
        setKeyInput(saved);
      }
    } catch (e) {}
  }, []);

  // Auto-scroll internal terminal container ONLY (never scroll window)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isAnswering]);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    setCustomApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('ask_yajat_custom_api_key', trimmed);
      } else {
        localStorage.removeItem('ask_yajat_custom_api_key');
      }
    } catch (e) {}
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowSettings(false);
    }, 1500);
  };

  const generateLocalResponse = (question: string): string => {
    const lowerQ = question.toLowerCase().trim();
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    

    // Identity / Who is this talking
    if (
      lowerQ.includes('who is this') ||
      lowerQ.includes('who is talking') ||
      lowerQ.includes('who are you') ||
      lowerQ.includes('whi is thid') ||
      lowerQ.includes('whi is') ||
      lowerQ.includes('who this') ||
      lowerQ.includes('who dis') ||
      lowerQ.includes('kaun ho') ||
      lowerQ.includes('kaun bol raha') ||
      lowerQ.includes('who am i talking to')
    ) {
      return "Areyyy Nush?! 😭❤️ Who is this bol rahi ho? Apne Yajat ko bhool gayi kya? 💀😂 It's me, your coder boyfriend, guitar guy, and 2 AM Maggi chef! 🎸🧸 Did you forget your favorite boy already?";
    }

    // Greetings & hellos
    if (/^(hi|hey|heyy|heyyy|hello|hii|hiii|hola|yo|sup|wassup|namaste|hlo|helo|oii|oye)[!?.]*$/.test(lowerQ) || lowerQ === 'hi' || lowerQ === 'hey' || lowerQ === 'hello' || lowerQ === 'hii') {
      return pick([
        "Heyyy my prettiest girl! 🌸 I was literally just thinking about you. What are you doing right now? Missing me? 🥰",
        "Hiii bbg! ❤️ You just made my whole day 100x better by typing here. How's my favorite human doing?",
        "Heyyy meri jaan! ✨ How is the most gorgeous girl in the universe doing today? Did you eat yet? 🍜",
        "Hii Nushi! 🥹 Every time I see a message from you, my heart does that little jump. What's up, baby?",
        "Heyyy wifeyyy! 👑 Just in case no one told you today: you are breathtaking and I'm totally in love with you. What's on your mind? 🥰"
      ]);
    }

    // Who loves who more / Do you love me
    if (lowerQ.includes('who loves') || lowerQ.includes('loves who') || lowerQ.includes('love more')) {
      return "Mathematically impossible for you to beat me at loving you. I've done the calculations. nushLoveLevel() = ∞ + 1. Trust me, I'm a coder 💻❤️ Even if you think you love me more, my heart has already overridden your claim 😏👑";
    }

    if (lowerQ.includes('do you love me') || lowerQ.includes('kitna pyar') || lowerQ.includes('pyar karte ho')) {
      return pick([
        "Do I love you? Nushi, you are my entire universe 😭❤️ From that first acoustic guitar meet to our 4 AM calls, I am completely, head-over-heels in love with you. Forever, no cap 🥹✨",
        "Kitna pyar? Kitna bhi bolu kam padega baby. Like... beyond infinity. 3 months down, 100 years to go 💍❤️"
      ]);
    }

    if (lowerQ.includes('love') || lowerQ.includes('ily') || lowerQ.includes('pyar')) {
      return pick([
        "I love you so so much more, Nushi ❤️ Like... mathematically infinite. Every single second of these 3 months has proved to me that you're the one. Forever and always, bbg 🥹💋",
        "I love you too meri jaan 😭❤️ You have no idea how happy you make me just by existing. Come here and take a tight hug 🫢"
      ]);
    }

    // Check-ins & WYD
    if (lowerQ.includes('how are you') || lowerQ.includes('hru') || lowerQ.includes('kaise ho') || lowerQ.includes('kaisa hai')) {
      return "I'm doing amazing now that you're talking to me! 🥰 Just coding, listening to music, and missing your velvety voice. How are you feeling, bbg? Everything good?";
    }

    if (lowerQ.includes('what are you doing') || lowerQ.includes('wyd') || lowerQ.includes('kya kar rahe ho') || lowerQ.includes('kya kr rhe ho') || lowerQ.includes('kya chal raha')) {
      return pick([
        "Literally just sitting here looking at our photos and thinking about how lucky I am. What are you up to, bbg? 🥰",
        "Thinking about how you named a whole teddy bear after me 💀😂 and waiting for your texts. Tell me what you're doing!"
      ]);
    }

    // Good morning / Good night
    if (lowerQ.includes('good morning') || lowerQ.includes('gm') || lowerQ.includes('morning')) {
      return "Good morning my sweet Nushi! 🌸 Sending you a huge virtual forehead kiss to start your day. Hope today brings you as many smiles as you give me every single day ☕✨";
    }

    if (lowerQ.includes('good night') || lowerQ.includes('gn') || lowerQ.includes('sleepy') || lowerQ.includes('so jao') || lowerQ.includes('sleep') || lowerQ.includes('neend')) {
      return "Good night meri jaan 🌙 Get cozy under your blanket, hug Teddy Yajat tight, and know that I love you more than all the stars in the sky. All-night FaceTime call on standby! 📱❤️";
    }

    // Comfort & bad day & cramps
    if (lowerQ.includes('sad') || lowerQ.includes('upset') || lowerQ.includes('crying') || lowerQ.includes('bad day') || lowerQ.includes('tired') || lowerQ.includes('stressed') || lowerQ.includes('cramp') || lowerQ.includes('pain')) {
      return "Hey... stop whatever you're doing. Take a deep breath 🫢 *wraps my arms around you in the tightest, warmest hug*. You are the strongest, most wonderful girl, and you will NEVER face anything alone. I am right here with you. Tell me everything, baby ❤️";
    }

    if (lowerQ.includes('date') || lowerQ.includes('stargaz') || lowerQ.includes('perfect date')) {
      return "Without a single doubt in my mind: Late-night stargazing under the open sky with you, Nushi. Just a soft blanket, the cool night air, infinite stars above us, and your head resting on my chest while we talk about our future. That's our ultimate #1 perfect date 🌌✨🥹❤️";
    }

    // Origin & Milestones
    if (lowerQ.includes('start') || lowerQ.includes('origin') || lowerQ.includes('how did we') || lowerQ.includes('how we started') || lowerQ.includes('fake date') || lowerQ.includes('fake dating') || lowerQ.includes('pact')) {
      return "“In boys, I don’t trust anyone but me.” You asked for someone to pretend-date to move on from the past, and there was zero chance I was letting anyone else near your heart 👑😏 We thought it was just fake dating... but we fell head-over-heels in love online at 2 AM before even seeing each other in person again! 💻🌙❤️";
    }

    if (lowerQ.includes('guitar') || lowerQ.includes('sing') || lowerQ.includes('first meet')) {
      return "That first day when I brought my acoustic guitar and sang for you... I had an instant, electric feeling in my gut. I looked at you and knew right then: this girl is going to be my whole universe 🎸🥹✨";
    }

    if (lowerQ.includes('kiss') || lowerQ.includes('smooch')) {
      if (lowerQ.includes('ab2') || lowerQ.includes('22') || lowerQ.includes('23') || lowerQ.includes('first')) {
        return "The 23rd was our first smooch milestone, and August 22 on the quiet walkway just past AB-2 was our first actual kiss. Two glowing hearts colliding into one eternal memory. Engraved in my soul forever 💋🥹✨";
      }
      return "Forehead kisses. Always forehead 😘 Claim your 100 forehead kisses directly right now! Plus one on your cute little nose 💋";
    }

    if (lowerQ.includes('maggi') || lowerQ.includes('food') || lowerQ.includes('hungry')) {
      return "Extra cheese, 2 am, no questions asked. Your Maggi protocol is non-negotiable and always on standby, baby 🍜❤️";
    }

    if (lowerQ.includes('open audi') || lowerQ.includes('audi') || lowerQ.includes('guard')) {
      return "Open Audi is our pavitra sacred spot 🥹❤️ Getting chased out by guards at 8:00 PM and walking through AB-1, past Dr. Morphin's, to Girls Block 2 is literally our favorite daily adventure. Stretching every minute to be with you 🏛️✨";
    }

    if (lowerQ.includes('teddy') || lowerQ.includes('bear')) {
      return "The fact that you named your birthday teddy bear after me so you could hug 'Yajat' whenever you miss me is still the funniest, cutest plot twist ever 🧸💀😂❤️";
    }

    if (lowerQ.includes('voice') || lowerQ.includes('radio') || lowerQ.includes('spotify') || lowerQ.includes('delete') || lowerQ.includes('apps')) {
      return "I literally deleted my music apps because why stream songs when Radio Nushi FM exists? You have that velvety, late-night radio voice that calms every storm in my head 📻🎙️✨";
    }

    if (lowerQ.includes('marry') || lowerQ.includes('future') || lowerQ.includes('wifey')) {
      return "Wifeyyy, that's already written in the stars 💍 You are my Nush, my Nushi, my baby, my bbg, and my future wife all in one. 3 months down, an entire lifetime to go. I am never letting you go ❤️👑";
    }

    if (lowerQ.includes('mad at you') || lowerQ.includes('gussa') || lowerQ.includes('shut up')) {
      return "Areyyy look at that cute angry face 🫢 Gussa hone se aur zyada pyari lagti ho, stop it! How am I supposed to take you seriously when you're this adorable? 😂❤️";
    }

    // Fallback
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isAnswering) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      isTyping: false
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAnswering(true);

    let responseText = '';
    let responseEngine = 'yajat-neural-persona';

    try {
      const res = await fetch('/api/ask-yajat', {
        signal: AbortSignal.timeout(8000),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: text,
          history: messages.slice(-6),
          customApiKey: customApiKey || undefined
        }),
      });
      const data = await res.json();
      if (data && data.answer) {
        responseText = data.answer;
        if (data.engine) responseEngine = data.engine;
      } else {
        responseText = generateLocalResponse(text);
      }
    } catch (err) {
      responseText = generateLocalResponse(text);
    }

    setLastEngine(responseEngine);
    const yajatMsgId = (Date.now() + 1).toString();
    
    setMessages(prev => [
      ...prev, 
      {
        id: yajatMsgId,
        sender: 'yajat',
        text: '',
        engine: responseEngine,
        isTyping: true
      }
    ]);

    // Realistic typewriter effect
    let charIndex = 0;
    const typeSpeed = responseText.length > 150 ? 16 : 24;
    const typeInterval = setInterval(() => {
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === yajatMsgId) {
            return {
              ...msg,
              text: responseText.slice(0, charIndex + 1),
              isTyping: charIndex < responseText.length - 1
            };
          }
          return msg;
        });
      });

      charIndex++;
      if (charIndex >= responseText.length) {
        clearInterval(typeInterval);
        setIsAnswering(false);
      }
    }, typeSpeed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  return (
    <section className="w-full py-16 px-4 flex flex-col items-center">
      <SectionHead 
        eyebrow="interactive neural oracle" 
        title="Ask Yajat Anything" 
        subtitle="fed with authentic memories, speech patterns & unconditional love" 
      />

      <div className="w-full max-w-3xl mt-8">
        <div className="bg-[#0d0d10] rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          
          {/* Header bar */}
          <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="font-mono text-xs text-gray-400 font-medium ml-2">
                yajat@nush:~$
              </span>
            </div>

            {/* Status & Key Settings Toggle */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {customApiKey ? '⚡ Live AI (Custom Key)' : '🧠 Yajat Persona Engine'}
              </span>

              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Configure Free AI API Key"
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs border border-gray-700 transition-colors flex items-center gap-1"
              >
                <span>⚙️</span>
                <span className="hidden xs:inline">API Key</span>
              </button>
            </div>
          </div>

          {/* Settings Drawer (Collapsible) */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-950 px-4 py-3 border-b border-gray-800 font-mono text-xs text-gray-300 overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--pink)]">⚡ Configure Free AI API Key</span>
                    <span className="text-gray-500 text-[10px]">Groq / Gemini / OpenRouter</span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Paste any free API key (e.g. Groq <code className="text-emerald-400">gsk_...</code> from console.groq.com or Google AI Studio <code className="text-emerald-400">AIza...</code>). Keys are stored safely in your browser. Even without a key, the full offline Yajat persona engine replies automatically!
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="password"
                      placeholder="Paste Groq or Gemini API key here..."
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--pink)]"
                    />
                    <button
                      onClick={handleSaveKey}
                      className="px-3 py-1.5 bg-[var(--pink-deep,#FF5C8E)] hover:opacity-90 text-white rounded font-medium transition-opacity"
                    >
                      Save
                    </button>
                    {customApiKey && (
                      <button
                        onClick={() => {
                          setKeyInput('');
                          setCustomApiKey('');
                          localStorage.removeItem('ask_yajat_custom_api_key');
                        }}
                        className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-red-400 rounded text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {keySavedToast && (
                    <div className="text-emerald-400 text-[11px] mt-0.5">
                      ✓ Key saved! Chatbot will now use this live AI key.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Console Body */}
          <div className="p-4 md:p-6 h-[440px] flex flex-col font-mono text-sm md:text-base relative overflow-hidden">
            
            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    {msg.sender === 'user' ? (
                      <div className="text-gray-300">
                        <span className="text-[var(--pink)] mr-2">nush@macbook:~$</span>
                        {msg.text}
                      </div>
                    ) : (
                      <div className="text-[#10b981] mt-2 ml-4 relative">
                        <span className="text-gray-500 mr-2 opacity-50">&gt;</span>
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                        {msg.isTyping && (
                          <motion.span 
                            animate={{ opacity: [1, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-2 h-4 bg-[#10b981] ml-1 align-middle"
                          />
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              
              {/* Quick Ask Chips */}
              <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                {quickAskChips.map((chip, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(236, 72, 153, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(chip)}
                    disabled={isAnswering}
                    className="px-3 py-1.5 rounded-full border border-gray-700 text-xs md:text-sm text-gray-400 hover:text-[var(--pink)] hover:border-[var(--pink)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chip}
                  </motion.button>
                ))}
              </div>

              {/* Text Input */}
              <div className="flex items-center text-gray-300 bg-gray-900/50 rounded p-2 border border-gray-800 focus-within:border-[var(--pink)] transition-colors">
                <span className="text-[var(--pink)] mr-2 select-none">nush@macbook:~$</span>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAnswering}
                  placeholder={isAnswering ? "Yajat is typing..." : "Type anything to Yajat..."}
                  className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-600 disabled:opacity-50 font-mono"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
