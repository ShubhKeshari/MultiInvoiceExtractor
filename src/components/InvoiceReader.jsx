import React, { useState, useEffect } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import QRCodeDisplay from "./QRCodeDisplay";
//import { jsPDF } from "jspdf"; // Import jsPDF
import "jspdf-autotable";
// import { QRCodeCanvas } from "qrcode.react";
// import { createRoot } from "react-dom/client";
// import ReactDOMServer from "react-dom/server";
// import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
// Set worker source to match the installed version
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const InvoiceReader = ({ pdfFile }) => {
  const [invoices, setInvoices] = useState([]);
  const [imgSrc, setImgSrc] = useState([]);
  useEffect(() => {
    const extractInvoices = async () => {
      const pdf = await getDocument(URL.createObjectURL(pdfFile)).promise;
      //console.log("PDF", pdf);
      const invoiceData = [];
      const separatorRegex = /Page No\s+\d+\s+of\s+\d+/i;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        //console.log("textContent", textContent);

        const pageText = textContent.items.map((item) => item.str).join(" ");
        //console.log("pagewiseText", pageText);

        //console.log("Extracted Text for Page", i, pageText);

        if (separatorRegex.test(pageText)) {
          const text = pageText.match(separatorRegex)?.[0];
          const pageNum = /Page No\s+(\d+)\s+of\s+(\d+)/i;
          const m = text.match(pageNum);
          if (m) {
            // Extract the matched page numbers and convert them to integers
            const currentPage = parseInt(m[1], 10); // Current page (first captured group)
            const totalPages = parseInt(m[2], 10); // Total pages (second captured group)
            // Log the extracted page numbers
            //console.log(`Current Page: ${currentPage}`);
            //console.log(`Total Pages: ${totalPages}`);
            let invoiceNumber;
            let invoiceDate;
            let customerId;
            let customerName;
            let salesman;
            let totalAmount;
            if (currentPage === 1 && totalPages === 1) {
              invoiceNumber = pageText.match(
                /Invoice No\s+Invoice Date\s*[:\-]?\s*[:\-]?\s*(\S+)/
              )?.[1];
              invoiceDate = pageText.match(/Invoice Date.{22}(.{10})/)?.[1];
              customerId = pageText.match(/Cust Code\s*[:\-]?\s*(\S+)/)?.[1];
              customerName = pageText.match(
                /Cust Name\s*[:\-]?\s*(.+?)(?=\s*:)/
              )?.[1];
              salesman = pageText.match(
                /Salesman\s*[:\-]?\s*(.+?)(?=\s+Po No|$)/
              )?.[1];
              totalAmount = pageText
                .match(/Amount Payable\s*[:\-]?\s*([\d,\.]+)\s*$/)?.[1]
                .replace(/,/g, "");
              invoiceData.push({
                invoiceNumber: invoiceNumber || "N/A",
                invoiceDate: invoiceDate || "N/A",
                totalAmount: totalAmount || "N/A",
                customerName: customerName || "N/A",
                customerId: customerId || "N/A",
                salesman: salesman || "N/A",
                pageNo: i,
              });
            } else if (currentPage === 1) {
              invoiceNumber = pageText.match(
                /Invoice No\s+Invoice Date\s*[:\-]?\s*[:\-]?\s*(\S+)/
              )?.[1];
              invoiceDate = pageText.match(/Invoice Date.{22}(.{10})/)?.[1];
              customerId = pageText.match(/Cust Code\s*[:\-]?\s*(\S+)/)?.[1];
              customerName = pageText.match(
                /Cust Name\s*[:\-]?\s*(.+?)(?=\s*:)/
              )?.[1];
              salesman = pageText.match(
                /Salesman\s*[:\-]?\s*(.+?)(?=\s+Po No|$)/
              )?.[1];

              invoiceData.push({
                invoiceNumber: invoiceNumber || "N/A",
                invoiceDate: invoiceDate || "N/A",
                customerName: customerName || "N/A",
                customerId: customerId || "N/A",
                salesman: salesman || "N/A",
              });
            } else if (currentPage === totalPages) {
              totalAmount = pageText
                .match(/Amount Payable\s*[:\-]?\s*([\d,\.]+)\s*$/)?.[1]
                .replace(/,/g, "");
              if (invoiceData.length > 0) {
                invoiceData[invoiceData.length - 1].totalAmount =
                  totalAmount || "N/A";
                invoiceData[invoiceData.length - 1].pageNo = i;
              }
            }
          } else {
            console.log("Page no. not found");
          }
        } else {
          console.log(`No separator found for Page ${i}`);
        }
      }
      setInvoices(invoiceData);
    };

    if (pdfFile) {
      extractInvoices();
    }
  }, [pdfFile]);

  const getImage = (DataQR) => {
    setImgSrc((prev) => [...prev, DataQR]);
  };

  const generatePDF = () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first");
      return;
    }
    console.log("this is all image", imgSrc);
    const reader = new FileReader();
    reader.onload = async () => {
      const pdfData = new Uint8Array(reader.result);

      // Load the PDF document using pdf.js
      const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
      const pageCount = pdfDoc.numPages;

      // Initialize jsPDF instance to create a new PDF
      const doc = new jsPDF();

      // Load the image that you want to add to each page

      const imageWidth = 50; // Image width (in mm)
      const imageHeight = 50; // Image height (in mm)

      // Iterate over all pages of the loaded PDF
      for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        let fltr = imgSrc.filter((item) => item.pageNo == i);
        let imageSrc;
        if (fltr.length > 0) {
          imageSrc = fltr[0].img;
        }
        // Render the PDF page into a canvas
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Add the existing page content to the new PDF
        if (i > 1) {
          doc.addPage();
        }
      
          doc.addImage(
            canvas,
            "PNG",
            0,
            0,
            canvas.width * 0.264583,
            canvas.height * 0.264583
          );

        // Get the height of the page to place the image at the bottom
        const pageHeight = doc.internal.pageSize.height;

        // Add image at the bottom of each page
        if (fltr.length > 0) {
          doc.addImage(
            imageSrc,
            "PNG",
            10,
            pageHeight - imageHeight - 10,
            imageWidth,
            imageHeight
          );
        }
      }

      // Save the new PDF with the image added
      doc.save("output.pdf");
    };

    reader.readAsArrayBuffer(pdfFile);
  };

  return (
    <div>
      <h2>Extracted Invoices</h2>
      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <>
          <button onClick={generatePDF}>Add Image to Existing PDF</button>
          <table>
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>Invoice Number</th>
                <th>Invoice Date</th>
                <th>Total Amount</th>
                <th>Customer Name</th>
                <th>Customer ID</th>
                <th>Salesman</th>
                <th>QR Code</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.invoiceDate}</td>
                  <td>{invoice?.totalAmount}</td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.customerId}</td>
                  <td>{invoice.salesman}</td>
                  <td>
                    <QRCodeDisplay data={invoice} getImage={getImage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default InvoiceReader;
