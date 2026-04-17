import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RFPBotPage from './pages/RFPBotPage'
import HistoryPage from './pages/HistoryPage'
import ProtectedRoute from './components/Common/ProtectedRoute'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/rfp-bot" element={<RFPBotPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
