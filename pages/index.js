'use client';
import React, { useRef, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import for the Webcam component
const Webcam = dynamic(() => import('react-webcam'), { ssr: false });

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

const Home = () => {
  const webcamRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    setIsClient(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          handleLocationError(error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleLocationError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError('User denied the request for Geolocation. Please enable location services in your device settings.');
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationError('Location information is unavailable. Please check your device settings.');
        break;
      case error.TIMEOUT:
        setLocationError('The request to get user location timed out. Please try again.');
        break;
      case error.UNKNOWN_ERROR:
      default:
        setLocationError('An unknown error occurred while fetching location.');
        break;
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current && webcamReady) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log(imageSrc);
    } else {
      console.warn('Webcam not available');
    }
  }, [webcamReady]);

  const handleUserMedia = () => {
    console.log('Webcam user media success');
    setWebcamReady(true);
  };

  const handleUserMediaError = (error) => {
    console.error('Webcam user media error:', error);
    setWebcamReady(false);
  };

  return (
    <div>
      <Head>
        <title>Next.js Camera Overlay</title>
        <meta name="description" content="Next.js app with camera overlay for alignment" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', position: 'relative' }}>
        {isClient && (
          <>
            <Webcam
              audio={false}
              height={720}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={1280}
              videoConstraints={videoConstraints}
              style={{ position: 'absolute', top: 0, left: 0, transform: 'scaleX(-1)' }} // Apply horizontal flip
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              border: '10px solid rgba(0, 255, 0, 0.5)', // Green overlay
              boxSizing: 'border-box',
            }} />
          </>
        )}
        <button onClick={capture} disabled={!webcamReady} style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: webcamReady ? 'pointer' : 'not-allowed',
        }}>
          Capture
        </button>
        {location.latitude && location.longitude && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
          }}>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
          </div>
        )}
        {locationError && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 0, 0, 0.7)',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
          }}>
            <p>Error: {locationError}</p>
            {locationError.includes('denied') && (
              <p>Please enable location services in your device settings.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;