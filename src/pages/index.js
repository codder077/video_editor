import { Box, Button, Text, Group } from '@mantine/core';
import AudioCutterLanding from '../components/AudioCutterLanding';

export default function Home() {
  return (
    <Box style={{ display: 'flex',backgroundColor:'#17171e',height:'100vh'}}>
      <Box style={{ flex: 1, textAlign: 'center',marginTop:'10rem',color:'white',height:'60vh'}}>
        <AudioCutterLanding />
      </Box>
    </Box>
  );
}
