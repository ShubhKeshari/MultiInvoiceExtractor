import { useState } from "react";
import UploadButton from "./components/UploadButton";
import InvoiceReader from "./components/InvoiceReader";
import "./App.css";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  return (
    <>
      <div className="app-container">
        <h1>Invoice Extractor</h1>
        <UploadButton setPdfFile={setPdfFile} />
        {pdfFile && <InvoiceReader pdfFile={pdfFile} />}
      </div>
    </>
  );
}

export default App;
