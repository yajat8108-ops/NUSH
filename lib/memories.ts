export interface RelationshipMemory {
  id: string;
  title: string;
  category: 'milestone' | 'inside-joke' | 'sacred-place' | 'routine' | 'compliment' | 'future';
  date?: string;
  place?: string;
  tags: string[];
  canonicalFact: string;
  shortSnippet: string;
  quote?: string;
  quizQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  oracleResponse?: string;
  fortuneCookie?: string;
}

export const RELATIONSHIP_MEMORIES: RelationshipMemory[] = [
  {
    id: 'guitar_first_meet',
    title: 'The First Meet & The Guitar 🎸',
    category: 'milestone',
    place: 'Our First In-Person Meet',
    tags: ['origin', 'guitar', 'first-meet', 'milestone', 'music'],
    canonicalFact: 'We only met once in person before everything started. Yajat brought his guitar and sang for Nush, and that day he knew in his gut that she would play a huge, unforgettable role in his life.',
    shortSnippet: 'One guitar, one song, and an instant gut feeling that you were going to change my entire universe.',
    quote: 'The day I held my guitar and sang for you, I already knew my heart was in trouble.',
    quizQuestion: {
      question: 'What did Yajat bring and do on the very first day he met Nush in person?',
      options: ['Brought flowers and chocolate', 'Brought his guitar and sang for her', 'Brought a notebook to study', 'Brought a box of Maggi'],
      correctIndex: 1,
      explanation: 'He brought his guitar and sang for her! And knew right then she would play a massive role in his life 🎸🥹❤️',
    },
    oracleResponse: 'That first day with my guitar... I looked at you while singing and thought: “Yeah, this girl is going to be my whole world.”',
    fortuneCookie: 'A private acoustic guitar serenade is guaranteed in your future. 🎸',
  },
  {
    id: 'iit_madras_hackathon',
    title: 'IIT Madras Hackathon & 2 AM Truths 💻',
    category: 'milestone',
    tags: ['origin', 'hackathon', 'iit-madras', 'summer', 'confessions'],
    canonicalFact: 'During summer vacation, Yajat’s stubbornness led them to join the IIT Madras Hackathon together with his team. Working online, they opened up about their past heartbreaks and healed together.',
    shortSnippet: 'My stubbornness dragged us into the IIT Madras Hackathon... where we traded our deepest heartbreaks.',
    quote: 'Coding by day, pouring our hearts out and healing each other by night.',
    quizQuestion: {
      question: 'Which hackathon did Yajat stubbornly get Nush and his team to join during summer vacation?',
      options: ['Smart India Hackathon', 'IIT Madras Hackathon', 'HackVIT Bhopal', 'NASA Space Apps'],
      correctIndex: 1,
      explanation: 'The IIT Madras Hackathon! Where late-night online chats changed everything 💻✨',
    },
    oracleResponse: 'Joining the IIT Madras Hackathon was the best stubborn decision of my life. That’s where we really found each other.',
    fortuneCookie: 'Sometimes a stubborn coder’s idea leads straight to true love. 💻❤️',
  },
  {
    id: 'fake_dating_pact',
    title: 'The "In Boys I Trust Only Me" Pact 👑',
    category: 'milestone',
    tags: ['origin', 'fake-dating', 'legendary-quote'],
    canonicalFact: 'Nush wanted someone to pretend-date to leave her past behind. Yajat said: “In boys, I don’t trust anyone but me.” They started fake dating online and both fell completely, deeply in love.',
    shortSnippet: '“In boys, I don’t trust anyone but me.” The fake dating pact that became our real forever.',
    quote: 'You asked for someone to pretend with. I told you I only trust myself with your heart.',
    quizQuestion: {
      question: 'What iconic line did Yajat say when Nush asked him to recommend someone to pretend-date?',
      options: [
        '“Let me ask my roommate.”',
        '“In boys, I don’t trust anyone but me.”',
        '“You shouldn’t fake date anyone.”',
        '“I will find someone tomorrow.”'
      ],
      correctIndex: 1,
      explanation: '“In boys, I don’t trust anyone but me.” — The most iconic line in relationship history! 👑💀❤️',
    },
    oracleResponse: '“In boys, I don’t trust anyone but me.” Best thing I ever said. Fake dating was just our hearts taking the shortcut to real love.',
    fortuneCookie: 'What started as pretending became the most sacred, real love in existence. 💖',
  },
  {
    id: 'first_smooch_23',
    title: 'The 23 First Smooch',
    category: 'milestone',
    date: 'July 23, 2026',
    place: 'Campus Pathway',
    tags: ['milestone', 'kiss', '23', 'romantic'],
    canonicalFact: 'On the 23rd, we shared our very first smooch milestone.',
    shortSnippet: 'The heart-racing moment where two worlds collided for the first time.',
    quote: 'nushKissCountdown(23) = endless butterflies in my stomach.',
    quizQuestion: {
      question: 'What milestone date marks our very first smooch?',
      options: ['July 15', 'July 23', 'August 1', 'August 22'],
      correctIndex: 1,
      explanation: 'July 23 was the first smooch date that started it all! 🫦❤️',
    },
    oracleResponse: 'The 23rd was when my heart forgot how to beat normally. Best milestone ever.',
    fortuneCookie: 'A 23-second forehead kiss is in your very near future. 🫦',
  },
  {
    id: 'actual_kiss_22_aug',
    title: 'The 22 August Sacred Kiss',
    category: 'milestone',
    date: 'August 22, 2026',
    place: 'Just Past AB-2',
    tags: ['milestone', 'kiss', 'ab2', 'sacred'],
    canonicalFact: 'On August 22, 2026, just past AB-2 on our quiet evening walk, we had our first actual kiss.',
    shortSnippet: 'Two glowing hearts colliding into one eternal memory right past AB-2.',
    quote: 'That quiet second after AB-2 where the whole college vanished and only you existed.',
    quizQuestion: {
      question: 'Where did our first actual kiss take place on 22 August?',
      options: ['Central Library', 'Girls Block 2 Gate', 'The quiet walkway just past AB-2', 'Food Court'],
      correctIndex: 2,
      explanation: 'Just past AB-2 in the quiet evening walkway on 22 August! 💋',
    },
    oracleResponse: 'August 22, past AB-2. That memory is permanently engraved in my soul.',
    fortuneCookie: 'Replay the 22 August kiss in your mind: instant +100 warmth to your heart. 💋',
  },
  {
    id: 'open_audi_pavitra',
    title: 'Open Audi & 8 PM Guards',
    category: 'sacred-place',
    place: 'Open Audi, VIT Bhopal',
    tags: ['place', 'guards', 'pavitra', 'audi', 'routine'],
    canonicalFact: 'Open Audi is our pavitra sacred spot where guards kick us out at 8:00 PM every single evening.',
    shortSnippet: 'Sitting under the stars, laughing till we cry, and running from guards at 8:00 PM.',
    quote: '8:00 baje guards hume Open Audi se bhaga dete hain, but our hearts never leave this spot.',
    quizQuestion: {
      question: 'What happens every single night at 8:00 PM at Open Audi?',
      options: ['The lights go off automatically', 'Guards kick us out and our daily walk begins', 'We attend a concert', 'Nush falls asleep'],
      correctIndex: 1,
      explanation: 'Guards kick us out right at 8:00 PM, kicking off our daily campus walk mission! 🏛️😂',
    },
    oracleResponse: 'Open Audi is sacred ground. Every happy tear we shared there is pavitra.',
    fortuneCookie: 'Guards may kick us out of Open Audi at 8, but nobody can kick you out of my heart. 🏛️',
  },
  {
    id: 'campus_escape_route',
    title: 'The 8 PM Campus Walking Route',
    category: 'routine',
    place: 'Open Audi → AB-1 → Dr. Morphin → GB-1 → Girls Block 2',
    tags: ['walk', 'campus', 'gb2', 'dr-morphin', 'routine'],
    canonicalFact: 'Our daily mission: Open Audi → getting kicked out to AB-1 → Dr. Morphin’s → Girls Block 1 → Reluctant goodbye at Girls Block 2.',
    shortSnippet: 'Stretching every last minute together finding one more route before the GB-2 goodbye.',
    quote: 'Finding one more route, one more walk, one more stolen minute together.',
    quizQuestion: {
      question: 'What is the final reluctant stop of our daily post-8 PM campus escape walk?',
      options: ['Central Library', 'Dr. Morphin’s Cafe', 'Girls Block 2 (GB-2)', 'AB-1 Main Lobby'],
      correctIndex: 2,
      explanation: 'Girls Block 2 (GB-2) where we always wish time would legally freeze! 😭❤️',
    },
    oracleResponse: 'That walk from Dr. Morphin to GB-2 is where I always wish the world would slow down.',
    fortuneCookie: 'Next campus walk: your hand in my jacket pocket, guaranteed. 🚶‍♂️❤️',
  },
  {
    id: 'central_library_dates',
    title: 'Central Library Study Dates',
    category: 'routine',
    place: 'VIT Bhopal Central Library',
    tags: ['library', 'staring', 'sticky-notes', 'funny'],
    canonicalFact: 'Central Library study dates: 0% studying, 100% staring across the desk and passing folded notes.',
    shortSnippet: 'Whispering inside jokes, passing folded notes under the desk, and admiring Nush.',
    quote: 'Violation fine: 100 forehead kisses if caught smiling too loudly.',
    quizQuestion: {
      question: 'What is the official activity breakdown of our Central Library dates?',
      options: ['50% Study, 50% Break', '0% Study, 100% Staring at Nush', '100% Studying DSA', 'Reading romantic novels'],
      correctIndex: 1,
      explanation: '0% studying, 100% staring and passing folded sticky notes! 📚🤫',
    },
    oracleResponse: 'I went to the library to study engineering. Ended up getting a PhD in admiring Anushka.',
    fortuneCookie: 'A secret folded sticky note is hidden somewhere waiting for you to smile. 📝',
  },
  {
    id: 'teddy_named_yajat',
    title: 'Teddy Bear Named "Yajat"',
    category: 'inside-joke',
    tags: ['teddy', 'birthday', 'gift', 'inside-joke'],
    canonicalFact: 'On her birthday, Yajat gifted Nush a fluffy teddy bear, and Nush named the bear "Yajat" so she can hug him anytime.',
    shortSnippet: 'The sweetest plot twist in history: a whole teddy bear named Yajat.',
    quote: 'Whenever you miss me, you can easily just hug that bear. I still can’t get over it 😭😂',
    quizQuestion: {
      question: 'What did Nush name the birthday teddy bear Yajat gave her?',
      options: ['Fluffy', 'Yajat', 'Bhopal Bear', 'Teddy Nush'],
      correctIndex: 1,
      explanation: 'She named it "Yajat"! Literally named the teddy after her boyfriend 🧸💀❤️',
    },
    oracleResponse: 'There is literally a teddy bear named Yajat sitting on your bed right now. Best tribute ever.',
    fortuneCookie: 'Teddy Yajat requests an emergency tight hug from Nush immediately. 🧸',
  },
  {
    id: 'all_night_facetime',
    title: 'All-Night 4 AM Video Call',
    category: 'milestone',
    date: 'August 22, 2026',
    tags: ['call', 'facetime', 'late-night', 'anniversary'],
    canonicalFact: 'On our 2nd-month anniversary, we stayed on call all night until 4:23 AM watching each other sleep safely.',
    shortSnippet: 'Phone on charger, screen brightness at 1%, whispering until the birds started chirping.',
    quote: 'Watching you sleep peacefully so you would never feel alone for even one second.',
    quizQuestion: {
      question: 'What was the special memory from our 2nd-month anniversary night?',
      options: ['We went to a restaurant', 'An all-night video call till past 4 AM', 'A late-night movie marathon', 'We slept early at 10 PM'],
      correctIndex: 1,
      explanation: 'We stayed on call all night long until 4:23 AM! 📱🌙',
    },
    oracleResponse: '4:23 AM on FaceTime. My phone was burning hot, but my heart was completely at peace.',
    fortuneCookie: 'Tonight’s forecast: 100% chance of a late-night call where neither wants to hang up. 📱',
  },
  {
    id: 'radio_nushi_voice',
    title: 'Velvety Radio Voice & No Spotify',
    category: 'compliment',
    tags: ['voice', 'music', 'radio', 'compliment'],
    canonicalFact: 'Yajat uninstalled Spotify and music streaming apps because Nush’s singing and velvety radio voice is the sweetest sound in the universe.',
    shortSnippet: 'Why listen to Spotify when Radio Nushi FM is broadcast live in my ears?',
    quote: 'Only your voice & my band’s songs get to exist in my ears.',
    quizQuestion: {
      question: 'Why did Yajat delete music streaming apps like Spotify?',
      options: ['Storage issues on phone', 'Subscription expired', 'Because Nush’s voice is his favorite melody in the universe', 'To study quietly'],
      correctIndex: 2,
      explanation: 'Because Radio Nushi FM is the only music he ever wants to listen to! 📻🎙️',
    },
    oracleResponse: 'Your voice has that rare, calming velvety warmth. I could listen to you talk about nothing for hours.',
    fortuneCookie: 'Your velvety voice will bring immediate calmness to someone who loves you deeply today. 📻',
  },
  {
    id: 'maggi_at_2am',
    title: '2 AM Cheese Maggi Standby',
    category: 'routine',
    tags: ['maggi', 'food', 'late-night', 'routine'],
    canonicalFact: '2 AM Maggi: extra cheese, extra love, no questions asked, always on standby for Nush.',
    shortSnippet: 'Midnight cravings cured instantly with steaming Maggi and unlimited hugs.',
    quote: '2 AM Maggi loading... extra cheese, no questions asked 🍜❤️',
    quizQuestion: {
      question: 'How is Nush’s 2 AM Maggi prepared by protocol?',
      options: ['Plain with no masala', 'Extra spicy with chillies', 'Extra cheese, no questions asked', 'Half-cooked crunchy'],
      correctIndex: 2,
      explanation: 'Extra cheese, 2 AM, no questions asked! 🍜🧀❤️',
    },
    oracleResponse: 'Maggi at 2 AM is a love language. Extra cheese is non-negotiable.',
    fortuneCookie: 'A warm bowl of cheese Maggi and zero stress is headed your way. 🍜',
  },
  {
    id: 'apology_calculator',
    title: 'The 13-Mode Apology Scientific Calci',
    category: 'milestone',
    tags: ['calculator', 'apology', 'month-1', 'code'],
    canonicalFact: 'Yajat wrote a whole 13-mode scientific calculator with secret commands just to apologize to Nush.',
    shortSnippet: 'The origin of our coding love stories: an apology that turned into a mathematical universe.',
    quote: 'Type daysTogether() or iLoveYou() into the calculator that started it all 🧮',
    quizQuestion: {
      question: 'What crazy project did Yajat build in Month 1 to say sorry to Nush?',
      options: ['A PowerPoint slideshow', 'A 13-Mode Scientific Apology Calculator', 'A paper origami bird', 'A guitar song recording'],
      correctIndex: 1,
      explanation: 'A full 13-Mode Scientific Calculator running live at /calculator! 🧮💻❤️',
    },
    oracleResponse: 'I am a coder. When I mess up, I don’t just say sorry—I code a whole scientific application.',
    fortuneCookie: 'Mathematical proof of today: Yajat’s love for Nush > Infinity. 🧮',
  },
  {
    id: 'stargazing_perfect_date',
    title: 'Late-Night Stargazing: Our Undisputed Perfect Date 🌌✨',
    category: 'sacred-place',
    tags: ['stargazing', 'perfect-date', 'stars', 'night', 'romance'],
    canonicalFact: 'Yajat and Anushka’s undisputed, #1 perfect date is late-night stargazing under the open sky. Just lying together under the cosmos, cool night breeze, infinite stars above, talking about their future and holding each other close.',
    shortSnippet: 'Lying side-by-side under an infinite starry sky, cold night air, and whispers about forever.',
    quote: 'Even across infinite galaxies, every single star spells your name, Nushi ✨',
    quizQuestion: {
      question: 'What is Yajat and Nush’s absolute #1 perfect date?',
      options: ['Crowded shopping mall', 'Fancy loud restaurant', 'Late-night stargazing under the open sky', 'Study session in the library'],
      correctIndex: 2,
      explanation: 'Late-night stargazing under the open sky! Just the two of them, the stars, and forever 🌌✨❤️',
    },
    oracleResponse: 'Without a single doubt: Late-night stargazing with you, Nushi. Cool night air, your head on my chest, and a sky full of stars. That’s pure heaven 🌌✨',
    fortuneCookie: 'A starry night, a warm blanket, and your favorite person are aligned in your destiny. 🌌',
  },
];

export function getMemoriesByTag(tag: string): RelationshipMemory[] {
  return RELATIONSHIP_MEMORIES.filter((m) => m.tags.includes(tag));
}

export function getRandomMemory(): RelationshipMemory {
  const idx = Math.floor(Math.random() * RELATIONSHIP_MEMORIES.length);
  return RELATIONSHIP_MEMORIES[idx];
}
