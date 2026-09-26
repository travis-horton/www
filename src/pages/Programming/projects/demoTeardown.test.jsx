import React from 'react';
import { render, fireEvent } from '@testing-library/react';
// Imported one by one: the projects index also pulls in the seximal clock,
// which this test does not need.
import { Asteroids } from './Asteroids';
import { Orbitz } from './Orbitz';
import { PerlinNoise } from './PerlinNoise';
import { PolygonRace } from './PolygonRace';

// The four canvas demos run animation loops and (Asteroids) keyboard
// listeners. These tests prove that leaving a demo's page stops all of it:
// no animation frame still queued, no timer still ticking, no listener left
// on window, and pressing "r" elsewhere no longer restarts an unseen game.

// jsdom has no canvas; give every canvas a do-nothing 2D context.
const fakeContext = (canvas) =>
  new Proxy(
    { canvas },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (prop === 'getImageData') {
          return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
        }
        return () => {};
      },
      set() {
        return true;
      },
    },
  );

let frames; // id -> callback, the animation frames still queued
let nextFrameId;
let listeners; // "type" -> Set of handlers currently on window
const realAdd = window.addEventListener;
const realRemove = window.removeEventListener;

beforeEach(() => {
  jest.useFakeTimers();
  frames = new Map();
  nextFrameId = 1;
  listeners = new Map();

  jest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(function getContext() {
      return fakeContext(this);
    });
  window.requestAnimationFrame = (cb) => {
    const id = nextFrameId;
    nextFrameId += 1;
    frames.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    frames.delete(id);
  };
  window.addEventListener = function add(type, fn, opts) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(fn);
    return realAdd.call(this, type, fn, opts);
  };
  window.removeEventListener = function remove(type, fn, opts) {
    if (listeners.has(type)) listeners.get(type).delete(fn);
    return realRemove.call(this, type, fn, opts);
  };
  localStorage.clear();
});

afterEach(() => {
  window.addEventListener = realAdd;
  window.removeEventListener = realRemove;
  jest.restoreAllMocks();
  jest.useRealTimers();
});

// Run every queued frame once (each may queue its next one), n times over.
const runFrames = (n) => {
  for (let i = 0; i < n; i += 1) {
    const due = [...frames.entries()];
    frames.clear();
    due.forEach(([, cb]) => cb(performance.now()));
  }
};

const windowListenerCount = () =>
  [...listeners.values()].reduce((sum, set) => sum + set.size, 0);

const demos = { Asteroids, Orbitz, PerlinNoise, PolygonRace };

describe.each(Object.entries(demos))('%s', (name, Demo) => {
  test('runs while its page is open', () => {
    const { container, unmount } = render(<Demo />);
    runFrames(3);
    jest.advanceTimersByTime(100);
    const running = frames.size + jest.getTimerCount();
    expect(running).toBeGreaterThan(0);
    expect(container.querySelectorAll('canvas').length).toBeGreaterThan(0);
    unmount();
  });

  test('leaves nothing running after its page closes, even after 5 visits', () => {
    for (let visit = 0; visit < 5; visit += 1) {
      const { unmount } = render(<Demo />);
      runFrames(3);
      jest.advanceTimersByTime(100);
      unmount();
    }
    expect(frames.size).toBe(0);
    expect(jest.getTimerCount()).toBe(0);
    expect(windowListenerCount()).toBe(0);
    // Nothing comes back to life on its own afterwards.
    runFrames(3);
    jest.advanceTimersByTime(1000);
    expect(frames.size).toBe(0);
  });
});

test('after leaving Asteroids, "r" on another page does not restart the game', () => {
  const { unmount } = render(<Asteroids />);
  runFrames(2);
  unmount();
  const contextCalls = HTMLCanvasElement.prototype.getContext.mock.calls.length;

  fireEvent.keyPress(window, { key: 'r', code: 'KeyR', charCode: 114 });
  fireEvent.keyDown(window, { key: 'ArrowUp', keyCode: 38 });

  expect(frames.size).toBe(0);
  expect(HTMLCanvasElement.prototype.getContext.mock.calls.length).toBe(
    contextCalls,
  );
});

test('while Asteroids is open, "r" still restarts it', () => {
  const { unmount } = render(<Asteroids />);
  const before = nextFrameId;
  fireEvent.keyPress(window, { key: 'r', code: 'KeyR', charCode: 114 });
  expect(nextFrameId).toBeGreaterThan(before); // a new game queued a frame
  expect(frames.size).toBe(1); // and the old game's frame was cancelled
  unmount();
  expect(frames.size).toBe(0);
});
