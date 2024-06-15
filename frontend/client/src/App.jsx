import './App.css'
import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Header from './Header'
import SearchForm from './Pages/SearchForm'
import Login from './Pages/Login'
import Register from './Pages/Register'
import { UserContextProvider } from './UserContext'
import AdminPage from './Pages/Admin'
import CityPage from './Pages/CityPage'
import AddFlightPage from './Pages/AddFlightPage'
import Dashboard from './Pages/Dashboard'

 function App()
{
 return(
  <UserContextProvider>
    <Routes>
    <Route path='/' element={<Layout></Layout>}>
    <Route index element={<SearchForm></SearchForm>}/>
    <Route path='/login' element={<Login></Login>}/>
    <Route path='register' element={<Register></Register>}/>
    <Route path='/admin' element={<AdminPage></AdminPage>}/>
    <Route path="/admin/add-cities" element={<CityPage />} />
    <Route path='/admin/add-flight' element={<AddFlightPage></AddFlightPage>}/>
    <Route path="/dashboard" element={<Dashboard />} />

    </Route>
  </Routes>
  </UserContextProvider>
  

)
}

export default App