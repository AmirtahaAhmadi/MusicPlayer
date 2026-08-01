import { useEffect, useState } from "react";

const useTheme = () => {
  const [isDarkOn, setIsDarkOn] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.body.style.background = isDarkOn ? "#242424" : "#f7f7f7";
    document.documentElement.classList.toggle("dark", isDarkOn);
    localStorage.setItem("theme", isDarkOn ? "dark" : "light");
  }, [isDarkOn]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const saved = localStorage.getItem("theme");
      if (!saved) setIsDarkOn(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return { isDarkOn, toggle: () => setIsDarkOn((prev) => !prev) };
};

export default useTheme;
