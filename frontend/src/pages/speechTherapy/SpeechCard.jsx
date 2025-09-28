import React, { useState, useRef, useEffect } from "react";
import { getVoice } from "../../Utils/voiceHelper";
import "../../styles/speechTherapyStyles/SpeechCard.css";

const SpeechCard = ({ title, imageUrl, childId = "child123", category }) => {
  const [recognizedText, setRecognizedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const cardRef = useRef(null);

  // ✅ Simple forgiving similarity function
  const isCloseMatch = (spoken, target) => {
    if (!spoken || !target) return false;
    const a = spoken.toLowerCase().trim();
    const b = target.toLowerCase().trim();
    if (a === b) return true;
    if (a.includes(b)) return true;

    // Check character by character similarity
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    const similarity = matches / b.length;
    return similarity >= 0.8; // good enough if 80% correct
  };

  // 🎤 Check if voices are ready when card mounts
  useEffect(() => {
    const voice = getVoice();
    if (voice) setIsVoiceReady(true);
    else {
      const interval = setInterval(() => {
        const v = getVoice();
        if (v) {
          setIsVoiceReady(true);
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  // Centralized speak function
  const speak = (text, onEnd) => {
    const voice = getVoice();
    if (!voice) return;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    utterance.voice = voice;
    if (onEnd) utterance.onend = onEnd;

    speechSynthesis.speak(utterance);
  };

  // 🔊 Handle Listen button
  const handleSpeak = () => {
    if (!isVoiceReady) return;

    const shouldEncourage = Math.random() > 0.7;
    if (shouldEncourage) {
      const encouragements = ["Great job!", "Well done!", "You're amazing!"];
      const msg =
        encouragements[Math.floor(Math.random() * encouragements.length)];
      speak(title, () => speak(msg));
    } else {
      speak(title);
    }

    if (cardRef.current) {
      cardRef.current.classList.add("speaking");
      setTimeout(() => cardRef.current?.classList.remove("speaking"), 1000);
    }
  };

  // 🎤 Handle Mic button
  const handleMic = () => {
    if (!isVoiceReady) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Sorry, voice recognition is not supported in this browser.");
      alert("Try in Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    speak("Please say the word now");
    setTimeout(() => {
      recognition.start();
      setIsListening(true);
    }, 1500);

    // ✅ async so we can use await inside
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setRecognizedText(transcript);
      setIsListening(false);

      let success = false;
      let message = "";

      // ✅ Use forgiving matcher
      if (isCloseMatch(transcript, title)) {
        const encouragements = [
          "Great job!",
          "Well done!",
          "You said it perfectly!",
          "Fantastic!"
        ];
        message =
          encouragements[Math.floor(Math.random() * encouragements.length)];
        success = true;

        setFeedbackMsg(message);
        speak(message);

        if (cardRef.current) {
          cardRef.current.classList.add("success-feedback");
          setTimeout(() => {
            cardRef.current?.classList.remove("success-feedback");
          }, 800);
        }
      } else {
        message = "Nice try! Let's say it again.";
        success = false;

        setFeedbackMsg(message);
        speak(message);

        if (cardRef.current) {
          cardRef.current.classList.add("tryagain-feedback");
          setTimeout(() => {
            cardRef.current?.classList.remove("tryagain-feedback");
          }, 800);
        }
      }

      // 📡 Send attempt data to backend
      const attemptData = {
        childId,
        category,
        cardTitle: title,
        imageUrl,
        transcript,
        success,
        feedbackMsg: message,
        createdAt: new Date().toISOString(),
      };

      try {
        const res = await fetch("http://localhost:5000/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attemptData),
        });
        const data = await res.json();
        console.log("Attempt saved:", data);
      } catch (err) {
        console.error("Failed to save attempt:", err);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "no-speech")
        speak("I didn’t hear anything. Please try again.");
    };

    recognition.onend = () => setIsListening(false);
  };

  return (
    <div className="scene">
      <div className={`card-3d ${isListening ? "listening" : ""}`} ref={cardRef}>
        <div className="card-face card-front">
          <div className="card-content">
            <h2 className="card-title">{title}</h2>
            <div className="image-container">
              <img src={imageUrl} alt={title} className="image" />
            </div>

            <div className="controls">
              <button
                onClick={handleSpeak}
                className="button speak-btn"
                disabled={!isVoiceReady}
              >
                🔊 {isVoiceReady ? "Listen" : "Loading..."}
              </button>

              <button
                onClick={handleMic}
                className="button mic-btn"
                disabled={!isVoiceReady}
              >
                🎤 {isListening ? "Listening..." : "Try Speaking"}
              </button>
            </div>

            {/* ✅ Smooth expanding block for recognized text + feedback */}
            <div
              className={`recognized-wrapper ${recognizedText ? "show" : ""}`}
            >
              {recognizedText && (
                <div className="recognized-text">
                  You said: <strong>{recognizedText}</strong>
                  <div className="feedback-text">{feedbackMsg}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechCard;