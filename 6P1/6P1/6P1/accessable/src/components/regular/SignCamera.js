import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { initializeGestureRecognizer, detectGestureFromImage, getStandardSignMeaning } from '../../utils/gestureLibrary';

const SignCamera = () => {
  const webcamRef = useRef(null);
  const [prediction, setPrediction] = useState('Loading AI...');
  const [hasMedia, setHasMedia] = useState(false);
  const [recognizerReady, setRecognizerReady] = useState(false);

  useEffect(() => {
    const initRecognizer = async () => {
      try {
        await initializeGestureRecognizer();
        setRecognizerReady(true);
      } catch (error) {
        console.error('Failed to initialize gesture recognizer:', error);
        setPrediction('AI initialization failed');
      }
    };
    initRecognizer();
  }, []);

  useEffect(() => {
    if (!hasMedia || !recognizerReady) return;

    const interval = setInterval(async () => {
      if (webcamRef.current?.video?.readyState === 4) {
        try {
          const gesture = await detectGestureFromImage(webcamRef.current.video);
          setPrediction(gesture);
        } catch (error) {
          console.error('Error detecting gesture:', error);
          setPrediction('Detection error');
        }
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [hasMedia, recognizerReady]);

  return (
    <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900 border-[10px] border-white">
      <Webcam 
        ref={webcamRef} 
        className="w-full aspect-video object-cover" 
        mirrored={true} 
        onUserMedia={() => setHasMedia(true)}
        onUserMediaError={(err) => {
          console.error('SignCamera webcam error:', err);
          setPrediction('Camera unavailable');
        }}
      />
      
      {/* Floating Display Overlay */}
      <div className="absolute inset-x-4 bottom-4 glass-card p-6 rounded-3xl flex flex-col items-center justify-center border-t border-white/20 backdrop-blur-md bg-white/10">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">AI Interpretation</p>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
          {prediction}
        </h2>
        <p className="text-sm text-slate-200 font-medium">Standard Sign: {getStandardSignMeaning(prediction)}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-300">Live Recognition Active</span>
        </div>
      </div>
    </div>
  );
};

export default SignCamera;