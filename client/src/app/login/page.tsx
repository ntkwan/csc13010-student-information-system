/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
    Alert,
    FormControlLabel,
    Checkbox,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        setError(null);
        setLoading(true);
        if (typeof window === 'undefined') return;
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/sign-in`,
                { email, password },
            );
            const { accessToken, refreshToken } = response.data;

            if (rememberMe) {
                localStorage.setItem('authToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
            } else {
                localStorage.setItem('authToken', accessToken);
            }

            console.log('Login successful:', response.data);
            router.push('/');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    'Login failed. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        handleLogin();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#f5f5f5',
                padding: '20px',
            }}
        >
            <Box
                sx={{
                    maxWidth: '400px',
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    padding: '30px',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{ textAlign: 'center', marginBottom: '20px' }}
                >
                    Login
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ marginBottom: '20px' }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ marginBottom: '20px' }}
                        required
                    />
                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ marginBottom: '20px' }}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        edge="end"
                                    >
                                        {showPassword ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) =>
                                    setRememberMe(e.target.checked)
                                }
                            />
                        }
                        label="Remember Me"
                        sx={{ marginBottom: '20px' }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ marginBottom: '20px' }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                </form>
                <Typography
                    variant="body2"
                    sx={{ textAlign: 'center', marginBottom: '20px' }}
                >
                    <a href="/forgot-password" style={{ color: '#1976d2' }}>
                        Forgot Password?
                    </a>
                </Typography>
            </Box>
        </Box>
    );
};

export default LoginPage;
