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

const DataTable = ({ headers, data, columnOrder }) => {
  // If columnOrder is provided, reorder the headers accordingly
  const orderedHeaders = columnOrder
    ? columnOrder.filter((col) => headers.includes(col))
    : headers;

  return (
    <TableContainer component={Paper} style={{marginTop: "30px"}}>
      <Table>
        <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {orderedHeaders.map((header, index) => (
                    <TableCell
                        key={index}
                        align="center"
                        sx={{ fontWeight: "bold" }}
                    >
                        {header}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {orderedHeaders.map((header, colIndex) => (
                <TableCell key={`${rowIndex}-${colIndex}`} align="center">
                  {row[header] ?? "-"}
                </TableCell>
              ))}
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