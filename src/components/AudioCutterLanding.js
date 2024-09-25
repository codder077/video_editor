import { useState, useRef } from 'react';
import { Box, Button, Group, Text } from '@mantine/core';
import AudioShowcase from './AudioShowcase';

export default function AudioCutterLanding() {
  const [audioFile, setAudioFile] = useState(null);
  const fileInputRef = useRef(null); // Reference to the hidden file input

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  return (
    <Box>
      <Box style={{display:'flex',marginBottom:'1rem',justifyContent:'center'}}>
        <Text size="sm" style={{ marginBottom: '1rem',marginRight:'2rem',fontSize:'1em',fontWeight:'bold'}}>
            HOW IT WORKS
        </Text>
        <Text size="sm" style={{ marginBottom: '1rem',fontSize:'1em',fontWeight:'bold'}}>
            JOINER
        </Text>
      </Box>

      <Text size="xl" weight={700} style={{ marginBottom: '1rem',fontSize:'4em',fontWeight:'bold'}}>
        Audio Cutter
      </Text>
      <Text size="sm" style={{ marginBottom: '1rem',fontSize:'2em'}}>
        Free editor to trim and cut any audio file online
      </Text>

      <Group position="center" mt="xl">
        <Button onClick={handleButtonClick} style={{transition: 'background-color 0.3s ease, transform 0.3s ease',padding:'1rem',marginTop:'1rem',borderRadius:'2rem',fontSize:'1em',fontWeight:'bold',backgroundColor:'#17171e',color:'white',border:'2px solid #665dc3'}}     onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2b2847'; // Change background color on hover
            e.currentTarget.style.cursor='pointer';
        }} 
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#17171e'; // Reset background color
        }}>
          Browse my files
        </Button>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the default file input
          ref={fileInputRef}
        />
      </Group>

      {audioFile && <AudioShowcase audioFile={audioFile} />}
    </Box>
  );
}

