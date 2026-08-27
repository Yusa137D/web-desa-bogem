/**
 * Format string number or raw digits to WhatsApp click-to-chat URL
 */
export function formatWhatsAppLink(phone: string, itemTitle?: string): string {
  const cleanNumber = phone.replace(/[^0-9]/g, "");
  const formattedNumber = cleanNumber.startsWith("0") ? "62" + cleanNumber.slice(1) : cleanNumber;
  
  const textMsg = itemTitle
    ? `Halo, saya tertarik dengan produk ${itemTitle} di Website Desa.`
    : `Halo, saya ingin bertanya seputar informasi di Website Desa.`;

  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(textMsg)}`;
}

/**
 * Format date string into Indonesian locale format (e.g. 14 Agustus 2026)
 */
export function formatDateIndonesian(dateStr?: string): string {
  if (!dateStr) return "Terbaru";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Terbaru";
  }
}

/**
 * Format number into Indonesian Rupiah (e.g. Rp 15.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Auto-format price input string into Indonesian Rupiah format.
 * Supports:
 * - Single price: '15000' -> 'Rp 15.000', '15000 / porsi' -> 'Rp 15.000 / porsi'
 * - Price ranges: '15000 - 250000' -> 'Rp 15.000 - Rp 250.000', '15000 - 250000 / pcs' -> 'Rp 15.000 - Rp 250.000 / pcs'
 * - Range with s/d or sampai: '15000 s/d 250000' -> 'Rp 15.000 - Rp 250.000'
 * - Prefixes like Mulai dari: 'Mulai dari 15000' -> 'Mulai dari Rp 15.000'
 * - Free text options: 'Hubungi WA', 'Nego', 'Gratis'
 */
export function formatRupiahInput(val: string): string {
  if (!val) return "";

  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();

  // 1. Preserve free text options
  if (
    lower === "hubungi wa" ||
    lower === "nego" ||
    lower === "gratis" ||
    lower.includes("hubungi wa") ||
    lower.includes("nego")
  ) {
    return val;
  }

  // 2. Separate unit suffix if present (e.g. " / bungkus", " / kg", " / porsi")
  const slashIdx = val.indexOf("/");
  let pricePart = val;
  let unitPart = "";

  if (slashIdx !== -1) {
    pricePart = val.substring(0, slashIdx);
    unitPart = " / " + val.substring(slashIdx + 1).trim();
  }

  // 3. Check for prefix like "Mulai dari " or "Mulai "
  let prefix = "";
  if (pricePart.toLowerCase().startsWith("mulai dari ")) {
    prefix = "Mulai dari ";
    pricePart = pricePart.substring(11);
  } else if (pricePart.toLowerCase().startsWith("mulai ")) {
    prefix = "Mulai ";
    pricePart = pricePart.substring(6);
  }

  // Helper to format a single numeric string into "Rp 15.000"
  const formatSingleNumber = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) return "";
    const formatted = Number(digits).toLocaleString("id-ID");
    return `Rp ${formatted}`;
  };

  // 4. Check for range separators: " - ", "-", " s/d ", " sd ", " sampai "
  let rangeSeparator = "";
  if (pricePart.includes(" - ")) {
    rangeSeparator = " - ";
  } else if (pricePart.includes("-")) {
    rangeSeparator = "-";
  } else if (pricePart.toLowerCase().includes(" s/d ")) {
    rangeSeparator = " s/d ";
  } else if (pricePart.toLowerCase().includes(" sd ")) {
    rangeSeparator = " sd ";
  } else if (pricePart.toLowerCase().includes(" sampai ")) {
    rangeSeparator = " sampai ";
  }

  if (rangeSeparator) {
    const parts = pricePart.split(rangeSeparator);
    if (parts.length >= 2) {
      const part1 = parts[0].trim();
      const part2 = parts.slice(1).join(rangeSeparator).trim();

      const formatted1 = formatSingleNumber(part1);

      // If user just typed the dash or separator and is still typing the second number
      if (!part2) {
        return `${prefix}${formatted1 || part1} - ${unitPart}`.trim();
      }

      const formatted2 = formatSingleNumber(part2);
      if (!formatted2) {
        return `${prefix}${formatted1 || part1} - ${part2}${unitPart}`.trim();
      }

      return `${prefix}${formatted1} - ${formatted2}${unitPart}`.trim();
    }
  }

  // 5. Single price formatting
  const digitsOnly = pricePart.replace(/[^0-9]/g, "");
  if (!digitsOnly) {
    return prefix ? prefix.trim() : (unitPart ? unitPart.trim() : val);
  }

  const formattedNum = Number(digitsOnly).toLocaleString("id-ID");
  return `${prefix}Rp ${formattedNum}${unitPart}`;
}
