"use client";
import { useState, useEffect } from "react";
import mqtt from "mqtt";
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const DTable = () => {
  const [rows, setRows] = useState([]); // Array to store table rows
  const [lastId, setLastId] = useState(0); // ID counter for unique row keys

  useEffect(() => {
    const username = "tgr";
    const password = "tgr18";

    // Connect to MQTT WebSocket
    const client = mqtt.connect("ws://210.246.215.31:8083", {
      username,
      password,
    });

    client.on("connect", () => {
      console.log("MQTT WebSocket connected");
      client.subscribe("main/predict"); // Subscribe to the desired topic
    });

    client.on("message", (topic, message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()); // Parse message as JSON
        console.log("Received:", parsedMessage);

        // Ensure `time` is valid before formatting
        const time = parseFloat(parsedMessage.time);
        if (isNaN(time)) {
          console.error("Invalid time value:", parsedMessage.time);
          return;
        }

        // Add received data to rows
        setRows((prevRows) => [
          ...prevRows,
          {
            id: lastId + 1,
            time: time.toFixed(2), // Format time to 2 decimal places
            prediction: parsedMessage.prediction || "Unknown", // Fallback for missing prediction
          },
        ]);

        setLastId((prevId) => prevId + 1);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    return () => {
      client.end(); // Cleanup MQTT connection on component unmount
    };
  }, [lastId]);

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar title={"Insight"} />
        <div className="relative bg-blueGray-800 md:pt-15 pb-32 pt-12">
          <div className="px-4 md:px-10 w-full mt-2">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">
                Real-time Prediction Table
              </h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time (s)</TableCell>
                      <TableCell>Prediction</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.time}</TableCell>
                        <TableCell>{row.prediction}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DTable;
