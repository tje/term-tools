/**
 * Character sets for progress bars. Must contain a minimum of 3 characters
 * each: the first and last characters represent filled/empty segments
 * (respectively), while anything in between is treated as a middle gradient
 */
export const PROGRESS_BAR = {
  SHADED: '█▓▒░ ',
  FINE: '█▉▊▋▌▍▎▏ ',
  PIPS: '■▪· ',
  BARS: '█▇▆▅▄▃▂▁ ',
}

/**
 * Character sets for spinners. These are stepped through from left to right,
 * wrapping back around to the front.
 */
export const PROGRESS_SPIN = {
  BASIC: '-╲\\|/╱',
  TWO_DOTS: '⡈⠔⠢⢁',
  BRAILLE_LINEAR: '⣠⣄⡆⠇⠋⠙⠸⢰',
  QUADS: '▖▌▛█▜▐▗ ',
}

/**
 * Character sets for graphs. Characters that can fit two values into on space
 * (braille) should include an array of strings for each character combination.
 */
export const GRAPH = {
  BRAILLE: [
    '⠀⢀⢠⢰⢸',
    '⡀⣀⣠⣰⣸',
    '⡄⣄⣤⣴⣼',
    '⡆⣆⣦⣶⣾',
    '⡇⣇⣧⣷⣿',
  ],
  BRAILLE_FLIPPED: [
    '⠀⠈⠘⠸⢸',
    '⠁⠉⠙⠹⢹',
    '⠃⠋⠛⠻⢻',
    '⠇⠏⠟⠿⢿',
    '⡇⡏⡟⡿⣿',
  ],
  BAR: [
    ' ▁▂▃▄▅▆▇█',
  ],
}
