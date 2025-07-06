import { useEffect, useState } from "react";

export default function useGlobalPromo() {
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    fetch("/api/promotions/global/active")
      .then((r) => r.json())
      .then(setPromo)
      .catch(() => setPromo(null));
  }, []);

  return promo;
}
