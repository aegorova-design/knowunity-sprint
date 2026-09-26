'use client';

import { useState, useRef } from 'react';

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioElementRef = useRef<HTMLAudioElement>(null);

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
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
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
        if (audioChunksRef.current.length === 0) {
          setError('Empty recording');
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: audioFormat || 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioElementRef.current) {
          audioElementRef.current.src = audioUrl;
        }
      };
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const transcribeAudio = async () => {
    if (!audioElementRef.current || !audioElementRef.current.src) {
      setError('No recording available');
      return;
    }

    setIsTranscribing(true);
    setError('');
    setTranscript('');

    try {
      // Get blob from the audio URL (which is a blob URL)
      let blob: Blob;
      try {
        const response = await fetch(audioElementRef.current.src);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio blob: ${response.status}`);
        }
        blob = await response.blob();
      } catch (err) {
        throw new Error(`Failed to retrieve recording: ${err instanceof Error ? err.message : String(err)}`);
      }

      if (blob.size === 0) {
        throw new Error('Empty recording');
      }

      // Determine file extension based on format
      const fileExt = audioFormat === 'audio/mp4' ? 'm4a' : (audioFormat === 'audio/webm' ? 'webm' : 'webm');
      const fileName = `recording.${fileExt}`;

      const formData = new FormData();
      formData.append('audio', blob, fileName);

      let res: Response;
      const startTime = Date.now();
      try {
        res = await fetch('/api/voice-test/transcribe', {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        throw new Error(`Network error: ${err instanceof Error ? err.message : String(err)}`);
      }

      const transcribeTime = Date.now() - startTime;
      setTranscriptionTime(transcribeTime);

      let data: any;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error(`Invalid response from server: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) {
        if (data.error === 'empty_recording') {
          throw new Error('Empty recording');
        } else if (data.error === 'api_error') {
          throw new Error('OpenAI transcription API error');
        } else {
          throw new Error(`API error (${res.status}): ${data.error || data.message || res.statusText}`);
        }
      }

      const transcript = data.transcript || '';
      if (!transcript) {
        throw new Error('No transcript returned from API');
      }
      setTranscript(transcript);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
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
          disabled={isTranscribing || !audioElementRef.current?.src}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isTranscribing ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            cursor: isTranscribing ? 'default' : 'pointer',
            borderRadius: '4px',
            opacity: isTranscribing ? 0.6 : 1
          }}
        >
          {isTranscribing ? 'Transcribing...' : 'Transcribe'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', padding: '10px', marginBottom: '20px', color: '#c62828' }}>
          {error}
        </div>
      )}

      {transcript && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <strong>Transcript:</strong>
          <p>{transcript}</p>
          <small style={{ color: '#666' }}>
            Format: {audioFormat} | Recording: {recordingLength}s | Transcription time: {transcriptionTime}ms
          </small>
        </div>
      )}
    </div>
  );
}
