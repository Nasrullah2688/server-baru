declare module 'bwip-js' {
    interface ToBufferOptions {
        bcid: string;
        text: string;
        scale?: number;
        height?: number;
        includetext?: boolean;
        textxalign?: string;
    }

    function toBuffer(options: ToBufferOptions, callback: (err: Error | null, png: Buffer | null) => void): void;

    export { toBuffer };
}
