import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeDisplay = ({ data }) => {
  //const qrData = JSON.stringify(data);
  const day = data["invoiceDate"]
    ? (() => {
        const dateValue = data["invoiceDate"];

        // Check if the date is already in "YYYY-MM-DD" format
        const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateValue);

        let date;
        if (isISOFormat) {
          // If the date is already in "YYYY-MM-DD" format, use it directly
          date = new Date(dateValue);
        } else {
          // If the date is in "DD-MM-YYYY" or "DD/MM/YYYY" format
          const dateParts = dateValue.split(/[-/]/); // Split on both '-' and '/'
          date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`); // Convert to YYYY-MM-DD format
        }

        const dayOfWeek = date.getDay(); // Get the day of the week (0-6)
        const dayMapping = ["G", "A", "B", "C", "D", "E", "F"]; // Map days to letters
        return dayMapping[dayOfWeek]; // Return the mapped code for the day
      })()
    : "N/A";

  const qrData = `${data.customerName},${data.salesman},${data.customerId},${data.invoiceNumber},${data.invoiceDate},${data.totalAmount},${day}`;
  return (
    <div>
      <QRCodeCanvas value={qrData} size={100} />
    </div>
  );
};

export default QRCodeDisplay;
