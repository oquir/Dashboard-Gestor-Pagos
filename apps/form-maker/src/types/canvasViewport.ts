export interface ViewportInput {
  portWidth: number
  portHeight: number
  zoom: number
  panelsCollapsed: boolean
}

// px del puerto. home*: scroll con el documento centrado y su borde superior a la vista.
export interface ViewportLayout {
  documentWidth: number
  rootWidth: number
  rootMinHeight: number
  paddingTop: number
  paddingBottom: number
  homeLeft: number
  homeTop: number
}
