// Клиентское сжатие и подгонка изображений.
// Любой размер приводится к разумному (макс. сторона = maxSize) и сжимается в WebP,
// чтобы фото красиво отображалось и не перегружало базу.
export async function resizeImageFile(
  file: File,
  maxSize = 1200,
  quality = 0.78
): Promise<string> {
  // SVG — векторный, не растрируем, сохраняем как есть
  if (file.type === 'image/svg+xml') {
    return fileToDataURL(file)
  }

  const dataUrl = await fileToDataURL(file)
  const img = await loadImage(dataUrl)

  let width = img.naturalWidth || img.width
  let height = img.naturalHeight || img.height

  const scale = Math.min(1, maxSize / Math.max(width, height))
  width = Math.round(width * scale)
  height = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl

  // Белый фон на случай прозрачных PNG при экспорте в JPEG
  ctx.drawImage(img, 0, 0, width, height)

  // WebP — компактный формат; если браузер не поддержит, отдаём JPEG
  let out = canvas.toDataURL('image/webp', quality)
  if (!out.startsWith('data:image/webp')) {
    out = canvas.toDataURL('image/jpeg', quality)
  }
  return out
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Не удалось открыть изображение'))
    img.src = src
  })
}
