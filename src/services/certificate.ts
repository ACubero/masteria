import { jsPDF } from "jspdf";

export const downloadCertificate = (studentName: string) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setTextColor(248, 250, 252);
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.text("TÍTULO DE MÁSTER", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(20);
  doc.text("En Inteligencia Artificial", pageWidth / 2, 65, {
    align: "center",
  });

  doc.setFontSize(16);
  doc.text("Por la presente se certifica que", pageWidth / 2, 85, {
    align: "center",
  });

  doc.setTextColor(129, 140, 248); // indigo-400
  doc.setFontSize(32);
  doc.text(studentName.toUpperCase(), pageWidth / 2, 105, { align: "center" });

  doc.save(`Certificado_Master_IA_${studentName.replace(/\s+/g, "_")}.pdf`);
};
