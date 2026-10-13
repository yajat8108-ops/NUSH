export interface SorryPromise {
  id: string;
  text: string;
}

export interface SorryToken {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface SorryReplyOption {
  label: string;
  response: string;
}

export interface SorryContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  letter: string[];
  signoff: string;
  whatIDid?: string;
  understand: string[];
  promises: SorryPromise[];
  tokens: SorryToken[];
  voiceNoteSrc?: string;
  replies: {
    needTime: SorryReplyOption;
    talk: SorryReplyOption;
  };
}

export const SORRY: SorryContent = {
  eyebrow: "from the bottom of my heart",
  title: "I'm Really Sorry, Nush",
  subtitle: "No excuses, no rationalizing — just what I feel, what I understand now, and what I want to make right.",
  letter: [
    "I'm writing this because you mean the world to me, and seeing you hurt because of a thoughtless choice I made breaks my heart. You deserve to feel valued, cherished, and always prioritized.",
    "I don't want to make excuses or brush things aside. What happened was my failure in consideration and empathy, and I need you to know how deeply sorry I am.",
    "This isn't about asking you to just get over it. Your feelings are completely valid, and I want to give you all the time and space you need while proving through my actions that you can trust me."
  ],
  signoff: "Forever yours, Yajat 🤍",
  whatIDid: "I thought about and considered going on a trip to Ujjain with a female friend instead of planning it with you. Thinking about taking a trip like that without you was careless, insensitive, and completely disregarding of your place in my life. It made you feel unprioritized and second, and I take full accountability for it. I won't ever do something like that again.",
  understand: [
    "I understand that trips and special experiences belong with you, and considering going with another female friend crossed an emotional boundary.",
    "I understand that it made you feel sidelined and question whether you are my first priority.",
    "I understand that trust isn't just about big betrayals; it's about day-to-day choices, mindfulness, and who I choose to share special memories with.",
    "I understand that an apology means nothing without changed behavior, and words alone don't undo the hurt you felt."
  ],
  promises: [
    {
      id: "priority",
      text: "You will always come first — any trips, getaways, and special moments will be planned with you, never someone else."
    },
    {
      id: "boundaries",
      text: "Clear, respectful boundaries in all my friendships. No ambiguity, no thoughtless plans that disregard your feelings."
    },
    {
      id: "transparency",
      text: "Total transparency and consideration before plans ever get made, so you never feel surprised or left behind."
    },
    {
      id: "listening",
      text: "When you share how something makes you feel, I will listen with an open heart instead of becoming defensive."
    },
    {
      id: "ujjain-together",
      text: "Our trip to Ujjain will be ours and ours alone, whenever you're ready to go together."
    }
  ],
  tokens: [
    {
      id: "token-ujjain",
      icon: "🛕",
      title: "Our Ujjain Trip (Just Us Two)",
      desc: "A spiritual and beautiful trip planned entirely around you, whenever you feel ready to take it with me."
    },
    {
      id: "token-uninterrupted-talk",
      icon: "☕",
      title: "Open Heart Listening Date",
      desc: "Phone on silent, zero defense, all your thoughts and feelings heard for as long as you want."
    },
    {
      id: "token-favorite-sweet",
      icon: "🍨",
      title: "Comfort Food & Sweet Treat",
      desc: "Your comfort food and dessert of choice delivered or brought to you with no questions asked."
    },
    {
      id: "token-peace-pass",
      icon: "🫂",
      title: "Gentle Hug & No-Pressure Pass",
      desc: "A warm hug and quiet reassurance whenever you feel overwhelmed, with no rush on your emotions."
    }
  ],
  voiceNoteSrc: "", // Optional: place path e.g. "/audio/sorry-note.mp3" when ready
  replies: {
    needTime: {
      label: "I need some time",
      response: "Take all the time you need, Nush. There is zero pressure from my side. I'm right here whenever you feel ready to talk, and I'll keep quietly working on being better for you."
    },
    talk: {
      label: "Let's talk",
      response: "Thank you for being open to talking. Call or text me whenever you're ready, and I will just listen with all my heart."
    }
  }
};
