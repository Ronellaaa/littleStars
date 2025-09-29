import a4 from "../../../assets/ac4.png";
import f4 from "../../../assets/happ.mp4";
import a1 from "../../../assets/ac1.png";
import a2 from "../../../assets/ac2.png";
import a3 from "../../../assets/ac3.png";
import a5 from "../../../assets/ac5.png";
import happyLeft from "../../../assets/bg2.png";
import happyRight from "../../../assets/b2.png";
import sadLeft from "../../../assets/bg4.png";
import sadRight from "../../../assets/bg6.png";
import angryLeft from "../../../assets/bg7.png";
import angryRight from "../../../assets/bg5.png";
export const PACKS = {
  happy: {
    theme: "#5cc28a",
    title: "GREEN ZONE — Calm & Happy",
    introLines: [
      "Hey friend! Welcome to the Happy zone! 💚",
      "Here we notice good moments and share smiles.",
      "Ready to try a quick activity and a tiny game?",
    ],
    bgLeft: happyLeft,
    bgRight: happyRight,
    video:f4,
    motivationalVideo: f4,
    askText: "How do you feel?",
    feelings: ["Happy", "Okay", "Sad"],

    items: [
      { id: "h1", label: "Helping a friend", image: a1, correct: true },
      { id: "h2", label: "Dancing", image: a2, correct: true },
      { id: "h3", label: "Breaking toys", image: a3, correct: false },
      { id: "h4", label: "Sharing snack", image: a4, correct: true },
      { id: "h5", label: "Ignoring others", image: a5, correct: false },
    ],
    trophyText: "Yay! You filled the basket with happy choices! 🏆",
    surpriseLine: "You're awesome! Keep shining! ✨",
  },

  sad: {
    theme: "#6aa7e8",
    title: "BLUE ZONE — A Bit Sad",
    introLines: [
      "It's okay to feel sad sometimes. 💙",
      "We can use kind choices to feel a little better.",
      "Let’s try a gentle activity and a tiny game.",
    ],
    bgLeft: sadLeft,
    bgRight: sadRight,
    video: f4,
    motivationalVideo: f4,
    askText: "How do you feel now?",
    feelings: ["Better", "Okay", "Still Sad"],
    items: [
      { id: "s1", label: "Hug a plushie",image: a2, correct: true },
      { id: "s2", label: "Drink water", image: a2, correct: true },
      { id: "s3", label: "Yell at friend",image: a2, correct: false },
      { id: "s4", label: "Talk to a helper", image: a2, correct: true },
      { id: "s5", label: "Throw things", image: a2, correct: false },
    ],
    trophyText: "Nice! Those choices can comfort us. 🏅",
    surpriseLine: "You matter, and your feelings matter. 💫",
  },

  angry: {
    theme: "#f28b62",
    title: "RED ZONE — Feeling Angry",
    introLines: [
      "Anger is a big energy! ❤️‍🔥",
      "We can move it safely and calm down.",
      "Try these smart choices in the game!",
    ],
    bgLeft: angryLeft,
    bgRight: angryRight,
    video: f4,
    motivationalVideo: f4,
    askText: "How do you feel now?",
    feelings: ["Calm", "Okay", "Still Angry"],
    items: [
      { id: "a1", label: "Deep breaths", image: a3, correct: true },
      { id: "a2", label: "Squeeze stress ball", image: a3, correct: true },
      { id: "a3", label: "Push someone", image: a3, correct: false },
      { id: "a4", label: "Count to 10", image: a3, correct: true },
      { id: "a5", label: "Break stuff", image: a3, correct: false },
    ],
    trophyText: "Boom! You used anger-smart choices. 🥇",
    surpriseLine: "Strong AND gentle — that’s you. 💪🌟",
  },
};
