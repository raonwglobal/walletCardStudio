import QRCode from "qrcode";

export async function createQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#111217", light: "#FFFFFF" }
  });
}
