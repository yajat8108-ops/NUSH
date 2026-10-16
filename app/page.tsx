'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// ── Above-fold & Persistent Controllers ─────────────────────────────
import UniverseProgressHUD   from '@/components/UniverseProgressHUD';
import AmbientEffects        from '@/components/AmbientEffects';
import ScrollProgress        from '@/components/ScrollProgress';
import FloatingBottomDock    from '@/components/FloatingBottomDock';
import AnniversaryHero       from '@/components/AnniversaryHero';
import UniverseTabsNav       from '@/components/UniverseTabsNav';

// ── Below-fold: lazy-load on demand — massive bundle size reduction ─
const AchievementsModal    = dynamic(() => import('@/components/AchievementsModal'),    { ssr: false });
const UniverseSecrets      = dynamic(() => import('@/components/UniverseSecrets'),      { ssr: false });
const NushSecret           = dynamic(() => import('@/components/NushSecret'),           { ssr: false });
const ThemeToggle          = dynamic(() => import('@/components/ThemeToggle'),          { ssr: false });
const CamcorderViewfinder  = dynamic(() => import('@/components/CamcorderViewfinder'),  { ssr: false });
const TimeMachineVault     = dynamic(() => import('@/components/TimeMachineVault'),     { ssr: false });
const SorrySection         = dynamic(() => import('@/components/sorry/SorrySection'),   { ssr: false });
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

// ── Private Sanctuary & 1-Year Master Suite Components ───────────────
const StealthGate          = dynamic(() => import('@/components/privacy/StealthGate'),          { ssr: false });
const PanicButton          = dynamic(() => import('@/components/privacy/PanicButton'),          { ssr: false });
const CelestialAurora      = dynamic(() => import('@/components/presence/CelestialAurora'),      { ssr: false });
const StargazingSky        = dynamic(() => import('@/components/stargazing/StargazingSky'),        { ssr: false });
const OpenWhenVault        = dynamic(() => import('@/components/comfort/OpenWhenVault'),        { ssr: false });
const YearOneWrapped       = dynamic(() => import('@/components/anniversary/YearOneWrapped'),   { ssr: false });
const FourSeasonsOdyssey   = dynamic(() => import('@/components/anniversary/FourSeasonsOdyssey'), { ssr: false });
const Reasons365Jar        = dynamic(() => import('@/components/anniversary/Reasons365Jar'),     { ssr: false });
const DualKeyVault         = dynamic(() => import('@/components/anniversary/DualKeyVault'),     { ssr: false });
const DreamSanctuaryRoom   = dynamic(() => import('@/components/anniversary/DreamSanctuaryRoom'),{ ssr: false });
const ForeverVowsScroll    = dynamic(() => import('@/components/anniversary/ForeverVowsScroll'), { ssr: false });
const VoiceRecorder        = dynamic(() => import('@/components/audio/VoiceRecorder'),          { ssr: false });
const CassetteRadio        = dynamic(() => import('@/components/audio/CassetteRadio'),          { ssr: false });
const MemoryOfTheDay       = dynamic(() => import('@/components/MemoryOfTheDay'),               { ssr: false });
const DormRoom             = dynamic(() => import('@/components/DormRoom'),                      { ssr: false });
const PresenceOverlay      = dynamic(() => import('@/components/presence/PresenceOverlay'),      { ssr: false });

import { useUniverseStore } from '@/lib/universeStore';

export default function Home() {
  const checkAndUpdateStreak = useUniverseStore((s) => s.checkAndUpdateStreak);
  const activeTab = useUniverseStore((s) => s.activeTab);

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
      {/* 0. STEALTH & DISGUISE CAMOUFLAGE GATEWAYS */}
      <StealthGate />
      <PanicButton />
      <YearOneWrapped />

      {/* 1. PERSISTENT GLOBAL HUDs & CONTROLLERS */}
      <UniverseProgressHUD />
      <AchievementsModal />
      <UniverseSecrets />
      <NushSecret />
      <AmbientEffects />
      <ScrollProgress />
      {/* Persistent floating elements */}
      <MemoryOfTheDay />
      <CassetteRadio />
      <PresenceOverlay />

      <ThemeToggle />
      <CamcorderViewfinder />
      <FloatingBottomDock />

      <main className="anniversary-body min-h-screen">
        {/* 2. STICKY TOP BAR & TABS NAVIGATION (ALWAYS VISIBLE AT TOP) */}
        <UniverseTabsNav />

        {/* 2.5 LIVE PRESENCE & STATUS BEACON */}
        <CelestialAurora />

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: OUR STORY (Hero, Origin, The Kiss, Love Letter, Vows)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'story' && (
          <section id="tab-story" className="space-y-4 animate-in fade-in duration-300">
            {/* 3. HERO — 3D Hearts + Dynamic Countdown */}
            <AnniversaryHero />

            <SectionDivider variant="cloud" />

            {/* 4. THE PROLOGUE — THE GUITAR & FAKE DATING PACT ORIGIN STORY */}
            <OriginStorySection />

            {/* 5. THE KISS TIMELINE — 23 Smooch & 22 August Actual Kiss Collision */}
            <TheKissMilestone />

            <SectionDivider variant="heartbeat" />

            {/* 6. 3-MONTH COMPLETE LOVE LETTER */}
            <UniverseLetter />

            <SectionDivider variant="stars" />

            {/* 6.5 FOREVER VOWS SCROLL */}
            <ForeverVowsScroll />
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: TIMELINE (Constellations, Escape Route, Era Diff, Stargazing)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'timeline' && (
          <section id="tab-timeline" className="space-y-4 animate-in fade-in duration-300">
            {/* 7. RELATIONSHIP CONSTELLATION TIMELINE & PAST ARCHIVES */}
            <UniverseTimeline />

            <SectionDivider variant="stars" />

            {/* 8. THE 8 PM VIT BHOPAL ESCAPE ROUTE ARCHIVE */}
            <div id="month2-archive">
              <CampusRouteMap />
            </div>

            <SectionDivider variant="cloud" />

            {/* 9. 3 MONTHS AGO VS NOW — INTERACTIVE ERA DIFF SLIDER */}
            <EraDiff />

            <SectionDivider variant="heartbeat" />

            {/* 10. OUR #1 UNDISPUTED DREAM DATE: STARGAZING SANCTUARY */}
            <div id="stargazing-sky">
              <StargazingSky />
            </div>

            <SectionDivider variant="stars" />

            {/* 11. FOUR SEASONS ODYSSEY */}
            <FourSeasonsOdyssey />

            <SectionDivider variant="wave" />

            {/* 12. MILESTONE TIME CAPSULES */}
            <LockedSection
              minProgress={68}
              sectionName="Milestone Time Capsules"
              tip="Find 3 secret easter eggs or unlock badges to unseal our wax milestone letters!"
              unlockDay={8}
            >
              <TimeCapsule />
            </LockedSection>

            <SectionDivider variant="cloud" flip />

            {/* 13. 14-DAY COUNTDOWN DRIP & ROAD TO SEP 22ND */}
            <FutureSection />
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: GALLERY (Filmstrip, Photos, Corkboard, 3D Room, Mixtape, Audio)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'gallery' && (
          <section id="tab-gallery" className="space-y-4 animate-in fade-in duration-300">
            {/* 14. GF DAY 35MM FILMSTRIP HORIZONTAL SCRUBBER */}
            <FilmstripScroller />

            <SectionDivider variant="wave" />

            {/* 15. OUR PHOTO ALBUM — GLOBAL CLOUD GALLERY */}
            <PhotoAlbum />

            <SectionDivider variant="wave" flip />

            {/* 16. DRAGGABLE POLAROID CORKBOARD */}
            <CorkboardSection />

            <SectionDivider variant="stars" />

            {/* 17. 3D INTERACTIVE DORM ROOM */}
            <DormRoom />

            <SectionDivider variant="wave" />

            {/* 18. SHARED PLAYLIST / MIXTAPE BUILDER */}
            <LockedSection
              minProgress={15}
              sectionName="Our Shared Mixtape"
              tip="Read our love letter, explore our story, or scratch love reasons to unlock!"
              unlockDay={1}
            >
              <OurSong />
            </LockedSection>

            <SectionDivider variant="stars" />

            {/* 19. RADIO NUSHI AUDIO VAULT & VOICE MEMORIES */}
            <LockedSection
              minProgress={62}
              sectionName="Radio Nushi Voice Studio"
              tip="Unlock badges or play arcade games to open our audio voice vault!"
              unlockDay={7}
            >
              <VoiceMemories />
              <div className="mt-8 space-y-6">
                <VoiceRecorder />
                <CassetteRadio />
              </div>
            </LockedSection>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: GAMES (11 Love Arcade Mini-Games, Trivia, Quiz, AI Oracle)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'games' && (
          <section id="tab-games" className="space-y-4 animate-in fade-in duration-300">
            {/* 20. 11-GAME MASTER LOVE ARCADE */}
            <LoveArcadeHub />

            <SectionDivider variant="heartbeat" />

            {/* 21. COUPLE TRIVIA SHOWDOWN */}
            <QuizSection />

            <SectionDivider variant="stars" />

            {/* 22. COMPATIBILITY TEST */}
            <LockedSection
              minProgress={45}
              sectionName="The Couple Compatibility Test"
              tip="Play Couple Trivia or ask Yajat a question to unlock our 15-question test!"
              unlockDay={4}
            >
              <CompatibilityTest />
            </LockedSection>

            <SectionDivider variant="wave" />

            {/* 23. DATE NIGHT SIMULATOR */}
            <LockedSection
              minProgress={50}
              sectionName="Date Night Simulator"
              tip="Chat with Ask Yajat or complete Couple Trivia to plan our dream dates!"
              unlockDay={5}
            >
              <DateSimulator />
            </LockedSection>

            <SectionDivider variant="cloud" />

            {/* 24. ASK YAJAT AI ORACLE */}
            <AskYajatConsole />
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 5: SANCTUARY & VAULT (Reasons, Vaults, Journal, Vows, Certificate)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'vault' && (
          <section id="tab-vault" className="space-y-4 animate-in fade-in duration-300">
            {/* 25. 60 REASONS SCRATCH GRID */}
            <ReasonsSection />

            <SectionDivider variant="stars" />

            {/* 26. 365 REASONS JAR */}
            <Reasons365Jar />

            <SectionDivider variant="wave" />

            {/* 27. NUSH'S RECIPROCAL TWO-WAY VAULT & MOOD PAD */}
            <TwoWayVault />

            {/* 28. EMERGENCY EMOTIONAL CARE: OPEN WHEN LETTERS */}
            <OpenWhenVault />

            <SectionDivider variant="stars" />

            {/* 28.5 THE MULTIVERSE TIME MACHINE VAULT */}
            <TimeMachineVault />

            <SectionDivider variant="aurora" />

            {/* 29. HANDWRITTEN LETTER CANVAS */}
            <LockedSection
              minProgress={25}
              sectionName="Handwritten Parchment Pad"
              tip="Explore our Polaroid corkboard, test your memory, or play in the Love Arcade!"
              unlockDay={2}
            >
              <HandwrittenCanvas />
            </LockedSection>

            {/* 30. RELATIONSHIP JOURNAL & DIARY */}
            <LockedSection
              minProgress={35}
              sectionName="The Relationship Journal"
              tip="Explore our campus escape route or find a hidden easter egg to unlock our diary!"
              unlockDay={3}
            >
              <RelationshipJournal />
            </LockedSection>

            <SectionDivider variant="heartbeat" />

            {/* 31. REDEEMABLE LOVE COUPONS */}
            <LockedSection
              minProgress={56}
              sectionName="Redeemable Love Tokens"
              tip="Earn Love Points across our universe to unseal your coupon booklet!"
              unlockDay={6}
            >
              <CouponsSection />
            </LockedSection>

            <SectionDivider variant="stars" />

            {/* 32. DUAL KEY VAULT & DREAM SANCTUARY */}
            <DualKeyVault />
            <DreamSanctuaryRoom />

            <SectionDivider variant="aurora" />

            {/* 33. DREAM BUCKET LIST MAP */}
            <LockedSection
              minProgress={76}
              sectionName="Dream Bucket List Map"
              tip="Earn Love Points or unlock achievements to open our world travel map!"
              unlockDay={9}
            >
              <DreamMap />
            </LockedSection>

            <SectionDivider variant="aurora" />

            {/* 34. RELATIONSHIP STATS DASHBOARD */}
            <LockedSection
              minProgress={88}
              sectionName="Universe Mission Control"
              tip="Explore nearly all corners of our universe to unlock live telemetry!"
              unlockDay={11}
            >
              <RelationshipDashboard />
            </LockedSection>

            <SectionDivider variant="cloud" flip />

            {/* 35. SECRET ROOM (UNLOCKED AFTER 5+ SECRETS) */}
            <SecretRoom />

            <SectionDivider variant="wave" />

            {/* 36. OFFICIAL CERTIFICATE OF EXCELLENCE */}
            <LockedSection
              minProgress={95}
              sectionName="Certificate of Excellence"
              tip="Our Grand Anniversary Finale & Official Award!"
              unlockDay={14}
            >
              <CertificateSection />
            </LockedSection>

            <SectionDivider variant="wave" />

            {/* 37. FINAL CINEMATIC EPILOGUE */}
            <CinematicEnding />
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 6: I'M SORRY (Dedicated Apology & Amends Sanctuary — Kept at Last)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'sorry' && (
          <section id="tab-sorry" className="space-y-6 animate-in fade-in duration-300">
            <SorrySection />
          </section>
        )}

        {/* ─── GLOBAL FOOTER (Present on all tabs) ─────────────────── */}
        <SectionDivider variant="wave" />
        <QrFooter />

        <footer className="anniversary-footer">
          <div className="heart-row">🩷🐻👑</div>
          three months of us &middot; a quarter of a year &middot; forever to go ❤️🎶😭
        </footer>
      </main>
    </>
  );
}
