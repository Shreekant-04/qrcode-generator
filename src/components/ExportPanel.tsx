import React, { useState } from "react";
import { Download, FileImage, FileText, Image } from "lucide-react";
import jsPDF from "jspdf";
import { QRCodeOptions } from "../types/qrcode";

interface ExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  options: QRCodeOptions;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ canvasRef, options }) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "svg" | "pdf">(
    "png",
  );
  const [exportQuality, setExportQuality] = useState(1);
  const [exportScale, setExportScale] = useState(2);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPNG = async () => {
    if (!canvasRef.current) return;

    try {
      setExporting(true);
      const canvas = canvasRef.current;

      // Create a higher resolution version
      const exportCanvas = document.createElement("canvas");
      const exportCtx = exportCanvas.getContext("2d")!;

      const scaledSize = canvas.width * exportScale;
      exportCanvas.width = scaledSize;
      exportCanvas.height = scaledSize;

      // Scale up the context
      exportCtx.scale(exportScale, exportScale);
      exportCtx.drawImage(canvas, 0, 0);

      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            const filename = `qr-code-${Date.now()}.png`;
            downloadFile(blob, filename);
          }
        },
        "image/png",
        exportQuality,
      );
    } catch (error) {
      console.error("Error exporting PNG:", error);
    } finally {
      setExporting(false);
    }
  };

  const exportSVG = async () => {
    if (!canvasRef.current) return;

    try {
      setExporting(true);

      // Create SVG from canvas
      const canvas = canvasRef.current;

      // Simple SVG creation (this is a basic implementation)
      const svg = `
        <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              <canvas width="${canvas.width}" height="${canvas.height}"></canvas>
            </div>
          </foreignObject>
        </svg>
      `;

      const blob = new Blob([svg], { type: "image/svg+xml" });
      const filename = `qr-code-${Date.now()}.svg`;
      downloadFile(blob, filename);
    } catch (error) {
      console.error("Error exporting SVG:", error);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    if (!canvasRef.current) return;

    try {
      setExporting(true);

      const canvas = canvasRef.current;
      const imgData = canvas.toDataURL("image/png", exportQuality);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to maintain aspect ratio
      const aspectRatio = canvas.width / canvas.height;
      let imgWidth = pdfWidth - 40; // 20mm margin on each side
      let imgHeight = imgWidth / aspectRatio;

      if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40;
        imgWidth = imgHeight * aspectRatio;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      const filename = `qr-code-${Date.now()}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case "png":
        exportPNG();
        break;
      case "svg":
        exportSVG();
        break;
      case "pdf":
        exportPDF();
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Export Options
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "png", label: "PNG", icon: Image },
                { value: "svg", label: "SVG", icon: FileImage },
                { value: "pdf", label: "PDF", icon: FileText },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as any)}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-lg border transition-colors ${
                    exportFormat === format.value
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <format.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{format.label}</span>
                </button>
              ))}
            </div>
          </div>

          {exportFormat === "png" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quality: {Math.round(exportQuality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={exportQuality}
                  onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Scale: {exportScale}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={exportScale}
                  onChange={(e) => setExportScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher scale = better quality but larger file size
                </p>
              </div>
            </>
          )}

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>
              {exporting
                ? "Exporting..."
                : `Export as ${exportFormat.toUpperCase()}`}
            </span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">
          Current Settings
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            Size: {options.size}×{options.size}px
          </div>
          <div>Error Correction: {options.errorCorrectionLevel}</div>
          <div>Shape: {options.shape}</div>
          <div>Logo: {options.logoFile ? "Yes" : "No"}</div>
          <div>Gradient: {options.hasGradient ? "Yes" : "No"}</div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p className="font-medium mb-1">💡 Tips:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Use PNG for web and digital use</li>
          <li>Use SVG for scalable graphics</li>
          <li>Use PDF for printing</li>
          <li>Higher error correction helps with logo overlay</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportPanel;
