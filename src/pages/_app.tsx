import '../styles/globals.css'
import type { AppProps } from 'next/app'
import ImageContextProvider from '../contexts/ImageContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ImageContextProvider>
      <Component {...pageProps} />
    </ImageContextProvider>
  ) 
  
}

export default MyApp
