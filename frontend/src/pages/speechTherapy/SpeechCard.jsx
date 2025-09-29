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

    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    const similarity = matches / b.length;
    return similarity >= 0.8;
  };

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
      cardRef.current.classList.add("speech-therapy-speaking");
      setTimeout(() => cardRef.current?.classList.remove("speech-therapy-speaking"), 1000);
    }
  };

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

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setRecognizedText(transcript);
      setIsListening(false);

      let success = false;
      let message = "";

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
          cardRef.current.classList.add("speech-therapy-success-feedback");
          setTimeout(() => {
            cardRef.current?.classList.remove("speech-therapy-success-feedback");
          }, 800);
        }
      } else {
        message = "Nice try! Let's say it again.";
        success = false;

        setFeedbackMsg(message);
        speak(message);

        if (cardRef.current) {
          cardRef.current.classList.add("speech-therapy-tryagain-feedback");
          setTimeout(() => {
            cardRef.current?.classList.remove("speech-therapy-tryagain-feedback");
          }, 800);
        }
      }

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
        const res = await fetch("http://localhost:5050/api/speech/attempts", {
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
    <div className="speech-therapy-scene">
      <div className={`speech-therapy-card-3d ${isListening ? "speech-therapy-listening" : ""}`} ref={cardRef}>
        <div className="speech-therapy-card-face speech-therapy-card-front">
          <div className="speech-therapy-card-content">
            <h2 className="speech-therapy-card-title">{title}</h2>
            <div className="speech-therapy-image-container">
              <img src={imageUrl} alt={title} className="speech-therapy-image" />
            </div>

            <div className="speech-therapy-controls">
              <button
                onClick={handleSpeak}
                className="speech-therapy-button speech-therapy-speak-btn"
                disabled={!isVoiceReady}
              >
                🔊 {isVoiceReady ? "Listen" : "Loading..."}
              </button>

              <button
                onClick={handleMic}
                className="speech-therapy-button speech-therapy-mic-btn"
                disabled={!isVoiceReady}
              >
                🎤 {isListening ? "Listening..." : "Try Speaking"}
              </button>
            </div>

            <div
              className={`speech-therapy-recognized-wrapper ${recognizedText ? "speech-therapy-show" : ""}`}
            >
              {recognizedText && (
                <div className="speech-therapy-recognized-text">
                  You said: <strong>{recognizedText}</strong>
                  <div className="speech-therapy-feedback-text">{feedbackMsg}</div>
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
