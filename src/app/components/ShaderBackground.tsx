"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

const ShaderGradientAny = ShaderGradient as any;

export default function ShaderBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-100">
      <ShaderGradientCanvas
        style={{ position: 'absolute', width: '100vw', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <ShaderGradientAny
          control="props"
          animate="on"
          brightness={1.2}
          cAzimuthAngle={180}
          cDistance={4}
          cPolarAngle={90}
          cameraZoom={1}
          color1="#6b3517"
          color2="#dbba95"
          color3="#705138"
          destination="onCanvas"
          embedMode="off"
          envPreset="city"
          format="gif"
          fov={45}
          frameRate={10}
          gizmoHelper="hide"
          grain="on"
          lightType="3d"
          pixelDensity={1}
          positionX={-1.4}
          positionY={0}
          positionZ={0}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.1}
          rotationX={0}
          rotationY={10}
          rotationZ={50}
          shader="defaults"
          type="plane"
          uAmplitude={1}
          uDensity={1.7}
          uFrequency={5.5}
          uSpeed={0.3}
          uStrength={1}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
