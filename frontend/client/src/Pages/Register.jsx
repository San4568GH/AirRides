import { useState } from 'react';
import { Navigate } from 'react-router-dom';

//Code for Register Page
export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email,setEmail]= useState('')
  const [redirect, setRedirect] = useState(false)

  async function register(ev) {
    ev.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',

        body: JSON.stringify({ username,email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }
      else {
        setRedirect(true);
        const data = await response.json();
        alert('Registration successful!')
        console.log('Registration successful:', data);
      }
    } catch (error) {
      alert('Failed to Register');
      console.error('Error during registration:', error);
    }
  }

  if (redirect)// to login page after registration
  {
    return <Navigate to={'/login'} />
  }


  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />

<input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button type="submit">Register</button>
    </form>
  );
}
