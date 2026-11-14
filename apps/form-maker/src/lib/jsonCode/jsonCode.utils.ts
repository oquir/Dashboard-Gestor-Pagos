// Pliega el texto para buscar sin distinguir mayusculas ni tildes ("ano" encuentra "Año").
//
// Se pliega caracter por caracter y cada uno queda de un solo caracter, asi el texto plegado mide
// lo mismo que el original y las posiciones de lo encontrado sirven tal cual para resaltar el texto
// real. Un normalize('NFD') de la cadena entera separaria cada tilde en su propio caracter y
// correria todas las posiciones de ahi en adelante.
export function foldSearchText(text: string): string {
  let folded: string = ''

  for (let i = 0; i < text.length; i++) {
    const code: number = text.charCodeAt(i)

    // ASCII es casi todo el JSON: el atajo evita un normalize por caracter.
    if (code < 128) {
      folded += code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : text.charAt(i)
    } else {
      folded += text.charAt(i).normalize('NFD').charAt(0).toLowerCase().charAt(0)
    }
  }

  return folded
}
