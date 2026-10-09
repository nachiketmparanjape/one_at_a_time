export function vibrate(pattern = 15) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function vibrateSuccess() {
  vibrate([10, 30, 10]);
}

export function vibrateDismiss() {
  vibrate(10);
}
