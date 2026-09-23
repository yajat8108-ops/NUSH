'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// ── Above-fold: load eagerly (user sees these immediately) ──────────
import UniverseEntrance      from '@/components/UniverseEntrance';
import UniverseProgressHUD   from '@/components/UniverseProgressHUD';
import AmbientEffects        from '@/components/AmbientEffects';
import ScrollProgress        from '@/components/ScrollProgress';
import FloatingBottomDock    from '@/components/FloatingBottomDock';
import AnniversaryHero       from '@/components/AnniversaryHero';

// ── Below-fold: lazy-load on demand — massive bundle size reduction ─
const AchievementsModal    = dynamic(() => import('@/components/AchievementsModal'),    { ssr: false });
const UniverseSecrets      = dynamic(() => import('@/components/UniverseSecrets'),      { ssr: false });
const NushSecret           = dynamic(() => import('@/components/NushSecret'),           { ssr: false });
const ThemeToggle          = dynamic(() => import('@/components/ThemeToggle'),          { ssr: false });
const CamcorderViewfinder  = dynamic(() => import('@/components/CamcorderViewfinder'),  { ssr: false });
const TimeMachineVault     = dynamic(() => import('@/components/TimeMachineVault'),     { ssr: false });
const SectionDivider       = dynamic(() => import('@/components/SectionDivider'),       { ssr: false });
const OriginStorySection   = dynamic(() => import('@/components/OriginStorySection'),   { ssr: false });
const TheKissMilestone     = dynamic(() => import('@/components/TheKissMilestone'),     { ssr: false });
const LoveArcadeHub        = dynamic(() => import('@/components/arcade/LoveArcadeHub'), { ssr: false });
const UniverseLetter       = dynamic(() => import('@/components/UniverseLetter'),       { ssr: false });
const UniverseTimeline     = dynamic(() => import('@/components/UniverseTimeline'),     { ssr: false });
const EraDiff              = dynamic(() => import('@/components/EraDiff'),              { ssr: false });
const CampusRouteMap       = dynamic(() => import('@/components/CampusRouteMap'),       { ssr: false });
const FilmstripScroller    = dynamic(() => import('@/components/FilmstripScroller'),    { ssr: false });
const PhotoAlbum           = dynamic(() => import('@/components/PhotoAlbum'),           { ssr: false });
const OurSong              = dynamic(() => import('@/components/OurSong'),              { ssr: false });
const CorkboardSection     = dynamic(() => import('@/components/CorkboardSection'),     { ssr: false });
const ReasonsSection       = dynamic(() => import('@/components/ReasonsSection'),       { ssr: false });
const TwoWayVault          = dynamic(() => import('@/components/TwoWayVault'),          { ssr: false });
const HandwrittenCanvas    = dynamic(() => import('@/components/HandwrittenCanvas'),    { ssr: false });
const RelationshipJournal  = dynamic(() => import('@/components/RelationshipJournal'),  { ssr: false });
const QuizSection          = dynamic(() => import('@/components/QuizSection'),          { ssr: false });
const CompatibilityTest    = dynamic(() => import('@/components/CompatibilityTest'),    { ssr: false });
const AskYajatConsole      = dynamic(() => import('@/components/AskYajatConsole'),      { ssr: false });
const DateSimulator        = dynamic(() => import('@/components/DateSimulator'),        { ssr: false });
const CouponsSection       = dynamic(() => import('@/components/CouponsSection'),       { ssr: false });
const VoiceMemories        = dynamic(() => import('@/components/VoiceMemories'),        { ssr: false });
const TimeCapsule          = dynamic(() => import('@/components/TimeCapsule'),          { ssr: false });
const SecretRoom           = dynamic(() => import('@/components/SecretRoom'),           { ssr: false });
const FutureSection        = dynamic(() => import('@/components/FutureSection'),        { ssr: false });
const DreamMap             = dynamic(() => import('@/components/DreamMap'),             { ssr: false });
const RelationshipDashboard= dynamic(() => import('@/components/RelationshipDashboard'),{ ssr: false });
const CertificateSection   = dynamic(() => import('@/components/CertificateSection'),   { ssr: false });
const CinematicEnding      = dynamic(() => import('@/components/CinematicEnding'),      { ssr: false });
const QrFooter             = dynamic(() => import('@/components/QrFooter'),             { ssr: false });
const LockedSection        = dynamic(() => import('@/components/LockedSection'),        { ssr: false });

import { useUniverseStore } from '@/lib/universeStore';

export default function Home() {
  const checkAndUpdateStreak = useUniverseStore((s) => s.checkAndUpdateStreak);

  React.useEffect(() => {
    checkAndUpdateStreak();
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* 1. CINEMATIC ANIMATED ENTRANCE PROLOGUE */}
      <UniverseEntrance />

      {/* 2. PERSISTENT GLOBAL HUDs & CONTROLLERS */}
      <UniverseProgressHUD />
      <AchievementsModal />
      <UniverseSecrets />
      <NushSecret />
      <AmbientEffects />
      <ScrollProgress />
      <ThemeToggle />
      <CamcorderViewfinder />
      <TimeMachineVault />
      <FloatingBottomDock />

      <main className="anniversary-body">
        {/* 3. HERO — 3D Hearts + 90-Day Dynamic Counter */}
        <AnniversaryHero />

        <SectionDivider variant="wave" />

        {/* 4. THE PROLOGUE — THE GUITAR & FAKE DATING PACT ORIGIN STORY */}
        <OriginStorySection />

        {/* 5. THE KISS TIMELINE — 23 Smooch & 22 August Actual Kiss Collision */}
        <TheKissMilestone />

        <SectionDivider variant="heartbeat" />

        {/* 5. 11-GAME MASTER LOVE ARCADE */}
        <LoveArcadeHub />

        {/* 6. 3-MONTH COMPLETE LOVE LETTER */}
        <UniverseLetter />

        <SectionDivider variant="stars" />

        {/* 7. RELATIONSHIP CONSTELLATION TIMELINE & PAST ARCHIVES */}
        <UniverseTimeline />

        {/* 8. 3 MONTHS AGO VS NOW — INTERACTIVE ERA DIFF SLIDER */}
        <EraDiff />

        <SectionDivider variant="cloud" />

        {/* 9. THE 8 PM VIT BHOPAL ESCAPE ROUTE ARCHIVE */}
        <div id="month2-archive">
          <CampusRouteMap />
        </div>

        {/* 10. GF DAY 35MM FILMSTRIP HORIZONTAL SCRUBBER */}
        <FilmstripScroller />

        {/* 10.5 OUR PHOTO ALBUM — GLOBAL CLOUD GALLERY */}
        <PhotoAlbum />

        {/* 10.8 SHARED PLAYLIST / MIXTAPE BUILDER (Phase 2 Reveal) */}
        <LockedSection
          minProgress={15}
          sectionName="Our Shared Mixtape"
          tip="Read our love letter, explore our story, or scratch love reasons to unlock!"
          unlockDay={1}
        >
          <OurSong />
        </LockedSection>

        <SectionDivider variant="wave" flip />

        {/* 11. DRAGGABLE POLAROID CORKBOARD */}
        <CorkboardSection />

        {/* 12. 60 REASONS SCRATCH GRID */}
        <ReasonsSection />

        {/* 13. NUSH'S RECIPROCAL TWO-WAY VAULT & MOOD PAD */}
        <TwoWayVault />

        {/* 13.5 HANDWRITTEN LETTER CANVAS (Phase 3 Reveal) */}
        <LockedSection
          minProgress={25}
          sectionName="Handwritten Parchment Pad"
          tip="Explore our Polaroid corkboard, test your memory, or play in the Love Arcade!"
          unlockDay={2}
        >
          <HandwrittenCanvas />
        </LockedSection>

        <SectionDivider variant="aurora" />

        {/* 13.8 RELATIONSHIP JOURNAL & DIARY (Phase 3 Reveal) */}
        <LockedSection
          minProgress={35}
          sectionName="The Relationship Journal"
          tip="Explore our campus escape route or find a hidden easter egg to unlock our diary!"
          unlockDay={3}
        >
          <RelationshipJournal />
        </LockedSection>

        {/* 14. COUPLE TRIVIA SHOWDOWN */}
        <QuizSection />

        {/* 14.5 COMPATIBILITY TEST (Phase 4 Reveal) */}
        <LockedSection
          minProgress={45}
          sectionName="The Couple Compatibility Test"
          tip="Play Couple Trivia or ask Yajat a question to unlock our 15-question test!"
          unlockDay={4}
        >
          <CompatibilityTest />
        </LockedSection>

        <SectionDivider variant="heartbeat" />

        {/* 15. ASK YAJAT AI ORACLE */}
        <AskYajatConsole />

        {/* 15.5 DATE NIGHT SIMULATOR (Day 5 Reveal) */}
        <LockedSection
          minProgress={50}
          sectionName="Date Night Simulator"
          tip="Chat with Ask Yajat or complete Couple Trivia to plan our dream dates!"
          unlockDay={5}
        >
          <DateSimulator />
        </LockedSection>

        {/* 16. REDEEMABLE LOVE COUPONS (Day 6 Reveal) */}
        <LockedSection
          minProgress={56}
          sectionName="Redeemable Love Tokens"
          tip="Earn Love Points across our universe to unseal your coupon booklet!"
          unlockDay={6}
        >
          <CouponsSection />
        </LockedSection>

        <SectionDivider variant="stars" />

        {/* 17. RADIO NUSHI AUDIO VAULT & VOICE MEMORIES (Day 7 Reveal) */}
        <LockedSection
          minProgress={62}
          sectionName="Radio Nushi Voice Studio"
          tip="Unlock badges or play arcade games to open our audio voice vault!"
          unlockDay={7}
        >
          <VoiceMemories />
        </LockedSection>

        {/* 17.5 TIME CAPSULE LETTERS (Day 8 Reveal) */}
        <LockedSection
          minProgress={68}
          sectionName="Milestone Time Capsules"
          tip="Find 3 secret easter eggs or unlock badges to unseal our wax milestone letters!"
          unlockDay={8}
        >
          <TimeCapsule />
        </LockedSection>

        {/* 18. SECRET ROOM (UNLOCKED AFTER 5+ SECRETS) */}
        <SecretRoom />

        <SectionDivider variant="cloud" flip />

        {/* 19. 14-DAY COUNTDOWN DRIP & ROAD TO SEP 22ND */}
        <FutureSection />

        {/* 19.5 THE DREAM DESTINATIONS WORLD MAP (Day 9 Reveal) */}
        <LockedSection
          minProgress={76}
          sectionName="Dream Bucket List Map"
          tip="Earn Love Points or unlock achievements to open our world travel map!"
          unlockDay={9}
        >
          <DreamMap />
        </LockedSection>

        <SectionDivider variant="aurora" />

        {/* 20. RELATIONSHIP STATS DASHBOARD (Day 11 Reveal) */}
        <LockedSection
          minProgress={88}
          sectionName="Universe Mission Control"
          tip="Explore nearly all corners of our universe to unlock live telemetry!"
          unlockDay={11}
        >
          <RelationshipDashboard />
        </LockedSection>

        {/* 20.5 OFFICIAL CERTIFICATE OF EXCELLENCE (Day 14 - Sep 22nd Grand Finale) */}
        <LockedSection
          minProgress={95}
          sectionName="Certificate of Excellence"
          tip="Our Grand September 22nd Anniversary Finale & Official Award!"
          unlockDay={14}
        >
          <CertificateSection />
        </LockedSection>

        <SectionDivider variant="wave" />

        {/* 21. FINAL CINEMATIC EPILOGUE */}
        <CinematicEnding />

        {/* 22. QR FOOTER */}
        <QrFooter />

        <footer className="anniversary-footer">
          <div className="heart-row">🩷🐻👑</div>
          three months of us &middot; a quarter of a year &middot; forever to go ❤️🎶😭
        </footer>
      </main>
    </>
  );
}
