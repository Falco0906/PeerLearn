import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import '../login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin, register: authRegister } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    universityId: '',
    department: 'Engineering'
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authLogin(loginData.email, loginData.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authRegister(registerData);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div style={{ display: 'inline-block', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '1rem', marginBottom: '1rem' }}>
            <Building color="white" size={40} />
          </div>
          <h1>KLH Peer Learning</h1>
          <p>
            {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
          </p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
            className={`login-tab ${isLogin ? 'active' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
            className={`login-tab ${!isLogin ? 'active' : ''}`}
          >
            Register
          </button>
        </div>

        {/* Alert Messages */}
        <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Forms */}
        <div className="login-form">
          {isLogin ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="your.email@klh.edu.in"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="form-button"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">University ID</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input
                    type="text"
                    name="universityId"
                    value={registerData.universityId}
                    onChange={handleRegisterChange}
                    required
                    pattern="KLH\d{3,}"
                    title="University ID must start with KLH followed by at least 3 digits (e.g., KLH001)"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="KLH001"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <div style={{ position: 'relative' }}>
                  <Building style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <select
                    name="department"
                    value={registerData.department}
                    onChange={handleRegisterChange}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', appearance: 'none', background: 'white' }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Business">Business</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="your.email@klh.edu.in"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    minLength="6"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Create a password (min 6 characters)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="form-button"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
