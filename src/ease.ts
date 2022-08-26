type FnEase = (x: number) => number

export const EASING = {
  LINEAR: (x: number) => x,
  CUBIC_IN_OUT: (x: number) => x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2,
  CUBIC_OUT: (x: number) => 1 - ((1 - x) ** 3),
  CUBIC_IN: (x: number) => x ** 3,
} as const
