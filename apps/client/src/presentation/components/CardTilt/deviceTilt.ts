import type { CardTiltValues } from './CardTiltValues';
import { DeviceMotion, type DeviceMotionMeasurement } from 'expo-sensors';
import { useEffect } from 'react';
import { makeMutable, withTiming } from 'react-native-reanimated';

/** Device rotation (radians) that maps to a full card tilt. */
const FULL_TILT_RAD = 0.35;
/** Share of the gap to the current orientation the neutral position recovers per update. */
const RECENTER_FACTOR = 0.02;
const UPDATE_INTERVAL_MS = 33;

const tilt: CardTiltValues = { x: makeMutable(0), y: makeMutable(0) };

let subscribers = 0;
let subscription: { remove: () => void } | null = null;
let neutral: { beta: number; gamma: number } | null = null;

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

/** Converts a device rotation delta to screen axes, depending on the screen orientation. */
function toScreenAxes(dGamma: number, dBeta: number, orientation: number): [number, number] {
  switch (orientation) {
    case 90:
      return [dBeta, -dGamma];
    case -90:
      return [-dBeta, dGamma];
    case 180:
      return [-dGamma, -dBeta];
    default:
      return [dGamma, dBeta];
  }
}

function handleMotion({ rotation, orientation }: DeviceMotionMeasurement) {
  if (!rotation) return;
  const { beta, gamma } = rotation;
  // The neutral position slowly follows the way the device is held, so only movements tilt cards.
  neutral ??= { beta, gamma };
  neutral = {
    beta: neutral.beta + (beta - neutral.beta) * RECENTER_FACTOR,
    gamma: neutral.gamma + (gamma - neutral.gamma) * RECENTER_FACTOR,
  };
  const [dx, dy] = toScreenAxes(gamma - neutral.gamma, beta - neutral.beta, orientation);
  tilt.x.value = withTiming(clamp(dx / FULL_TILT_RAD), { duration: UPDATE_INTERVAL_MS });
  tilt.y.value = withTiming(clamp(dy / FULL_TILT_RAD), { duration: UPDATE_INTERVAL_MS });
}

async function start() {
  if (!(await DeviceMotion.isAvailableAsync())) return;
  // Mounted cards may all have unmounted while the availability check was pending.
  if (subscribers === 0 || subscription) return;
  DeviceMotion.setUpdateInterval(UPDATE_INTERVAL_MS);
  subscription = DeviceMotion.addListener(handleMotion);
}

function stop() {
  subscription?.remove();
  subscription = null;
  neutral = null;
  tilt.x.value = withTiming(0);
  tilt.y.value = withTiming(0);
}

/**
 * Device orientation as a normalized tilt, shared by every card. The motion sensor only runs
 * while at least one component uses this hook with `enabled`.
 */
export function useDeviceTilt(enabled: boolean): CardTiltValues {
  useEffect(() => {
    if (!enabled) return;
    subscribers += 1;
    if (subscribers === 1) void start();
    return () => {
      subscribers -= 1;
      if (subscribers === 0) stop();
    };
  }, [enabled]);

  return tilt;
}
