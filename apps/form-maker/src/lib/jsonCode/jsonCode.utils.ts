// Sin mayusculas ni tildes, caracter por caracter: el largo no cambia y las posiciones sirven para
// resaltar.
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
