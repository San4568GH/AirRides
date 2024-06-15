import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:4000/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const userInfo = await response.json();
          setUserInfo(userInfo);
        } else {
          console.error('Failed to fetch profile', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [setUserInfo]);

  async function logout() {
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    if (confirmLogout) {
      try {
        const response = await fetch('http://localhost:4000/logout', {
          credentials: 'include',
          method: 'POST',
        });

        if (response.ok) {
          alert('Successfully Logged out.');
          setUserInfo(null);
          console.log('Logged out successfully');
        } else {
          alert('Unexpected Error while logging out');
          console.error('Failed to log out');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">
        <img src="logo.svg" alt="logo" />
        AirRides
      </Link>
      <nav>
        {username && (
          <>
           {username==='admin' &&
           (
            <>
            <Link to='/admin'>Admin Panel</Link>
            </>
           )}
            <span>Welcome, <b>{username}</b>!!</span>
            <Link to="/dashboard">Dashboard</Link>
            <a onClick={logout}>Logout</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
