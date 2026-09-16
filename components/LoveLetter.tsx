'use client';

import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useInView, motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

import { SoundEngine } from '@/lib/audio';

const VIDEO_OPTIONS = [
  { id: 'v1', label: 'Month 1 🌸', src: '/videos/our-video.mp4' },
  { id: 'v2', label: 'Month 2 🐻', src: '/videos/our-video-2.mp4' },
  { id: 'v3', label: 'Month 3 ❤️', src: '/videos/video-new.mp4' }
];

export default function LoveLetter() {
  const router = useRouter();
  const { theme } = useStore();
  const [teddyClicks, setTeddyClicks] = useState(0);
  const [teddyUnlocked, setTeddyUnlocked] = useState(false);
  const [floatingBears, setFloatingBears] = useState<{ id: number; x: number; y: number }[]>([]);
  const [activeVideo, setActiveVideo] = useState(VIDEO_OPTIONS[0].id);
  const letterRef = useRef(null);
  const isInView = useInView(letterRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      // Fire confetti when love letter is fully scrolled into view
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: theme === 'dark' ? ['#fcebdc', '#4A3222', '#c9a255'] : ['#FF9EC9', '#FF5C8E']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: theme === 'dark' ? ['#8A5A34', '#b59247'] : ['#B9AEF5', '#FFDD8C']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isInView]);

  // Teddy bear 10 clicks easter egg
  const handleTeddyClick = (e?: React.MouseEvent) => {
    SoundEngine.squeak();
    const newCount = teddyClicks + 1;
    setTeddyClicks(newCount);

    // Add floating +1 feedback
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
      // Big teddy confetti
      confetti({
        particleCount: 120,
        spread: 120,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
        shapes: ['circle'],
        scalar: 2,
      });
      setTimeout(() => {
        router.push('/teddy');
      }, 900);
    }
  };

  // Share Our Story
  const handleShareStory = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#FF9EC9');
    gradient.addColorStop(0.5, '#B9AEF5');
    gradient.addColorStop(1, '#FFDD8C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Decorative hearts
    ctx.font = '40px serif';
    ctx.fillText('💖', 30, 60);
    ctx.fillText('🩷', 720, 80);
    ctx.fillText('💕', 50, 550);
    ctx.fillText('💗', 700, 520);

    // White card area
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.roundRect(80, 80, 640, 440, 24);
    ctx.fill();

    // Try to load first photo
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = '/photos/photo-1.jpg';
      });
      // Draw circular clipped photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(400, 230, 100, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 300, 130, 200, 200);
      ctx.restore();
      // Circle border
      ctx.strokeStyle = '#FF5C8E';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(400, 230, 102, 0, Math.PI * 2);
      ctx.stroke();
    } catch {
      // Photo failed to load, draw heart instead
      ctx.font = '80px serif';
      ctx.textAlign = 'center';
      ctx.fillText('💖', 400, 260);
    }

    // Title
    ctx.fillStyle = '#3B2245';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Yajat & Nush', 400, 380);

    // Subtitle
    ctx.fillStyle = '#6b4d78';
    ctx.font = '18px sans-serif';
    const start = new Date('2026-06-22T00:00:00').getTime();
    const days = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
    ctx.fillText(`${days} days of love and counting 🩷`, 400, 415);

    // Message
    ctx.fillStyle = '#FF5C8E';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('"Every day with you is my new favorite day"', 400, 460);

    // Convert to blob and share
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'our-story.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Our Story 🩷',
            text: `Yajat & Nush — ${days} days together`,
            files: [file],
          });
        } catch {
          downloadImage(blob);
        }
      } else {
        downloadImage(blob);
      }
    }, 'image/png');
  };

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'our-story.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="letter" className="anniversary-section relative print:py-0 print:m-0 print:bg-white print:text-black">
      {/* Print Button */}
      <button 
        onClick={() => window.print()}
        className="absolute top-4 right-4 bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-[var(--pink)] font-nunito font-bold text-sm shadow hover:scale-105 transition-transform print:hidden"
      >
        🖨️ Save as Keepsake (PDF)
      </button>

      <div className="letter print:shadow-none print:bg-white print:border-none print:w-full print:max-w-none" ref={letterRef}>
                <span className="eyebrow print:hidden">two months down &middot; stepping into month 3</span>
        <h2 className="script" style={{ fontSize: '3rem', margin: '0.4rem 0 1.4rem' }}>for you, my nushi ❤️</h2>
        
        <p>Happy 2 months to us, <strong>Nushi</strong> 😭❤️ (and cheers to starting our 3rd month journey together today!)</p>
        
        <p>Honestly, it&apos;s crazy to think that two months have already flown by, <strong>baby</strong>, because somehow we&apos;ve already created memories that feel like they&apos;ll stay with me for a lifetime. When I think about <em>our</em> journey, my mind always goes back to <strong>Open Audi</strong> 🥹❤️. That place is so sacred and <strong>pavitra</strong> for both of us. So many of our happiest and most beautiful moments started right there. Sometimes we just remember those moments and both of us get emotional, sometimes even end up crying—not because we&apos;re sad, but because we&apos;re just <em>that happy</em> that we got to live those moments together 😭❤️.</p>
        
        <p>And then there is our daily 8:00 PM mission 😭😂. <strong>8:00 baje guards hume Open Audi se bhaga dete hain</strong>, but obviously that doesn&apos;t mean we&apos;re going our separate ways 💀. Phir hum saath mein AB-1 ki taraf chale jaate hain. Jab AB-1 se bhi bhagana chalu kar dete hain, we slowly start our walk towards Dr. Morphin&apos;s 😭❤️. Waha se Girls Block 1 ke paas se hote hue, we somehow keep stretching every last minute together... until finally, reluctantly, we part ways at <strong>Girls Block 2</strong>.</p>
        
        <p>And I don&apos;t know why, but that walk always gets me, <strong>bbg</strong> 🥹❤️. Finding our way through AB-1, Dr. Morphin&apos;s, passing Girls Block 1... finally having to say goodbye at Girls Block 2. Then you turn back and walk towards your hostel while I go my way. It&apos;s such a normal, small moment, but it has become one of the most precious parts of my day. Maybe because we keep finding <em>one more route, one more walk, one more few minutes</em> together, just because neither of us actually wants to say goodbye yet 😭❤️.</p>
        
        <p>
          And one of my favourite memories will always be <strong>your birthday</strong>, <strong>Nush</strong> 🥹❤️. Being there with you, celebrating your special day, giving you that 
          <span 
            className="cursor-pointer font-bold text-[var(--pink-deep)] mx-1 hover:underline select-none bg-[var(--pink)]/30 px-2 py-0.5 rounded-full inline-block transition-transform hover:scale-110 active:scale-95"
            onClick={handleTeddyClick}
            title="Click me 10 times for a secret!"
          >
            🧸 teddy bear
          </span>
          {teddyClicks > 0 && teddyClicks < 10 && (
            <span className="text-xs font-bold text-[var(--pink-deep)] ml-1 print:hidden animate-bounce">({teddyClicks}/10 taps!)</span>
          )}
          , and then you deciding to name it <strong>Yajat</strong> 😭😭. I still can&apos;t get over the fact that there&apos;s literally a teddy named after me 💀😂. But honestly, that day and all those little moments around it will always stay so close to my heart.
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
                  ? "Tap here 10 times to unlock the Secret 3D Teddy Room 🚪✨" 
                  : teddyClicks >= 10 
                    ? "🎉 Opening Secret Teddy Room..." 
                    : `Keep going! ${10 - teddyClicks} more taps to go 🐾`}
              </span>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-xs font-bold font-nunito shadow transition-transform group-hover:scale-105 ${
            teddyClicks >= 10 ? 'bg-green-500 text-white animate-pulse' : 'bg-[var(--pink-deep)] text-white'
          }`}>
            {teddyClicks >= 10 ? "UNLOCKED 💖" : "TAP 🐾"}
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
        <p>And especially <strong>last night on our 2nd month anniversary</strong>, <strong>bbg</strong> 🥹❤️... you were all alone in your room, and there was no way in hell I was letting you feel lonely for even a second. We stayed on video call for the <strong>entire night</strong> 🌙📱. Phones overheating on the chargers, screen brightness turned all the way down, whispering back and forth until 4:00 AM, making you laugh, and watching you softly drift off to sleep while I listened to your quiet breathing until the morning sun came up. That night proved to me that no distance or walls can ever make you lonely as long as you have me ❤️.</p>

        {/* Library Study Dates */}
        <p>And then there are our <strong>Central Library study dates</strong> 📚🤫... sitting across from each other pretending we&apos;re actually studying for exams, passing silly folded sticky notes under the desk, whispering inside jokes so the librarian doesn&apos;t shush us, and me getting literally <strong>0% studying done</strong> because I&apos;m <strong>100% busy staring at you</strong> and admiring how cute your focused face looks 😭❤️.</p>

        {/* Deleting Music Apps & Her Radio Voice */}
        <p>You know how obsessed I am with music—music was literally my whole oxygen. But do you know what&apos;s crazy? <strong>I literally deleted all my music streaming apps</strong> 🎶🚫. A guy who lives and breathes music deleted Spotify... because nothing on any chart in the world compares to hearing you. You have that effortless, warm, velvety <strong>late-night radio voice</strong> that just instantly calms every single storm in my head. And when you sing to me? Every artist in the world becomes background noise. The only two sounds that get to exist in my universe now are my band&apos;s music and your sweet voice coming from your lips 🎙️❤️.</p>

        {/* Her Radiance & Compliment */}
        <p>And I don&apos;t think you even realize how breathtaking you genuinely are, <strong>meri jaan</strong>. Your stomach... that flawless, warm brown skin, the way my hand just naturally rests against your waist when I pull you close during our random tight hugs... you are sculpted like pure perfection. I swear sometimes I just look at you and wonder how on earth someone so gorgeous and pure is mine ✨🥹.</p>

        <p>I love our completely random tight hugs 🥹❤️. No planning, no reason, just suddenly holding each other tight, and somehow for those few moments the rest of the world disappears. Two months down with you, <strong>wifeyyy</strong> 😭❤️, and stepping into Month 3 today feels like the start of another amazing chapter.</p>
        
        <p>Maybe that&apos;s what I love the most about us, <strong>baby</strong>. We&apos;re not even trying to create perfect memories. We&apos;re just living our normal days together, and somehow they turn into something unforgettable. A random campus walk becomes a memory. Library study turns into romance. A late night FaceTime becomes precious. And saying goodbye at Girls Block 2 becomes the part of the day where I wish time would just slow down a little 😭❤️.</p>
        
        <p><strong>Happy 2 months, meri Nushi ❤️🥹 (Here&apos;s to starting Month 3 today and forever to go!)</strong></p>
        
        <p>Thank you for making these two months the happiest of my life. Thank you for your voice, your laughs, your tears of happiness, your random tight hugs, the late night video calls, and every single extra minute we somehow manage to steal together.</p>
        
        <p>Here&apos;s to <strong>Open Audi</strong>, to our sacred little memories there, to getting kicked out at 8:00 and still somehow finding our way together through the Library, AB-1, Dr. Morphin&apos;s, Girls Block 1 and finally Girls Block 2 😭😂❤️. Here&apos;s to teddy <strong>Yajat</strong>, to all-night calls, to your radio voice, to you being my <strong>Nush, Nushi, baby, bbg and wifeyyy</strong> all at once 😭❤️, and to all the Month 3 memories we are starting to create from today.</p>
        
        <p><strong>I love you so so much, Nushi ❤️🥹 Happy 2 months to us, baby. Here&apos;s to us and our little world ❤️🎶😭</strong></p>
        
        {/* MEDIA PLACEHOLDERS */}
        <div className="my-8 flex flex-col md:flex-row gap-4 items-center justify-center print:hidden">
          {/* Video */}
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <div className="flex gap-2 self-center print:hidden">
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
          
          {/* Voice Note Placeholder */}
          <div className="w-full md:w-1/2 h-full bg-[var(--white)] rounded-xl border border-[var(--pink)]/30 p-4 flex items-center gap-4 shadow-sm">
            <button className="w-12 h-12 rounded-full bg-[var(--pink-deep)] text-white flex items-center justify-center shadow hover:scale-105 transition-transform">
              ▶
            </button>
            <div className="flex-1">
              <div className="h-1 bg-gray-200 rounded-full w-full overflow-hidden">
                <div className="h-full bg-[var(--pink-deep)] w-1/3" />
              </div>
              <span className="text-xs font-nunito text-[var(--plum-soft)] mt-1 block">Voice Note - 1:14</span>
            </div>
          </div>
        </div>

        {/* Share Our Story Button */}
        <div className="flex justify-center my-6 print:hidden">
          <button
            onClick={handleShareStory}
            className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-8 py-3 rounded-full font-nunito font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            💌 Share Our Story
          </button>
        </div>

        <p className="signoff">with all my love, yours forever,<br/>Yajat Kataria 🐻🩷</p>
      </div>
    </section>
  );
}
