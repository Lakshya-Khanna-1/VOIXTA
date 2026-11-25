'use client';

import { useEffect, useRef, useState } from 'react';
import { analyzeMessage } from '../lib/detector.mjs';
import { detectorCopy } from '../lib/detectorCopy';
import { decodeRecording, loadTranscriber } from '../lib/speech';

let classifier;

function loadClassifier() {
  classifier ??= fetch('/detector-model.json')
    .then((response) => {
      if (!response.ok) throw new Error('Classifier download failed');
      return response.json();
    })
    .catch((error) => {
      classifier = undefined;
      throw error;
    });
  return classifier;
}

export default function Detector({ locale, titleRef, onPractice }) {
  const copy = detectorCopy[locale];
  const [mode, setMode] = useState('call');
  const [language, setLanguage] = useState(locale);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [state, setState] = useState('');
  const [error, setError] = useState('');
  const recorder = useRef(null);
  const stream = useRef(null);
  const timer = useRef(null);
  const generation = useRef(0);
  const resultSection = useRef(null);
  const busy = Boolean(state);

  useEffect(() => () => {
    generation.current += 1;
    clearTimeout(timer.current);
    if (recorder.current?.state === 'recording') {
      recorder.current.onstop = null;
      recorder.current.stop();
    }
    stream.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (result) resultSection.current?.focus();
  }, [result]);

  async function analyze(value) {
    const run = ++generation.current;
    setText(value);
    setResult(null);
    setError('');
    setState('working');
    try {
      const model = await loadClassifier();
      if (generation.current === run) setResult(analyzeMessage(value, mode, model));
    } catch {
      if (generation.current === run) setError(copy.modelError);
    } finally {
      if (generation.current === run) setState('');
    }
  }

  function stopRecording() {
    clearTimeout(timer.current);
    if (recorder.current?.state === 'recording') recorder.current.stop();
  }

  async function startRecording() {
    const run = ++generation.current;
    setState('starting');
    setError('');
    setResult(null);
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
      if (generation.current !== run) {
        microphone.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = microphone;
      const recording = new MediaRecorder(microphone);
      recorder.current = recording;
      const chunks = [];
      recording.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recording.onstop = async () => {
        microphone.getTracks().forEach((track) => track.stop());
        if (generation.current !== run) return;
        setState('transcribing');
        try {
          const audio = await decodeRecording(new Blob(chunks, { type: recording.mimeType }));
          if (generation.current !== run) return;
          const transcribe = await loadTranscriber(language);
          if (generation.current !== run) return;
          const transcript = (await transcribe(audio, { language, task: 'transcribe' })).text.trim();
          if (generation.current !== run) return;
          if (!transcript) {
            setError(copy.emptySpeech);
            setState('');
          } else {
            await analyze(transcript.slice(0, 3000));
          }
        } catch {
          if (generation.current === run) {
            setError(copy.speechError);
            setState('');
          }
        }
      };
      recording.start();
      timer.current = setTimeout(stopRecording, 20000);
      setState('recording');
    } catch {
      stream.current?.getTracks().forEach((track) => track.stop());
      if (generation.current === run) {
        setError(copy.mic);
        setState('');
      }
    }
  }

  return (
    <>
      <h1 ref={titleRef} tabIndex={-1}>{copy.title}</h1>
      <p className="intro">{copy.intro}</p>
      <div className="input-modes" role="group" aria-label={copy.mode}>
        {['call', 'sms'].map((type) => (
          <button key={type} type="button" aria-pressed={mode === type} disabled={busy} onClick={() => {
            setMode(type);
            setText('');
            setResult(null);
            setError('');
          }}>{copy[type]}</button>
        ))}
      </div>
      {mode === 'call' && (
        <section className="speech-input" aria-labelledby="speech-heading">
          <h2 id="speech-heading">{copy.audioTitle}</h2>
          <p className="fine">{copy.audioIntro}</p>
          <div className="speech-actions">
            <button type="button" className="button button-primary" disabled={busy && state !== 'recording'} onClick={state === 'recording' ? stopRecording : startRecording}>
              {state === 'recording' ? copy.stop : copy.record}
            </button>
            <select aria-label={copy.audioLanguage} value={language} disabled={busy} onChange={(event) => setLanguage(event.target.value)}>
              <option lang="en" value="en">English</option>
              <option lang="hi" value="hi">हिन्दी</option>
            </select>
          </div>
          <p className="speech-status" role="status">{state === 'recording' ? copy.recording : state === 'transcribing' ? copy.processing : ''}</p>
        </section>
      )}
      <form className="message-form" onSubmit={(event) => {
        event.preventDefault();
        if (!busy && text.trim()) analyze(text.trim());
      }}>
        <label htmlFor="detector-input">{mode === 'call' ? copy.transcript : copy.message}</label>
        <textarea id="detector-input" rows="4" value={text} maxLength={3000} disabled={busy} onChange={(event) => {
          setText(event.target.value);
          setResult(null);
          setError('');
        }} />
        <button type="submit" className="button button-outline" disabled={busy || !text.trim()}>{copy.check}</button>
      </form>
      {error && <p role="alert" className="detector-error">{error}</p>}
      {result && (
        <section ref={resultSection} tabIndex={-1} aria-labelledby="verdict" className={`detector-result result-${result.level}`}>
          <h2 id="verdict">{copy[result.level]}</h2>
          <p>{copy[result.context && result.level === 'clear' ? result.context : `${result.level}Text`]}</p>
          {result.evidence.length > 0 && (
            <>
              <h3>{copy.resultCues}</h3>
              <ul>{result.evidence.map(({ kind, quote, request }) => (
                <li key={kind}>{copy.cues[kind]} <q>{[request, quote].filter(Boolean).join(' · ')}</q></li>
              ))}</ul>
            </>
          )}
        </section>
      )}
      <div className="detector-examples">
        <p>{copy.examples}</p>
        <div>{copy.sampleNames.map((label, index) => (
          <button className="text-button" type="button" disabled={busy} key={label} onClick={() => analyze((mode === 'call' ? copy.callSamples : copy.smsSamples)[index])}>{label}</button>
        ))}</div>
      </div>
      <details className="detector-details">
        <summary>{copy.works}</summary>
        <p>{copy.worksText}</p>
      </details>
      <button className="text-button" type="button" onClick={onPractice}>{copy.practice}</button>
    </>
  );
}
