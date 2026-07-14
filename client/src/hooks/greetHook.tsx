import { useState, useEffect } from "react";

export function useGreeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    function calculateGreeting() {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning!";
      if (hour < 18) return "Good afternoon!";
      return "Good evening!";
    }

    setGreeting(calculateGreeting());

    const interval = setInterval(() => {
      setGreeting(calculateGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return greeting;
}
