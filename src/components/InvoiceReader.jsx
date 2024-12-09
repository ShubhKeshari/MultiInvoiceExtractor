import React, { useState, useEffect } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import QRCodeDisplay from "./QRCodeDisplay";
//import { jsPDF } from "jspdf"; // Import jsPDF
import "jspdf-autotable";
// import { QRCodeCanvas } from "qrcode.react";
// import { createRoot } from "react-dom/client";
// import ReactDOMServer from "react-dom/server";
// import html2canvas from "html2canvas";

// Set worker source to match the installed version
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const InvoiceReader = ({ pdfFile }) => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const extractInvoices = async () => {
      const pdf = await getDocument(URL.createObjectURL(pdfFile)).promise;
      const invoiceData = [];
      const separatorRegex = /Page No\s+\d+\s+of\s+\d+/i;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");

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
              }
            }
            // if (invoiceNumber && totalAmount) {
            //   invoiceData.push({
            //     invoiceNumber: invoiceNumber || "N/A",
            //     invoiceDate: invoiceDate || "N/A",
            //     totalAmount: totalAmount || "N/A",
            //     customerName: customerName || "N/A",
            //     customerId: customerId || "N/A",
            //     salesman: salesman || "N/A",
            //   });
            // } else {
            //   console.warn(`Incomplete essential details on Page ${i}`);
            // }
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

 
  
  // const generatePDF = async () => {
  //   const doc = new jsPDF();
  //   // Generate table data with serial number and QR code info
  //   const tableData = invoices.map((invoice, index) => [
  //     index + 1, // Sl No. (serial number)
  //     invoice.invoiceNumber,
  //     invoice.invoiceDate,
  //     invoice.totalAmount,
  //     invoice.customerName,
  //     invoice.customerId,
  //     invoice.salesman,
  //     invoice, // Pass the entire invoice object to the QR code column
  //   ]);

  //   // Define columns for the table (including QR code column)
  //   const columns = [
  //     { title: "Sl No.", dataKey: "slNo" },
  //     { title: "Invoice Number", dataKey: "invoiceNumber" },
  //     { title: "Invoice Date", dataKey: "invoiceDate" },
  //     { title: "Total Amount", dataKey: "totalAmount" },
  //     { title: "Customer Name", dataKey: "customerName" },
  //     { title: "Customer ID", dataKey: "customerId" },
  //     { title: "Salesman", dataKey: "salesman" },
  //     { title: "QR Code", dataKey: "qrCode" }, // New column for QR Code
  //   ];

  //   // Temporary hidden container for QR codes
  //   const qrContainer = document.createElement("div");
  //   qrContainer.style.display = "none";
  //   document.body.appendChild(qrContainer);

  //   const qrPromises = []; // Array to track QR code rendering promises

  //   doc.autoTable({
  //     head: [columns.map((col) => col.title)], // Table headers
  //     body: tableData, // Table data
  //     didDrawCell: (data) => {
  //       if (data.column.index === 7) {
  //         const invoice = data.row.cells[7].raw; // Get the entire invoice object
  //         const qrId = `qrCode-${data.row.index}`; // Unique ID for the QR code container

  //         const qrCodeElement = document.createElement("div");
  //         qrCodeElement.id = qrId;
  //         qrContainer.appendChild(qrCodeElement);

  //         // Render QR code in the hidden container
  //         const root = createRoot(qrCodeElement);
  //         root.render(
  //           <QRCodeCanvas value={JSON.stringify(invoice)} size={128} />
  //         );

  //         // Create a promise for capturing the QR code
  //         const qrPromise = new Promise((resolve) => {
  //           setTimeout(() => {
  //             const canvas = qrCodeElement.querySelector("canvas");
  //             if (canvas) {
  //               const qrCodeDataUrl = canvas.toDataURL("image/png"); // Get PNG image
  //               const x = data.cell.x + 2; // Adjust X position
  //               const y = data.cell.y + 2; // Adjust Y position
  //               const width = 13; // Width of QR code
  //               const height = 13; // Height of QR code

  //               doc.addImage(qrCodeDataUrl, "PNG", x, y, width, height);
  //               resolve(); // Resolve the promise after adding the image
  //             } else {
  //               console.error("Canvas element not found for QR code.");
  //               resolve(); // Resolve even in error to avoid hanging promises
  //             }
  //           }, 500); // Allow time for rendering
  //         });

  //         qrPromises.push(qrPromise); // Add the promise to the array
  //       }
  //     },
  //   });

  //   // Wait for all QR codes to be rendered and added to the PDF
  //   await Promise.all(qrPromises);

  //   // Clean up hidden container
  //   qrContainer.remove();

  //   // Save the PDF
  //   doc.save("invoices.pdf");
  // };
  
  return (
    <div>
      <h2>Extracted Invoices</h2>
      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <>
          {/* <button onClick={generatePDF}>Generate PDF</button> */}
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
                    <QRCodeDisplay data={invoice} />
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
