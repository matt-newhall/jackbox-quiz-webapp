const generateCharacter = () => {
  const numberCharCodes = [...Array(10).keys()].map(x => 48 + x)
  const characterCharCodes = [...Array(26).keys()].map(x => 65 + x)

  const possibleValues = [...numberCharCodes, ...characterCharCodes]

  const charIndex = possibleValues[Math.floor(possibleValues.length * Math.random())]

  return String.fromCharCode(charIndex)
}

export const generateRoomCode = (length: number = 4) => {
  const roomCode = Array.from({ length }, generateCharacter).join('')
  return roomCode
}
