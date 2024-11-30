import jsPDF from 'jspdf'
import '@/assets/js/SIMHEI-normal.js'

let isFontRegistered = false

export const createPDFDocument = (): jsPDF => {
  const doc = new jsPDF()
  if (!isFontRegistered) {
    // 确保字体只注册一次
    doc.addFont('SIMHEI-normal.js', 'SIMHEI', 'normal')
    isFontRegistered = true
  }
  doc.setFont('SIMHEI')
  return doc
}