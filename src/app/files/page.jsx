"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "../components/Sidebar/Sidebar.js";

const FilesTable = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [files, setFiles] = useState([]);

  // Fetch the file list from the API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          "http://210.246.215.31:1000/api/v1/soundAll"
        ); // Adjust the URL to match your API endpoint
        setFiles(response.data.files); // Set the files in state
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
    const interval = setInterval(fetchFiles, 10000); // Fetch files every 10 seconds
    return () => clearInterval(interval); // Clear the interval
  }, []);

  // Function to handle file download
  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`/api/download/${filename}`, {
        responseType: "blob", // Ensure the response is treated as a binary file
      });

      // Create a download link and click it to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar title={"Files"} />
        <div className="relative bg-blueGray-800 md:pt-15 pb-32 pt-12">
          <div className="px-4 md:px-10 w-full mt-2">
            <TableContainer component={Paper}>
              <Table aria-label="files table">
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Size (bytes)</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file, index) => (
                    <TableRow key={index}>
                      <TableCell>{file.name}</TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleDownload(file.name)}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilesTable;
