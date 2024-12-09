import React from "react";

const SummarySection = ({ 
  title, 
  componentLabel, 
  outdoorLabel, 
  componentValue, 
  outdoorValue, 
  loadingMessage,
  unit
}) => {
  return (
    <div>
        <h2>{title}</h2>
        {componentValue !== null && outdoorValue !== null ? (
            <>
            <p>
                <span style={{ marginRight: "50px" }}>{componentLabel}:</span>
                <span>{componentValue} {unit}</span>
            </p>
            <p>
                <span style={{ marginRight: "50px" }}>{outdoorLabel}:</span>
                <span>{outdoorValue} {unit}</span>
            </p>
            </>
        ) : (
            <p>{loadingMessage}</p>
        )}
    </div>
  );
};

export default SummarySection;