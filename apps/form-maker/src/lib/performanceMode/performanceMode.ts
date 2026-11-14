// Lo del modo de bajo rendimiento que la clase de index.css no alcanza. Un scrollIntoView que pide
// behavior: 'smooth' en JS se anima igual aunque el CSS diga scroll-behavior: auto, asi que cada
// llamada tiene que pedir el comportamiento segun el modo.

export function revealScrollBehavior(isLowPerformance: boolean): ScrollBehavior {
  return isLowPerformance ? 'auto' : 'smooth'
}
