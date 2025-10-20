import React, { useState, useRef, useEffect } from "react";
import { getVoice } from "../../Utils/voiceHelper";
import "../../styles/speechTherapyStyles/SpeechCard.css";

const SpeechCard = ({ title, imageUrl, childId = "child123", category }) => {
  const [recognizedText, setRecognizedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const cardRef = useRef(null);

  // Simple forgiving similarity function
  const isCloseMatch = (spoken, target) => { // Check if spoken text closely matches target
    if (!spoken || !target) return false; // Handle empty inputs
    const a = spoken.toLowerCase().trim(); // Normalize case and trim whitespace
    const b = target.toLowerCase().trim(); // Normalize case and trim whitespace
    if (a === b) return true; // Exact match
    if (a.includes(b)) return true; // Substring match

    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) { // Count character matches
      if (a[i] === b[i]) matches++; // Increment for each matching character
    }
    const similarity = matches / b.length; // Calculate similarity ratio
    return similarity >= 0.8; // Consider a match if 80% similar
  };

  useEffect(() => {
    const voice = getVoice(); // Get the desired voice
    if (voice) setIsVoiceReady(true); // If voice is ready, update state
    else {
      const interval = setInterval(() => { // Poll every 200ms if voice is not ready
        const v = getVoice(); // Try to get the voice again
        if (v) {
          setIsVoiceReady(true); // Update state if voice is found
          clearInterval(interval); // Clear the interval
        }
      }, 200); // Polling interval
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, []); // Run once on mount

  const speak = (text, onEnd) => { // Function to speak text using Web Speech API
    const voice = getVoice(); // Get the desired voice
    if (!voice) return; // Exit if voice is not available
    speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text); // Create a new utterance with the text
    utterance.lang = "en-US"; // Set language
    utterance.rate = 0.9; // Slightly slower rate for clarity
    utterance.pitch = 1.1; // Slightly higher pitch for engagement
    utterance.volume = 0.9; // Slightly lower volume
    utterance.voice = voice; // Assign the selected voice
    if (onEnd) utterance.onend = onEnd; // Set callback for when speech ends if provided

    speechSynthesis.speak(utterance); // Speak the utterance
  };

  const handleSpeak = () => {
    if (!isVoiceReady) return; // Exit if voice is not ready

    const shouldEncourage = Math.random() > 0.7; // 30% chance to add encouragement
    if (shouldEncourage) { //if encouragement is to be added
      const encouragements = ["Great job!", "Well done!", "You're amazing!"];
      const msg =
        encouragements[Math.floor(Math.random() * encouragements.length)]; // Pick a random encouragement
      speak(title, () => speak(msg)); // Speak title then encouragement
    } else {
      speak(title); // Just speak the title if no encouragement
    }

    if (cardRef.current) { // Add speaking animation
      cardRef.current.classList.add("speech-therapy-speaking");
      setTimeout(() => cardRef.current?.classList.remove("speech-therapy-speaking"), 1000); // Remove after 1 second
    }
  };

  const handleMic = () => { // Handle microphone button click
    if (!isVoiceReady) return; // Exit if voice is not ready

    // Check for browser support
    const SpeechRecognition = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Sorry, voice recognition is not supported in this browser.");
      alert("Try in Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition(); // Create a new recognition instance
    recognition.lang = "en-US"; // Set language
    recognition.continuous = false; // Single result

    speak("Please say the word now");
    setTimeout(() => { // Start listening after prompt
      recognition.start(); // Start the recognition
      setIsListening(true); // Update state to show listening
    }, 1500); // Wait for the prompt to finish

    recognition.onresult = async (event) => { // Handle the recognition result
      const transcript = event.results[0][0].transcript.toLowerCase().trim(); // Get the recognized text
      setRecognizedText(transcript); // Update state to show recognized text
      setIsListening(false); // Stop listening state

      let success = false; // Initialize success flag
      let message = ""; // Initialize feedback message

      if (isCloseMatch(transcript, title)) { // Check if the spoken text matches the card title
        const encouragements = [
          "Great job!",
          "Well done!",
          "You said it perfectly!",
          "Fantastic!"
        ];
        message =
          encouragements[Math.floor(Math.random() * encouragements.length)];
        success = true;

        setFeedbackMsg(message); // Update feedback message state
        speak(message); // Speak the encouragement

        if (cardRef.current) { // Add success animation
          cardRef.current.classList.add("speech-therapy-success-feedback");
          setTimeout(() => {
            cardRef.current?.classList.remove("speech-therapy-success-feedback");
          }, 800);
        }
      } else {
        message = "Nice try! Let's say it again, shall we?"; // Feedback for incorrect attempt
        success = false; // Mark attempt as unsuccessful

        setFeedbackMsg(message); // Update feedback message state
        speak(message); // Speak the feedback

        if (cardRef.current) { // Add try again animation
          cardRef.current.classList.add("speech-therapy-tryagain-feedback");
          setTimeout(() => {
            cardRef.current?.classList.remove("speech-therapy-tryagain-feedback");
          }, 800);
        }
      }

      const attemptData = { // Prepare data to log the attempt
        childId, // Assuming a fixed childId for demo
        category, 
        cardTitle: title, // Title of the card
        imageUrl,
        transcript,
        success, // Mark attempt as successful or not
        feedbackMsg: message, // Feedback message
        createdAt: new Date().toISOString(), // Log the current timestamp
      };

      try {
        const res = await fetch("http://localhost:5000/api/speech/attempts", { // Send attempt data to backend
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attemptData), // Convert data to JSON
        });
        const data = await res.json(); // Parse the JSON response
        console.log("Attempt saved:", data); // Log success message
      } catch (err) {
        console.error("Failed to save attempt:", err);
      }
    };

    recognition.onerror = (event) => { // Handle recognition errors
      setIsListening(false); // Stop listening state
      if (event.error === "no-speech") // If no speech detected
        speak("I didn’t hear anything. Please try again.");
    };

    recognition.onend = () => setIsListening(false); // Ensure listening state is reset on end
  };

  return (
    <div className="speech-therapy-scene">
      <div className={`speech-therapy-card-3d ${isListening ? "speech-therapy-listening" : ""}`} ref={cardRef}> {/* Add listening class if active */}
        <div className="speech-therapy-card-face speech-therapy-card-front">
          <div className="speech-therapy-card-content">
            <h2 className="speech-therapy-card-title">{title}</h2>
            <div className="speech-therapy-image-container">
              <img src={imageUrl} alt={title} className="speech-therapy-image" />
            </div>

            <div className="speech-therapy-controls"> {/* Buttons container */}
              <button
                onClick={handleSpeak} // Handle speak button click
                className="speech-therapy-button speech-therapy-speak-btn"
                disabled={!isVoiceReady} // Disable if voice not ready
              >
                🔊 {isVoiceReady ? "Listen" : "Loading..."} {/*If voice is ready, show "Listen", else show "Loading..."*/}
              </button>

              <button
                onClick={handleMic} // Handle mic button click
                className="speech-therapy-button speech-therapy-mic-btn"
                disabled={!isVoiceReady} // Disable if voice not ready
              >
                🎤 {isListening ? "Listening..." : "Try Speaking"} {/* If listening, show "Listening...", else show "Try Speaking" */}
              </button>
            </div>

            {/* Show recognized text and feedback if available */}
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
