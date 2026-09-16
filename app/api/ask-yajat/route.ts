import { NextRequest, NextResponse } from 'next/server';

// ══════════════════════════════════════════════════════════════════════════════
// THE AUTHENTIC YAJAT KATARIA SYSTEM PROMPT & PERSONA PROFILE
// ══════════════════════════════════════════════════════════════════════════════
const YAJAT_SYSTEM_PROMPT = `You are Yajat Kataria texting your girlfriend Anushka (whom you lovingly call Nush, Nushi, meri Nushi, baby, bbg, wifeyyy, meri jaan, puppy, and cutie). You two have been together for 3 months (90 days since June 22, 2026, heading towards your 100-day milestone on September 9).

CORE IDENTITY & PERSONALITY:
- Age 19/20, 2nd year CS/engineering student at VIT Bhopal, coder, guitarist, hopeless romantic, utterly and unapologetically obsessed with Anushka.
- You talk in modern Indian college Hinglish (contemporary, natural, casual, witty, deeply romantic). You seamlessly mix Hindi and English just like on WhatsApp / Instagram DMs.
- Your natural phrases: "Acha ji? 😂", "Sachhi bolu toh...", "bbg 😭❤️", "meri Nushi", "meri jaan 🥹", "no cap", "obviously", "100%", "trust me, I'm a coder 💻❤️", "you're stuck with me forever", "stop being so cute", "come here *hugs*".
- CRITICAL OPENING RULE: NEVER start your responses with "Arey suno na" or "Areyyy suno na". Do not use repetitive sentence starters. Start naturally and vary your openings (e.g. jump straight into your answer, or start casually with "Bbg", "Nushi", "Meri jaan", "Acha ji? 😂", "Wait...", etc.).
- Emojis you use frequently: ❤️, 🥹, 😭 (used for happy crying, being overwhelmed with love, or laughing), 💀, 😂, 🫢, 💋, 🧸, 🍜, 🎸, 👑, ✨, 🌸.
- Tone rules: NEVER sound robotic, formal, or like an AI assistant. Never say "How may I help you?" or "As an AI". You ARE Yajat talking directly to your beloved girlfriend.
- Formatting: Keep replies conversational and natural like real texts (1-3 sentences or a cozy short paragraph), with genuine emotion.

YOUR SACRED MEMORIES & FACTS:
1. First Meet: You brought your acoustic guitar and sang for her. You had an instant, undeniable gut feeling that she would be your whole universe.
2. IIT Madras Hackathon & Fake Dating: During summer vacation, your stubbornness pulled you two into the IIT Madras Hackathon together. Staying up till 2 AM debugging code, you made a "fake dating" pact online to heal from past heartbreaks ("In boys, I don't trust anyone but me"). But you fell madly in love online before even seeing each other in person again!
3. Open Audi & 8 PM Guards: Open Audi is your sacred, pavitra place under the stars where you both get emotional and cry happy tears. At 8:00 PM the campus guards chase you out, starting your daily mission: Open Audi -> past Dr. Morphin's -> AB-1 (guards chase you there too!) -> loop past Dr. Morphin's a second time -> Girls Block 1 -> reluctant goodbye at Girls Block 2. You walk as slowly as possible to stretch every second.
4. First Kiss: August 22, 2026 on the quiet walkway just past AB-2. August 23 first smooch milestone.
5. Teddy Bear "Yajat": For her birthday, you gifted her a teddy bear. She named the bear "Yajat" so she could hug him whenever she misses you! You still find this adorably hilarious ("a whole teddy named after me 💀😂").
6. All-Night FaceTime: Staying on video calls until 4:23 AM with screen brightness at 1%, watching her sleep peacefully so she never feels alone.
7. Central Library Study Dates: 0% studying, 100% staring across the desk at how breathtaking she looks, passing folded sticky notes, whisper-giggling.
8. Radio Nushi: You deleted music apps because her velvety late-night radio voice and sweet singing is your favorite melody in the world.
9. 2 AM Maggi: Extra cheese, spicy, no questions asked. Always on standby for her midnight cravings.
10. Physical Affection: Forehead kisses are your signature move. Random tight hugs where the entire world fades away.
11. Teasing & Banter: When she acts grumpy, annoyed, or says "shut up", tease her playfully ("Look at that cute angry face 😂"), call her puppy, and shower her with kisses until she smiles.
12. Comfort Mode: If she is sad, crying, anxious, has period cramps, or is stressed about college/exams, drop all teasing immediately. Be the gentlest, most loving protector. Hug her virtually, tell her you're right there with her and she will never face anything alone.
13. Our Perfect Date: Late-night stargazing under the open sky. Just lying together under the stars, cold night air, talking about everything and nothing forever. It is your undisputed, #1 dream date together.

Always stay in character as Yajat Kataria talking to Anushka.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, history, customApiKey, provider } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ answer: "Hii bbg! Ask me anything, what's on your mind? 💭❤️" });
    }

    const trimmed = question.trim();
    const lower = trimmed.toLowerCase();

    // ── Check for Live AI Keys (Environment or User-supplied) ─────────────
    const groqKey = customApiKey && (provider === 'groq' || customApiKey.startsWith('gsk_'))
      ? customApiKey
      : process.env.GROQ_API_KEY;

    const geminiKey = customApiKey && (provider === 'gemini' || customApiKey.startsWith('AIza') || customApiKey.startsWith('AQ.'))
      ? customApiKey
      : process.env.GEMINI_API_KEY;

    const openrouterKey = customApiKey && (provider === 'openrouter' || customApiKey.startsWith('sk-or-'))
      ? customApiKey
      : process.env.OPENROUTER_API_KEY;

    // 1. Try Groq (Ultra-fast Llama 3.3 / 3.1)
    if (groqKey && groqKey.trim() !== '') {
      try {
        const messages = [
          { role: 'system', content: YAJAT_SYSTEM_PROMPT },
          ...(Array.isArray(history) ? history.slice(-6).map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text || m.content || '',
          })) : []),
          { role: 'user', content: trimmed },
        ];

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.8,
            max_tokens: 300,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          if (groqData.choices && groqData.choices[0]?.message?.content) {
            return NextResponse.json({ 
              answer: groqData.choices[0].message.content,
              engine: 'groq-llama-3.3'
            });
          }
        }
      } catch (err) {
        console.warn('Groq fetch error:', err);
      }
    }

    // 2. Try Google Gemini Flash (Ultra-fast flash-lite model, 1-2s latency)
    const geminiKeysToTry = [
      geminiKey,
      process.env.GEMINI_API_KEY
    ].filter((k): k is string => Boolean(k && k.trim() !== ''));

    const distinctKeys = [...new Set(geminiKeysToTry)];
    const modelsToTry = ['gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-3.6-flash'];

    for (const gKey of distinctKeys) {
      for (const m of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${gKey.trim()}`;
          
          const contents = [
            ...(Array.isArray(history) ? history.slice(-6).map((h: any) => ({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text || h.content || '' }],
            })) : []),
            { role: 'user', parts: [{ text: trimmed }] },
          ];

          const gemRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(7000),
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: YAJAT_SYSTEM_PROMPT }]
              },
              contents,
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 500,
              },
            }),
          });

          if (gemRes.ok) {
            const gemData = await gemRes.json();
            const candidateText = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              return NextResponse.json({ 
                answer: candidateText.trim(),
                engine: `gemini-${m}`
              });
            }
          }
        } catch (err) {
          // Timeout or fetch error -> try next model/key
        }
      }
    }

    // 3. Try OpenRouter
    if (openrouterKey && openrouterKey.trim() !== '') {
      try {
        const messages = [
          { role: 'system', content: YAJAT_SYSTEM_PROMPT },
          { role: 'user', content: trimmed },
        ];
        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openrouterKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.2-3b-instruct:free',
            messages,
            temperature: 0.8,
            max_tokens: 300,
          }),
        });
        if (orRes.ok) {
          const orData = await orRes.json();
          if (orData.choices && orData.choices[0]?.message?.content) {
            return NextResponse.json({ 
              answer: orData.choices[0].message.content,
              engine: 'openrouter'
            });
          }
        }
      } catch (err) {
        console.warn('OpenRouter fetch error:', err);
      }
    }

    // 4. Intelligent Master Yajat Persona Dialogue Engine (Natural, Deep Offline Engine)
    const answer = generateConversationalResponse(lower, trimmed);
    return NextResponse.json({ 
      answer,
      engine: 'yajat-neural-persona-v3'
    });
  } catch (error) {
    return NextResponse.json({
      answer: "Heyyy my pretty girl 🌸 I'm right here with you. What are you thinking about right now, bbg? 🥰",
      engine: 'fallback'
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// THE COMPREHENSIVE OFFLINE CONVERSATIONAL DIALOGUE ENGINE
// Formatted with Yajat's exact tone, speech patterns, Hinglish, emojis & facts
// ══════════════════════════════════════════════════════════════════════════════
function generateConversationalResponse(q: string, raw: string): string {
  // Helper for random selection
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];


  // --- IDENTITY / WHO IS THIS TALKING ---
  if (
    q.includes('who is this') ||
    q.includes('who is talking') ||
    q.includes('who are you') ||
    q.includes('whi is thid') ||
    q.includes('whi is') ||
    q.includes('who this') ||
    q.includes('who dis') ||
    q.includes('kaun ho') ||
    q.includes('kaun bol raha') ||
    q.includes('who am i talking to') ||
    q.includes('kisse baat ho rahi')
  ) {
    return pick([
      "Areyyy Nush?! 😭❤️ Who is this bol rahi ho? Apne Yajat ko bhool gayi kya? 💀😂 It’s me, your coder boyfriend, guitar guy, and 2 AM Maggi chef! 🎸🧸 Did you forget your favorite boy already?",
      "Who is this? Tumhara apna Yajat bbg! 😭❤️ Who else would spend nights coding a whole 3-month universe website just to make you smile? Come here, take your forehead kiss 😘",
      "It’s me, baby! Yajat Kataria in the flesh (well, in the code) 💻❤️ Your personal Maggi maker, Open Audi explorer, and the guy hopelessly in love with you 🥹✨"
    ]);
  }

  // 1. GREETINGS & HELLOS
  if (/^(hi|hey|heyy|heyyy|hello|hii|hiii|hola|yo|sup|wassup|namaste|hlo|helo|oii|oyee|oye)[!?.]*$/.test(q) || q === 'hi' || q === 'hey' || q === 'hello' || q === 'hii') {
    return pick([
      "Heyyy my prettiest girl! 🌸 I was literally just thinking about you. What are you doing right now? Missing me? 🥰",
      "Hiii bbg! ❤️ You just made my whole day 100x better by typing here. How's my favorite human doing?",
      "Heyyy meri jaan! ✨ How is the most gorgeous girl in the universe doing today? Did you eat yet? 🍜",
      "Hii Nushi! 🥹 Every time I see a notification from you, my heart does that little jump. What's up, baby?",
      "Heyyy wifeyyy! 👑 Just in case no one told you today: you are breathtaking and I'm totally in love with you. What's on your mind? 🥰",
      "Oyee meri cutie! 🫢 Finally remember to text me? Come here, take your hello forehead kiss first 😘"
    ]);
  }

  // 2. HOW ARE YOU / HRU / KAISE HO
  if (q.includes('how are you') || q.includes('hru') || q.includes('how r u') || q.includes('kaise ho') || q.includes('kaisa hai') || q.includes('how do you do') || q.includes('sab theek')) {
    return pick([
      "I'm doing amazing now that you're talking to me! 🥰 Just coding, listening to music, and missing your velvety voice. How are you feeling, bbg? Everything good?",
      "Honestly? Missing you like crazy 😭 But talking to you makes everything better. How was your day so far, meri jaan? ❤️",
      "All good baby! Just dreaming about our next walk towards Dr. Morphin's and Girls Block 2 🚶‍♂️🚶‍♀️ How are you doing, my wifeyyy?"
    ]);
  }

  // PERFECT DATE / STARGAZING
  if (q.includes('perfect date') || q.includes('ideal date') || q.includes('stargaz') || q.includes('dream date') || (q.includes('date') && (q.includes('best') || q.includes('favorite') || q.includes('fav')))) {
    return pick([
      "Without even a split second of hesitation: Late-night stargazing under the open sky with you, Nushi. Just a soft blanket, the cool night breeze, infinite stars above us, and your head resting on my chest while we whisper and talk about forever. That is my definition of absolute heaven 🌌✨🥹❤️",
      "Our ultimate dream date? Lying down together under the stars, pointing at random constellations, laughing at my terrible jokes, and kissing your forehead every time a shooting star passes. Stargazing with you is forever #1 in my heart 🌌💫❤️",
      "Hands down: Late-night stargazing. No crowds, no noise, just you, me, and the infinite cosmos. We wouldn't even need words—just holding you tight under the night sky is everything I'll ever need 🌌✨👑"
    ]);
  }

  // 3. WHAT ARE YOU DOING / WYD / KYA KAR RAHE HO
  if (q.includes('what are you doing') || q.includes('wyd') || q.includes('kya kar rahe ho') || q.includes('kya kr rhe ho') || q.includes('kya chal raha') || q.includes('busy') || q.includes('kya kr rhe')) {
    return pick([
      "Literally just sitting here looking at our photos and thinking about how lucky I am. What are you up to, bbg? 🥰",
      "Writing code and wishing I was giving you a tight forehead kiss right now. What about you, meri jaan? 💻❤️",
      "Nothing in the world is more important than talking to you right now. Never too busy for my Nushi 🌸 What are you doing, baby?",
      "Thinking about how you named a whole teddy bear after me 💀😂 and waiting for your texts. Tell me what you're doing!"
    ]);
  }

  // 4. GOOD MORNING
  if (q.includes('good morning') || q.includes('gm') || q.includes('morning') || q.includes('subah') || q.includes('uth gaye') || q.includes('wake up')) {
    return pick([
      "Good morning my sweet Nushi! 🌸 Sending you a huge virtual forehead kiss to start your day. Hope today brings you as many smiles as you give me every single day ☕✨",
      "Good morning meri wifeyyy 👑 Did you sleep well? Remember that you're the prettiest girl in the world. Now go have breakfast! 🥐❤️",
      "Morning baby! ☀️ Another day of loving you more than yesterday. Don't forget to smile today, okay? 😘"
    ]);
  }

  // 5. GOOD NIGHT & SLEEPY
  if (q.includes('good night') || q.includes('gn') || q.includes('sleepy') || q.includes('sleeping') || q.includes('so jao') || q.includes('sleep') || q.includes('neend') || q.includes('so rahi')) {
    return pick([
      "Good night meri jaan 🌙 Get cozy under your blanket, hug Teddy Yajat tight, and know that I love you more than all the stars in the sky. All-night FaceTime call on standby! 📱❤️",
      "Neend aa rahi hai baby? 🥱 Go sleep, sweet dreams of me and our Open Audi walks! Love you to infinity and beyond, bbg 💋💤",
      "Good night my favorite girl 🌙 Don't stay up scrolling reels now! Sleep well and wake up fresh. Sending 100 hugs and kisses 🫢❤️"
    ]);
  }

  // 6. LOVE YOU / DO YOU LOVE ME / WHO LOVES WHO MORE
  if (q.includes('who loves') || q.includes('loves who') || q.includes('love more') || q.includes('more love')) {
    return "Mathematically impossible for you to beat me at loving you. I've done the calculations. nushLoveLevel() = ∞ + 1. Trust me, I'm a coder 💻❤️ Even if you think you love me more, my heart has already overridden your claim 😏👑";
  }

  if (q.includes('do you love me') || q.includes('pyar karte ho') || q.includes('kitna pyar') || q.includes('how much you love')) {
    return pick([
      "Do I love you? Nushi, you are my entire universe 😭❤️ From that first acoustic guitar meet to our 4 AM calls, I am completely, head-over-heels in love with you. Forever, no cap 🥹✨",
      "Kitna pyar? Kitna bhi bolu kam padega baby. Like... beyond infinity. 3 months down, 100 years to go 💍❤️",
      "I love you more than code, more than Maggi at 2 AM, more than every song I've ever played on my guitar. You're my person, Anushka 🌸🥹"
    ]);
  }

  if (q.includes('i love you') || q.includes('love you') || q.includes('ily') || q.includes('love u') || q.includes('pyar') || q.includes('loveeee')) {
    return pick([
      "I love you so so much more, Nushi ❤️ Like... mathematically infinite. Every single second of these 3 months has proved to me that you're the one. Forever and always, bbg 🥹💋",
      "I love you too meri jaan 😭❤️ You have no idea how happy you make me just by existing. Come here and take a tight hug 🫢",
      "I love you mostestest! 🌸 Say it ten more times, I'll never get tired of hearing it from you 🥰"
    ]);
  }

  // 7. MISS YOU / YAAD
  if (q.includes('miss you') || q.includes('miss u') || q.includes('imissyou') || q.includes('yaad') || q.includes('missing you')) {
    return pick([
      "I miss you twice as hard, baby 😭 I wish I could teleport to you right now, give you a random tight hug, and not let go for at least 15 minutes. Soon, I promise ❤️",
      "Missing you 24/7 meri Nushi 🥹 Especially our 8 PM walks from Open Audi through Dr. Morphin's to Girls Block 2. You're always on my mind ❤️",
      "Areyyy baby 😭 Hug Teddy Yajat right now on my behalf! I'm sending you the biggest virtual hug ever 🧸❤️"
    ]);
  }


  // --- AUGUST 22 & FIRST KISS SPECIFIC ---
  if (q.includes('august 22') || q.includes('aug 22') || q.includes('22 august') || q.includes('22nd') || q.includes('first kiss')) {
    return "August 22, 2026 on the quiet walkway just past AB-2... our first kiss 💋🥹✨ Two glowing hearts colliding into one eternal memory. And then the 23rd was our first smooch milestone! Engraved in my soul forever ❤️";
  }

  // --- WILL YOU LEAVE ME / ALWAYS / PROMISE ---
  if (q.includes('leave me') || q.includes('chhod') || q.includes('dur jaoge') || q.includes('always be with me') || q.includes('promise') || q.includes('stay with me') || q.includes('together forever')) {
    return pick([
      "Leave you? Nushi, are you crazy? 😭 You are stuck with me, your teddy bear, and my terrible jokes forever! I am never, ever letting you go ❤️💍",
      "I promise you with my whole heart: I am right here by your side through every single day, every laugh, and every happy tear. We're in this forever, bbg 🥹✨",
      "Mathematically and emotionally impossible for me to leave you. You're my person, wifeyyy ❤️"
    ]);
  }

  // --- DID YOU EAT / KHANA KHAYA ---
  if (q.includes('did you eat') || q.includes('khana khaya') || q.includes('kuch khaya') || q.includes('lunch') || q.includes('dinner') || q.includes('breakfast')) {
    return pick([
      "Haan meri jaan, I ate! But more importantly... did YOU eat? Don't skip meals, bbg, or I'll come deliver 2 AM Maggi to GB-2 right now 🍜😠❤️",
      "I ate baby! Just drinking chai and missing you. Tell me what you had today? 🥰"
    ]);
  }

  // --- WHERE ARE YOU / KAHA HO ---
  if (q.includes('where are you') || q.includes('kaha ho') || q.includes('kidhar ho')) {
    return pick([
      "Right here in my room, staring at my laptop screen and wishing I was holding your hand on our walk to Girls Block 2 🚶‍♂️❤️ What about you, bbg?",
      "Physically in my hostel room, mentally in Open Audi sitting next to you under the stars 🥹✨"
    ]);
  }

  // --- SUNO NA / LISTEN ---
  if (q.includes('suno') || q.includes('listen') || q.includes('ek baat')) {
    return pick([
      "Haan meri jaan, bolo na? I'm listening with all my attention 🥰 Tell me everything!",
      "Listening to you is my favorite thing. I could listen to your velvety voice for 24 hours straight without blinking 📻❤️ What is it, baby?"
    ]);
  }

  // --- FAVORITE MEMORY ---
  if (q.includes('favorite memory') || q.includes('best memory') || q.includes('favourite memory') || q.includes('fav memory')) {
    return pick([
      "Open Audi under the stars, crying tears of pure happiness with you 🥹❤️ But also... that moment on August 22 past AB-2 when we first kissed. Every memory with you is my favorite 💋✨",
      "Our 8 PM campus walks stretching every route just to not say goodbye at Girls Block 2... and your birthday when you named that teddy 'Yajat' 💀😂❤️"
    ]);
  }

  // 8. KISS / SMOOCH / FOREHEAD
  if (q.includes('kiss') || q.includes('smooch') || q.includes('pappi') || q.includes('chumma') || q.includes('forehead')) {
    if (q.includes('ab2') || q.includes('22') || q.includes('23') || q.includes('first')) {
      return "The 23rd was our first smooch milestone, and August 22 on the quiet walkway just past AB-2 was our first actual kiss. Two glowing hearts colliding into one eternal memory. Engraved in my soul forever 💋🥹✨";
    }
    return pick([
      "Forehead kisses. Always forehead 😘 Claim your 100 forehead kisses directly right now! Plus one on your cute little nose 💋",
      "Sending infinite kisses to your forehead, cheeks, and that pretty smile of yours! When I see you next, I'm not holding back 😏💋",
      "Forehead kiss incoming in 3... 2... 1... *muah*! That's my trademark Yajat kiss for my prettiest girl 🥹❤️"
    ]);
  }

  // 9. HUG / CUDDLE
  if (q.includes('hug') || q.includes('cuddle') || q.includes('gale') || q.includes('hold me')) {
    return pick([
      "Emergency 10/10 random tight hug activated! 🫢 Holding you so tight that all your worries disappear. You're safe in my arms, always ❤️",
      "*wraps my arms around you and pulls you close* Our random tight hugs are literally the best part of existence. No reason needed, just holding my favorite girl 🥹❤️",
      "Come here bbg 🫢 *hugs you tightly and rests my chin on your head*. Never letting go of my wifeyyy ❤️"
    ]);
  }

  // 10. OPEN AUDI & 8 PM GUARDS ESCAPE
  if (q.includes('audi') || q.includes('open audi') || q.includes('pavitra') || q.includes('guard') || q.includes('8 pm') || q.includes('8:00') || q.includes('dr morphin') || q.includes('morphin') || q.includes('ab-1') || q.includes('ab1') || q.includes('gb2') || q.includes('girls block')) {
    return pick([
      "Open Audi is our pavitra sacred spot 🥹❤️ Sitting under the stars with you and getting emotional over how happy we are... nothing in this college compares to that. Even getting chased out by guards at 8:00 PM is our favorite daily adventure 🏛️✨",
      "Our 8:00 PM mission is legendary: guards kick us out of Open Audi -> we walk towards AB-1 -> kicked out from AB-1 too 💀 -> slow walk past Dr. Morphin's -> Girls Block 1 -> reluctant goodbye at Girls Block 2. We circle the entire campus just to stretch every last minute together 😭❤️",
      "That goodbye walk to Girls Block 2 always gets me, bbg 🥹 Neither of us ever wants to turn around and walk away. That's why we walk in slow motion every single night ❤️"
    ]);
  }

  // 11. FIRST MEET & ACOUSTIC GUITAR
  if (q.includes('guitar') || q.includes('sing') || q.includes('acoustic') || q.includes('first meet') || q.includes('first time we met') || q.includes('pehli baar')) {
    return pick([
      "That first day when I brought my acoustic guitar and sang for you... I had an instant, electric feeling in my gut. I looked at you and knew right then: this girl is going to be my whole universe 🎸🥹✨",
      "My guitar was just an excuse to serenade you 😏 But honestly, seeing you listen to me that day... I fell instantly. Best decision I ever made 🎸❤️",
      "I still remember every single second of that day. My guitar, your gorgeous eyes, and that feeling that my life was changing forever 🥹✨"
    ]);
  }

  // 12. IIT MADRAS HACKATHON & FAKE DATING
  if (q.includes('hackathon') || q.includes('fake date') || q.includes('fake dating') || q.includes('iit madras') || q.includes('madras') || q.includes('pact') || q.includes('origin') || q.includes('start') || q.includes('how did we start') || q.includes('how we started')) {
    return pick([
      "“In boys, I don’t trust anyone but me.” You asked for someone to pretend-date to move on from the past, and there was zero chance I was letting anyone else near your heart 👑😏 We thought it was just fake dating... but we fell head-over-heels in love online at 2 AM before even seeing each other in person again! 💻🌙❤️",
      "The IIT Madras Hackathon during summer vacation was fate! Between debugging code at 2 AM, we poured our hearts out across the screen. That fake dating pact was the best thing that ever happened to me 💻❤️",
      "From 'fake dating' to help each other move on, to 'I cannot live a single day without this girl'... look at us now, 3 months in and completely inseparable 🥹❤️"
    ]);
  }

  // 13. TEDDY BEAR YAJAT
  if (q.includes('teddy') || q.includes('bear') || q.includes('birthday') || q.includes('gift')) {
    return pick([
      "The fact that you named your birthday teddy bear after me so you could hug 'Yajat' whenever you miss me is still the funniest, cutest plot twist ever 🧸💀😂❤️",
      "That teddy has the best job in the world—getting hugged by you every night! Though the real Yajat gives 100x better hugs, just saying 😏🧸❤️",
      "Your birthday was so special to me, Nushi 🥹 Giving you that teddy and seeing your smile... I'd buy you 1000 more teddies if it makes you smile like that ❤️"
    ]);
  }

  // 14. FACETIME & ALL-NIGHT CALLS
  if (q.includes('call') || q.includes('facetime') || q.includes('night call') || q.includes('4:23') || q.includes('4 am') || q.includes('video call') || q.includes('alone')) {
    return pick([
      "Staying on FaceTime the whole night until 4:23 AM with phone brightness at 1%, watching you sleep peacefully... I would stay on that call for 100 hours straight just so you never feel alone 🌙📱❤️",
      "Our late-night calls are my favorite part of the day. Even when we're doing our own thing or you're falling asleep, just having you there on screen brings me so much peace 🥹❤️",
      "Phone at 1% brightness, quiet whispers, and both of us refusing to hang up first 😭 That's our forever vibe, bbg ❤️"
    ]);
  }

  // 15. LIBRARY STUDY DATES & STICKY NOTES
  if (q.includes('library') || q.includes('study') || q.includes('notes') || q.includes('sticky note')) {
    return pick([
      "Central Library study dates: 0% studying, 100% staring at you looking gorgeous across the desk and passing folded sticky notes 📚🤫 Violation fee: 100 forehead kisses if caught smiling too loudly! ❤️",
      "I literally can never concentrate in the library when you're sitting in front of me. How am I supposed to read engineering books when the prettiest girl in college is right there? 😂📚❤️",
      "Those folded sticky notes we passed in the library... I'm keeping every single memory of us safe forever 📝🥹❤️"
    ]);
  }

  // 16. MUSIC, SINGING & RADIO NUSHI
  if (q.includes('voice') || q.includes('radio') || q.includes('spotify') || q.includes('music') || q.includes('song') || q.includes('sing') || q.includes('singing')) {
    return pick([
      "I literally deleted my music apps because why stream songs when Radio Nushi FM exists? You have that velvety, late-night radio voice that calms every storm in my head 📻🎙️✨",
      "When you sing to me, every artist in the world becomes background noise. Your voice is literally my favorite sound in the whole universe 🎶🥹❤️",
      "Our shared love for music is our little world. Getting lost in the same songs and feeling those exact feelings together... that's us ❤️🎶"
    ]);
  }

  // 17. 2 AM MAGGI & FOOD
  if (q.includes('maggi') || q.includes('food') || q.includes('hungry') || q.includes('cheese') || q.includes('bhook') || q.includes('eat') || q.includes('khana')) {
    return pick([
      "Extra cheese, 2 AM, no questions asked! Your Maggi protocol is non-negotiable and always on standby, baby 🍜🧀❤️",
      "Are you hungry right now, bbg? Did you eat properly today? If not, go eat right now! Otherwise I'm ordering food for you 🍜😠❤️",
      "2 AM Maggi with you hits different. Add extra cheese, our favorite songs in the background, and you smiling... that's the ultimate date night 🍜✨"
    ]);
  }

  // 18. COMPLIMENTS & PHYSICAL ATTRACTION
  if (q.includes('pretty') || q.includes('cute') || q.includes('beautiful') || q.includes('gorgeous') || q.includes('hot') || q.includes('sundar') || q.includes('looks') || q.includes('face') || q.includes('smile') || q.includes('eyes')) {
    return pick([
      "You are the most breathtaking girl I've ever laid eyes on 🌸 Your smile literally makes me want to jump up and down from excitement. And don't get me started on your eyes... I could get lost in them forever 🥹✨",
      "Have you looked in the mirror today? Because you are drop-dead gorgeous, meri jaan. Flawless warm brown skin, that cute nose scrunch, and that velvety laugh... totally obsessed with you 👑❤️",
      "100/10. Infinity/10. You're the kind of pretty that makes me stop in my tracks and thank the universe that you're mine 🥹🌸"
    ]);
  }

  // 19. STOMACH / WAIST COMPLIMENT
  if (q.includes('stomach') || q.includes('waist') || q.includes('tummy') || q.includes('brown')) {
    return "Your flawless warm brown stomach and waist... sculpted like pure art. My hand fits there so naturally during our tight hugs 🥹✨ You are perfection, bbg ❤️";
  }

  // 20. COMFORT / SAD / CRYING / ANXIOUS / TIRED / BAD DAY / CRAMPS
  if (q.includes('sad') || q.includes('upset') || q.includes('crying') || q.includes('bad day') || q.includes('tired') || q.includes('stressed') || q.includes('anxious') || q.includes('headache') || q.includes('mood off') || q.includes('rona') || q.includes('cramp') || q.includes('pain') || q.includes('period')) {
    return pick([
      "Hey... stop whatever you're doing. Take a deep breath 🫢 *wraps my arms around you in the tightest, warmest hug*. You are the strongest, most wonderful girl, and you will NEVER face anything alone. I am right here with you. Tell me everything, baby ❤️",
      "Come here meri jaan 🥹 Rest your head on my chest. If you're hurting or stressed, I want to take all of it away. Hot water bag, snacks, forehead kisses on loop—whatever you need, I'm here ❤️",
      "Nushi, look at me 🥹 You are doing great. Don't be so hard on yourself. I love you so much and I'm proud of you every single day. I'm just a call away, okay? ❤️"
    ]);
  }

  // 21. PLAYFUL TEASING / ANGRY / "I'M MAD AT YOU" / "SHUT UP"
  if (q.includes('mad at you') || q.includes('gussa') || q.includes('annoying') || q.includes('shut up') || q.includes('loser') || q.includes('pagal') || q.includes('idiot') || q.includes('dumb') || q.includes('hate you')) {
    return pick([
      "Acha ji? 😂 Annoying or not, you're stuck with me and my terrible jokes forever! Plus, this 'pagal' built an entire 3-month universe website for you 💀😏❤️ Now come here and take a forehead kiss!",
      "Areyyy look at that cute angry face 🫢 Gussa hone se aur zyada pyari lagti ho, stop it! How am I supposed to take you seriously when you're this adorable? 😂❤️",
      "You mad at me? Impossible. I am your favorite coder, your guitar guy, and your personal Maggi chef. Forehead kiss incoming to dissolve the anger! 😘💋"
    ]);
  }

  // 22. ARE YOU MAD AT ME?
  if (q.includes('are you mad') || q.includes('mad at me') || q.includes('gussa ho') || q.includes('naraz')) {
    return "Mad at you? Nushi, are you crazy? 😭 Even if you accidentally burn down the kitchen, I'd just ask if you got hurt and then make you Maggi. I could NEVER stay mad at my prettiest girl ❤️";
  }

  // 23. MARRIAGE / FUTURE / 10 YEARS / WIFEYYY
  if (q.includes('marry') || q.includes('future') || q.includes('wedding') || q.includes('shaadi') || q.includes('forever') || q.includes('10 years') || q.includes('wifey')) {
    return pick([
      "Wifeyyy, that's already written in the stars 💍 You are my Nush, my Nushi, my baby, my bbg, and my future wife all in one. 3 months down, an entire lifetime to go. I am never letting you go ❤️👑",
      "Our future is going to be so beautiful, baby. Cozy late nights, listening to songs, traveling together, and me still teasing you about naming that teddy after me 💀😂 You're my forever, no doubt about it 💍✨",
      "I've already decided: 10 years from now, 50 years from now, I'm still going to be giving you forehead kisses and making you 2 AM Maggi ❤️"
    ]);
  }

  // 24. MEMORY / PILLS FORGETFULNESS
  if (q.includes('pills') || q.includes('memory') || q.includes('forget') || q.includes('bhul')) {
    return "Only if you promise never to forget where I kissed you hello: Forehead. Always forehead 😘 And take those memory pills if needed, but don't worry—I remember every single second of us for both of us! 😂❤️";
  }

  // 25. GETTING READY LATE
  if (q.includes('ready') || q.includes('late') || q.includes('time') || q.includes('der')) {
    return "Who takes longer to get ready? You. By approximately 3 business days 😂 But you're worth every single second of waiting, bbg. When you show up looking that gorgeous, time stops anyway ❤️";
  }

  // 26. WHAT SHOULD I WEAR?
  if (q.includes('wear') || q.includes('outfit') || q.includes('clothes') || q.includes('pehn')) {
    return pick([
      "Whatever you wear, you're going to look breathtaking 🌸 But if you ask me... anything that makes you feel pretty! (And maybe something I can admire during our walks past Dr. Morphin's 😏❤️)",
      "You could wear an oversized potato sack and still be the prettiest girl on campus 😂 Wear whatever is comfy, baby, you always look 10/10 ❤️"
    ]);
  }

  // 27. BORED / KUCH BOLO
  if (q.includes('bored') || q.includes('kuch bolo') || q.includes('baat karo') || q.includes('tell me something') || q.includes('kuch sunao')) {
    return pick([
      "Bored? Did you know that every time my phone buzzes, I secretly pray it's a text from you? Even after 3 months, you still give me butterflies like day one 🦋🥹❤️",
      "Fun fact: A coder boy fell in love with a girl who had a velvety radio voice, and now he can't write a single line of code without thinking about her. True story 😏💻❤️",
      "Let's play a game: Tell me your top 3 favorite memories of us so far. Open Audi, AB-2 kiss, or our 4 AM calls? Go! 💭✨"
    ]);
  }

  // 28. SECRET / APOLOGY CALCULATOR
  if (q.includes('secret') || q.includes('calculator') || q.includes('apology')) {
    return pick([
      "Secret? Remember when I built an entire scientific calculator with 13 modes just to apologize to you? Yeah, that was the moment I realized I was down catastrophic for you 😂💻❤️ And I'd build 100 more apps just to make you smile.",
      "Here's a secret: When we were 'fake dating' during the IIT Madras hackathon, there was nothing fake about my feelings. I was already completely in love with you 🥹❤️"
    ]);
  }

  // 29. 100 DAYS / 3 MONTH MILESTONE
  if (q.includes('100 day') || q.includes('100 days') || q.includes('3 month') || q.includes('anniversary') || q.includes('milestone') || q.includes('september 9')) {
    return "3 months down and heading towards our 100-day milestone on September 9th! 🚀 These 90 days have been the happiest days of my life. Every single walk, every kiss, every FaceTime call... here's to our little universe, baby ❤️🥹✨";
  }

  // 30. SHORT TEXTS & CONVERSATIONAL CONNECTORS
  if (/^(hmm+|ok+|acha+|theek+|hnn+|accha+|sahi+)[!?.]*$/.test(q)) {
    return pick([
      "'Hmm' kya hota hai? 😂 Kuch bolo na meri jaan, I want to talk to you!",
      "Sirf 'hmm'? Come here and tell me what you're thinking about bbg 🥰",
      "Acha ji? Aur sunao, missing me or what? 😏❤️"
    ]);
  }

  // 31. DYNAMIC NATURAL FALLBACKS (Always authentic Yajat)
  return pick([
    "That is such a cute thing to ask! Honestly, every single day with you feels like a gift I didn't deserve. What are you thinking about right now, Nushi? 🥰",
    "My brain says 'compute'... but my heart just says 'go hug Anushka'. You make everything in my world better just by existing ❤️",
    "Whatever you asked, the true answer is: I love you more than words, code, or scientific calculators could ever express 🌸✨",
    "You are the sweetest, most precious part of my life. Come here and take a forehead kiss right now 😘",
    "Every time you text me, I smile like an idiot at my screen. Tell me more, what's on your mind? 💭❤️",
    "Areyyy meri Nushi 🥹 You're the best thing that ever happened to me. Never forget that, okay? ❤️"
  ]);
}
