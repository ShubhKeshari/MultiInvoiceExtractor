import React from "react";

const UploadButton = ({ setPdfFile }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        style={{
          marginBottom: "10px",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          backgroundColor: "#f8f8f8",
          fontSize: "16px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#f8f8f8")}
      />
    </div>
  );
};

export default UploadButton;
