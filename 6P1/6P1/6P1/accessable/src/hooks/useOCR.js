import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { getDocument } from 'pdfjs-dist';

export const useOCR = (language = 'eng') => {
  const [loading, setLoading] = useState(false);

  const renderPdfToImage = async (pdfFile) => {
    const buffer = await pdfFile.arrayBuffer();
    const loadingTask = getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/png');
  };

  const getImageDimensions = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 800, height: 1131 }); // A4 roughly
      img.src = src;
    });
  };

  const scanImage = async (file) => {
    if (!file) {
      throw new Error('No file selected for OCR.');
    }

    const isImage = file.type && file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      throw new Error('Only image and PDF files are supported for OCR.');
    }

    setLoading(true);
    const source = isPdf ? await renderPdfToImage(file) : URL.createObjectURL(file);
    try {
      const { data } = await Tesseract.recognize(source, language, {
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      });
      
      const dimensions = await getImageDimensions(source);
      
      const text = data?.text?.trim() || '';
      let lines = data?.lines || [];

      // Fallback: If Tesseract didn't return lines array but found text, manually construct lines
      if (lines.length === 0 && text.length > 0) {
        lines = text.split('\n').filter(t => t.trim().length > 0).map((t, idx) => ({
          text: t,
          bbox: { x0: 20, y0: 40 + (idx * 30), x1: 200, y1: 40 + (idx * 30) } // Fake BBox
        }));
      }
      
      return {
        lines,
        text,
        width: dimensions.width,
        height: dimensions.height
      };
    } finally {
      if (!isPdf) {
        URL.revokeObjectURL(source);
      }
      setLoading(false);
    }
  };

  return { scanImage, loading };
};
