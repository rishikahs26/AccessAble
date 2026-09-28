import { useState } from 'react';

// Wait up to 3s for voices to load (needed on Android/WebView)
const getVoicesAsync = () =>
  new Promise((resolve) => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) return resolve(v);
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    }, 3000);
  });

export const useAssistant = (language = 'en-US') => {
  const [isMicActive, setIsMicActive] = useState(false);

  // ── speak — waits until speech fully finishes before resolving ────────────
  const speak = async (text) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    await new Promise((r) => setTimeout(r, 150)); // let cancel settle

    const voices = await getVoicesAsync();
    const langCode = language.split('-')[0];
    const isIndic = ['hi','ta','te','kn','ml','bn','gu','mr','pa'].includes(langCode);

    let voice = null;
    if (isIndic) {
      voice = voices.find(v => v.lang === language)
           || voices.find(v => v.lang.startsWith(langCode))
           || voices.find(v => v.lang.startsWith('en-IN'))
           || voices.find(v => v.lang.startsWith('en'))
           || voices[0];
    } else {
      voice = voices.find(v => v.lang === language)
           || voices.find(v => v.lang.startsWith(langCode))
           || voices[0];
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;
      utterance.onend   = () => resolve();
      utterance.onerror = (e) => { if (e.error !== 'interrupted') console.error('TTS:', e.error); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  };

  // ── listen — waits 400ms after speak finishes before opening mic ──────────
  const listen = () => {
    return new Promise((resolve) => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { console.error('SpeechRecognition not supported'); return resolve(''); }

      // 400ms gap so the TTS audio tail doesn't bleed into the mic
      setTimeout(() => {
        const recognition = new SR();
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let resolved = false;
        const done = (val) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(tid);
            setIsMicActive(false);
            resolve(val);
          }
        };

        const tid = setTimeout(() => {
          try { recognition.abort(); } catch (_) {}
          done('');
        }, 14000);

        recognition.onstart  = () => setIsMicActive(true);
        recognition.onresult = (e) => done(e.results?.[0]?.[0]?.transcript?.toLowerCase().trim() || '');
        recognition.onerror  = (e) => { if (e.error !== 'aborted') console.error('STT:', e.error); done(''); };
        recognition.onend    = () => done('');

        try { recognition.start(); }
        catch (err) { console.error('recognition.start failed:', err); done(''); }
      }, 400);
    });
  };

  return { speak, listen, isMicActive };
};
