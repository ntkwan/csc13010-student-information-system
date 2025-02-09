/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import {
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Paper,
    Avatar,
    Box,
    Typography,
} from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const UsersPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<{
        [key: string]: { [key: string]: string };
    }>({});
    const [user, setUser] = useState<{
        username: string;
        avatar: string;
    } | null>(null);
    const [isSignOutVisible, setIsSignOutVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const defaultAvatar = 'https://robohash.org/mail@ashallendesign.co.uk';

    const fetchRecords = async () => {
        setLoading(true);
        setErrorMessage('');
        if (!searchQuery) {
            fetchAllProfiles();
            fetchUserProfile();
            return;
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/search?name=${searchQuery}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            if (response.data.length === 0) {
                setErrorMessage(
                    'No users found matching your search criteria.',
                );
            } else {
                setRecords(response.data);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setErrorMessage(
                    'No users found matching your search criteria.',
                );
            } else {
                console.error('Error fetching records:', error);
                setErrorMessage(
                    'An error occurred while fetching data. Please try again.',
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        setLoading(true);
        if (typeof window === 'undefined') return;
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Access token is missing');
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            setUser(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
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

    const handleAvatarClick = () => {
        setIsSignOutVisible(!isSignOutVisible);
    };

    const fetchAllProfiles = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users`, // Fetch all users
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            if (response.data.length === 0) {
                setErrorMessage('No users found.');
            } else {
                setRecords(response.data);
            }
        } catch (error) {
            console.error('Error fetching all profiles:', error);
            setErrorMessage(
                'An error occurred while fetching data. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleHeaderClick = () => {
        router.push('/');
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (localStorage.getItem('authToken')) {
            fetchUserProfile();
            fetchAllProfiles();
        }
    }, []);

    const handleEditChange = (id: string, field: string, value: string) => {
        setEditing((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const saveChanges = async () => {
        const updates = Object.entries(editing).map(([id, updates]) => ({
            id,
            updates,
        }));
        if (updates.length === 0) return;

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users`,
                updates,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            setEditing({});
            fetchRecords();
        } catch (error) {
            console.error('Error updating records:', error);
        }
    };

    const isLoggedIn =
        typeof window !== 'undefined'
            ? localStorage.getItem('authToken')
            : null;

    return (
        <div style={{ padding: '20px' }}>
            <Head>
                <title>
                    {isLoggedIn ? 'User Management' : 'Welcome to the Homepage'}
                </title>
                <meta
                    name="For administrator to manage users efficiently"
                    content="User management page"
                />
            </Head>

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
            >
                <Typography
                    variant="h4"
                    style={{
                        cursor: 'pointer',
                        userSelect: 'none', // Prevent text from being selected
                    }}
                    onClick={handleHeaderClick}
                >
                    {isLoggedIn ? 'User Management' : 'Welcome to Homepage'}
                </Typography>
                <Box
                    display="flex"
                    alignItems="center"
                    style={{ position: 'relative' }}
                >
                    {isLoggedIn ? (
                        <>
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid #ccc"
                                borderRadius="8px"
                                padding="8px"
                                onClick={handleAvatarClick}
                                style={{ cursor: 'pointer' }}
                            >
                                <Avatar
                                    src={user?.avatar || defaultAvatar}
                                    alt={user?.username}
                                    style={{ marginRight: '10px' }}
                                />
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginLeft: '10px',
                                        userSelect: 'none', // Prevent text from being selected
                                    }}
                                >
                                    {user?.username}
                                </Typography>
                            </Box>
                            {isSignOutVisible && (
                                <Box
                                    mt={6}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '0',
                                        transform: 'translateY(-50%)',
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleSignOut}
                                        startIcon={
                                            <ExitToApp
                                                style={{ color: 'red' }}
                                            />
                                        }
                                    >
                                        Sign Out
                                    </Button>
                                </Box>
                            )}
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

            {isLoggedIn && (
                <>
                    <Box
                        mb={6}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        style={{ width: '100%' }}
                    >
                        <Box width="50%" minWidth="300px">
                            <TextField
                                label="Search by username or email"
                                variant="outlined"
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && fetchRecords()
                                }
                                style={{ marginBottom: '20px' }}
                            />
                            <Button
                                variant="contained"
                                onClick={fetchRecords}
                                disabled={loading}
                            >
                                {'Search'}
                            </Button>
                            {errorMessage && (
                                <Typography
                                    color="error"
                                    variant="body2"
                                    style={{ marginTop: '10px' }}
                                >
                                    {errorMessage}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mb={6}
                    >
                        <TableContainer
                            component={Paper}
                            style={{
                                width: '80%',
                                maxWidth: '1200px',
                                maxHeight: '600px', // Set max height for scrolling
                                overflow: 'auto', // Enable scrolling
                            }}
                        >
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Username</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Birthdate</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {records.map(
                                        (record: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {record.id}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={
                                                            editing[record.id]
                                                                ?.username ||
                                                            record.username
                                                        }
                                                        onChange={(e) =>
                                                            handleEditChange(
                                                                record.id,
                                                                'username',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={
                                                            editing[record.id]
                                                                ?.email ||
                                                            record.email
                                                        }
                                                        onChange={(e) =>
                                                            handleEditChange(
                                                                record.id,
                                                                'email',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="date"
                                                        value={
                                                            editing[record.id]
                                                                ?.birthdate ||
                                                            new Date(
                                                                record.birthday,
                                                            )
                                                                .toISOString()
                                                                .split('T')[0]
                                                        }
                                                        onChange={(e) =>
                                                            handleEditChange(
                                                                record.id,
                                                                'birthdate',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={async () => {
                                                            if (
                                                                editing[
                                                                    record.id
                                                                ]
                                                            ) {
                                                                const updates =
                                                                    {
                                                                        id: record.id,
                                                                        updates:
                                                                            editing[
                                                                                record
                                                                                    .id
                                                                            ],
                                                                    };
                                                                try {
                                                                    await axios.post(
                                                                        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users`,
                                                                        [
                                                                            updates,
                                                                        ],
                                                                        {
                                                                            headers:
                                                                                {
                                                                                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                                                                                },
                                                                        },
                                                                    );
                                                                    setEditing(
                                                                        (
                                                                            prev,
                                                                        ) => {
                                                                            const updated =
                                                                                {
                                                                                    ...prev,
                                                                                };
                                                                            delete updated[
                                                                                record
                                                                                    .id
                                                                            ];
                                                                            return updated;
                                                                        },
                                                                    );
                                                                    fetchRecords();
                                                                } catch (error) {
                                                                    console.error(
                                                                        'Error updating record:',
                                                                        error,
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                        disabled={
                                                            !editing[record.id]
                                                        }
                                                    >
                                                        Update
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{
                            display: 'block',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                        onClick={saveChanges}
                        disabled={Object.keys(editing).length === 0}
                    >
                        Save Changes
                    </Button>
                </>
            )}
        </div>
    );
};

export default UsersPage;
