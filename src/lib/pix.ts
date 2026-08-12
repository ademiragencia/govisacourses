/** Pix copia-e-cola (BR Code) — independente do checkout da operadora. */
export const PIX_KEY = "62760529000160";
export const PIX_NAME = "GO VISA COURSES";
export const PIX_CITY = "CAMPO GRANDE";

function tlv(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixCode(opts: {
  amount: number;
  txid: string;
  key?: string;
  name?: string;
  city?: string;
}) {
  const key = (opts.key || PIX_KEY).replace(/\s/g, "");
  const name = (opts.name || PIX_NAME)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .slice(0, 25);
  const city = (opts.city || PIX_CITY)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .slice(0, 15);
  const txid = opts.txid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "GOVISA";
  const merchant = tlv("00", "br.gov.bcb.pix") + tlv("01", key);
  const extra = tlv("05", txid);
  let payload =
    tlv("00", "01") +
    tlv("26", merchant) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", opts.amount.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", name) +
    tlv("60", city) +
    tlv("62", extra) +
    "6304";
  return payload + crc16(payload);
}

export function pixQrUrl(code: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(code)}`;
}
