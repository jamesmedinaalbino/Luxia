import { jsPDF } from 'jspdf';
import { TechnicalActa } from '../types';

export const generateActaPDF = async (acta: TechnicalActa): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 15;
      drawMiniHeader();
    }
  };

  const drawMiniHeader = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`LUXIA SEGURIDAD ELECTRÓNICA | ${acta.code} - ${acta.projectName}`, margin + 3, y + 5.5);
    y += 12;
  };

  // --- TOP HEADER ---
  // Background brand banner
  doc.setFillColor(10, 25, 47); // deep navy
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');

  // Brand Name
  doc.setTextColor(56, 189, 248); // light cyan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LUXIA', margin + 6, y + 9);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('SISTEMAS DE SEGURIDAD ELECTRÓNICA & INTEGRACIÓN', margin + 6, y + 15);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('NIT: 901.328.440-8 | PBX: (+57) 1 744 8920 | operaciones@luxiaseguridad.com', margin + 6, y + 21);

  // Right box for document code & status
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 58, y + 3, 54, 20, 2, 2, 'F');
  
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text('CONSECUTIVO OFICIAL', pageWidth - margin - 55, y + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(acta.code, pageWidth - margin - 55, y + 13);

  const statusLabel = acta.status === 'firmada' ? 'CERTIFICADA / FIRMADA' : acta.status.toUpperCase();
  doc.setFillColor(acta.status === 'firmada' ? 16 : 71, acta.status === 'firmada' ? 185 : 85, acta.status === 'firmada' ? 129 : 105);
  doc.roundedRect(pageWidth - margin - 55, y + 15, 48, 5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.text(statusLabel, pageWidth - margin - 53, y + 18.5);

  y += 30;

  // Title of the Acta
  const typeMap: Record<string, string> = {
    visita_tecnica: 'ACTA DE VISITA TÉCNICA Y LEVANTAMIENTO DE CAMPO',
    servicio_mantenimiento: 'ACTA DE SERVICIO TÉCNICO Y MANTENIMIENTO',
    entrega_satisfaccion: 'ACTA DE ENTREGA Y RECEPCIÓN A SATISFACCIÓN',
  };

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 7, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(typeMap[acta.type] || 'ACTA DE CONTROL TÉCNICO', margin + 4, y + 5);

  y += 10;

  // --- GENERAL INFORMATION GRID ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 28, 1, 1, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 28, 1, 1, 'S');

  doc.setFontSize(8);
  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Proyecto:', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(acta.projectName, margin + 26, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Cliente:', margin + 4, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(acta.clientName, margin + 26, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Contacto / Cargo:', margin + 4, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${acta.clientContact} (${acta.clientPhone})`, margin + 30, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Dirección / Sede:', margin + 4, y + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${acta.address} - ${acta.city}`, margin + 30, y + 24);

  // Column 2 (Right side)
  const col2X = margin + 115;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha / Hora:', col2X, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(acta.createdAt, col2X + 22, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Elaborado por:', col2X, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(acta.createdByName, col2X + 22, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Rol en Obra:', col2X, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(acta.createdRole.toUpperCase(), col2X + 22, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Sistemas:', col2X, y + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(2, 132, 199);
  doc.text(acta.systemTypes.join(', '), col2X + 16, y + 24);

  y += 32;

  // --- OBJECTIVE & SCOPE ---
  checkPageBreak(25);
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('1. OBJETIVO DEL SERVICIO O VISITA', margin + 3, y + 3.8);
  y += 7;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const objLines = doc.splitTextToSize(acta.objective || 'Sin registrar.', contentWidth - 4);
  doc.text(objLines, margin + 2, y);
  y += objLines.length * 4.2 + 4;

  // --- WORK PERFORMED ---
  checkPageBreak(30);
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('2. DESCRIPCIÓN DE TRABAJOS REALIZADOS / ACTIVIDADES TÉCNICAS', margin + 3, y + 3.8);
  y += 7;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const workLines = doc.splitTextToSize(acta.workDone || 'Sin descripción detallada.', contentWidth - 4);
  doc.text(workLines, margin + 2, y);
  y += workLines.length * 4.2 + 4;

  // --- EQUIPMENT TABLE ---
  if (acta.equipment && acta.equipment.length > 0) {
    checkPageBreak(30 + acta.equipment.length * 7);
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('3. EQUIPOS Y COMPONENTES DE SEGURIDAD ELECTRÓNICA REGISTRADOS', margin + 3, y + 3.8);
    y += 6;

    // Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Tipo de Equipo', margin + 2, y + 4.2);
    doc.text('Marca / Modelo', margin + 48, y + 4.2);
    doc.text('Serial / N° Activo', margin + 102, y + 4.2);
    doc.text('Ubicación en Sitio', margin + 140, y + 4.2);
    doc.text('Estado', margin + 168, y + 4.2);
    y += 7;

    // Table rows
    acta.equipment.forEach((item, idx) => {
      checkPageBreak(8);
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 1, contentWidth, 6.5, 'F');
      }
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(item.type.substring(0, 25), margin + 2, y + 3.5);
      doc.text(`${item.brand} ${item.model}`.substring(0, 32), margin + 48, y + 3.5);
      doc.text(item.serial || 'S/N', margin + 102, y + 3.5);
      doc.text((item.location || 'General').substring(0, 18), margin + 140, y + 3.5);

      const statusColors: Record<string, [number, number, number]> = {
        operativo: [22, 101, 52],
        instalado: [3, 105, 161],
        reparado: [147, 51, 234],
        pendiente_cambio: [180, 83, 9],
      };
      const [cr, cg, cb] = statusColors[item.status] || [71, 85, 105];
      doc.setTextColor(cr, cg, cb);
      doc.setFont('helvetica', 'bold');
      doc.text(item.status.toUpperCase(), margin + 168, y + 3.5);

      y += 6.5;
    });
    y += 3;
  }

  // --- OBSERVATIONS & RECOMMENDATIONS ---
  checkPageBreak(25);
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('4. OBSERVACIONES Y RECOMENDACIONES TÉCNICAS', margin + 3, y + 3.8);
  y += 7;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const obsText = `Observaciones: ${acta.observations || 'Ninguna.'}\nRecomendaciones: ${acta.recommendations || 'Realizar rutinas periódicas de mantenimiento preventivo y limpieza de óptica.'}`;
  const obsLines = doc.splitTextToSize(obsText, contentWidth - 4);
  doc.text(obsLines, margin + 2, y);
  y += obsLines.length * 4.2 + 5;

  // --- PHOTOGRAPHIC EVIDENCE (IF ANY) ---
  if (acta.photos && acta.photos.length > 0) {
    checkPageBreak(45);
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('5. REGISTRO FOTOGRÁFICO DE INSTALACIÓN EN TIEMPO REAL', margin + 3, y + 3.8);
    y += 7;

    const photoWidth = 55;
    const photoHeight = 38;
    const photosPerRow = 3;
    const gap = 8;

    for (let i = 0; i < Math.min(acta.photos.length, 6); i++) {
      const photo = acta.photos[i];
      const col = i % photosPerRow;
      if (col === 0 && i !== 0) {
        y += photoHeight + 14;
        checkPageBreak(photoHeight + 14);
      }
      const px = margin + col * (photoWidth + gap);

      try {
        // Draw image frame
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(px, y, photoWidth, photoHeight, 1, 1, 'F');
        doc.addImage(photo.url, 'JPEG', px, y, photoWidth, photoHeight, undefined, 'FAST');
        doc.setDrawColor(203, 213, 225);
        doc.rect(px, y, photoWidth, photoHeight, 'S');

        // Caption text
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        const captionLines = doc.splitTextToSize(photo.caption || `Evidencia #${i + 1}`, photoWidth);
        doc.text(captionLines, px, y + photoHeight + 3.5);
      } catch {
        // If image fails to load or CORS, draw fallback placeholder
        doc.setFillColor(241, 245, 249);
        doc.rect(px, y, photoWidth, photoHeight, 'F');
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        doc.text(`[Evidencia #${i + 1}]`, px + 10, y + 18);
        doc.text(photo.caption || 'Foto en sitio', px + 2, y + photoHeight + 3.5);
      }
    }
    y += photoHeight + 14;
  }

  // --- SIGNATURES SECTION ---
  checkPageBreak(45);
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('6. FIRMAS DE CONFORMIDAD Y ENTREGA TÉCNICA', margin + 3, y + 3.8);
  y += 8;

  const sigBoxWidth = (contentWidth - 8) / 2;
  const sigBoxHeight = 34;

  // Box 1: CLIENT SIGNATURE
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, sigBoxWidth, sigBoxHeight, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigBoxWidth, sigBoxHeight, 1, 1, 'S');

  if (acta.clientSignature?.signatureBase64) {
    try {
      doc.addImage(acta.clientSignature.signatureBase64, 'PNG', margin + 10, y + 2, sigBoxWidth - 20, 15);
    } catch {
      // Signature text fallback
    }
  }

  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 6, y + 18, margin + sigBoxWidth - 6, y + 18);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(acta.clientSignature?.signerName || acta.clientContact || 'Cliente / Interventor', margin + 6, y + 22);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Doc: ${acta.clientSignature?.signerDocument || 'Registrado en acta'}`, margin + 6, y + 26);
  doc.text(`Cargo: ${acta.clientSignature?.signerRoleOrJob || 'Representante del Cliente'}`, margin + 6, y + 29.5);
  doc.text(`Fecha: ${acta.clientSignature?.date || acta.createdAt}`, margin + 6, y + 33);

  // Box 2: LUXIA RESPONSIBLE SIGNATURE
  const sig2X = margin + sigBoxWidth + 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(sig2X, y, sigBoxWidth, sigBoxHeight, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sig2X, y, sigBoxWidth, sigBoxHeight, 1, 1, 'S');

  if (acta.luxiaSignature?.signatureBase64) {
    try {
      doc.addImage(acta.luxiaSignature.signatureBase64, 'PNG', sig2X + 10, y + 2, sigBoxWidth - 20, 15);
    } catch {
      // Fallback
    }
  }

  doc.setDrawColor(148, 163, 184);
  doc.line(sig2X + 6, y + 18, sig2X + sigBoxWidth - 6, y + 18);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(acta.luxiaSignature?.signerName || acta.createdByName, sig2X + 6, y + 22);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Doc / Registro: ${acta.luxiaSignature?.signerDocument || 'CC y Matrícula Profesional'}`, sig2X + 6, y + 26);
  doc.text(`Cargo: ${acta.luxiaSignature?.signerRoleOrJob || `${acta.createdRole.toUpperCase()} LUXIA`}`, sig2X + 6, y + 29.5);
  doc.text(`Certificación LUXIA: ${acta.luxiaSignature?.date || acta.createdAt}`, sig2X + 6, y + 33);

  y += sigBoxHeight + 8;

  // --- FOOTER NOTE ON LAST PAGE ---
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  const legalNote = 'Este documento constituye constancia legal y técnica de los servicios y equipos instalados por LUXIA Seguridad Electrónica. Cualquier modificación no autorizada al sistema invalida la garantía técnica. Generado digitalmente por LUXIA App.';
  doc.text(doc.splitTextToSize(legalNote, contentWidth), margin, y);

  // Trigger browser download
  const cleanFilename = `Acta_LUXIA_${acta.code.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(cleanFilename);
};
