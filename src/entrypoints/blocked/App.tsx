import { useState, useEffect } from "react";
import { Shield, Clock, Focus, Hourglass } from "lucide-react";
import { motion } from "framer-motion";

// Background patterns - abstract shapes that look professional
const backgroundPatterns = [
  "radial-gradient(circle at 50% 50%, var(--primary) 0%, var(--background) 70%)",
  "linear-gradient(135deg, var(--accent) 0%, var(--background) 100%)",
  "radial-gradient(circle at 10% 20%, var(--primary) 0%, var(--background) 80%)",
  "linear-gradient(45deg, var(--secondary) 0%, var(--background) 100%)",
  "radial-gradient(ellipse at bottom, var(--accent) 0%, var(--background) 70%)",
  "linear-gradient(to right, var(--primary) 0%, var(--background) 100%)",
];

// Inspirational quotes about focus and productivity
const quotes = [
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  {
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
  },
  {
    text: "Time is what we want most, but what we use worst.",
    author: "William Penn",
  },
  {
    text: "Until we can manage time, we can manage nothing else.",
    author: "Peter Drucker",
  },
  {
    text: "The bad news is time flies. The good news is you're the pilot.",
    author: "Michael Altshuler",
  },
  {
    text: "Time is the most valuable thing a man can spend.",
    author: "Theophrastus",
  },
];

function App() {
  const [blockedUrl, setBlockedUrl] = useState<string>("");
  const [blockedTime, setBlockedTime] = useState<string>("");
  const [reason, setReason] = useState<string>("This site has been blocked");
  const [backgroundPattern, setBackgroundPattern] = useState<string>("");
  const [quote, setQuote] = useState<{ text: string; author: string }>({
    text: "",
    author: "",
  });

  useEffect(() => {
    // Get the URL that was blocked from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get("url") || "";
    setBlockedUrl(url);

    // Set current time
    const now = new Date();
    setBlockedTime(now.toLocaleTimeString());

    // Try to determine if it was blocked by a specific word or as a whole site
    const blockedWord = urlParams.get("word");
    if (blockedWord) {
      setReason(`This site contains the blocked word: "${blockedWord}"`);
    } else {
      setReason("This site has been blocked by your settings");
    }

    // Set random background pattern
    const randomPatternIndex = Math.floor(
      Math.random() * backgroundPatterns.length
    );
    setBackgroundPattern(backgroundPatterns[randomPatternIndex]);

    // Set random quote
    const randomQuoteIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomQuoteIndex]);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        background: backgroundPattern,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Floating particles for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary/10 rounded-full"
            style={{
              width: Math.random() * 60 + 10,
              height: Math.random() * 60 + 10,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 10 + 10,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="max-w-md w-full bg-card/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-border z-10"
      >
        <div className="bg-gradient-to-r from-primary to-primary/80 p-8 flex items-center justify-center">
          <Shield className="h-16 w-16 text-primary-foreground drop-shadow-md" />
        </div>

        <div className="p-8 space-y-6">
          <motion.h1
            className="text-3xl font-bold text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Access Blocked
          </motion.h1>

          <motion.div
            className="bg-muted/50 backdrop-blur-sm rounded-lg p-5 text-center border border-border/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-muted-foreground mb-3">{reason}</p>
            {blockedUrl && (
              <p className="font-mono text-sm truncate bg-background/50 p-2 rounded">
                {blockedUrl}
              </p>
            )}
          </motion.div>

          <motion.div
            className="flex items-center justify-center text-sm text-muted-foreground gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Clock className="h-4 w-4" />
            <span>Blocked at {blockedTime}</span>
          </motion.div>

          <motion.div
            className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-start gap-3">
              <Focus className="h-5 w-5 text-accent-foreground mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm italic text-foreground/80">
                  "{quote.text}"
                </p>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  — {quote.author}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-muted/30 p-4 text-center text-sm text-muted-foreground border-t border-border/30 flex items-center justify-center gap-2">
          <Hourglass className="h-4 w-4" />
          <p>Site blocked by Vite Time Extension</p>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
