"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Tabs,
  Tab,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Delete } from "@mui/icons-material"; // Import delete icon
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import mqtt from "mqtt";
import Swal from "sweetalert2";

const Controlpanel = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tabValue, setTabValue] = useState(0);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now()); // Key for resetting input
  const [topic, setTopic] = useState(""); // The currently subscribed topic
  const [tempT, setTempT] = useState(""); // Temporary topic input
  const [tempM, setTempM] = useState(""); // Temporary message input
  const [sendT, setSendT] = useState(""); // Temporary topic input
  const [messages, setMessages] = useState([]); // List of incoming messages
  const [client, setClient] = useState(null); // MQTT client
  const [files2, setFiles2] = useState([]);
  const [mode, setMode] = useState(0); // State for mode

  useEffect(() => {
    // Create MQTT client with authentication
    const mqttClient = mqtt.connect("ws://210.246.215.31:8083", {
      username: "tgr", // Replace with your MQTT username
      password: "tgr18", // Replace with your MQTT password
    });
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker with authentication");
    });

    mqttClient.on("message", (topic, message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `Topic ${topic} >>> ${message.toString()}`,
      ]);
    });

    return () => {
      mqttClient.end();
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();

    if (client && sendT && tempM) {
      client.publish(sendT, tempM);
      console.log(`Sent message to topic: ${sendT} - ${tempM}`);
      Swal.fire({
        title: "Success!",
        text: `send ${tempM} to topic ${sendT}`,
        icon: "success",
        timer: 1500,
      });
      setTempM("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (client && tempT) {
      // Unsubscribe from the previous topic if there was one
      if (topic) {
        client.unsubscribe(topic, () => {
          console.log(`Unsubscribed from previous topic: ${topic}`);
        });
      }

      // Clear previous messages before subscribing to the new topic
      setMessages([]);

      // Update the topic state
      setTopic(tempT);

      // Subscribe to the new topic
      client.subscribe(tempT, (err) => {
        if (!err) {
          console.log(`Subscribed to topic: ${tempT}`);
        } else {
          console.error("Subscription error:", err);
        }
      });
      Swal.fire({
        title: "Success!",
        text: `Topic is ${tempT}`,
        icon: "success",
        timer: 1500,
      });
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFiles = [...event.target.files].filter((file) =>
      file.name.toLowerCase().endsWith(".zip")
    );

    if (selectedFiles.length !== event.target.files.length) {
      setUploadStatus("Only .zip files are allowed.");
    } else {
      setUploadStatus("");
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]); // Append new files to existing files
  };

  // Handle file removal
  const handleFileRemove = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setInputKey(Date.now()); // Reset input key to allow re-selecting the same file
  };

  // Handle multiple file upload
  const handleFileUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("Please select at least one .zip file before uploading.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("filepatch", file); // Use "filepatch" for each file as required by the backend
    });

    try {
      setUploadStatus("");
      setIsUploading(true);

      const response = await axios.post(
        "http://210.246.215.31:1000/api/v1/uploadPatch",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setUploadStatus("Files uploaded successfully!");
        setFiles([]); // Clear files after successful upload
      } else {
        setUploadStatus("Failed to upload files.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("An error occurred while uploading the files.");
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch the file list from the API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          "http://210.246.215.31:1000/api/v1/getPatches"
        ); // Adjust the URL to match your API endpoint
        setFiles2(response.data.files); // Set the files in state
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
    const interval = setInterval(fetchFiles, 10000); // Fetch files every 10 seconds
    return () => clearInterval(interval); // Clear the interval
  }, []);

  // Function to handle file download
  const handleUpdate = async (filename) => {
    // สร้าง payload ในรูปแบบ JSON
    const payload = JSON.stringify({ update: filename });

    // Publish ไปที่ MQTT topic
    client.publish("main/line", payload, (error) => {
      if (error) {
        console.error("Failed to publish message:", error);
      } else {
        console.log("Message published successfully:", payload);
      }
    });
  };

  const handleUpload = async (filename) => {
    // สร้าง payload ในรูปแบบ JSON
    const payload = JSON.stringify({ drop: filename });

    // Publish ไปที่ MQTT topic
    client.publish("main/line", payload, (error) => {
      if (error) {
        console.error("Failed to publish message:", error);
      } else {
        console.log("Message published successfully:", payload);
      }
    });
  };

  const handleFileChangeConfig = (event) => {
    const selectedFiles = [...event.target.files].filter((file) =>
      file.name.toLowerCase().endsWith(".wav")
    );

    if (selectedFiles.length !== event.target.files.length) {
      setUploadStatus("Only .wav files are allowed.");
    } else {
      setUploadStatus("");
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]); // Append only .wav files
  };

  const handleFileUploadConfig = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("input", file);
    });

    try {
      setIsUploading(true);
      const response = await axios.post(
        "http://210.246.215.31:1000/api/v1/uploadInput",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 200) {
        setUploadStatus("Files uploaded successfully!");
        setFiles([]); // Clear files after upload
      } else {
        setUploadStatus("Failed to upload files.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("An error occurred while uploading the files.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMode = async (newMode) => {
    setMode(newMode);
    const payload = JSON.stringify({ mode: "" + newMode });

    client.publish("main/line", payload, (error) => {
      if (error) {
        console.error("Failed to publish message:", error);
      } else {
        console.log("Message published successfully:", payload);
      }
    });
  };

  // Automatically hide alert after 1 second
  useEffect(() => {
    if (uploadStatus) {
      const timer = setTimeout(() => {
        setUploadStatus("");
      }, 3000); // 1 second delay

      return () => clearTimeout(timer); // Clear timer if component unmounts
    }
  }, [uploadStatus]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar title={"Raspberry Pi Control"} />
        <div className="relative bg-blueGray-800 md:pt-15 pb-32 pt-12">
          <div className="px-4 md:px-10 w-full mt-2">
            {/* MUI Tabs */}
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                backgroundColor: "white",
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="Tab"
              >
                <Tab label="Patch Management" />
                <Tab label="MQTT Raspberry Pi" />
                <Tab label="Config Mode" />
              </Tabs>
            </Box>
            <Box sx={{ padding: 2 }}>
              {tabValue === 0 && (
                <Typography>
                  <Box
                    sx={{
                      maxWidth: 400,
                      mx: "auto",
                      textAlign: "center",
                      p: 2,
                      bgcolor: "#2a2d3e",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ color: "#fff" }}
                    >
                      Upload Patch To Server
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <input
                        key={inputKey} // Add key prop to reset input
                        type="file"
                        multiple // Allow multiple files
                        accept=".zip" // Accept only .zip files
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="contained"
                          component="span"
                          sx={{ mb: 1 }}
                        >
                          Choose Files
                        </Button>
                      </label>

                      {files.length > 0 && (
                        <List
                          sx={{
                            width: "100%",
                            maxHeight: 200,
                            overflow: "auto",
                            bgcolor: "#2a2d3e",
                          }}
                        >
                          {files.map((file, index) => (
                            <ListItem
                              key={index}
                              sx={{
                                color: "#ccc",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              {file.name}
                              <IconButton
                                edge="end"
                                color="error"
                                onClick={() => handleFileRemove(index)}
                              >
                                <Delete />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      )}

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFileUpload}
                        sx={{ width: "100%", mt: 1 }}
                        disabled={isUploading || files.length === 0}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>

                      {isUploading && (
                        <Box sx={{ width: "100%", mt: 1 }}>
                          <LinearProgress />
                        </Box>
                      )}
                    </Box>

                    {uploadStatus && (
                      <Alert
                        severity={
                          uploadStatus.includes("successfully")
                            ? "success"
                            : "error"
                        }
                        sx={{ mt: 2 }}
                      >
                        {uploadStatus}
                      </Alert>
                    )}
                  </Box>
                  <div className="mt-5">
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
                          {files2.map((file, index) => (
                            <TableRow key={index}>
                              <TableCell>{file.name}</TableCell>
                              <TableCell>{file.size}</TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleUpdate(file.name)}
                                >
                                  Update Pi
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </Typography>
              )}
              {tabValue === 1 && (
                <Typography>
                  <div className="bg-slate-500 h-fit p-2">
                    <div className="flex justify-center">
                      <form onSubmit={handleSend} className="w-2/4">
                        <label
                          htmlFor="topic"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Topic:
                        </label>
                        <input
                          type="text input"
                          name="topic"
                          placeholder="Enter topic"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          onChange={(e) => setSendT(e.target.value)}
                        />
                        <label
                          htmlFor="message"
                          className="block my-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Message:
                        </label>
                        <input
                          type="text"
                          id="message"
                          value={tempM}
                          onChange={(e) => setTempM(e.target.value)}
                          placeholder="Enter message"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <div className="flex justify-center">
                          <button
                            type="submit"
                            className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          >
                            send message
                          </button>
                        </div>
                      </form>
                    </div>

                    <br />
                    <div className="mx-4">
                      <form
                        onSubmit={handleSubmit}
                        className="flex justify-center items-center"
                      >
                        <input
                          type="text"
                          id="topic"
                          value={tempT}
                          onChange={(e) => setTempT(e.target.value)}
                          placeholder="Enter topic"
                          className="w-1/5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          className=" text-white ml-3 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                          Set Topic
                        </button>
                      </form>
                      <div className="bg-slate-200 text-black mt-2 p-4 border-black rounded-xl border">
                        {messages.length > 0 ? (
                          <ul className=" max-h-96 overflow-scroll">
                            {messages.map((msg, index) => (
                              <li className="my-1" key={index}>
                                {msg}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No messages yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Typography>
              )}
              {tabValue === 2 && (
                <Typography>
                  <button
                    type="button"
                    className=" text-white ml-3 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    onClick={() => handleMode(0)}
                  >
                    Mode Auto
                  </button>
                  <button
                    type="button"
                    className=" text-white ml-3 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    onClick={() => handleMode(1)}
                  >
                    Mode Manual
                  </button>
                  <div className="mt-5">
                    <Box
                      sx={{
                        maxWidth: 400,
                        mx: "auto",
                        textAlign: "center",
                        p: 2,
                        bgcolor: "#2a2d3e",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ color: "#fff" }}
                      >
                        Upload Sound Input for Pi
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <input
                          key={inputKey}
                          type="file"
                          multiple
                          accept=".wav" // Restrict to .wav files only
                          onChange={handleFileChangeConfig}
                          style={{ display: "none" }}
                          id="file-upload-config"
                        />
                        <label htmlFor="file-upload-config">
                          <Button
                            variant="contained"
                            component="span"
                            sx={{ mb: 1 }}
                          >
                            Choose Files
                          </Button>
                        </label>

                        {files.length > 0 && (
                          <List
                            sx={{
                              width: "100%",
                              maxHeight: 200,
                              overflow: "auto",
                              bgcolor: "#2a2d3e",
                            }}
                          >
                            {files.map((file, index) => (
                              <ListItem
                                key={index}
                                sx={{
                                  color: "#ccc",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                {file.name}
                                <IconButton
                                  edge="end"
                                  color="error"
                                  onClick={() => handleFileRemove(index)}
                                >
                                  <Delete />
                                </IconButton>
                              </ListItem>
                            ))}
                          </List>
                        )}

                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleFileUploadConfig}
                          sx={{ width: "100%", mt: 1 }}
                          disabled={isUploading || files.length === 0}
                        >
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                        {isUploading && (
                          <Box sx={{ width: "100%", mt: 1 }}>
                            <LinearProgress />
                          </Box>
                        )}
                      </Box>
                      {uploadStatus && (
                        <Alert
                          severity={
                            uploadStatus.includes("successfully")
                              ? "success"
                              : "error"
                          }
                          sx={{ mt: 2 }}
                        >
                          {uploadStatus}
                        </Alert>
                      )}
                    </Box>

                    {/* Table to display available files to send to Pi */}
                    <TableContainer component={Paper} className="mt-5">
                      <Table aria-label="files table">
                        <TableHead>
                          <TableRow>
                            <TableCell>File Name</TableCell>
                            <TableCell>Size (bytes)</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {files2
                            .filter((file) =>
                              file.name.toLowerCase().endsWith(".wav")
                            ) // กรองเฉพาะไฟล์ .wav
                            .map((file, index) => (
                              <TableRow key={index}>
                                <TableCell>{file.name}</TableCell>
                                <TableCell>{file.size}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleUpload(file.name)}
                                  >
                                    Send to Pi
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </Typography>
              )}
            </Box>
          </div>
        </div>
      </div>
    </>
  );
};

export default Controlpanel;
