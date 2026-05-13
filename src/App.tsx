import { useState, useRef } from "react";
import { Download, Palette, Settings, Camera } from "lucide-react";
import QRCodeGenerator from "./components/QRCodeGenerator";
import ControlPanel from "./components/ControlPanel";
import ExportPanel from "./components/ExportPanel";
import { QRCodeOptions } from "./types/qrcode";

function App() {
  const [options, setOptions] = useState<QRCodeOptions>({
    text: "https://example.com",
    errorCorrectionLevel: "H" as const,
    size: 300,
    margin: 20,
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    logoFile: null,
    logoSize: 50,
    logoHasBackground: true,
    logoShape: "square" as const,
    borderRadius: 0,
    shape: "square" as const,
    hasGradient: false,
    gradientStart: "#000000",
    gradientEnd: "#333333",
    gradientDirection: "diagonal" as const,
    style: "modern" as const,
    borderWidth: 0,
    borderColor: "#000000",
    frameStyle: "none" as const,
    callToActionText: "",
    isTransparent: false,
    backgroundImage: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState("style");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QR Studio</h1>
                <p className="text-sm text-gray-600">
                  Advanced QR Code Generator
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {[
              { id: "style", label: "Style", icon: Palette },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "export", label: "Export", icon: Download },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "style" && (
              <ControlPanel options={options} setOptions={setOptions} />
            )}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code Data
                  </label>
                  <textarea
                    value={options.text}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, text: e.target.value }))
                    }
                    placeholder="Enter URL, text, or data..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Error Correction Level
                  </label>
                  <select
                    value={options.errorCorrectionLevel}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        errorCorrectionLevel: e.target.value as any,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="L">L - Low (~7%)</option>
                    <option value="M">M - Medium (~15%)</option>
                    <option value="Q">Q - Quartile (~25%)</option>
                    <option value="H">H - High (~30%)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Higher levels allow more logo coverage but create larger
                    codes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size: {options.size}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="10"
                    value={options.size}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        size: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margin: {options.margin}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={options.margin}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        margin: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            )}
            {activeTab === "export" && (
              <ExportPanel canvasRef={canvasRef} options={options} />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Preview
                </h2>
                <p className="text-gray-600">
                  Your customized QR code will appear below
                </p>
              </div>

              <div className="flex justify-center">
                <QRCodeGenerator ref={canvasRef} options={options} />
              </div>

              <div className="mt-8 text-center text-sm text-gray-500">
                <p>QR code updates automatically as you customize</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
