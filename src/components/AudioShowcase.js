import { useState, useEffect, useRef } from 'react';
import { Box, Text, Button, TextInput } from '@mantine/core';

export default function AudioShowcase({ audioFile }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [start, setStart] = useState(0); // Start time for trimming
  const [end, setEnd] = useState(0); // End time for trimming
  const audioRef = useRef(null); // Reference to the audio element
  const audioContext = useRef(null); // Reference to the AudioContext
  const [audioBuffer, setAudioBuffer] = useState(null); // Store audio buffer

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        setEnd(audio.duration); // Set the end time to the total duration of the audio
      };

      // Load audio into AudioContext
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const decodedData = await audioContext.current.decodeAudioData(e.target.result);
        setAudioBuffer(decodedData); // Store the decoded audio buffer
      };

      reader.readAsArrayBuffer(audioFile);

      // Cleanup URL object when component is unmounted
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile]);

  const handlePlayTrimmed = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = start; // Set the starting point for the playback
      audioRef.current.play();

      // Stop the audio when it reaches the end time
      const stopAtEnd = () => {
        if (audioRef.current.currentTime >= end) {
          audioRef.current.pause();
          audioRef.current.currentTime = start; // Reset to start after pausing
        }
      };

      audioRef.current.ontimeupdate = stopAtEnd; // Check time during playback
    }
  };

  const handleDownloadTrimmedAudio = () => {
    if (audioBuffer && audioContext.current) {
      const trimmedBuffer = audioContext.current.createBuffer(
        1, 
        audioContext.current.sampleRate * (end - start), 
        audioContext.current.sampleRate
      );

      // Copy the trimmed audio data
      trimmedBuffer.getChannelData(0).set(audioBuffer.getChannelData(0).subarray(
        audioContext.current.sampleRate * start,
        audioContext.current.sampleRate * end
      ));

      // Create a new AudioBufferSourceNode
      const source = audioContext.current.createBufferSource();
      source.buffer = trimmedBuffer;

      // Create a function to export the trimmed audio
      const exportAudio = () => {
        const offlineContext = new OfflineAudioContext(1, trimmedBuffer.length, audioContext.current.sampleRate);
        const exportSource = offlineContext.createBufferSource();
        exportSource.buffer = trimmedBuffer;
        exportSource.connect(offlineContext.destination);
        exportSource.start(0);

        offlineContext.startRendering().then((renderedBuffer) => {
          // Convert to WAV format
          const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
          const url = URL.createObjectURL(wavBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'trimmed-audio.wav';
          a.click();
          URL.revokeObjectURL(url);
        });
      };

      exportAudio();
    }
  };

  // Function to convert audio buffer to WAV format
  const bufferToWave = (abuffer, len) => {
    const numOfChannels = abuffer.numberOfChannels;
    const length = len*2 + 44; // WAV header size
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, length - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, abuffer.sampleRate, true);
    view.setUint32(28, abuffer.sampleRate * numOfChannels * 2, true); // Byte rate
    view.setUint16(32, numOfChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(view, 36, 'data');
    view.setUint32(40, len * 2, true); // Data size

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < numOfChannels; i++) {
      const channelData = abuffer.getChannelData(i);
      for (let j = 0; j < len; j++) {
        view.setInt16(offset, channelData[j] * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  // Helper function to write string to DataView
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <Box style={{ marginTop: '2rem', textAlign: 'center', height:'30vh'}}>
      <Text size="md">Preview your uploaded audio file:</Text>
      {audioUrl && (
        <>
          <audio ref={audioRef} controls>
            <source src={audioUrl} type={audioFile.type} />
            Your browser does not support the audio element.
          </audio>

          {/* Inputs for start and end times */}
          <Box mt="xl" style={{marginBottom:'1rem'}}>
            <TextInput
              label="Set Trim Start (in seconds)"
              value={start}
              onChange={(e) => setStart(parseFloat(e.target.value))}
              type="number"
              min={0}
              step="0.01"
            />
            <TextInput
              label="Set Trim End (in seconds)"
              value={end}
              onChange={(e) => setEnd(parseFloat(e.target.value))}
              type="number"
              min={start}
              step="0.01"
            />
          </Box>

          <Button mt="lg" onClick={handlePlayTrimmed} style={{transition: 'background-color 0.3s ease, transform 0.3s ease',padding:'0.5rem',marginRight:'1rem',borderRadius:'2rem',fontSize:'1em',fontWeight:'bold',backgroundColor:'#17171e',color:'white',border:'2px solid #665dc3'}}           onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#665dc3'; // Change background color on hover
              e.currentTarget.style.cursor='pointer';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#17171e'; // Reset background color
            }}>
            Play Trimmed Audio
          </Button>
          <Button mt="lg" onClick={handleDownloadTrimmedAudio} style={{transition: 'background-color 0.3s ease, transform 0.3s ease',padding:'0.5rem',borderRadius:'2rem',fontSize:'1em',fontWeight:'bold',backgroundColor:'#17171e',color:'white',border:'2px solid #665dc3'}}           onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#665dc3'; // Change background color on hover
              e.currentTarget.style.cursor='pointer';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#17171e'; // Reset background color
            }}>
            Download Trimmed Audio
          </Button>
        </>
      )}
    </Box>
  );
}



