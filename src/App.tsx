import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import InstitutePage from "./pages/InstitutePage/InstitutePage";

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="insitute/:instName/:instFloor" element={<InstitutePage />} />
          <Route path="not-found" element={<NotFoundPage/>} />
          <Route path="*" element={<Navigate to={"not-found"} />} />
        </Routes>
      </BrowserRouter> 
    </>
  )
}

export default App
