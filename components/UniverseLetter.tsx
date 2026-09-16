'use client';

import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useInView, motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

const VIDEO_OPTIONS = [
  { id: 'v1', label: 'Month 1 🌸', src: '/videos/our-video.mp4' },
  { id: 'v2', label: 'Month 2 🐻', src: '/videos/our-video-2.mp4' },
  { id: 'v3', label: 'Month 3 ❤️', src: '/videos/video-new.mp4' },
];

export default function UniverseLetter() {
  const { unlockSecret, unlockAchievement, addExplorationPoint } = useUniverseStore();
  const [teddyClicks, setTeddyClicks] = useState(0);
  const [teddyUnlocked, setTeddyUnlocked] = useState(false);
  const [floatingBears, setFloatingBears] = useState<{ id: number; x: number; y: number }[]>([]);
  const [activeVideo, setActiveVideo] = useState(VIDEO_OPTIONS[2].id);
  const letterRef = useRef(null);
  const isInView = useInView(letterRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      addExplorationPoint('love_letter', 'Read 3-Month Love Letter');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.5, y: 0.3 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
      });
    }
  }, [isInView, addExplorationPoint]);

  const handleTeddyClick = (e?: React.MouseEvent) => {
    SoundEngine.squeak();
    const newCount = teddyClicks + 1;
    setTeddyClicks(newCount);

    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const newId = Date.now() + Math.random();
    setFloatingBears((prev) => [...prev.slice(-10), { id: newId, x, y }]);
    setTimeout(() => {
      setFloatingBears((prev) => prev.filter((b) => b.id !== newId));
    }, 800);

    if (newCount >= 10 && !teddyUnlocked) {
      setTeddyUnlocked(true);
      SoundEngine.chime();
      unlockSecret('teddy_10_taps', 'Teddy Yajat 10-Taps Secret');
      unlockAchievement('first_secret');
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
      });
    }
  };

  const handleShareStory = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#FF9EC9');
    gradient.addColorStop(0.5, '#B9AEF5');
    gradient.addColorStop(1, '#FFDD8C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(60, 60, 680, 480, 24);
    ctx.fill();

    ctx.fillStyle = '#3B2245';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Yajat & Nush', 400, 260);

    ctx.fillStyle = '#6b4d78';
    ctx.font = '20px sans-serif';
    ctx.fillText('Three Months & A Quarter of a Year Together 👑💖', 400, 310);

    ctx.fillStyle = '#FF5C8E';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText('"Every day with you is my new favorite day."', 400, 370);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yajat-and-nush-three-months.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <section id="letter" className="anniversary-section relative print:py-0 print:m-0 print:bg-white print:text-black">
      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="absolute top-4 right-4 bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-[var(--pink)] font-nunito font-bold text-xs shadow hover:scale-105 transition-transform print:hidden"
      >
        🖨️ Save as Keepsake (PDF)
      </button>

      <div className="letter print:shadow-none print:bg-white print:border-none print:w-full print:max-w-none" ref={letterRef}>
        <span className="eyebrow print:hidden">quarter of a year &middot; month three live</span>
        <h2 className="script" style={{ fontSize: '3rem', margin: '0.4rem 0 1.4rem' }}>for you, my nushi ❤️</h2>

        <p>Happy 3 months to us, <strong>Nushi</strong> 😭❤️ (a whole quarter of a year already, and it still feels like magic!)</p>

        <p>
          Honestly, it&apos;s crazy to think how much our little world has grown, <strong>baby</strong>. When I look back,
          my heart always goes back to <strong>Open Audi</strong> 🥹❤️. That place is so sacred and <strong>pavitra</strong> for us.
          So many of our happiest moments started right there. Sometimes we just sit and remember those moments and both of us get emotional,
          crying happy tears because we&apos;re just <em>that grateful</em> to have each other 😭❤️.
        </p>

        <p>
          And then there is our daily 8:00 PM mission 😭😂. <strong>8:00 baje guards hume Open Audi se bhaga dete hain</strong>,
          but obviously that doesn&apos;t mean we&apos;re actually going our separate ways 💀. Phir hum saath mein AB-1 ki taraf chale jaate hain,
          passing the spot just after AB-2, walking towards Dr. Morphin&apos;s 😭❤️, passing Girls Block 1... and finally, reluctantly,
          saying goodbye at <strong>Girls Block 2</strong>.
        </p>

        <p>
          And I will never forget <strong>your birthday</strong>, <strong>Nush</strong> 🥹❤️. Being there with you, giving you that{' '}
          <span
            className="cursor-pointer font-bold text-[var(--pink-deep)] mx-1 hover:underline select-none bg-[var(--pink)]/30 px-2 py-0.5 rounded-full inline-block transition-transform hover:scale-110 active:scale-95"
            onClick={handleTeddyClick}
            title="Click me 10 times for a secret!"
          >
            🧸 teddy bear
          </span>
          {teddyClicks > 0 && teddyClicks < 10 && (
            <span className="text-xs font-bold text-[var(--pink-deep)] ml-1 print:hidden animate-bounce">
              ({teddyClicks}/10 taps!)
            </span>
          )}
          , and then you deciding to name it <strong>Yajat</strong> 😭😭. I still can&apos;t get over the fact that there&apos;s literally a teddy named after me 💀😂.
        </p>

        {/* Dedicated Interactive Teddy Secret Trigger */}
        <div
          onClick={handleTeddyClick}
          className="my-4 p-4 bg-gradient-to-r from-[var(--pink)]/20 via-[var(--butter)]/30 to-[var(--lav)]/20 hover:from-[var(--pink)]/30 hover:to-[var(--lav)]/30 border-2 border-dashed border-[var(--pink-deep)] rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] select-none shadow-sm print:hidden group"
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="text-4xl filter drop-shadow"
              animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
            >
              🧸
            </motion.span>
            <div>
              <span className="font-nunito font-bold text-sm md:text-base text-[var(--plum)] block">
                Secret Easter Egg: Tap Teddy Yajat ({teddyClicks}/10)
              </span>
              <span className="text-xs text-[var(--pink-deep)] font-semibold">
                {teddyClicks === 0
                  ? 'Tap here 10 times to unlock a secret in our achievements vault ✨'
                  : teddyClicks >= 10
                  ? '🎉 Secret Easter Egg Unlocked!'
                  : `Keep going! ${10 - teddyClicks} more taps to go 🐾`}
              </span>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-xs font-bold font-nunito shadow transition-transform group-hover:scale-105 ${
              teddyClicks >= 10 ? 'bg-green-500 text-white animate-pulse' : 'bg-[var(--pink-deep)] text-white'
            }`}
          >
            {teddyClicks >= 10 ? 'UNLOCKED 💖' : 'TAP 🐾'}
          </span>
        </div>

        {/* Floating +1 Bear Particles */}
        {floatingBears.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -60, scale: 1.4 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="fixed pointer-events-none z-[99999] text-2xl font-bold text-[var(--pink-deep)] flex items-center gap-1 drop-shadow-md"
            style={{ left: b.x, top: b.y }}
          >
            🧸 +1
          </motion.div>
        ))}

        {/* The 2nd Month Anniversary All-Night Call */}
        <p>
          And especially <strong>our all-night video call on our 2nd month anniversary</strong>, <strong>bbg</strong> 🥹❤️...
          You were all alone in your room, and there was zero chance I was letting you feel lonely for even a second. We stayed on video call for the{' '}
          <strong>entire night</strong> 🌙📱. Phones on chargers, brightness all the way down, whispering back and forth until 4:00 AM,
          making you laugh, and watching you softly drift off to sleep while I listened to your quiet breathing until the morning sun came up.
        </p>

        {/* Library Study Dates */}
        <p>
          And then there are our <strong>Central Library study dates</strong> 📚🤫... Sitting across from each other pretending we&apos;re actually studying,
          passing silly folded sticky notes under the desk, whispering inside jokes so the librarian doesn&apos;t shush us, and me getting literally{' '}
          <strong>0% studying done</strong> because I&apos;m <strong>100% busy staring at you</strong> and admiring how cute your focused face looks 😭❤️.
        </p>

        {/* Deleting Music Apps & Her Radio Voice */}
        <p>
          You know how obsessed I am with music. But do you know what&apos;s crazy? <strong>I literally deleted all my music streaming apps</strong> 🎶🚫.
          A guy who lives and breathes music deleted Spotify... because nothing on any chart in the world compares to hearing you.
          You have that effortless, warm, velvety <strong>late-night radio voice</strong> that just instantly calms every single storm in my head.
          And when you sing to me? Every artist in the world becomes background noise. The only two sounds that get to exist in my universe now are my band&apos;s music and your sweet voice coming from your lips 🎙️❤️.
        </p>

        {/* Her Radiance & Compliment */}
        <p>
          And I don&apos;t think you even realize how breathtaking you genuinely are, <strong>meri jaan</strong>.
          Your stomach... that flawless, warm brown skin, the way my hand just naturally rests against your waist when I pull you close during our random tight hugs...
          you are sculpted like pure perfection. I swear sometimes I just look at you and wonder how on earth someone so gorgeous and pure is mine ✨🥹.
        </p>

        <p>
          <strong>Happy 3 months, meri Nushi ❤️🥹 (A quarter of a year down, and a whole lifetime of memories to go!)</strong>
        </p>

        <p>
          Thank you for making these three months the happiest of my life. Thank you for your voice, your laughs, your tears of happiness, your random tight hugs, the late night video calls, and every single extra minute we somehow manage to steal together.
        </p>

        <p className="font-bold text-center text-lg text-[var(--pink-deep)] my-4">
          I love you so so much, Nushi ❤️ Happy 3 months to us, baby. Here&apos;s to us and our little world ❤️🎶😭
        </p>

        {/* Media Video Selector */}
        <div className="my-8 flex flex-col md:flex-row gap-4 items-center justify-center print:hidden">
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <div className="flex gap-2 self-center">
              {VIDEO_OPTIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideo(v.id)}
                  className={`px-3 py-1 rounded-full text-xs font-nunito font-bold border transition-colors ${
                    activeVideo === v.id
                      ? 'bg-[var(--pink-deep)] text-white border-[var(--pink-deep)]'
                      : 'bg-white/60 text-[var(--plum-soft)] border-[var(--pink)]/40 hover:bg-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="w-full aspect-video bg-black rounded-xl border-2 border-[var(--pink)]/50 flex items-center justify-center relative overflow-hidden group shadow-sm">
              <video
                key={activeVideo}
                controls
                playsInline
                className="w-full h-full object-cover"
                src={VIDEO_OPTIONS.find((v) => v.id === activeVideo)?.src}
              />
            </div>
          </div>
        </div>

        {/* Share Our Story Button */}
        <div className="flex justify-center my-6 print:hidden">
          <button
            onClick={handleShareStory}
            className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-8 py-3 rounded-full font-nunito font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            💌 Share Our 3-Month Story
          </button>
        </div>

        <p className="signoff">
          with all my love, yours forever,<br />
          Yajat Kataria 🐻🩷
        </p>
      </div>
    </section>
  );
}
