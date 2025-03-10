'use client';

import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Switch,
    FormControlLabel,
} from '@mui/material';
import axios from 'axios';

interface SettingDashboardProps {
    emailSuffix: string;
    phonePrefix: string;
    creationDeleteWindow: number;
    setEmailSuffix: (emailSuffix: string) => void;
    setPhonePrefix: (phonePrefix: string) => void;
    setCreationDeleteWindow: (creationDeleteWindow: number) => void;
    setEnableValidation: (enableValidation: boolean) => void;
    enableValidation: boolean;
}

const SettingDashboard = (props: SettingDashboardProps) => {
    const {
        emailSuffix,
        phonePrefix,
        creationDeleteWindow,
        setEmailSuffix,
        setPhonePrefix,
        setCreationDeleteWindow,
        setEnableValidation,
        enableValidation,
    } = props;

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const validatePhoneNumberPrefix = (prefix: string) => {
        const regex = /^\+\d+$/;
        return regex.test(prefix);
    };

    const validateEmailSuffix = (suffix: string) => {
        const regex = /^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(suffix);
    };

    const handleSaveSettings = (enableValidation?: boolean) => {
        if (!validatePhoneNumberPrefix(phonePrefix)) {
            setError("Invalid prefix. Must start with '+' followed by digits.");
            return;
        }

        if (!validateEmailSuffix(emailSuffix)) {
            setError(
                "Invalid suffix. Must start with '@' followed by a domain name.",
            );
            return;
        }

        setError('');
        setSuccessMessage('');

        axios
            .put(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/settings?emailSuffix=${emailSuffix}&phonePrefix=${phonePrefix}&creationDeleteWindow=${creationDeleteWindow}&enableValidation=${enableValidation}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            )
            .then(() => {
                console.log('Settings saved successfully');
                setSuccessMessage('Settings saved successfully');
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
                    University Settings
                </Typography>

                {/* Toggle Switch for Enabling/Disabling Settings */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={enableValidation}
                            onChange={() => {
                                setEnableValidation(!enableValidation);
                                handleSaveSettings(!enableValidation);
                            }}
                            color="primary"
                        />
                    }
                    label={
                        enableValidation
                            ? 'Settings Enabled'
                            : 'Settings Disabled'
                    }
                    sx={{ mb: 2 }}
                />

                {/* Email Suffix */}
                <TextField
                    fullWidth
                    label="Email Suffix"
                    variant="outlined"
                    value={emailSuffix}
                    onChange={(e) => {
                        setEmailSuffix(e.target.value);
                        setSuccessMessage('');
                    }}
                    sx={{ mb: 2 }}
                    disabled={!enableValidation}
                />

                {/* Phone Number Prefix */}
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
                        setSuccessMessage('');
                    }}
                    error={Boolean(error)}
                    helperText={error}
                    sx={{ mb: 2 }}
                    disabled={!enableValidation}
                />

                {/* Creation Delete Window */}
                <TextField
                    fullWidth
                    label="Creation Delete Window"
                    variant="outlined"
                    type="number"
                    value={creationDeleteWindow}
                    onChange={(e) =>
                        setCreationDeleteWindow(Number(e.target.value))
                    }
                    sx={{ mb: 2 }}
                    disabled={!enableValidation}
                />

                {/* Save Button */}
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleSaveSettings(enableValidation)}
                    disabled={!enableValidation}
                >
                    Save Settings
                </Button>

                {successMessage && (
                    <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ mt: 2, textAlign: 'center' }}
                    >
                        {successMessage}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default SettingDashboard;
