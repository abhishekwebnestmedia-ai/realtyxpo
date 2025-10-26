import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Canvg } from 'canvg';

export function exportRowsAsPdf({ columns = [], rows = [], fileName = 'export.pdf', title = '', watermark = null }) {
  // watermark: { src: string, opacity?: number (0-1), scale?: number (fraction of page width, default 0.6) }
  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load watermark image: ' + e));
    img.src = src;
  });

  const createProcessedDataUrl = (img, opacity = 0.08, raw = false) => {
    try {
      // Create a reasonably large canvas to preserve quality when scaled in the PDF
      const DPR = window.devicePixelRatio || 1;
      const srcW = img.naturalWidth || img.width || 1200;
      const srcH = img.naturalHeight || img.height || 800;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(srcW * DPR, 1200);
      canvas.height = Math.max(srcH * DPR, 800);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // If raw is false, apply the requested opacity; otherwise draw fully opaque
      if (!raw) ctx.globalAlpha = opacity;
      // Draw image centered and scaled to fill the canvas while preserving aspect
      const scale = Math.max(canvas.width / srcW, canvas.height / srcH);
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      const dx = (canvas.width - drawW) / 2;
      const dy = (canvas.height - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.warn('Failed to process watermark image to dataURL', err);
      return null;
    }
  };

  try {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

  let processedWatermarkDataUrl = null;
  let watermarkImgElement = null;
    

    const prepareWatermark = async () => {
      if (!watermark || !watermark.src) return;
      try {
        let imgSrc = watermark.src;
        // If SVG, fetch the raw text and rasterize it using canvg for best compatibility.
        const srcLower = String(watermark.src || '').toLowerCase();
        const isSvg = srcLower.endsWith('.svg') || srcLower.startsWith('data:image/svg+xml');
        const rawRequested = !!watermark.raw;
        let desiredOpacity = typeof watermark.opacity === 'number' ? watermark.opacity : 0.15;

        if (isSvg) {
          try {
            const resp = await fetch(watermark.src);
            if (resp && resp.ok) {
              const svgText = await resp.text();
              // create a canvas and render SVG via canvg
              const canvas = document.createElement('canvas');
              // choose a canvas size matching A4 at 72pt: approximately 595x842 pts
              const DPR = window.devicePixelRatio || 1;
              canvas.width = Math.max(1200, Math.round(595 * DPR));
              canvas.height = Math.max(1600, Math.round(842 * DPR));
              const ctx = canvas.getContext('2d');
              // Render the SVG into the canvas using canvg
              const v = await Canvg.fromString(ctx, svgText);
              await v.render();
              // Optionally apply opacity if not rawRequested
              if (!rawRequested) {
                const tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = canvas.width;
                tmpCanvas.height = canvas.height;
                const tctx = tmpCanvas.getContext('2d');
                tctx.globalAlpha = Math.max(desiredOpacity, 0.05);
                tctx.drawImage(canvas, 0, 0);
                processedWatermarkDataUrl = tmpCanvas.toDataURL('image/png');
              } else {
                processedWatermarkDataUrl = canvas.toDataURL('image/png');
              }
              // Keep the image element fallback as well
              watermarkImgElement = new Image();
              watermarkImgElement.src = processedWatermarkDataUrl;
            }
          } catch (svgErr) {
            console.warn('Failed to rasterize SVG via canvg, falling back to image load', svgErr);
            // fallback to normal image load below
          }
        }

        // If processedWatermarkDataUrl is not populated (non-SVG or fallback), load as image
        if (!processedWatermarkDataUrl) {
          const img = await loadImage(watermark.src);
          watermarkImgElement = img;
          if (img) {
            // If it's not SVG or canvg failed, attempt processing via canvas (honoring raw flag)
            if (isSvg && !rawRequested) {
              desiredOpacity = Math.max(desiredOpacity, 0.25);
            }
            processedWatermarkDataUrl = createProcessedDataUrl(img, desiredOpacity, rawRequested);
            if (!processedWatermarkDataUrl) console.warn('Watermark processing returned null; using image element fallback');
          }
        }
      } catch (err) {
        console.warn('Could not prepare watermark:', err.message || err);
        processedWatermarkDataUrl = null;
      }
    };

    const head = [columns.map(c => c.label || c)];
    const body = rows.map(row => columns.map(col => {
      const key = col.key || col.accessor || col;
      const v = row[key];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    }));

    const renderWatermarkOnDoc = (docInstance, pageNumber = null) => {
      if (!processedWatermarkDataUrl && !watermarkImgElement) return;
      // If a page number is provided, ensure the doc is on that page
      try {
        if (pageNumber && typeof docInstance.setPage === 'function') {
          docInstance.setPage(pageNumber);
        }
      } catch {
        // ignore setPage errors
      }

      // Fill the entire page with the watermark (cover the page bounds)
      const targetW = pageWidth;
      const targetH = pageHeight;
      const x = 0;
      const y = 0;

      try {
        if (processedWatermarkDataUrl) {
          // Guess image format from data URL
          let imgType = 'PNG';
          if (processedWatermarkDataUrl.startsWith('data:image/jpeg') || processedWatermarkDataUrl.startsWith('data:image/jpg')) imgType = 'JPEG';
          // Draw the watermark covering full page using the processed data URL
          docInstance.addImage(processedWatermarkDataUrl, imgType, x, y, targetW, targetH, undefined, 'FAST');
        } else if (watermarkImgElement) {
          // Fallback: use the loaded HTMLImageElement directly
          docInstance.addImage(watermarkImgElement, 'PNG', x, y, targetW, targetH, undefined, 'FAST');
        }
      } catch (err) {
        console.warn('Failed to draw watermark on PDF page', err);
      }
    };

    const generate = async () => {
      // prepare watermark if provided
      await prepareWatermark();

      if (title) {
        doc.setFontSize(14);
        doc.text(title, pageWidth / 2, 40, { align: 'center' });
      }

      // Draw table and ensure watermark is rendered as a background for each page.
      // We render the watermark first, then draw table with transparent/background cells so watermark shows through
      doc.autoTable({
        startY: title ? 60 : 40,
        head: head,
        body: body,
        styles: { 
          fontSize: 9,
          fillColor: false, // Make cells transparent so watermark shows through
        },
        headStyles: { 
          fillColor: [245, 245, 245, 0.8], // Semi-transparent header
          textColor: 40 
        },
        alternateRowStyles: {
          fillColor: false // Remove alternate row coloring to show watermark
        },
        margin: { left: 20, right: 20 },
        willDrawPage: function (data) {
          // Draw watermark on every page before table content
          renderWatermarkOnDoc(doc, data.pageNumber);
        }
      });

      doc.save(fileName);
    };

    // If environment supports async/await top-level, call generate and return; otherwise run and catch.
    return generate();
  } catch (err) {
    console.error('Failed to export PDF', err);
    throw err;
  }
}
