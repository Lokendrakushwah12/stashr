// Component inspired by github.com/zavalit/bayer-dithering-webgl-demo

import PixelBlast from "./pixel-blast";

const PixelBlastClient = () => {
  return (
    <div className="pointer-events-none absolute top-0 left-0 -z-1 h-[1000px] w-full opacity-25">
      <PixelBlast
        variant="diamond"
        pixelSize={4}
        color="#B19EEF"
        patternScale={6}
        patternDensity={0.5}
        pixelSizeJitter={0.5}
        rippleSpeed={0.4}
        rippleThickness={0.12}
        rippleIntensityScale={1.5}
        liquidStrength={0.12}
        liquidRadius={1.2}
        liquidWobbleSpeed={10}
        speed={0.6}
        edgeFade={0.25}
        transparent
      />
    </div>
  );
};

export default PixelBlastClient;
