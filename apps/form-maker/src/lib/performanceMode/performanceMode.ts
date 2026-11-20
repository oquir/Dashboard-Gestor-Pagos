// scrollIntoView con behavior smooth se anima aunque el CSS diga auto: cada llamada pide el
// comportamiento segun el modo.

export function revealScrollBehavior(isLowPerformance: boolean): ScrollBehavior {
  return isLowPerformance ? 'auto' : 'smooth'
}
