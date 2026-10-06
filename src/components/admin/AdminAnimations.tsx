import React, { useState } from 'react';
import { Cpu, Upload, Sparkles, Check, Film, Layers, Radio, Box, Globe } from 'lucide-react';
import { HardwareAnimationType } from '../../types/quiz';
import { HardwareAnimation3D } from '../animations/HardwareAnimation3D';

interface PresetCard {
  type: HardwareAnimationType;
  title: string;
  category: string;
  description: string;
}

const ALL_PRESETS: PresetCard[] = [
  { type: 'RESISTOR', title: 'Resistor', category: 'Passive', description: '3D cylindrical ceramic body with axial silver leads and standard 4-color tolerance bands.' },
  { type: 'CAPACITOR', title: 'Capacitor', category: 'Passive', description: '3D aluminum electrolytic can with scored safety vent top, negative stripe, and radial wire leads.' },
  { type: 'LED', title: 'Light Emitting Diode', category: 'Optoelectronics', description: '3D translucent dome optic lens with internal die, emissive glow aura, and dual cathode/anode leads.' },
  { type: 'TRANSISTOR', title: 'NPN Transistor (BJT)', category: 'Semiconductor', description: '3D TO-92 molded epoxy package with flat index face and 3 inline metallic pins.' },
  { type: 'DIODE', title: 'PN Junction Diode', category: 'Semiconductor', description: '3D DO-41 cylindrical semiconductor package with silver cathode polarity band.' },
  { type: 'RELAY', title: 'Electromechanical Relay', category: 'Electromechanical', description: '3D SPDT sealed switching relay with internal electromagnetic solenoid armature.' },
  { type: 'ARDUINO', title: 'Arduino Uno R3', category: 'Microcontroller', description: '3D blue microcontroller board with ATmega328P SoC, female headers, USB-B port, and power jack.' },
  { type: 'ESP32', title: 'ESP32 Dual-Core', category: 'Microcontroller / RF', description: '3D matte-black IoT module with laser-etched RF metal shield and gold serpentine PCB antenna.' },
  { type: 'ULTRASONIC_SENSOR', title: 'HC-SR04 Ultrasonic', category: 'Acoustic Sensor', description: '3D dual metallic acoustic transducers (Transmitter T / Receiver R) on PCB mount.' },
  { type: 'IR_SENSOR', title: 'Infrared Reflex Sensor', category: 'Optical Sensor', description: '3D infrared phototransistor reflex module with LM393 comparator circuitry.' },
  { type: 'LDR', title: 'Photoresistor (LDR)', category: 'Optical Sensor', description: '3D cadmium sulfide (CdS) serpentine optical receiver on ceramic base.' },
  { type: 'SERVO', title: 'SG90 Micro Servo', category: 'Actuator', description: '3D translucent blue geared servo with oscillating white dual-arm output horn.' },
  { type: 'DC_MOTOR', title: 'DC Armature Motor', category: 'Motor Control', description: '3D brushed cylindrical metallic DC motor with spinning steel rotor shaft.' },
  { type: 'BUZZER', title: 'Piezo Buzzer', category: 'Acoustics', description: '3D cylindrical black piezoelectric resonant casing with polarity index.' },
  { type: 'IC', title: 'DIP-8 Integrated Circuit', category: 'Semiconductor', description: '3D dual in-line 8-pin precision microchip with index notch and bent alloy leads.' },
  { type: 'LOGIC_GATE', title: 'Universal Logic Gate', category: 'Digital Logic', description: '3D logic IC package evaluating digital input states with output truth telemetry.' },
  { type: 'PCB', title: 'Printed Circuit Board', category: 'Hardware Layout', description: '3D multi-layer green FR-4 laminate with etched golden copper traces and SMD components.' },
  { type: 'OSCILLOSCOPE', title: 'Digital Oscilloscope', category: 'Instrumentation', description: '3D benchtop digital oscilloscope with phosphor waveform display and dual rotary knobs.' },
  { type: 'BREADBOARD', title: '830-Point Breadboard', category: 'Prototyping', description: '3D solderless prototyping tie-point grid with power distribution rails.' },
];

export const AdminAnimations: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<HardwareAnimationType>('RESISTOR');
  const [customAssets, setCustomAssets] = useState<
    { name: string; url: string; type: string; date: string }[]
  >([]);
  const [uploadName, setUploadName] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setCustomAssets((prev) => [
      {
        name: uploadName.trim() || 'Custom 3D / Motion Asset',
        url: customUrl.trim(),
        type: customUrl.endsWith('.gltf') || customUrl.endsWith('.glb') ? '3D GLTF' : 'CUSTOM',
        date: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);

    setUploadName('');
    setCustomUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomAssets((prev) => [
        {
          name: file.name,
          url: dataUrl,
          type: file.name.endsWith('.gltf') || file.name.endsWith('.glb') ? '3D GLTF' : 'MEDIA',
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pb-4 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase">3D Animations Studio</h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-300">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>3D WebGL</span>
        </div>
      </div>

      {/* Featured Spotlight Card */}
      <div className="p-6 rounded-2xl bg-[#090f14] border-2 border-emerald-500/30 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-2xl">
        <div className="md:col-span-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase font-bold">
              ACTIVE 3D INSPECTOR
            </span>
            <span className="font-mono text-xs text-slate-400">
              {ALL_PRESETS.find((p) => p.type === selectedPreset)?.category}
            </span>
          </div>

          <h2 className="text-2xl font-mono font-bold text-white uppercase">
            {selectedPreset.replace('_', ' ')}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {ALL_PRESETS.find((p) => p.type === selectedPreset)?.description}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>RENDER PIPELINE:</span>
              <span className="text-emerald-400 font-bold">THREE.JS WEBGL RENDERER</span>
            </div>
            <div className="flex justify-between">
              <span>SHADING & MATERIALS:</span>
              <span className="text-cyan-400">PBR STANDARD / PHYSICAL TRANSMISSION</span>
            </div>
            <div className="flex justify-between">
              <span>INTERACTION:</span>
              <span className="text-amber-400">ORBIT CONTROLS / ZOOM / PAN</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 flex justify-center">
          <HardwareAnimation3D type={selectedPreset} size="lg" showLabel={true} interactive={true} autoRotate={true} />
        </div>
      </div>

      {/* Custom 3D Asset & Remote Source Loader */}
      <div className="p-6 rounded-2xl bg-[#080d12] border border-cyan-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-white uppercase">
              Fetch 3D Model From Source (GLTF, GLB, Remote 3D URL)
            </h3>
          </div>
          <span className="font-mono text-[10px] text-cyan-400">GLTF / GLB 3D STREAMER</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Picker */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
            <Upload className="w-8 h-8 text-cyan-400 mb-2" />
            <p className="text-xs text-slate-300 font-medium mb-1">
              Select 3D Model or Animation from Device
            </p>
            <p className="text-[10px] font-mono text-slate-500 mb-3">
              Supports .gltf, .glb, .mp4, .webp, .png
            </p>
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition">
              CHOOSE 3D FILE
              <input type="file" accept=".gltf,.glb,image/*,video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* URL Input */}
          <form onSubmit={handleAddCustom} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div>
              <label className="block font-mono text-[11px] text-slate-400 uppercase mb-1">
                3D Model / Asset Name
              </label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g. 3D STM32 Nucleo Board"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] text-slate-400 uppercase mb-1">
                Source URL (GLTF/GLB or Media)
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://.../model.glb"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs"
            >
              STREAM & REGISTER 3D SOURCE
            </button>
          </form>
        </div>

        {/* Uploaded Custom Assets Strip */}
        {customAssets.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <h4 className="font-mono text-xs text-slate-400 uppercase mb-3">
              Registered 3D & Custom Assets ({customAssets.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {customAssets.map((asset, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white truncate">{asset.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                      {asset.type}
                    </span>
                  </div>
                  <HardwareAnimation3D type="CUSTOM" customAssetUrl={asset.url} size="sm" showLabel={false} />
                  <span className="text-[10px] font-mono text-slate-500 block truncate">{asset.url}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid of All 19 Real 3D Presets */}
      <div className="space-y-4">
        <h3 className="font-mono text-sm font-bold text-white uppercase">
          Standard Hardware 3D Component Library ({ALL_PRESETS.length} Real 3D WebGL Models)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.type;
            return (
              <div
                key={preset.type}
                onClick={() => setSelectedPreset(preset.type)}
                className={`p-4 rounded-2xl bg-[#080d12] border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-slate-400 uppercase">
                      {preset.category}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                        ACTIVE 3D
                      </span>
                    )}
                  </div>
                  <h4 className="font-mono text-xs font-bold text-white mb-2">{preset.title}</h4>
                </div>

                <div className="my-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-bold">{preset.type}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {isSelected ? 'INSPECTING 3D ➜' : 'SELECT 3D'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
