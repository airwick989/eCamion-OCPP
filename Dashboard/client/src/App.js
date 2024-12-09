import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home'; 
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/Theme"; // Import the theme you just created

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
          <Routes>
            <Route path="/" element={<Home/>} />
          </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;