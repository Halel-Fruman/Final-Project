import { useEffect, useState } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";

const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false);

  // show when scrolled 400px down
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-5 right-5 z-50 rounded-full bg-primaryColor p-3 shadow-lg
                 text-white hover:bg-secondaryColor transition-transform hover:scale-110"
    >
      <ChevronUpIcon className="w-6 h-6" />
    </button>
  );
};

export default ScrollTopButton;
