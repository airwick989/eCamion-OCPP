import React from "react";

const SummarySection = ({ 
  title, 
  data, // Array of objects containing label and value
  loadingMessage,
  unit
}) => {
  return (
    <div>
      <h2>{title}</h2>
      {data && data.length > 0 ? (
        data.map(({ label, value }, index) => (
          <p key={index}>
            <span style={{ marginRight: "50px" }}>{label}:</span>
            <span>{value} {unit}</span>
          </p>
        ))
      ) : (
        <p>{loadingMessage}</p>
      )}
    </div>
  );
};

export default SummarySection;