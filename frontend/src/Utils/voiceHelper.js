let globalFemaleVoice = null;

export const initVoices = (onReady) => {
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;

    const femaleVoiceNames = [
      "Google UK English Female",
      "Microsoft Zira Desktop",
      "Samantha",
      "Karen",
      "Tessa",
      "Fiona",
      "Veena",
      "Victoria"
    ];

    let voice = voices.find(v =>
      femaleVoiceNames.some(name => v.name.includes(name))
    );
    if (!voice) voice = voices[0];

    globalFemaleVoice = voice;
    if (onReady) onReady(voice);
  };

  if (speechSynthesis.getVoices().length > 0) {
    loadVoices();
  } else {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
};

export const getVoice = () => globalFemaleVoice;