import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

const BarcodeScannerComponent = () => {
    const [barcodeValue, setBarcodeValue] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

    useEffect(() => {
        // Update viewport height dynamically
        const updateHeight = () => setViewportHeight(window.innerHeight);
        window.addEventListener('resize', updateHeight);

        if (isScanning && !scannerRef.current) {
            scannerRef.current = new Html5Qrcode('reader');
            startScanner();
        }

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
            window.removeEventListener('resize', updateHeight);
        };
    }, [isScanning]);

    const startScanner = async () => {
        try {
            if (scannerRef.current) {
                await scannerRef.current.start(
                    { facingMode: 'environment' }, // Use back camera
                    {
                        fps: 10, // Frames per second
                    },
                    onScanSuccess,
                    onScanFailure
                );
                console.log('Scanner started successfully.');
            }
        } catch (err) {
            console.error('Error starting scanner:', err);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                console.log('Scanner stopped successfully.');
            } catch (err) {
                console.error('Error stopping scanner:', err);
            } finally {
                scannerRef.current = null;
                setIsScanning(false);
            }
        }
    };

    const onScanSuccess = async (decodedText) => {
        setBarcodeValue(decodedText);
        await stopScanner();
        axios
            .post('http://localhost:5002/api/barcode/scan', { decodedText })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error scanning barcode:', error);
            });
    };

    const onScanFailure = (error) => {
        console.warn('QR code scan failed:', error);
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: `${viewportHeight}px`, // Dynamically set height based on viewport
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Darker background for better visibility
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const readerContainerStyle = {
        width: '100%',
        height: '100%', // Ensures full height of the overlay
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Prevents overflow issues
    };

    const readerStyle = {
        width: '100vw', // Full screen width
        height: '100%', // Full container height
        display: 'block',
        objectFit: 'cover', // Ensures the camera feed fills the container
    };

    const buttonStyle = {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: '#f44336',
        color: '#fff',
        zIndex: 1001,
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>Barcode Scanner</h2>
            {!isScanning && (
                <button
                    style={{
                        marginTop: '20px',
                        display: 'block',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: '#4CAF50',
                        color: '#fff',
                        margin: '20px auto',
                    }}
                    onClick={() => setIsScanning(true)}
                >
                    Open Scanner
                </button>
            )}
            {isScanning && (
                <div style={overlayStyle}>
                    <div style={readerContainerStyle}>
                        <div id="reader" style={readerStyle}></div>
                    </div>
                    <button style={buttonStyle} onClick={stopScanner}>
                        Close Scanner
                    </button>
                </div>
            )}
            <input
                type="text"
                value={barcodeValue}
                readOnly
                style={{
                    marginTop: '20px',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    width: '100%',
                    maxWidth: '400px',
                    display: 'block',
                    margin: '20px auto',
                }}
                placeholder="Scanned barcode will appear here"
            />
        </div>
    );
};

export default BarcodeScannerComponent;
