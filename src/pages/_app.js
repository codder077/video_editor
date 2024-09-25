// _app.js
import { MantineProvider } from '@mantine/core';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <Component {...pageProps} />
    </MantineProvider>
  );
}

export default MyApp;
