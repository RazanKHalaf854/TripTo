import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { MessageCircle, Send, User, Bot, X, Mic } from 'lucide-react';
import '../Style/TriptoBot.css';

const TriptoBot = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am Tripto AI. How can I help you discover Lebanon today?' }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef(null);
    const silenceTimer = useRef(null);

    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    // نطق الرد آلياً
    const speak = (msg) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    // التمرير التلقائي لآخر رسالة
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // معالجة الطلبات (صوت أو كتابة)
    const processRequest = async (text, isVoice = false) => {
        if (!text.trim() || isProcessing) return;

        if (!isVoice) {
            setMessages(prev => [...prev, { role: 'user', text }]);
            setInput('');
        } else {
            setMessages(prev => [...prev, { role: 'user', text: ` ${text}` }]);
        }

        setIsProcessing(true);

        try {
            // استدعاء الـ API الموحد
            const res = await axios.post("http://localhost:5000/api/tripto-combined", { 
                question: text.toLowerCase() 
            });
            
            const { reply, action, path } = res.data;

            setMessages(prev => [...prev, { role: 'bot', text: reply }]);
            if (isVoice) speak(reply);

            if (action === 'NAVIGATE') {
                setTimeout(() => {
                    navigate(path);
                    setIsOpen(false); 
                }, 2000);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting." }]);
        } finally {
            setIsProcessing(false);
            resetTranscript();
        }
    };

    // مراقبة الصمت لإرسال الطلب صوتياً
    useEffect(() => {
        if (!transcript.trim() || isProcessing) return;
        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        silenceTimer.current = setTimeout(() => {
            if (listening) {
                SpeechRecognition.stopListening();
                processRequest(transcript, true);
            }
        }, 1500);

        return () => clearTimeout(silenceTimer.current);
    }, [transcript, listening]);

    const handleToggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        }
    };

    if (!browserSupportsSpeechRecognition) return null;

    return (
        <div className="bot-fixed-container">
            {!isOpen && (
                <button className="bot-toggle-launcher shadow-chic" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={30} color="white" />
                </button>
            )}

            {isOpen && (
                <div className="chat-window shadow-chic">
                    <div className="chat-header">
                        <div className="bot-info">
                            <div className={`online-dot ${listening ? 'mic-active' : ''}`}></div>
                            <span>Tripto AI Assistant</span>
                        </div>
                        <button className="close-bot-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} color="white" />
                        </button>
                    </div>

                    <div className="chat-messages" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`message-wrapper ${m.role}`}>
                                <div className="icon-circle">
                                    {m.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="message-text">{m.text}</div>
                            </div>
                        ))}
                        {listening && <div className="transcript-preview">{transcript}...</div>}
                    </div>

                    <div className="chat-input-area">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            onKeyPress={(e) => e.key === 'Enter' && processRequest(input, false)}
                            disabled={listening}
                        />
                        
                        <button 
                            className={`mic-icon-btn ${listening ? 'is-listening' : ''}`} 
                            onClick={handleToggleListening}
                        >
                            <Mic size={20} />
                            {listening && <span className="pulse-ring"></span>}
                        </button>

                        <button className="send-btn-chic" onClick={() => processRequest(input, false)}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TriptoBot;