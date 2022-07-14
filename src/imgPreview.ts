import { PixelCrop } from 'react-image-crop'
import { canvasPreview } from './canvasPreview'

let previewUrl = ''

function toBlob(canvas: HTMLCanvasElement): Promise<any> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve)
  })
}

// Returns an image source you should set to state and pass
// `{previewSrc && <img alt="Crop preview" src={previewSrc} />}`
export async function imgPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
) {
  canvasPreview(image, canvas, crop, scale, rotate)

  const blob = await toBlob(canvas)
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl)
  }

  previewUrl = URL.createObjectURL(blob)
  return previewUrl
}
