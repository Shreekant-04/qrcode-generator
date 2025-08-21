import React from 'react';
import { Upload, Palette, Layers, Sparkles } from 'lucide-react';
import { QRCodeOptions } from '../types/qrcode';

interface ControlPanelProps {
  options: QRCodeOptions;
  setOptions: React.Dispatch<React.SetStateAction<QRCodeOptions>>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ options, setOptions }) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOptions(prev => ({ ...prev, logoFile: file }));
    }
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOptions(prev => ({ ...prev, backgroundImage: file }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Colors</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Foreground
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={options.foregroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                className="w-10 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={options.foregroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Background
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={options.backgroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-10 h-8 rounded border border-gray-300"
                disabled={options.isTransparent}
              />
              <input
                type="text"
                value={options.backgroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                disabled={options.isTransparent}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="transparent"
            checked={options.isTransparent}
            onChange={(e) => setOptions(prev => ({ ...prev, isTransparent: e.target.checked }))}
            className="rounded"
          />
          <label htmlFor="transparent" className="ml-2 text-sm text-gray-700">
            Transparent background
          </label>
        </div>
      </div>

      {/* Gradient Section */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="gradient"
            checked={options.hasGradient}
            onChange={(e) => setOptions(prev => ({ ...prev, hasGradient: e.target.checked }))}
            className="rounded"
          />
          <label htmlFor="gradient" className="ml-2 text-sm font-medium text-gray-700">
            Use gradient
          </label>
        </div>

        {options.hasGradient && (
          <div className="space-y-3 pl-6 border-l-2 border-blue-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Color
                </label>
                <input
                  type="color"
                  value={options.gradientStart}
                  onChange={(e) => setOptions(prev => ({ ...prev, gradientStart: e.target.value }))}
                  className="w-full h-8 rounded border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Color
                </label>
                <input
                  type="color"
                  value={options.gradientEnd}
                  onChange={(e) => setOptions(prev => ({ ...prev, gradientEnd: e.target.value }))}
                  className="w-full h-8 rounded border border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={options.gradientDirection}
                onChange={(e) => setOptions(prev => ({ ...prev, gradientDirection: e.target.value as any }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
                <option value="diagonal">Diagonal</option>
                <option value="radial">Radial</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Logo Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Upload className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Logo</h3>
        </div>

        <div>
          <label className="block">
            <div className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-600">
                {options.logoFile ? options.logoFile.name : 'Upload logo'}
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </div>

        {options.logoFile && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Logo Size: {options.logoSize}%
            </label>
            <input
              type="range"
              min="10"
              max="40"
              step="2"
              value={options.logoSize}
              onChange={(e) => setOptions(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}
      </div>

      {/* Shape Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Shape</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'square', label: 'Square' },
            { value: 'circle', label: 'Circle' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'artistic', label: 'Artistic' }
          ].map(shape => (
            <button
              key={shape.value}
              onClick={() => setOptions(prev => ({ ...prev, shape: shape.value as any }))}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                options.shape === shape.value
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      {/* Effects Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Effects</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="shadow"
              checked={options.hasShadow}
              onChange={(e) => setOptions(prev => ({ ...prev, hasShadow: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="shadow" className="ml-2 text-sm text-gray-700">
              Drop shadow
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="glow"
              checked={options.hasGlow}
              onChange={(e) => setOptions(prev => ({ ...prev, hasGlow: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="glow" className="ml-2 text-sm text-gray-700">
              Glow effect
            </label>
          </div>

          {options.hasGlow && (
            <div className="pl-6">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Glow Color
              </label>
              <input
                type="color"
                value={options.glowColor}
                onChange={(e) => setOptions(prev => ({ ...prev, glowColor: e.target.value }))}
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="3d"
              checked={options.has3D}
              onChange={(e) => setOptions(prev => ({ ...prev, has3D: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="3d" className="ml-2 text-sm text-gray-700">
              3D effect
            </label>
          </div>
        </div>
      </div>

      {/* Border Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Border</h3>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Width: {options.borderWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={options.borderWidth}
            onChange={(e) => setOptions(prev => ({ ...prev, borderWidth: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {options.borderWidth > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Border Color
            </label>
            <input
              type="color"
              value={options.borderColor}
              onChange={(e) => setOptions(prev => ({ ...prev, borderColor: e.target.value }))}
              className="w-full h-8 rounded border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Call to Action</h3>
        
        <div>
          <input
            type="text"
            value={options.callToActionText}
            onChange={(e) => setOptions(prev => ({ ...prev, callToActionText: e.target.value }))}
            placeholder="e.g., 'Scan me!'"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;