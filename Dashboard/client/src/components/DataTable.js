import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const DataTable = ({ headers, data, columnOrder, thresholds }) => {
  // If columnOrder is provided, reorder the headers accordingly
  const orderedHeaders = columnOrder ? columnOrder.filter((col) => headers.includes(col)) : headers;

  const checkThreshold = (header, value) => {
    if (value < thresholds[header]['low']){
      return -1
    } else if (value > thresholds[header]['high']){
      return 1
    } else {
      return 0
    }
  };

  return (
    <TableContainer component={Paper} style={{ marginTop: "30px" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            {orderedHeaders.map((header, index) => (
              <TableCell key={index} align="center" sx={{ fontWeight: "bold" }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {orderedHeaders.map((header, colIndex) => {
                // Define color conditions
                let cellcolour = 'white';
                let textcolour = 'black';
                let cellval = row[header];

                if (header in thresholds){
                  let deviation = checkThreshold(header, cellval);

                  if (deviation === -1){
                    cellcolour = 'blue';
                  } else if (deviation === 1){
                    cellcolour = 'red';
                  };
                  if (deviation != 0){
                    textcolour = 'white';
                  };
                }

                return (
                  <TableCell
                    key={`${rowIndex}-${colIndex}`}
                    align="center"
                    sx={{
                      backgroundColor: cellcolour,
                      color: textcolour,
                    }}
                  >
                    {cellval ?? "-"}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

DataTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columnOrder: PropTypes.arrayOf(PropTypes.string), // Optional prop for custom column ordering
};

export default DataTable;