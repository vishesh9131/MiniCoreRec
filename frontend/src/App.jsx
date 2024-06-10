import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Button,
  Slider,
  Typography,
  Box,
  AppBar,
  Toolbar,
  CssBaseline,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  Avatar,
  Card,
  CardContent,
  Divider,
  TextField,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import DraggableWrapper from "./components/DraggableWrapper"; // Import custom Draggable wrapper
import ResizableWrapper from "./components/ResizableWrapper"; // Import custom Resizable wrapper

const CustomSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "primary" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6750A4" },
    background: { default: "#f9f7fc", paper: "#FFFFFF" },
    text: { primary: "#1C1B1F" },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    fontWeightBold: 700,
    h4: { fontWeight: 700, fontSize: "1.5rem" },
    h6: { fontWeight: 700, fontSize: "1.25rem" },
    body1: { fontWeight: 400, fontSize: "1rem" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: "12px", textTransform: "none" } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { padding: "16px", borderRadius: "12px", boxShadow: "none" },
      },
    },
    MuiAppBar: { styleOverrides: { root: { borderRadius: "12px" } } },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#D0BCFF" },
    background: { default: "#121212", paper: "#1E1E1E" },
    text: { primary: "#E6E1E5" },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    fontWeightBold: 700,
    h4: { fontWeight: 700, fontSize: "1.5rem" },
    h6: { fontWeight: 700, fontSize: "1.25rem" },
    body1: { fontWeight: 400, fontSize: "1rem" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: "12px", textTransform: "none" } },
    },
    MuiPaper: {
      styleOverrides: { root: { padding: "16px", borderRadius: "12px" } },
    },
    MuiAppBar: { styleOverrides: { root: { borderRadius: "12px" } } },
  },
});

function App() {
  const [model, setModel] = useState("");
  const [label, setLabel] = useState("");
  const [topK, setTopK] = useState(2);
  const [threshold, setThreshold] = useState(0.5);
  const [recommendations, setRecommendations] = useState([]);
  const [labels, setLabels] = useState([]);
  const [models, setModels] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const api = import.meta.env.VITE_API_URL;

  const saveLocation = (e, d) => {
    setLocation({ x: d.x, y: d.y });

    // Save location to the local storage
    localStorage.setItem("location", JSON.stringify({ x: d.x, y: d.y }));
  };

  const fetchLocation = () => {
    // Fetch location from the local storage
    const savedLocation = localStorage.getItem("location");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  };

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    // Fetch labels from the backend
    const fetchLabels = async () => {
      try {
        const response = await axios.get(`${api}/labels`);
        console.log("Fetched labels:", response.data.labels); // Debug log
        setLabels(response.data.labels);
      } catch (error) {
        setErrorMessage("Error fetching labels. Please try again.");
      }
    };
    fetchLabels();

    // Fetch model options from the backend
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${api}/models`);
        console.log("Fetched models:", response.data.models); // Debug log
        setModels(response.data.models);
      } catch (error) {
        setErrorMessage("Error fetching models. Please try again.");
      }
    };
    fetchModels();
  }, []);

  const handleRunModel = async () => {
    if (!model || !label) {
      setErrorMessage(
        "Please select both a model and a label before running the model."
      );
      return;
    }

    try {
      const response = await axios.post(`${api}/recommend`, {
        model,
        label,
        topK,
        threshold,
      });
      console.log("Received recommendations:", response.data.recommendations); // Debug log
      setRecommendations(response.data.recommendations);
      setErrorMessage(""); // Clear error message on success
    } catch (error) {
      setErrorMessage("Error running model. Please try again.");
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, paddingInline: 2 }}>
        <AppBar
          position="static"
          color="background"
          sx={{
            borderRadius: 9999,
            maxHeight: 80,
            display: "flex",
            justifyContent: "center",
            mt: 2,
          }}
          elevation={0}
          variant="outlined"
        >
          <Toolbar>
            <Avatar alt="App Icon" src="coreRec.svg" sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CoreRec
            </Typography>
            <FormControlLabel
              control={
                <CustomSwitch
                  checked={darkMode}
                  onChange={handleToggleDarkMode}
                  sx={{ mr: 1 }}
                />
              }
              sx={{ ml: 2 }}
              label={darkMode ? "Light Mode" : "Dark Mode"}
            />
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 2 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} variant="standard">
              {errorMessage}
            </Alert>
          )}
          {/* Grid container 2 grid on large screen and 1 on small screen */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ mb: 4, borderRadius: 2, height: 300 }}>
                <Typography variant="h4" gutterBottom>
                  Test_A
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={models}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select model"
                          variant="outlined"
                        />
                      )}
                      value={models.find((mdl) => mdl.value === model) || null}
                      onChange={(event, newValue) =>
                        setModel(newValue ? newValue.value : "")
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={labels}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select node label"
                          variant="outlined"
                        />
                      )}
                      value={label}
                      onChange={(event, newValue) => setLabel(newValue || "")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Top K</Typography>
                    <Slider
                      value={topK}
                      onChange={(e, val) => setTopK(val)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ marginTop: 5 }}>
                    <Typography gutterBottom>Threshold</Typography>
                    <Slider
                      value={threshold}
                      onChange={(e, val) => setThreshold(val)}
                      min={0}
                      max={1}
                      step={0.1}
                      marks
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleRunModel}
                      fullWidth
                      sx={{ mb: 2, borderRadius: 2, boxShadow: "none" }}
                    >
                      Run Model
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <DraggableWrapper
                func={saveLocation}
                position={{
                  x: location.x || 1,
                  y: location.y || 1,
                }}
              >
                <ResizableWrapper
                  width={298}
                  height={276}
                  minConstraints={[200, 100]}
                  maxConstraints={[600, 400]}
                >
                  <Paper
                    elevation={3}
                    sx={{ cursor: "move", height: "100%", borderRadius: 2 }}
                  >
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Recommended nodes:
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box
                      sx={{
                        p: 2,
                        height: "calc(100% - 48px)",
                        overflow: "auto",
                      }}
                    >
                      {recommendations.map((rec, index) => (
                        <Typography key={index} variant="h6" gutterBottom>
                          {rec}
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                </ResizableWrapper>
              </DraggableWrapper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
