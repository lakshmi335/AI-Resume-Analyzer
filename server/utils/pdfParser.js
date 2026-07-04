const pdfParse = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return { success: true, text: data.text.trim(), numPages: data.numpages };
  } catch (error) {
    return { success: false, text: '', error: error.message };
  }
};

const cleanResumeText = (text) => {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();
};

module.exports = { extractTextFromPDF, cleanResumeText };
