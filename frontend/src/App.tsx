import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import Overview from './pages/Overview'
import URLScanner from './pages/URLScanner'
import WebsiteScanner from './pages/WebsiteScanner'
import ExtensionScanner from './pages/ExtensionScanner'
import BehaviorMonitor from './pages/BehaviorMonitor'
import ThreatIntelligence from './pages/ThreatIntelligence'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import PolicyEngine from './pages/PolicyEngine'
import Settings from './pages/Settings'
import DatabaseExplorer from './pages/DatabaseExplorer'
import Docs from './pages/Docs'
import Help from './pages/Help'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Overview />} />
              <Route path="url-scanner" element={<URLScanner />} />
              <Route path="website-scanner" element={<WebsiteScanner />} />
              <Route path="extension-scanner" element={<ExtensionScanner />} />
              <Route path="behavior" element={<BehaviorMonitor />} />
              <Route path="threat-intelligence" element={<ThreatIntelligence />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="policies" element={<PolicyEngine />} />
              <Route path="settings" element={<Settings />} />
              <Route path="database" element={<DatabaseExplorer />} />
              <Route path="docs" element={<Docs />} />
              <Route path="help" element={<Help />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
