import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import QRCode from "qrcode";
import { QRCodeOptions } from "../types/qrcode";

interface QRCodeGeneratorProps {
  options: QRCodeOptions;
}

const QRCodeGenerator = forwardRef<HTMLCanvasElement, QRCodeGeneratorProps>(
  ({ options }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const getQrPayload = (rawText: string) => {
      const text = rawText.trim();
      if (!text) return text;

      const urlMatch = text.match(/https?:\/\/[^\s]+/i);
      if (!urlMatch) return text;

      let url = urlMatch[0];
      // Trim common trailing punctuation that often appears in sentences.
      const trailingPunctuation = "),.;:!?]}'\"";
      while (trailingPunctuation.includes(url.slice(-1))) {
        url = url.slice(0, -1);
      }

      try {
        // Ensure it's a valid absolute URL.
        // If valid, keep all user text but put the URL on its own line.
        // This increases the chance scanner apps auto-detect it as a clickable link.
        new URL(url);

        const normalized = text.replace(urlMatch[0], url);
        const urlIndex = normalized.indexOf(url);
        if (urlIndex === -1) return normalized;

        const lineStart = normalized.lastIndexOf("\n", urlIndex - 1) + 1;
        const nextNewline = normalized.indexOf("\n", urlIndex + url.length);
        const lineEnd = nextNewline === -1 ? normalized.length : nextNewline;

        const linePrefix = normalized.slice(lineStart, urlIndex);
        const lineSuffix = normalized.slice(urlIndex + url.length, lineEnd);

        // Already isolated on a line.
        if (linePrefix.trim() === "" && lineSuffix.trim() === "") {
          return normalized;
        }

        const head = normalized.slice(0, lineStart);
        const tail = normalized.slice(lineEnd);

        const parts: string[] = [];
        if (linePrefix.trim().length) parts.push(linePrefix.trimEnd());
        parts.push(url);
        if (lineSuffix.trim().length) parts.push(lineSuffix.trimStart());

        return (head + parts.join("\n") + tail).trim();
      } catch {
        return text;
      }
    };

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      generateQRCode();
    }, [options]);

    const generateQRCode = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;

      const callToActionFontSize = Math.max(12, options.size * 0.04);
      const callToActionAreaHeight = options.callToActionText
        ? Math.ceil(callToActionFontSize * 2)
        : 0;

      // Set canvas size
      const totalWidth = options.size + options.margin * 2;
      const totalHeight =
        options.size + options.margin * 2 + callToActionAreaHeight;
      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        const payload = getQrPayload(options.text);
        // Generate QR code data
        const qrCodeDataURL = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: options.errorCorrectionLevel,
          width: options.size,
          margin: 0,
          color: {
            dark: options.hasGradient ? "#000000" : options.foregroundColor,
            // When using gradients we render the QR "light" pixels as transparent,
            // so the gradient only applies to the dark modules.
            light: options.hasGradient
              ? "#00000000"
              : options.isTransparent
                ? "#00000000"
                : options.backgroundColor,
          },
        });

        const qrImage = new Image();
        qrImage.onload = async () => {
          // Save context
          ctx.save();

          // Apply background
          if (!options.isTransparent) {
            if (options.backgroundImage) {
              try {
                const bgImage = new Image();
                bgImage.onload = () => {
                  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
                  drawQRCode();
                };
                bgImage.src = URL.createObjectURL(options.backgroundImage);
              } catch {
                drawBackground();
                drawQRCode();
              }
            } else {
              drawBackground();
              drawQRCode();
            }
          } else {
            drawQRCode();
          }

          function drawBackground() {
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          function drawQRCode() {
            // Draw QR code based on shape
            const qrX = options.margin;
            const qrY = options.margin;

            ctx.save();

            // Apply shape clipping
            if (options.shape === "circle") {
              const centerX = qrX + options.size / 2;
              const centerY = qrY + options.size / 2;
              const radius = options.size / 2;

              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
              ctx.clip();
            } else if (options.shape === "rounded") {
              const radius = options.size * 0.1;
              roundedRect(ctx, qrX, qrY, options.size, options.size, radius);
              ctx.clip();
            }

            // Draw QR code
            if (options.hasGradient) {
              // Create a temporary canvas for gradient overlay
              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = options.size;
              tempCanvas.height = options.size;
              const tempCtx = tempCanvas.getContext("2d")!;

              tempCtx.drawImage(qrImage, 0, 0, options.size, options.size);

              // Apply gradient overlay
              tempCtx.globalCompositeOperation = "source-atop";
              const gradient = createGradient(
                tempCtx,
                options.size,
                options.size,
              );
              tempCtx.fillStyle = gradient;
              tempCtx.fillRect(0, 0, options.size, options.size);

              ctx.drawImage(tempCanvas, qrX, qrY);
            } else {
              ctx.drawImage(qrImage, qrX, qrY, options.size, options.size);
            }

            ctx.restore();

            // Draw border if enabled
            if (options.borderWidth > 0) {
              ctx.strokeStyle = options.borderColor;
              ctx.lineWidth = options.borderWidth;
              ctx.strokeRect(
                qrX - options.borderWidth / 2,
                qrY - options.borderWidth / 2,
                options.size + options.borderWidth,
                options.size + options.borderWidth,
              );
            }

            // Draw logo if provided
            if (options.logoFile) {
              drawLogo();
            }

            // Draw call-to-action text
            if (options.callToActionText) {
              drawCallToAction();
            }
          }

          async function drawLogo() {
            if (!options.logoFile) return;

            try {
              const logoImage = new Image();
              const url = URL.createObjectURL(options.logoFile);

              logoImage.onload = () => {
                const logoSize = (options.size * options.logoSize) / 100;
                const logoX = options.margin + (options.size - logoSize) / 2;
                const logoY = options.margin + (options.size - logoSize) / 2;

                // Background behind logo (optional)
                const padding = Math.max(4, Math.round(logoSize * 0.08));
                if (options.logoHasBackground) {
                  const bgX = logoX - padding;
                  const bgY = logoY - padding;
                  const bgSize = logoSize + padding * 2;

                  ctx.save();
                  ctx.fillStyle = "#ffffff";
                  ctx.beginPath();
                  if (options.logoShape === "circle") {
                    ctx.arc(
                      bgX + bgSize / 2,
                      bgY + bgSize / 2,
                      bgSize / 2,
                      0,
                      2 * Math.PI,
                    );
                  } else if (options.logoShape === "rounded") {
                    roundedRect(ctx, bgX, bgY, bgSize, bgSize, bgSize * 0.2);
                  } else {
                    ctx.rect(bgX, bgY, bgSize, bgSize);
                  }
                  ctx.fill();
                  ctx.restore();
                }

                // Clip logo shape (optional)
                ctx.save();
                if (options.logoShape === "circle") {
                  ctx.beginPath();
                  ctx.arc(
                    logoX + logoSize / 2,
                    logoY + logoSize / 2,
                    logoSize / 2,
                    0,
                    2 * Math.PI,
                  );
                  ctx.clip();
                } else if (options.logoShape === "rounded") {
                  roundedRect(
                    ctx,
                    logoX,
                    logoY,
                    logoSize,
                    logoSize,
                    logoSize * 0.2,
                  );
                  ctx.clip();
                }

                // Draw logo (preserve aspect ratio)
                const scale = Math.min(
                  logoSize / logoImage.naturalWidth,
                  logoSize / logoImage.naturalHeight,
                );
                const drawW = logoImage.naturalWidth * scale;
                const drawH = logoImage.naturalHeight * scale;
                const drawX = logoX + (logoSize - drawW) / 2;
                const drawY = logoY + (logoSize - drawH) / 2;
                ctx.drawImage(logoImage, drawX, drawY, drawW, drawH);
                ctx.restore();

                URL.revokeObjectURL(url);
              };
              logoImage.src = url;
              logoImage.onerror = () => URL.revokeObjectURL(url);
            } catch (error) {
              console.error("Error loading logo:", error);
            }
          }

          function drawCallToAction() {
            const text = options.callToActionText;
            const fontSize = callToActionFontSize;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = options.foregroundColor;
            ctx.textAlign = "center";

            const areaTop = options.margin + options.size;
            const textY =
              areaTop + callToActionAreaHeight / 2 + fontSize / 2 - 2;
            ctx.fillText(text, canvas.width / 2, textY);
          }

          ctx.restore();
        };
        qrImage.src = qrCodeDataURL;
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    const createGradient = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) => {
      let gradient;

      switch (options.gradientDirection) {
        case "horizontal":
          gradient = ctx.createLinearGradient(0, 0, width, 0);
          break;
        case "vertical":
          gradient = ctx.createLinearGradient(0, 0, 0, height);
          break;
        case "diagonal":
          gradient = ctx.createLinearGradient(0, 0, width, height);
          break;
        case "radial":
          gradient = ctx.createRadialGradient(
            width / 2,
            height / 2,
            0,
            width / 2,
            height / 2,
            width / 2,
          );
          break;
        default:
          gradient = ctx.createLinearGradient(0, 0, width, height);
      }

      gradient.addColorStop(0, options.gradientStart);
      gradient.addColorStop(1, options.gradientEnd);
      return gradient;
    };

    const roundedRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height,
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    return (
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded-lg shadow-lg max-w-full h-auto"
          style={{
            maxWidth: "400px",
            maxHeight: "400px",
          }}
        />
      </div>
    );
  },
);

QRCodeGenerator.displayName = "QRCodeGenerator";

export default QRCodeGenerator;
