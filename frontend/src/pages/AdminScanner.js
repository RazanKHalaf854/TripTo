import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';
import '../Style/AdminScanner.css';

const AdminScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);

    const speakMessage = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    // دالة لتشغيل السكنر
    const startScanner = () => {
        // التأكد من تنظيف الحاوية تماماً قبل البدء
        const container = document.getElementById('reader');
        if (container) container.innerHTML = "";

        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            rememberLastUsedCamera: true
        });

        scanner.render(handleCheckIn, (err) => { /* ignore */ });
        scannerRef.current = scanner;
    };

    // دالة لإيقاف السكنر
    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.clear();
                scannerRef.current = null;
            } catch (err) {
                console.error("Stop error:", err);
            }
        }
    };

    useEffect(() => {
        // نشغل الكاميرا فقط إذا ما في نتيجة ولا في تحميل
        if (!scanResult && !loading) {
            // ننتظر تكة صغيرة عشان نتأكد إن الـ DOM رسم الـ div
            const timer = setTimeout(() => {
                startScanner();
            }, 100);
            return () => {
                clearTimeout(timer);
                stopScanner();
            };
        }
    }, [scanResult, loading]);

    const handleCheckIn = async (token) => {
        if (loading) return;
        setLoading(true);
        
        // نوقف السكنر فوراً عشان الكاميرا ما تضل شغالة بالخلفية
        await stopScanner();
        
        try {
            const res = await axios.post("http://localhost:5000/api/check-in", { qr_token: token });
            if (res.data.success) {
                setScanResult({ success: true, aiMessage: res.data.aiMessage });
                speakMessage(res.data.aiMessage);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Verification Failed";
            setScanResult({ success: false, message: errorMessage, isWarning: err.response?.status === 400 });
            speakMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="scanner-page">
            <div className="scanner-header">
                <Sparkles className="ai-icon" />
                <h1>Tripto <span className="highlight">AI Security</span></h1>
            </div>

            <div className="scanner-container">
                {/* الحاوية تظهر فقط عند عدم وجود نتيجة أو تحميل */}
                {!scanResult && !loading && (
                    <div id="reader" style={{ width: '100%' }}></div>
                )}
                
                {loading && (
                    <div className="loading-state">
                        <div className="ai-loader"></div>
                        <p>Tripto AI is verifying...</p>
                    </div>
                )}

                {scanResult && (
                    <div className={`result-card ${scanResult.success ? 'success' : 'error'} animate-in`}>
                        {scanResult.success ? <CheckCircle size={60} color="#1aa260" /> : <ShieldAlert size={60} color="#ef4444" />}
                        <h3>{scanResult.success ? "Entry Confirmed" : "Access Denied"}</h3>
                        <p className="res-msg">{scanResult.success ? scanResult.aiMessage : scanResult.message}</p>
                        <button className="reset-btn" onClick={() => setScanResult(null)}>
                            Scan Next Ticket
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminScanner;