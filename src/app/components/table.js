import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField, Box } from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

dayjs.extend(utc);

const DataTable = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false); // Track filtering state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Function to fetch items from the API
  const fetchItems = async () => {
    try {
      const response = await axios.get(
        "http://210.246.215.31:1000/api/v1/fetch"
      );
      const dataWithFormattedTimestamps = response.data.map((row) => ({
        ...row,
        ts: formatTimestampToGMT7(row.ts), // Convert timestamp to GMT+7
      }));
      setRows(dataWithFormattedTimestamps);
      if (!isFiltering) {
        setFilteredRows(dataWithFormattedTimestamps); // Update filteredRows only if not filtering
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Function to format timestamp to GMT+7
  const formatTimestampToGMT7 = (timestampInSeconds) => {
    const timestampInMilliseconds = timestampInSeconds * 1000; // Convert to milliseconds
    return dayjs
      .utc(timestampInMilliseconds)
      .utcOffset(7)
      .format("DD-MM-YYYY HH:mm:ss");
  };

  const handleEdit = async (newRow) => {
    console.log("Updating row:", newRow);
    try {
      const response = await axios.put(
        `http://210.246.215.31:1000/api/v1/update/${newRow._id}`,
        newRow
      );

      const updatedRow = response.data;
      setRows((prevRows) =>
        prevRows.map((row) => (row._id === updatedRow._id ? updatedRow : row))
      );
      return updatedRow;
    } catch (error) {
      console.error("Error updating data:", error);
      fetchItems();
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://210.246.215.31:1000/api/v1/delete/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const applyFilter = () => {
    setIsFiltering(true); // Start filtering mode
    if (startDate && endDate) {
      const filtered = rows.filter((row) => {
        const rowDate = dayjs(row.ts, "DD-MM-YYYY HH:mm:ss"); // Parse formatted timestamp
        return rowDate.isAfter(startDate) && rowDate.isBefore(endDate);
      });
      setFilteredRows(filtered);
    } else {
      setFilteredRows(rows);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 10000); // Fetch items every 10 seconds
    return () => clearInterval(interval); // Clear the interval
  }, []);

  const resetFilter = () => {
    setIsFiltering(false); // Stop filtering mode
    setFilteredRows(rows); // Reset filtered rows to original rows
    setStartDate(null); // Clear start date
    setEndDate(null); // Clear end date
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 150, hide: true },
    { field: "ts", headerName: "Timestamp", width: 180, editable: false },
    { field: "power", headerName: "Power", width: 150, editable: true },
    { field: "pressure", headerName: "Pressure", width: 150, editable: true },
    { field: "force", headerName: "Force", width: 150, editable: true },
    {
      field: "cycle_count",
      headerName: "Cycle Count",
      width: 150,
      editable: true,
    },
    { field: "PoP", headerName: "PoP", width: 150, editable: true },
    {
      field: "L1_GND",
      headerName: "Voltage L1-GND",
      width: 150,
      editable: true,
    },
    {
      field: "L2_GND",
      headerName: "Voltage L2-GND",
      width: 150,
      editable: true,
    },
    {
      field: "L3_GND",
      headerName: "Voltage L3-GND",
      width: 150,
      editable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleDelete(params.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", backgroundColor: "white", p: 2 }}>
      {/* Date Range Filter */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <DateTimePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(props) => <TextField {...props} />}
          />
          <DateTimePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(props) => <TextField {...props} />}
          />
          <Button variant="contained" onClick={applyFilter}>
            Apply Filter
          </Button>
          <Button variant="outlined" onClick={resetFilter}>
            Reset Filter
          </Button>
          <Button variant="outlined" color="primary" onClick={fetchItems}>
            Refresh Data
          </Button>
        </Box>
      </LocalizationProvider>

      {/* Data Grid */}
      <DataGrid
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
          columns: {
            columnVisibilityModel: {
              _id: false,
            },
          },
        }}
        rows={filteredRows}
        columns={columns}
        processRowUpdate={handleEdit} // This is where the row update is processed
        getRowId={(row) => row._id}
        autoHeight
      />
    </Box>
  );
};

export default DataTable;
