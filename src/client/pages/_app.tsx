import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

const inter = Inter({ weight: ['300', '700'], subsets: ['latin', 'cyrillic'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          html {
            font-family: ${inter.style.fontFamily};
            font-weight: ${inter.style.fontWeight};
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  );
}
