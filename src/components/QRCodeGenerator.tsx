import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import QRCode from 'qrcode';
import { QRCodeOptions } from '../types/qrcode';

interface QRCodeGeneratorProps {
  options: QRCodeOptions;
}

const QRCodeGenerator = forwardRef<HTMLCanvasElement, QRCodeGeneratorProps>(
  ({ options }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      generateQRCode();
    }, [options]);

    const generateQRCode = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      // Set canvas size
      const totalSize = options.size + (options.margin * 2);
      canvas.width = totalSize;
      canvas.height = totalSize;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        // Generate QR code data
        const qrCodeDataURL = await QRCode.toDataURL(options.text, {
          errorCorrectionLevel: options.errorCorrectionLevel,
          width: options.size,
          margin: 0,
          color: {
            dark: options.hasGradient ? '#000000' : options.foregroundColor,
            light: options.isTransparent ? '#00000000' : options.backgroundColor,
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
            if (options.hasGradient) {
              const gradient = createGradient(ctx, canvas.width, canvas.height);
              ctx.fillStyle = gradient;
            } else {
              ctx.fillStyle = options.backgroundColor;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          function drawQRCode() {
            // Apply shadow
            if (options.hasShadow) {
              ctx.shadowBlur = options.shadowBlur;
              ctx.shadowColor = options.shadowColor;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
            }

            // Apply glow effect
            if (options.hasGlow) {
              ctx.shadowBlur = 20;
              ctx.shadowColor = options.glowColor;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            }

            // Draw QR code based on shape
            const qrX = options.margin;
            const qrY = options.margin;

            ctx.save();
            
            // Apply shape clipping
            if (options.shape === 'circle') {
              const centerX = qrX + options.size / 2;
              const centerY = qrY + options.size / 2;
              const radius = options.size / 2;
              
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
              ctx.clip();
            } else if (options.shape === 'rounded') {
              const radius = options.size * 0.1;
              roundedRect(ctx, qrX, qrY, options.size, options.size, radius);
              ctx.clip();
            }

            // Draw QR code
            if (options.hasGradient) {
              // Create a temporary canvas for gradient overlay
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = options.size;
              tempCanvas.height = options.size;
              const tempCtx = tempCanvas.getContext('2d')!;
              
              tempCtx.drawImage(qrImage, 0, 0, options.size, options.size);
              
              // Apply gradient overlay
              tempCtx.globalCompositeOperation = 'source-atop';
              const gradient = createGradient(tempCtx, options.size, options.size);
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
                options.size + options.borderWidth
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

            // Reset shadow
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          async function drawLogo() {
            if (!options.logoFile) return;

            try {
              const logoImage = new Image();
              logoImage.onload = () => {
                const logoSize = (options.size * options.logoSize) / 100;
                const logoX = options.margin + (options.size - logoSize) / 2;
                const logoY = options.margin + (options.size - logoSize) / 2;

                // Draw logo background (white rounded rectangle for better visibility)
                const padding = 8;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(
                  logoX - padding, 
                  logoY - padding, 
                  logoSize + padding * 2, 
                  logoSize + padding * 2
                );

                // Draw logo without clipping to preserve full image
                ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
              };
              logoImage.src = URL.createObjectURL(options.logoFile);
            } catch (error) {
              console.error('Error loading logo:', error);
            }
          }

          function drawCallToAction() {
            const text = options.callToActionText;
            const fontSize = Math.max(12, options.size * 0.04);
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = options.foregroundColor;
            ctx.textAlign = 'center';
            
            const textY = options.margin + options.size + 30;
            ctx.fillText(text, canvas.width / 2, textY);
          }

          ctx.restore();
        };
        qrImage.src = qrCodeDataURL;
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    const createGradient = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      let gradient;
      
      switch (options.gradientDirection) {
        case 'horizontal':
          gradient = ctx.createLinearGradient(0, 0, width, 0);
          break;
        case 'vertical':
          gradient = ctx.createLinearGradient(0, 0, 0, height);
          break;
        case 'diagonal':
          gradient = ctx.createLinearGradient(0, 0, width, height);
          break;
        case 'radial':
          gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
          break;
        default:
          gradient = ctx.createLinearGradient(0, 0, width, height);
      }
      
      gradient.addColorStop(0, options.gradientStart);
      gradient.addColorStop(1, options.gradientEnd);
      return gradient;
    };

    const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
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
            maxWidth: '400px',
            maxHeight: '400px',
          }}
        />
      </div>
    );
  }
);

QRCodeGenerator.displayName = 'QRCodeGenerator';

export default QRCodeGenerator;