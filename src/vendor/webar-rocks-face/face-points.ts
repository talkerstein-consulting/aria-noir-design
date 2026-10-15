/**
 * The mean face the head pose is solved against: 3D positions on
 * dev/face.obj for each landmark the network outputs (MIT, WebAR.rocks).
 *
 * Copied from the MAIN helper, helpers/WebARRocksFaceThreeHelper.js at
 * commit 819cdbad, not from the React demo's copy we vendor beside it. The
 * React copy still carries the older table; the main one was recalibrated
 * (ears at +-70 rather than +-77, outer eye corners at [42, 34, 38] rather
 * than [46, 37.9, 38], earrings at +-75, a higher nose tip) and gained
 * temple and chin points. It is the table upstream's own glasses demo uses.
 *
 * Passed to the helper as `solvePnPObjPointsPositions`, which replaces its
 * built-in defaults, so the vendored file itself stays unmodified.
 */
export const FACE_POINTS: Record<string, [number, number, number]> = {
  leftEyeCtr: [33.7, 37.9, 45.9],
  rightEyeCtr: [-33.7, 37.9, 45.9],

  leftEyeInt: [16, 36, 40],
  rightEyeInt: [-16, 36, 40],

  leftEyeExt: [42, 34, 38],
  rightEyeExt: [-42, 34, 38],

  leftEyeBot: [33, 31, 45],
  rightEyeBot: [-33, 31, 45],

  leftEarBottom: [70, -18.6, -18],
  rightEarBottom: [-70, -18.6, -18],

  leftEarEarring: [75, -37, -24.8],
  rightEarEarring: [-75, -37, -24.8],

  noseLeft: [21, -0.1, 67],
  noseRight: [-21, -0.1, 67],

  noseBottom: [0, -0.6, 82],
  noseOuter: [0, 16, 93],

  mouthLeft: [27, -29.9, 70.8],
  mouthRight: [-27, -29.9, 70.8],

  upperLipBot: [0, -24, 83.5],
  upperLipTop: [0, -17.2, 86.3],
  lowerLipTop: [0, -26, 84.3],
  lowerLipBot: [0, -34, 89.6],

  leftEyeBrowInt: [15, 55.4, 51.2],
  rightEyeBrowInt: [-15, 55.4, 51.2],

  templeTopRight: [-66, 39, 11.5],
  templeTopLeft: [66, 39, 11.5],
  templeBotRight: [-69.5, 7, 21],
  templeBotLeft: [69.5, 7, 21],

  chin: [0, -71, 91],
  chinTop: [0, -60, 95],
  chinLeft: [31, -60, 76],
  chinRight: [-31, -60, 76],
};
