import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  Box,
  Modal, 
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from "../services/api";

const DataTable = ({ cabid, jid, headers, data, columnOrder, thresholds, setThresholds }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [openThresholds, setOpenThresholds] = useState(false);
  const [openClear, setOpenClear] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lowerBoundRef = useRef(null);
  const upperBoundRef = useRef(null);

  const handleClick = (event, header) => {
    setAnchorEl(event.currentTarget);
    setSelectedHeader(header);
  };

  const handleOpenThresholds = () => {
    setOpenThresholds(true);
    setAnchorEl(null);
  };

  const handleOpenClear = () => {
    setOpenClear(true);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedHeader(null);
    setOpenThresholds(false);
    setOpenClear(false);
    setError(null);
  };

  // Reorder headers if columnOrder is provided
  const orderedHeaders = columnOrder ? columnOrder.filter((col) => headers.includes(col)) : headers;

  const checkThreshold = (header, value) => {
    if ((thresholds[header]["low"] != null) && (value < thresholds[header]["low"])) {
      return -1;
    } else if ((thresholds[header]["high"] != null) && (value > thresholds[header]["high"])) {
      return 1;
    } else {
      return 0;
    }
  };

  const applyThresholds = async (clear) => {
    setLoading(true);
    setError(null);

    var lowerbound = null;
    var upperbound = null;

    if (!clear){
      lowerbound = lowerBoundRef.current.value;
      upperbound = upperBoundRef.current.value;
    };

    axios
      .get(`/setTableThresholds?cabinetid=${cabid}&chargerid=${jid}&header=${selectedHeader}&lowerbound=${lowerbound}&upperbound=${upperbound}&clear=${clear ? 1 : 0}`)
      .then((response) => {
        setThresholds(response.data.tablethresholds);
        setLoading(false);
        handleClose();
      })
      .catch((err) => {
        console.error(`Error setting threshold(s): ${err.message}`);
        setError("Failed to set threshold(s). Please try again later.");
        setLoading(false);
      });
  };

  useEffect(() => {
    //cccsfsdfsdfsdfsdfsdfdsfsdfsdfdsfdsfdsfdsfdsfsdfdsadasdasd 888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888console.log("Table re-rendered with new thresholds:", thresholds);
  }, [thresholds]); // Re-renders when `value` changes

  return (
    <TableContainer component={Paper} style={{ marginTop: "30px" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            {orderedHeaders.map((header, index) => (
              <TableCell
                key={index}
                align="center"
                sx={{
                  fontWeight: "bold",
                  cursor: thresholds[header] ? "pointer" : "default",
                  transition: "background-color 0.3s ease-in-out",
                  "&:hover": thresholds[header] ? { backgroundColor: "rgba(0, 0, 0, 0.1)" } : {},
                }}
                onClick={thresholds[header] ? (event) => handleClick(event, header) : undefined}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {header}
                  {thresholds[header] && <ArrowDropDownIcon sx={{ ml: 0.5 }} />}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {orderedHeaders.map((header, colIndex) => {
                let cellColour = "white";
                let textColour = "black";
                let cellVal = row[header];

                if (header in thresholds) {
                  let deviation = checkThreshold(header, cellVal);

                  if (deviation === -1) {
                    cellColour = "blue";
                  } else if (deviation === 1) {
                    cellColour = "red";
                  }
                  if (deviation !== 0) {
                    textColour = "white";
                  }
                }

                return (
                  <TableCell
                    key={`${rowIndex}-${colIndex}`}
                    align="center"
                    sx={{
                      backgroundColor: cellColour,
                      color: textColour,
                    }}
                  >
                    {cellVal ?? "-"}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dropdown menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleOpenThresholds}>Set Flagging Thresholds</MenuItem>
        <MenuItem onClick={handleOpenClear}>Clear Thresholds</MenuItem>
      </Menu>

      {/* Floating Overlay */}
      <Modal open={openThresholds} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%",
            maxHeight: "40%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          {/* Overlay Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">{selectedHeader}</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {/* Overlay Content */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: "50px",
              paddingX: "50px",
              marginTop: "30px",
            }}
          >
            <TextField
              id="lowerbound"
              label="Lower Bound"
              type="number"
              defaultValue={thresholds[selectedHeader]?.["low"]} // Will be empty if "low" is undefined or null
              inputRef={lowerBoundRef} // Attach ref
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <TextField
              id="upperbound"
              label="Upper Bound"
              type="number"
              defaultValue={thresholds[selectedHeader]?.["high"]} 
              inputRef={upperBoundRef}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <Button variant="contained" onClick={() => applyThresholds(false)} disabled={loading}> 
              {loading ? "Saving..." : "Set"} 
            </Button>
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
              {data && (
                <div>
                  <h3>{data.title}</h3>
                  <p>{data.body}</p>
                </div>
              )}
          </Box>
        </Box>
      </Modal>

      <Modal open={openClear} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%",
            maxHeight: "40%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          {/* Overlay Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">{selectedHeader}</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {/* Overlay Content */}
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", textAlign: "center", mt: 2, marginTop: "20px" }}>
            <Typography variant="body1" component="div">
              Are you sure you want to clear the current flagging thresholds?
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: "50px",
              paddingX: "50px",
              marginTop: "30px",
            }}
          >
            <Button variant="contained" onClick={() => applyThresholds(true)} disabled={loading}>{loading ? "Clearing..." : "Confirm"} </Button>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
          </Box>
        </Box>
      </Modal>
    </TableContainer>
  );
};

DataTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columnOrder: PropTypes.arrayOf(PropTypes.string),
  thresholds: PropTypes.object.isRequired,
};

export default DataTable;
