import {useAnimate} from "framer-motion";
import {useState} from "react";

export function useFadeToggle() {
  const [scope, animate] = useAnimate();
  const [isAnimating, setIsAnimating] = useState(false);

  const fadeToggle = async () => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);

    await animate(scope.current, { opacity: 1 });
    await animate(scope.current, { opacity: 0 });

    setIsAnimating(false);
  };

  return {
    fadeToggle,
    isAnimating,
    ref: scope
  };
}
