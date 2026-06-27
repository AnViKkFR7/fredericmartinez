import { useState, useRef, useCallback, useEffect } from "react";
import type { RefObject } from "react";

export interface DragCarouselHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export interface UseDragCarouselReturn {
  activeIndex: number;
  snapTo: (index: number) => void;
  handlers: DragCarouselHandlers;
}

export default function useDragCarousel(
  trackRef: RefObject<HTMLDivElement>,
  slideCount: number,
  initialIndex = 0
): UseDragCarouselReturn {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const isDragging = useRef(false);
  const startPointerX = useRef(0);
  const startOffset = useRef(0);
  const currentOffset = useRef(0);

  const getStepWidth = useCallback((): number => {
    const track = trackRef.current;
    if (!track || !track.children.length) return 384;
    const first = track.children[0] as HTMLElement;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap) || 24;
    return first.offsetWidth + gap;
  }, [trackRef]);

  const applyOffset = useCallback((offset: number, animated: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = animated
      ? "transform 0.52s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      : "none";
    track.style.transform = `translateX(${offset}px)`;
    currentOffset.current = offset;
  }, [trackRef]);

  const snapTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(slideCount - 1, index));
      const target = -(clamped * getStepWidth());
      applyOffset(target, true);
      setActiveIndex(clamped);
    },
    [slideCount, getStepWidth, applyOffset]
  );

  // Set initial position after mount
  useEffect(() => {
    if (initialIndex === 0) return;
    const raf = requestAnimationFrame(() => {
      const target = -(initialIndex * getStepWidth());
      applyOffset(target, false);
    });
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const beginDrag = useCallback(
    (pointerX: number) => {
      isDragging.current = true;
      startPointerX.current = pointerX;
      startOffset.current = currentOffset.current;
      applyOffset(currentOffset.current, false);
    },
    [applyOffset]
  );

  const moveDrag = useCallback(
    (pointerX: number) => {
      if (!isDragging.current) return;
      const track = trackRef.current;
      if (!track) return;
      const dx = pointerX - startPointerX.current;
      const step = getStepWidth();
      const maxOffset = 0;
      const minOffset = -(slideCount - 1) * step;
      let next = startOffset.current + dx;
      // Edge resistance
      if (next > maxOffset) next = maxOffset + (next - maxOffset) * 0.22;
      if (next < minOffset) next = minOffset + (next - minOffset) * 0.22;
      currentOffset.current = next;
      track.style.transform = `translateX(${next}px)`;
    },
    [slideCount, getStepWidth, trackRef]
  );

  const endDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const step = getStepWidth();
    const rawIndex = -currentOffset.current / step;
    snapTo(Math.round(rawIndex));
  }, [getStepWidth, snapTo]);

  const handlers: DragCarouselHandlers = {
    onMouseDown: (e) => { e.preventDefault(); beginDrag(e.pageX); },
    onMouseMove: (e) => moveDrag(e.pageX),
    onMouseUp: endDrag,
    onMouseLeave: endDrag,
    onTouchStart: (e) => beginDrag(e.touches[0].pageX),
    onTouchMove: (e) => moveDrag(e.touches[0].pageX),
    onTouchEnd: endDrag,
  };

  return { activeIndex, snapTo, handlers };
}
