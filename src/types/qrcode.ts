export interface QRCodeOptions {
  text: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  size: number;
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
  logoFile: File | null;
  logoSize: number;
  borderRadius: number;
  shape: 'square' | 'circle' | 'rounded' | 'artistic';
  hasGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
  hasShadow: boolean;
  shadowBlur: number;
  shadowColor: string;
  has3D: boolean;
  hasGlow: boolean;
  glowColor: string;
  style: 'modern' | 'classic' | 'rounded' | 'pixel' | 'neon';
  borderWidth: number;
  borderColor: string;
  frameStyle: 'none' | 'simple' | 'rounded' | 'shadow';
  callToActionText: string;
  isTransparent: boolean;
  backgroundImage: File | null;
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf';
  quality: number;
  scale: number;
}