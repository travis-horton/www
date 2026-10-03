import { useEffect, useState } from 'react';

/**
 * The time, as a Date that is replaced once per drawn frame.
 *
 * This is an ANALOG face's clock (Travis, 26.0905). A swept hand needs a
 * position per frame, not per tick; driving it off the page's tick would move
 * it in 1.85-second jumps no matter what the geometry said. Kept separate
 * rather than raising the tick rate, so the digits go on stepping.
 * requestAnimationFrame also stops on a hidden tab for free, which a timer
 * does not.
 *
 * Each face calls this itself, so a new frame re-renders that face and nothing
 * around it. The loop used to live in the page root and hand the Date down,
 * which re-rendered the whole page, prose and all, on every frame.
 *
 * The cleanup cancels the LATEST frame: `id` is reassigned on every draw, so
 * by the time the face unmounts it names the one request still pending.
 */
function useAnimationFrameDate() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let id;
    const draw = () => {
      setNow(new Date());
      id = window.requestAnimationFrame(draw);
    };
    id = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(id);
  }, []);

  return now;
}

export default useAnimationFrameDate;
