import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScannerComponent = () => {
    const [barcodeValue, setBarcodeValue] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

    const qrboxWidth = Math.min(window.innerWidth * 0.8, 600);
    const qrboxHeight = qrboxWidth * 0.6;

    useEffect(() => {
        const updateHeight = () => setViewportHeight(window.innerHeight);
        window.addEventListener('resize', updateHeight);

        if (isScanning && !scannerRef.current) {
            scannerRef.current = new Html5Qrcode('reader');
            startScanner();
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
            window.removeEventListener('resize', updateHeight);
        };
    // eslint-disable-next-line
    }, [isScanning]);

    const startScanner = async () => {
        try {
            if (scannerRef.current) {
                await scannerRef.current.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        formatsToSupport: [
                            'code_128',
                        ],
                        focusMode: "continuous",
                        qrbox: { width: qrboxWidth, height: qrboxHeight },
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
    };

    const onScanFailure = (error) => {
        console.warn('QR code scan failed:', error);
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: `${viewportHeight}px`,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const readerContainerStyle = {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    };

    const readerStyle = {
        width: '100vw',
        height: '100%',
        display: 'block',
    };

    const qrboxStyle = {
        position: 'absolute',
        width: `${qrboxWidth}px`,
        height: `${qrboxHeight}px`,
        border: '4px solid #00FF00',
        boxSizing: 'border-box',
        zIndex: 1001,
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
        zIndex: 1002,
    };

    const inputTextStyle = {
        marginTop: '20px',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        width: '100%',
        maxWidth: '400px',
        display: 'block',
        margin: '20px auto',
    };

    const openButtonStyle = {
        marginTop: '20px',
        display: 'block',
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: '#4CAF50',
        color: '#fff',
        margin: '20px auto',
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>Barcode Scanner</h2>
            {!isScanning && (
                <button
                    style={openButtonStyle}
                    onClick={() => setIsScanning(true)}
                >
                    Open Scanner
                </button>
            )}
            {isScanning && (
                <div style={overlayStyle}>
                    <div style={readerContainerStyle}>
                        <div id="reader" style={readerStyle}></div>
                        <div style={qrboxStyle}></div>
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
                style={inputTextStyle}
                placeholder="Scanned barcode will appear here"
            />
        </div>
    );
};

export default BarcodeScannerComponent;
