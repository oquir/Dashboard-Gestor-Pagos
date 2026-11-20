// Lo que queda en cycle no entra en order: el simulador avisa en vez de dar un cero que parece
// bueno.
export interface DerivedPlan {
  order: string[]
  cycle: string[] | null
}
