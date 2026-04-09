declare module "upng-js" {
  const UPNG: {
    encode(
      buffers: ArrayBuffer[],
      width: number,
      height: number,
      colorCount?: number,
    ): ArrayBuffer;
  };

  export default UPNG;
}
