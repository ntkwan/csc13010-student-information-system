/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    LinearProgress,
    IconButton,
    InputAdornment,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const ForgotPasswordPage = () => {
    const router = useRouter();

    const [phase, setPhase] = useState(1); // 1: Input Email, 2: Input OTP, 3: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validatePassword = (password: string): boolean => {
        return password.length >= 8; // Minimum length of 8 characters
    };

    const calculatePasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength += 1; // Minimum length
        if (/[A-Z]/.test(password)) strength += 1; // Uppercase letter
        if (/[a-z]/.test(password)) strength += 1; // Lowercase letter
        if (/[0-9]/.test(password)) strength += 1; // Number
        if (/[\W]/.test(password)) strength += 1; // Special character
        return strength;
    };

    const handleSubmitEmail = async () => {
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/password-recovery`,
                {
                    email,
                },
            );
            setSuccess('OTP has been sent to your email.');
            setPhase(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOtp = async () => {
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/verify-otp`,
                { email, otp },
            );
            setSuccess(
                'OTP verified successfully. Please set your new password.',
            );
            setPhase(3);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setError(null);
        setSuccess(null);
        setLoading(true);

        if (!validatePassword(newPassword)) {
            setError('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/reset-password`,
                { email, otp, newPassword },
            );
            setSuccess('Password reset successfully. You can now log in.');
            router.push('/login');
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to reset password.',
            );
        } finally {
            setLoading(false);
        }
    };

    const renderPhaseContent = () => {
        switch (phase) {
            case 1:
                return (
                    <>
                        <Typography variant="h5" sx={{ marginBottom: '20px' }}>
                            Forgot Password
                        </Typography>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ marginBottom: '20px' }}
                            required
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                            onClick={handleSubmitEmail}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Send OTP'
                            )}
                        </Button>
                    </>
                );
            case 2:
                return (
                    <>
                        <Typography variant="h5" sx={{ marginBottom: '20px' }}>
                            Enter OTP
                        </Typography>
                        <TextField
                            label="OTP"
                            type="text"
                            fullWidth
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            sx={{ marginBottom: '20px' }}
                            required
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                            onClick={handleSubmitOtp}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Verify OTP'
                            )}
                        </Button>
                    </>
                );
            case 3:
                const passwordStrength = calculatePasswordStrength(newPassword);
                return (
                    <>
                        <Typography variant="h5" sx={{ marginBottom: '20px' }}>
                            Reset Password
                        </Typography>
                        <TextField
                            label="New Password"
                            fullWidth
                            value={newPassword}
                            type={showPassword ? 'text' : 'password'}
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
                        {newPassword && (
                            <>
                                <Typography
                                    variant="body2"
                                    sx={{ marginBottom: '5px' }}
                                >
                                    Password Strength:
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={(passwordStrength / 5) * 100}
                                    sx={{
                                        height: '10px',
                                        borderRadius: '5px',
                                        marginBottom: '15px',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor:
                                                passwordStrength < 3
                                                    ? 'red'
                                                    : passwordStrength < 4
                                                      ? 'orange'
                                                      : 'green',
                                        },
                                    }}
                                />
                            </>
                        )}
                        <TextField
                            label="Confirm Password"
                            fullWidth
                            value={confirmPassword}
                            type={showConfirmPassword ? 'text' : 'password'}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{ marginBottom: '20px' }}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword,
                                                )
                                            }
                                            edge="end"
                                        >
                                            {showConfirmPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                            onClick={handleResetPassword}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </>
                );
            default:
                return null;
        }
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
                {error && (
                    <Alert severity="error" sx={{ marginBottom: '20px' }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ marginBottom: '20px' }}>
                        {success}
                    </Alert>
                )}
                {renderPhaseContent()}
            </Box>
        </Box>
    );
};

export default ForgotPasswordPage;
