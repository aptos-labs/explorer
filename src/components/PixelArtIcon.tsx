import React from "react";

interface PixelArtGeneratorProps {
  walletAddress: string;
}

const PixelArtGenerator: React.FC<PixelArtGeneratorProps> = ({
  walletAddress,
}) => {
  // Convert wallet address hex string to RGB values
  const convertToRGB = (hex: string, index: number): number[] => {
    // Convert each pair of hexadecimal characters to decimal
    const r = parseInt(hex.slice(index, index + 2), 16);
    const g = parseInt(hex.slice(index + 8, index + 10), 16);
    const b = parseInt(hex.slice(index + 16, index + 18), 16);
    return [r, g, b];
  };

  // Create pixel art image with multiple pixels
  const createPixelArt = (address: string): string => {
    const canvasSize = 3;
    const pixelSize = 6; // Size of each pixel in pixels
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize * pixelSize; // Set canvas width
    canvas.height = canvasSize * pixelSize; // Set canvas height
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to create canvas context");
    }

    // Loop through each pixel in the image
    for (let x = 0; x < canvasSize; x++) {
      for (let y = 0; y < canvasSize; y++) {
        const rgbValues = convertToRGB(address, x + y); // Convert hex to RGB with updated index
        // Set the color of the current pixel
        ctx.fillStyle = `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
        // Draw the current pixel on the canvas
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    return canvas.toDataURL(); // Return the data URL of the generated image
  };

  const pixelArtDataURL = createPixelArt(walletAddress); // Generate pixel art image data URL

  return (
    <img
      src={pixelArtDataURL}
      alt="Pixel Art"
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        imageRendering: "pixelated", // Set image rendering to "pixelated"
      }}
    />
  );
};

export default PixelArtGenerator;
