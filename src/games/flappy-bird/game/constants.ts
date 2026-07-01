/** All tunable values for Flappy Bird. Tune here first before touching logic. */

/** Logical play resolution. The canvas is scaled to fit the window while
 *  keeping this aspect ratio, so all physics below live in these units. */
export const VIEW_WIDTH = 480;
export const VIEW_HEIGHT = 720;

/** Height of the scrolling ground strip along the bottom (view units). */
export const GROUND_HEIGHT = 96;

// --- Bird ---
export const BIRD_X = VIEW_WIDTH * 0.3;
export const BIRD_RADIUS = 17;
/** Downward acceleration, units/s². */
export const GRAVITY = 1900;
/** Instant upward velocity applied on a flap, units/s (negative = up). */
export const FLAP_VELOCITY = -560;
/** Velocity used to map the bird's tilt angle (units/s -> radians). */
export const MAX_FALL_TILT_SPEED = 700;
export const TILT_UP = -0.5; // radians when flapping/rising
export const TILT_DOWN = 1.4; // radians at terminal-ish fall

// --- Pipes ---
export const PIPE_WIDTH = 76;
/** Vertical opening the bird must fly through. */
export const PIPE_GAP = 190;
/** Horizontal scroll speed of pipes, units/s. */
export const PIPE_SPEED = 190;
/** Horizontal distance between consecutive pipe pairs. */
export const PIPE_SPACING = 260;
/** Minimum margin between a gap edge and the top/ground when placing a gap. */
export const PIPE_MARGIN = 70;

// --- Feel ---
/** Max simulated dt per frame (s) so a hitch/tab-switch can't teleport the bird. */
export const MAX_DT = 0.032;
