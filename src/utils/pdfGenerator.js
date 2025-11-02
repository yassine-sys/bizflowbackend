import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Génère un devis PDF professionnel
 * @param {Object} quote - Données du devis
 * @param {Object} contact - Infos du client
 * @param {Object} tenant - Infos de l'entreprise
 */
export async function generateQuotePDF(quote, contact, tenant) {
  const tempDir = "temp";
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const filePath = path.join(tempDir, `quote-${quote.id}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ========== HEADER ==========
    if (fs.existsSync("assets/logo.png")) {
      doc.image("assets/logo.png", 50, 40, { width: 80 });
    }
    doc.fontSize(20).text(tenant.name || "BIZFlow", 150, 50);
    doc.fontSize(10).text(tenant.email || "", 150, 70);
    doc.text(tenant.address || "", 150, 85);
    doc.moveDown(2);

    // ========== TITRE ==========
    doc.fontSize(22).fillColor("#333").text("DEVIS", { align: "right" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`N° : ${quote.id}`, { align: "right" });
    doc.text(`Date : ${new Date(quote.created_at).toLocaleDateString()}`, { align: "right" });
    doc.moveDown(1.5);

    // ========== CLIENT ==========
    doc.fontSize(14).fillColor("#000").text("Client :", 50);
    doc.fontSize(12).fillColor("#444");
    doc.text(contact.name);
    doc.text(contact.email);
    if (contact.phone) doc.text(contact.phone);
    doc.moveDown(1.5);

    // ========== DÉTAILS ==========
    doc.fontSize(14).fillColor("#000").text("Détails du devis :", 50);
    doc.moveDown(0.5);

    const items = quote.items
      ? JSON.parse(quote.items)
      : [
          { description: "Service principal", quantity: 1, price: quote.amount },
        ];

    // Tableau
    const tableTop = doc.y + 10;
    const itemSpacing = 25;

    doc.fontSize(12).fillColor("#000");
    doc.text("Description", 50, tableTop);
    doc.text("Qté", 300, tableTop);
    doc.text("Prix unitaire (TND)", 350, tableTop);
    doc.text("Total (TND)", 480, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    let totalHT = 0;

    items.forEach((item) => {
      const lineTotal = item.quantity * item.price;
      totalHT += lineTotal;

      doc.fillColor("#333");
      doc.text(item.description, 50, y);
      doc.text(item.quantity, 310, y);
      doc.text(item.price.toFixed(2), 370, y);
      doc.text(lineTotal.toFixed(2), 490, y);
      y += itemSpacing;
    });

    doc.moveDown(2);

    // ========== TOTAUX ==========
    const TVA = totalHT * 0.19;
    const totalTTC = totalHT + TVA;

    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
    doc.fontSize(12).fillColor("#000");
    doc.text(`Sous-total HT :`, 400, y + 20);
    doc.text(`${totalHT.toFixed(2)} TND`, 500, y + 20, { align: "right" });
    doc.text(`TVA (19%) :`, 400, y + 40);
    doc.text(`${TVA.toFixed(2)} TND`, 500, y + 40, { align: "right" });
    doc.font("Helvetica-Bold");
    doc.text(`Total TTC :`, 400, y + 70);
    doc.text(`${totalTTC.toFixed(2)} TND`, 500, y + 70, { align: "right" });
    doc.moveDown(3);

    // ========== SIGNATURE ==========
    doc.font("Helvetica").fontSize(12).fillColor("#444");
    doc.text("Signature et cachet :", 50, doc.y + 20);
    doc.moveDown(2);
    doc.text("__________________________", 50);

    // ========== FOOTER ==========
    doc.fontSize(10).fillColor("#777");
    doc.text("Merci pour votre confiance.", 50, 780, { align: "center" });

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}
