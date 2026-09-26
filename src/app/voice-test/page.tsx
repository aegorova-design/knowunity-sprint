'use client';

import { useState, useRef, useEffect } from 'react';

export default function VoiceTestPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/voice-test/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setError('Invalid passcode');
      }
    } catch (err) {
      setError('Verification failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'monospace' }}>
        <h1>Voice Test</h1>
        <form onSubmit={handlePasscodeSubmit}>
          <input
            type="password"
            placeholder="Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '8px' }}>
            Unlock
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </div>
    );
  }

  return <VoiceTestApp />;
}

function VoiceTestApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFormat, setAudioFormat] = useState<'audio/webm' | 'audio/mp4' | null>(null);
  const [recordingLength, setRecordingLength] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [transcriptionTime, setTranscriptionTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  const addDebugLog = (message: string) => {
    console.log('[voice-test]', message);
    setDebugLog((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addDebugLog(`UNCAUGHT ERROR: ${event.message}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addDebugLog(`UNHANDLED REJECTION: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const detectAudioFormat = (): 'audio/webm' | 'audio/mp4' => {
    const options = [
      { mimeType: 'audio/webm' },
      { mimeType: 'audio/mp4' }
    ];

    for (const option of options) {
      if (MediaRecorder.isTypeSupported(option.mimeType)) {
        return option.mimeType as 'audio/webm' | 'audio/mp4';
      }
    }

    // Fallback
    return 'audio/webm';
  };

  const startRecording = async () => {
    setError('');
    setTranscript('');
    setTranscriptionTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const format = detectAudioFormat();
      setAudioFormat(format);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: format });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          addDebugLog(`Audio chunk received: ${event.data.size} bytes`);
        }
      };

      // Start with timeslice to ensure chunks arrive during recording on iOS
      mediaRecorder.start(1000);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      addDebugLog('Recording started with 1000ms timeslice');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone permission denied');
      } else {
        setError('Failed to start recording: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      const length = Date.now() - startTimeRef.current;
      setRecordingLength(Math.round(length / 1000 * 10) / 10); // Round to 1 decimal

      mediaRecorderRef.current.onstop = () => {
        addDebugLog(`Stop event: ${audioChunksRef.current.length} chunks received`);

        if (audioChunksRef.current.length === 0) {
          addDebugLog('ERROR: Empty recording - no chunks received');
          setError('Empty recording');
          return;
        }

        // Build blob from all chunks and store for both playback and transcription
        const audioBlob = new Blob(audioChunksRef.current, { type: audioFormat || 'audio/webm' });
        audioBlobRef.current = audioBlob;
        addDebugLog(`Blob created: ${audioBlob.size} bytes, type=${audioBlob.type}`);

        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioElementRef.current) {
          audioElementRef.current.src = audioUrl;
          addDebugLog(`Audio element src set, ready for playback`);
        }
      };
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      addDebugLog('Recording stopped, stream closed');
    }
  };

  const transcribeAudio = async () => {
    // Immediate logging - highest priority
    console.log('[TRANSCRIBE] Button clicked');
    try {
      addDebugLog('Transcribe tap received');

      // Use the stored blob from recording, not the audio element src
      if (!audioBlobRef.current) {
        addDebugLog('ERROR: No blob stored - recording may not have completed');
        setError('No recording available');
        return;
      }

      const blob = audioBlobRef.current;
      addDebugLog(`Using stored blob: size=${blob.size}, type=${blob.type}`);

      setIsTranscribing(true);
      setError('');
      setTranscript('');

      if (blob.size === 0) {
        addDebugLog('ERROR: Blob size is 0');
        throw new Error('Empty recording');
      }

      // Determine file extension based on format
      const fileExt = audioFormat === 'audio/mp4' ? 'm4a' : (audioFormat === 'audio/webm' ? 'webm' : 'webm');
      const fileName = `recording.${fileExt}`;
      addDebugLog(`File format: ${audioFormat}, extension: ${fileExt}`);

      const formData = new FormData();
      formData.append('audio', blob, fileName);
      addDebugLog('FormData created with audio file');

      let res: Response;
      const startTime = Date.now();
      try {
        addDebugLog('Sending fetch to /api/voice-test/transcribe...');
        res = await fetch('/api/voice-test/transcribe', {
          method: 'POST',
          body: formData
        });
        addDebugLog(`Fetch response received: status=${res.status}`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        addDebugLog(`ERROR: Fetch failed: ${errMsg}`);
        throw new Error(`Network error: ${errMsg}`);
      }

      const transcribeTime = Date.now() - startTime;
      setTranscriptionTime(transcribeTime);
      addDebugLog(`Transcription took ${transcribeTime}ms`);

      let data: any;
      try {
        data = await res.json();
        addDebugLog(`Response JSON parsed`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        addDebugLog(`ERROR: Failed to parse JSON: ${errMsg}`);
        throw new Error(`Invalid response from server: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) {
        const errorMsg = data.error === 'empty_recording' ? 'Empty recording' :
                         data.error === 'api_error' ? 'OpenAI transcription API error' :
                         `API error (${res.status}): ${data.error || data.message || res.statusText}`;
        addDebugLog(`ERROR: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const transcript = data.transcript || '';
      if (!transcript) {
        addDebugLog('ERROR: No transcript in response');
        throw new Error('No transcript returned from API');
      }
      addDebugLog(`Transcript received: ${transcript.substring(0, 30)}...`);
      setTranscript(transcript);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugLog(`EXCEPTION: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
      addDebugLog('Transcribe operation complete');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', fontFamily: 'monospace' }}>
      <h1>Voice Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginRight: '10px',
            backgroundColor: isRecording ? '#ff6b6b' : '#4caf50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <span style={{ fontSize: '14px', color: '#666' }}>
          {isRecording && `Recording... ${recordingLength}s`}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <audio
          ref={audioElementRef}
          controls
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={transcribeAudio}
          disabled={isTranscribing || !audioBlobRef.current}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: (isTranscribing || !audioBlobRef.current) ? '#ccc' : '#2196f3',
            color: (isTranscribing || !audioBlobRef.current) ? '#999' : 'white',
            border: 'none',
            cursor: (isTranscribing || !audioBlobRef.current) ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            opacity: (isTranscribing || !audioBlobRef.current) ? 0.5 : 1
          }}
        >
          {isTranscribing ? 'Transcribing...' : 'Transcribe'}
        </button>
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
          Status: {isTranscribing ? 'transcribing' : 'ready'} | Blob: {audioBlobRef.current ? `${Math.round(audioBlobRef.current.size / 1024)}KB` : 'no'} | Disabled: {isTranscribing || !audioBlobRef.current ? 'yes' : 'no'}
        </div>
      </div>

      {debugLog.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#333',
          maxHeight: '150px',
          overflowY: 'auto',
          border: '1px solid #ccc'
        }}>
          <strong style={{ color: '#333' }}>Debug Log:</strong>
          {debugLog.map((log, idx) => (
            <div key={idx} style={{ color: log.includes('ERROR') ? '#d32f2f' : '#333', marginTop: '4px' }}>
              {log}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#ffebee', padding: '10px', marginBottom: '20px', color: '#c62828' }}>
          {error}
        </div>
      )}

      {transcript && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#333' }}>
          <strong style={{ color: '#333' }}>Transcript:</strong>
          <p style={{ color: '#333' }}>{transcript}</p>
          <small style={{ color: '#666' }}>
            Format: {audioFormat} | Recording: {recordingLength}s | Transcription time: {transcriptionTime}ms
          </small>
        </div>
      )}
    </div>
  );
}
