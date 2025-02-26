'use client';

import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

interface SettingDashboardProps {
    emailSuffix: string;
    phonePrefix: string;
    setEmailSuffix: (emailSuffix: string) => void;
    setPhonePrefix: (phonePrefix: string) => void;
}

const SettingDashboard = (props: SettingDashboardProps) => {
    const { emailSuffix, phonePrefix, setEmailSuffix, setPhonePrefix } = props;

    const [error, setError] = useState('');

    const validatePhoneNumberPrefix = (prefix: string) => {
        const regex = /^\+\d+$/;
        return regex.test(prefix);
    };

    const validateEmailSuffix = (suffix: string) => {
        const regex = /^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(suffix);
    };

    const handleSaveSettings = () => {
        if (!validatePhoneNumberPrefix(phonePrefix)) {
            setError("Invalid prefix. Must start with '+' followed by digits.");
            return;
        }

        if (!validateEmailSuffix(emailSuffix)) {
            setError(
                "Invalid suffix. Must start with '@' followed by domain name.",
            );
            return;
        }
        setError('');

        axios
            .put(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/settings?emailSuffix=${emailSuffix}&phonePrefix=${phonePrefix}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            )
            .then(() => {
                console.log('Settings saved successfully');
            })
            .catch((error) => {
                setError(
                    error.response?.data?.message ||
                        'An error occurred. Please try again.',
                );
            });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    border: '2px solid #1976d2',
                    borderRadius: '8px',
                    padding: '16px',
                    maxWidth: '400px',
                    backgroundColor: '#f9f9f9',
                }}
            >
                <Typography variant="h6" gutterBottom>
                    University settings
                </Typography>
                <TextField
                    fullWidth
                    label="Email Suffix"
                    variant="outlined"
                    value={emailSuffix}
                    onChange={(e) => setEmailSuffix(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Phone Number Prefix"
                    variant="outlined"
                    value={phonePrefix}
                    onChange={(e) => {
                        const value = e.target.value;
                        setPhonePrefix(value);
                        if (value === '' || validatePhoneNumberPrefix(value)) {
                            setError('');
                        } else {
                            setError(
                                "Invalid prefix. Must start with '+' followed by digits.",
                            );
                        }
                    }}
                    error={Boolean(error)}
                    helperText={error}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSaveSettings}
                >
                    Save Settings
                </Button>
            </Box>
        </Box>
    );
};

export default SettingDashboard;
