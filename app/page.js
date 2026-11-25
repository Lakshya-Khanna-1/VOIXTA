'use client';

import { useEffect, useRef, useState } from 'react';
import Detector from '../components/Detector';
import FamilyCard from '../components/FamilyCard';
import { detectorCopy } from '../lib/detectorCopy';
import { rehearsal } from '../lib/rehearsal';

function Cord() {
  return (
    <svg aria-hidden="true" viewBox="0 0 56 27" fill="none" className="cord">
      <path d="M2 21c10 6 24-3 24-12 0-4-3-6-7-5-7 2-11 14-3 18 8 4 28-4 28-13 0-4-4-6-8-4-7 3-8 14 0 17 5 2 12 1 18-3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg aria-hidden="true" width="23" height="20" viewBox="0 0 23 20" fill="none">
      <path d="M2 10h18m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const [locale, setLocale] = useState('en');
  const [stage, setStage] = useState('home');
  const [line, setLine] = useState(0);
  const [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [needsAnotherChoice, setNeedsAnotherChoice] = useState(false);
  const audio = useRef(null);
  const nextCue = useRef(null);
  const title = useRef(null);
  const hasNavigated = useRef(false);
  const copy = rehearsal[locale];
  const demo = detectorCopy[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (hasNavigated.current) {
      window.scrollTo(0, 0);
      title.current?.focus({ preventScroll: true });
    }
  }, [stage]);

  function stopAudio() {
    clearTimeout(nextCue.current);
    if (audio.current) {
      audio.current.onended = null;
      audio.current.onerror = null;
      audio.current.pause();
    }
  }

  function go(nextStage) {
    hasNavigated.current = true;
    stopAudio();
    setStage(nextStage);
    setNeedsAnotherChoice(false);
  }

  function cue(index, withSound) {
    stopAudio();
    setLine(index);
    if (!withSound) return;
    const player = audio.current ?? new Audio();
    audio.current = player;
    const source = `/audio/${locale}-${index + 1}.mp3`;
    function unavailable() {
      if (player.onended !== ended) return;
      stopAudio();
      setSound(false);
      setAudioError(true);
    }
    function ended() {
      if (index < copy.captions.length - 1) {
        nextCue.current = setTimeout(() => cue(index + 1, true), 1900);
      }
    }
    player.onended = ended;
    player.onerror = unavailable;
    player.src = source;
    player.play().catch(unavailable);
  }

  function start(withSound) {
    go('call');
    setSound(withSound);
    setAudioError(false);
    cue(0, withSound);
  }

  function toggleSound() {
    setSound(!sound);
    setAudioError(false);
    cue(line, !sound);
  }

  const home = stage === 'home';
  const lastLine = line === copy.captions.length - 1;

  return (
    <div className={`site ${home ? 'site-home' : 'site-flow'}`} lang={locale}>
      <header className="masthead shell">
        <button type="button" className="brand" onClick={() => go('home')} aria-label="Voixta">
          <Cord />
          <span>Voixta</span>
        </button>
        {home ? (
          <nav aria-label={demo.works} className="top-nav">
            <a className="how-link" href="#how-it-works">{demo.works}</a>
            <div className="languages" aria-label="Language / भाषा">
              <button type="button" lang="en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button>
              <span aria-hidden="true">/</span>
              <button type="button" lang="hi" aria-pressed={locale === 'hi'} onClick={() => setLocale('hi')}>हिन्दी</button>
            </div>
          </nav>
        ) : (
          <button type="button" className="text-button exit" onClick={() => go('home')}>{stage === 'help' ? copy.home : copy.exit}</button>
        )}
      </header>

      {home ? (
        <main className="shell" id="main-content">
          <section className="hero">
            <div className="hero-copy">
              <h1 ref={title} tabIndex={-1}>{demo.homeTitle}</h1>
              <p className="hero-intro">{demo.homeIntro}</p>
              <button type="button" className="button button-primary hero-button" onClick={() => go('detector')}>
                {demo.start}<Arrow />
              </button>
              <div className="hero-meta">
                <p className="fine">{demo.note}</p>
                <button type="button" className="text-button" onClick={() => go('help')}>{copy.help}</button>
              </div>
            </div>
            <img className="hero-art" src="/images/handset.webp" width="1220" height="916" fetchPriority="high" alt="" />
          </section>
          <div className="practice-bar">
            <button type="button" className="text-button" onClick={() => go('ready')}>{demo.practice}</button>
          </div>
          <section className="protocol" id="how-it-works" aria-label={demo.works}>
            {demo.protocol.map(([label, description]) => (
              <div key={label}>
                <h2>{label}</h2>
                <p>{description}</p>
              </div>
            ))}
          </section>
        </main>
      ) : (
        <main className={`flow stage-${stage}`} id="main-content">
          {stage === 'detector' && <Detector locale={locale} titleRef={title} onPractice={() => go('ready')} />}

          {stage === 'ready' && (
            <>
              <h1 ref={title} tabIndex={-1}>{copy.prep}</h1>
              <p className="intro">{copy.prepIntro}</p>
              <div className="actions">
                <button type="button" className="button button-primary" onClick={() => start(true)}>{copy.listen}<Arrow /></button>
                <button type="button" className="button button-outline" onClick={() => start(false)}>{copy.read}</button>
              </div>
              <p className="fine">{copy.prepNote}</p>
            </>
          )}

          {stage === 'call' && (
            <>
              <div className="call-top">
                <p className="call-label">{copy.drill}</p>
                <button type="button" className="text-button sound-control" onClick={toggleSound}>{sound ? copy.mute : copy.unmute}</button>
              </div>
              <h1 ref={title} tabIndex={-1}>{copy.caller}</h1>
              <img className="call-art" src="/images/handset.webp" width="1220" height="916" alt="" />
              <div className="call-caption" aria-live="polite">
                <p className="caption-line">“{copy.captions[line]}”</p>
              </div>
              <div className="call-actions">
                <button type="button" className="button button-danger" onClick={() => go('handoff')}>{copy.hang}</button>
                <button type="button" className="button button-outline" onClick={() => lastLine ? go('retry') : cue(line + 1, sound)}>
                  {lastLine ? copy.finish : copy.nextLine}
                </button>
              </div>
              {audioError && <p role="status" className="fine">{copy.soundError}</p>}
            </>
          )}

          {stage === 'retry' && (
            <>
              <h1 ref={title} tabIndex={-1}>{copy.retryTitle}</h1>
              <p className="intro">{copy.retryIntro}</p>
              <button type="button" className="button button-primary" onClick={() => go('ready')}>{copy.retry}<Arrow /></button>
            </>
          )}

          {stage === 'handoff' && (
            <>
              <p className="stage-context">{copy.callEnded}</p>
              <h1 ref={title} tabIndex={-1}>{copy.pass}</h1>
              <p className="intro">{copy.passIntro}</p>
              <img className="handoff-art" src="/images/handoff.webp" width="850" height="566" alt="" />
              <div className="actions">
                <button type="button" className="button button-primary" onClick={() => go('helper')}>{copy.passButton}<Arrow /></button>
                <button type="button" className="text-button" onClick={() => go('helper')}>{copy.solo}</button>
              </div>
            </>
          )}

          {stage === 'helper' && (
            <>
              <p className="stage-context">{copy.helperLabel}</p>
              <h1 ref={title} tabIndex={-1}>{copy.helperTitle}</h1>
              <blockquote>“{copy.helperQuote}”</blockquote>
              <p className="fine">{copy.helperIntro}</p>
              <section className="verify-choices" aria-labelledby="verify-heading">
                <h2 id="verify-heading">{copy.check}</h2>
                <div className="actions">
                  <button type="button" className="button button-outline choice" onClick={() => go('card')}>{copy.known}<Arrow /></button>
                  <button type="button" className="button button-outline choice" onClick={() => setNeedsAnotherChoice(true)}>{copy.callerNumber}<Arrow /></button>
                </div>
                {needsAnotherChoice && <p className="choice-feedback" role="status">{copy.checkAgain}</p>}
              </section>
            </>
          )}

          {stage === 'card' && (
            <>
              <h1 className="visually-hidden" ref={title} tabIndex={-1}>{copy.cardTitle}</h1>
              <p className="intro result-note">{copy.verify}</p>
              <FamilyCard locale={locale} copy={copy} />
              <button type="button" className="text-button replay" onClick={() => go('ready')}>{copy.swap}</button>
            </>
          )}

          {stage === 'help' && (
            <>
              <h1 ref={title} tabIndex={-1}>{copy.helpTitle}</h1>
              <p className="intro">{copy.helpIntro}</p>
              <div className="help-section">
                <p>{copy.helpLoss}</p>
                <a className="button button-primary" href="tel:1930">{copy.helpline}<Arrow /></a>
                <a className="text-link" href="https://cybercrime.gov.in/">{copy.portal}</a>
              </div>
              <div className="help-section">
                <p>{copy.suspicious}</p>
                <a className="text-link" href="https://sancharsaathi.gov.in/sfc/">{copy.chakshu}</a>
              </div>
            </>
          )}
        </main>
      )}

      {!home && stage !== 'help' && (
        <footer className="footer flow-footer">
          <button type="button" className="text-button" onClick={() => go('help')}>{copy.help}</button>
        </footer>
      )}
    </div>
  );
}
