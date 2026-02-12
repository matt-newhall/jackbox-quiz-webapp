export const handleImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  setProfilePicture: (url: string) => void
) => {
  const file = e.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicture(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
}
