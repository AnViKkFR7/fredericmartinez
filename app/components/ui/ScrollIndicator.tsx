// app/components/ui/ScrollIndicator.tsx
import { useEffect, useState } from "react";
import "~/styles/ScrollIndicator.css";

const LOTTIE_SCRIPT_SRC =
  "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js";
const DEFAULT_LOTTIE_SRC =
  "https://lottie.host/c643c8e5-e5f4-46a7-8d02-109d8a26279c/c5ORMo5Y7z.lottie";

let scriptPromise: Promise<void> | null = null;

function loadDotLottieScript() {
  if (customElements.get("dotlottie-wc")) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "module";
      script.src = LOTTIE_SCRIPT_SRC;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

interface ScrollIndicatorProps {
  lottieSrc?: string;
  hideThreshold?: number;
  className?: string;
}

export default function ScrollIndicator({
  lottieSrc = DEFAULT_LOTTIE_SRC,
  hideThreshold = 32,
  className = "",
}: ScrollIndicatorProps) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    loadDotLottieScript().then(() => setReady(true));
  }, []);

  useEffect(() => {
    let ticking = false;

    function update() {
      setVisible(window.scrollY <= hideThreshold);
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideThreshold]);

  if (!ready) return null;

  return (
    <div
      className={`scroll-indicator ${visible ? "scroll-indicator--visible" : ""} ${className}`}
      aria-hidden="true"
    >
      <dotlottie-wc src={lottieSrc} autoplay loop />
    </div>
  );
}