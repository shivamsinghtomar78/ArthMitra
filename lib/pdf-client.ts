"use client"

export async function extractTextFromPdf(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

  const data = new Uint8Array(await file.arrayBuffer())
  const document = await pdfjs.getDocument({
    data,
  }).promise

  const pages: string[] = []

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ")

      pages.push(pageText)
    }
  } finally {
    await document.destroy()
  }

  return pages.join("\n")
}
