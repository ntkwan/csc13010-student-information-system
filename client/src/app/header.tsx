'use client';
import Head from 'next/head';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Button, Avatar, Box, Typography, MenuItem, Menu } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import axios from 'axios';

interface HeaderProps {
    fetchAllProfiles: () => void;
    isLoggedIn: boolean;
    user: { username: string; avatar: string } | null;
    setUser: (user: { username: string; avatar: string } | null) => void;
}

const defaultAvatar = 'https://robohash.org/mail@ashallendesign.co.uk';

const Header = (props: HeaderProps) => {
    const { fetchAllProfiles, isLoggedIn, user, setUser } = props;

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClickMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        event.target.value = '';

        // Process file (JSON or CSV)
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/import`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            fetchAllProfiles();
        } catch (error) {
            console.error('Import failed:', error);
        }
    };

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/export/${format}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    responseType: 'blob', // Important for handling file responses
                },
            );

            const blob = new Blob([response.data]); // Create a blob from response
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleViewLogs = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/logs/download`,
                {
                    responseType: 'blob', // Ensures file is received as a binary blob
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );

            // Create a download link
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `logs-${new Intl.DateTimeFormat('en-GB', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            }).format(new Date())}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            handleCloseMenu(); // Close menu after download
        } catch (error) {
            console.error('Failed to download logs:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/sign-out`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );

            if (typeof window !== 'undefined')
                localStorage.removeItem('authToken');
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const router = useRouter();

    return (
        <>
            <Head>
                <title>
                    {isLoggedIn
                        ? 'Student Information System'
                        : 'Welcome to the Student Information System'}
                </title>
                <meta
                    name="For administrator to manage school records efficiently"
                    content="Student Information System"
                />
            </Head>

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
            >
                <Box
                    sx={{
                        border: '2px solid #1976d2',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        display: 'flex', // Change to flex for alignment
                        alignItems: 'center', // Center vertically
                        cursor: 'pointer',
                    }}
                    onClick={() => router.push('/')}
                >
                    <img
                        src="https://hcmus.edu.vn/wp-content/uploads/2023/04/Logo-chinh-e1681638380305.png"
                        alt="University Logo"
                        style={{ marginRight: '10px', height: '50px' }} // Adjust height as needed
                    />
                    <Typography style={{ userSelect: 'none' }}>
                        <>
                            <Typography
                                variant="h6" // Larger size
                                component="span"
                                style={{ fontWeight: 'bold' }} // Bold text
                            >
                                University of Science, VNU-HCM
                            </Typography>
                            <br />
                            {isLoggedIn ? (
                                <Typography>
                                    Student Information System
                                </Typography>
                            ) : (
                                <Typography>
                                    Welcome to Student Information System
                                </Typography>
                            )}
                        </>
                    </Typography>
                </Box>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                />

                <Box
                    display="flex"
                    alignItems="center"
                    style={{ position: 'relative' }}
                >
                    {isLoggedIn ? (
                        <>
                            <Box display="flex" mr={2} gap={2} mt={2} mb={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={handleImportClick}
                                >
                                    JSON/CSV
                                </Button>

                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<CloudDownloadIcon />}
                                    onClick={() => handleExport('json')}
                                >
                                    JSON
                                </Button>

                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<CloudDownloadIcon />}
                                    onClick={() => handleExport('csv')}
                                >
                                    CSV
                                </Button>
                            </Box>

                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid #ccc"
                                borderRadius="8px"
                                padding="8px"
                                onClick={handleClickMenu}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Avatar
                                    src={user?.avatar || defaultAvatar}
                                    alt={user?.username}
                                    sx={{ marginRight: '10px' }}
                                />
                                <Typography
                                    variant="body1"
                                    sx={{
                                        marginLeft: '10px',
                                        userSelect: 'none',
                                    }}
                                >
                                    {user?.username}
                                </Typography>
                            </Box>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleCloseMenu}
                                sx={{ mt: 1 }}
                            >
                                <MenuItem onClick={handleViewLogs}>
                                    <ListAltIcon sx={{ marginRight: '8px' }} />
                                    Activity logs
                                </MenuItem>
                                <MenuItem
                                    onClick={handleSignOut}
                                    sx={{ color: 'red' }}
                                >
                                    <ExitToAppIcon
                                        sx={{
                                            marginRight: '8px',
                                            color: 'red',
                                        }}
                                    />
                                    Sign out
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => router.push('/login')}
                                style={{ marginRight: '10px' }}
                            >
                                Sign In
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </>
    );
};

export default Header;
