/** Only what the try-on calls. See README. */
declare const WEBARROCKSFACE: {
  toggle_pause(isPause: boolean, isStopVideoStream?: boolean): void;
  capture_image(isFlip?: boolean): HTMLCanvasElement;
  destroy(): Promise<void>;
  resize(): void;
};
export default WEBARROCKSFACE;
