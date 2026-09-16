'use client';

import { useState, useEffect } from 'react';

interface LiveMomentData {
  timeGreeting: string;
  weatherNote: string;
  combinedFlourish: string;
  temperature: number | null;
  timeBucket: 'late_night' | 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';
  isLive: boolean;
}

export function useLiveMoment(): LiveMomentData {
  const [moment, setMoment] = useState<LiveMomentData>(() => getFallbackMoment());

  useEffect(() => {
    const computeLocalMoment = () => {
      const now = new Date();
      const hour = now.getHours();

      let timeBucket: LiveMomentData['timeBucket'] = 'evening';
      let timeGreeting = '';
      let defaultWeather = '';

      if (hour >= 0 && hour < 5) {
        timeBucket = 'late_night';
        timeGreeting = `It's ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} late night 🌙`;
        defaultWeather = 'Prime 2 AM Maggi & all-night FaceTime call hours 🍜📱';
      } else if (hour >= 5 && hour < 9) {
        timeBucket = 'early_morning';
        timeGreeting = 'Good morning, my sweet Nushi 🌸';
        defaultWeather = 'Thinking about your sleepy smile before my day even starts ☕';
      } else if (hour >= 9 && hour < 12) {
        timeBucket = 'morning';
        timeGreeting = 'Morning on campus ✨';
        defaultWeather = 'Hoping your day is as beautiful as your velvety voice 🎙️';
      } else if (hour >= 12 && hour < 17) {
        timeBucket = 'afternoon';
        timeGreeting = 'Afternoon study hours 📚';
        defaultWeather = 'Officially 0% studying, 100% missing Anushka under the desk 📝';
      } else if (hour >= 17 && hour < 21) {
        timeBucket = 'evening';
        timeGreeting = 'Golden hour around campus 🏛️';
        defaultWeather = 'Guards about to start their 8 PM Open Audi evacuation mission 😭😂';
      } else {
        timeBucket = 'night';
        timeGreeting = 'Quiet night hours 🌙';
        defaultWeather = 'Stretching every last minute together before saying goodbye at GB-2 🚶‍♂️❤️';
      }

      return {
        timeBucket,
        timeGreeting,
        weatherNote: defaultWeather,
        combinedFlourish: `${timeGreeting} — ${defaultWeather}`,
        temperature: null,
        isLive: true,
      };
    };

    // Set initial time-based moment
    const current = computeLocalMoment();
    setMoment(current);

    // Fetch live weather from Open-Meteo (Bhopal coordinates, free & CORS enabled)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=23.2599&longitude=77.4126&current=temperature_2m,weather_code,is_day')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;

          let weatherDesc = `${temp}°C outside`;
          if (code >= 51 && code <= 67) {
            weatherDesc = `Raindrops falling (${temp}°C) — perfect excuse for an extra tight hug 🌧️🫢`;
          } else if (code >= 1 && code <= 3) {
            weatherDesc = `Partly cloudy & ${temp}°C — nice breeze for a slow campus walk 🍃`;
          } else if (code === 0) {
            weatherDesc = `Clear starry skies & ${temp}°C — ideal Open Audi stargazing weather ⭐`;
          } else {
            weatherDesc = `${temp}°C — always warm in our little world 💖`;
          }

          setMoment((prev) => ({
            ...prev,
            temperature: temp,
            weatherNote: weatherDesc,
            combinedFlourish: `${prev.timeGreeting} & ${weatherDesc}`,
          }));
        }
      })
      .catch(() => {
        // Safe fallback already active
      });
  }, []);

  return moment;
}

function getFallbackMoment(): LiveMomentData {
  return {
    timeBucket: 'evening',
    timeGreeting: 'Right now in our universe ✨',
    weatherNote: 'Every second with you is my favorite season 🌸',
    combinedFlourish: 'Right now in our universe ✨ — Every second with you is my favorite season 🌸',
    temperature: null,
    isLive: false,
  };
}
