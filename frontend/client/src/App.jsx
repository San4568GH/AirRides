import './App.css'
import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import SearchForm from './pages/user/SearchForm'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import { UserContextProvider } from './context/UserContext'
import AdminPage from './pages/admin/Admin'
import CityPage from './pages/admin/CityPage'
import AddFlightPage from './pages/admin/AddFlightPage'
import Dashboard from './pages/user/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageCities from './pages/admin/ManageCities'
import ManageFlights from './pages/admin/ManageFlights'
import ViewBookings from './pages/admin/ViewBookings'
import FlightSchedules from './pages/admin/FlightSchedules'
import UserManagement from './pages/admin/UserManagement'
import ProtectedRoute from './auth/ProtectedRoute'
import SuperAdminSetup from './utils/SuperAdminSetup'

 function App()
{
 return(
  <UserContextProvider>
    <Routes>
    <Route path='/' element={<Layout></Layout>}>
    <Route index element={<SearchForm></SearchForm>}/>
    <Route path='/login' element={<Login></Login>}/>
    <Route path='register' element={<Register></Register>}/>
    <Route path='/setup' element={<SuperAdminSetup />} />
    <Route path='/admin' element={
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    }/>
    <Route path="/admin/cities" element={
      <ProtectedRoute requiredRole="admin">
        <ManageCities />
      </ProtectedRoute>
    } />
    <Route path="/admin/flights" element={
      <ProtectedRoute requiredRole="admin">
        <ManageFlights />
      </ProtectedRoute>
    } />
    <Route path="/admin/bookings" element={
      <ProtectedRoute requiredRole="admin">
        <ViewBookings />
      </ProtectedRoute>
    } />
    <Route path="/admin/schedules" element={
      <ProtectedRoute requiredRole="admin">
        <FlightSchedules />
      </ProtectedRoute>
    } />
    <Route path="/admin/users" element={
      <ProtectedRoute requiredRole="admin">
        <UserManagement />
      </ProtectedRoute>
    } />
    <Route path="/admin/add-cities" element={
      <ProtectedRoute requiredRole="admin">
        <CityPage />
      </ProtectedRoute>
    } />
    <Route path='/admin/add-flight' element={
      <ProtectedRoute requiredRole="admin">
        <AddFlightPage />
      </ProtectedRoute>
    }/>
    <Route path="/dashboard" element={<Dashboard />} />

    </Route>
  </Routes>
  </UserContextProvider>
  

)
}

export default App