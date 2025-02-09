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
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

const facultyOptions = [
    { value: 'Faculty of Law', label: 'Faculty of Law' },
    {
        value: 'Faculty of Business English',
        label: 'Faculty of Business English',
    },
    { value: 'Faculty of Japanese', label: 'Faculty of Japanese' },
    { value: 'Faculty of French', label: 'Faculty of French' },
];

const programOptions = [
    { value: 'Formal Program', label: 'Formal Program' },
    { value: 'High-Quality Program', label: 'High-Quality Program' },
    { value: 'Advanced Program', label: 'Advanced Program' },
];

const classYearOptions = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => ({
    value: `${1990 + i}`,
    label: `${1990 + i}`,
}));

const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
];

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
    const [showNewRecordForm, setShowNewRecordForm] = useState(false);
    const [newRecord, setNewRecord] = useState({
        username: '',
        fullname: '',
        birthday: '',
        gender: '',
        faculty: '',
        classYear: '',
        program: '',
        address: '',
        email: '',
        password: '',
        phone: '',
    });
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleViewDetails = (record) => {
        setSelectedRecord(record);
    };

    const handleCloseDetails = () => {
        setSelectedRecord(null);
    };

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
                console.log(response.data);
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

    const handleAddNewRecord = async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/user`,
                newRecord,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            setNewRecord({
                username: '',
                fullname: '',
                birthday: '',
                gender: '',
                faculty: '',
                classYear: '',
                program: '',
                address: '',
                email: '',
                password: '',
                phone: '',
            });
            setShowNewRecordForm(false);
            fetchAllProfiles();
        } catch (error) {
            console.error('Error adding new record:', error);
            setErrorMessage(
                'An error occurred while adding the record. Please try again.',
            );
        }
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
                <Typography
                    variant="h4"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => router.push('/')}
                >
                    {isLoggedIn
                        ? 'Student Information System'
                        : 'Welcome to Student Information System'}
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
                                label="Search by student ID or full name"
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

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowNewRecordForm(!showNewRecordForm)}
                        style={{ marginBottom: '20px' }}
                    >
                        {showNewRecordForm ? 'Cancel' : 'Add New Record'}
                    </Button>

                    {showNewRecordForm && (
                        <TableContainer
                            component={Paper}
                            style={{
                                marginBottom: '20px',
                                width: '80%',
                                margin: '0 auto',
                            }}
                        >
                            <Table>
                                <TableBody>
                                    {Object.keys(newRecord).map((field) => (
                                        <TableRow key={field}>
                                            <TableCell
                                                style={{ fontWeight: 'bold' }}
                                            >
                                                {(() => {
                                                    const key = field;
                                                    const displayKey =
                                                        key === 'fullname'
                                                            ? 'Full name'
                                                            : key === 'username'
                                                              ? 'Student ID'
                                                              : key ===
                                                                  'birthday'
                                                                ? 'Birthday'
                                                                : key ===
                                                                    'gender'
                                                                  ? 'Gender'
                                                                  : key ===
                                                                      'faculty'
                                                                    ? 'Faculty'
                                                                    : key ===
                                                                        'classYear'
                                                                      ? 'Class Year'
                                                                      : key ===
                                                                          'program'
                                                                        ? 'Program'
                                                                        : key ===
                                                                            'address'
                                                                          ? 'Address'
                                                                          : key ===
                                                                              'email'
                                                                            ? 'Email'
                                                                            : key ===
                                                                                'phone'
                                                                              ? 'Phone number'
                                                                              : key ===
                                                                                  'status'
                                                                                ? 'Status'
                                                                                : key ===
                                                                                    'role'
                                                                                  ? 'Role'
                                                                                  : key;
                                                    return displayKey;
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {field === 'birthday' ? (
                                                    <LocalizationProvider
                                                        dateAdapter={
                                                            AdapterDayjs
                                                        }
                                                    >
                                                        <DatePicker
                                                            value={
                                                                newRecord.birthday
                                                                    ? dayjs(
                                                                          newRecord.birthday,
                                                                      )
                                                                    : null
                                                            }
                                                            onChange={(
                                                                date: any,
                                                            ) =>
                                                                setNewRecord(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        birthday:
                                                                            date
                                                                                ? date.format(
                                                                                      'YYYY-MM-DD',
                                                                                  )
                                                                                : '',
                                                                    }),
                                                                )
                                                            }
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth:
                                                                        true,
                                                                },
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                                ) : field === 'gender' ? (
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        value={
                                                            newRecord.gender ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setNewRecord(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    gender: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        {genderOptions.map(
                                                            (option) => (
                                                                <MenuItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </MenuItem>
                                                            ),
                                                        )}
                                                    </TextField>
                                                ) : field === 'faculty' ? (
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        value={
                                                            newRecord.faculty ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setNewRecord(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    faculty:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        {facultyOptions.map(
                                                            (option) => (
                                                                <MenuItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </MenuItem>
                                                            ),
                                                        )}
                                                    </TextField>
                                                ) : field === 'classYear' ? (
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        value={
                                                            newRecord.classYear ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setNewRecord(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    classYear:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        {classYearOptions.map(
                                                            (option) => (
                                                                <MenuItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </MenuItem>
                                                            ),
                                                        )}
                                                    </TextField>
                                                ) : field === 'program' ? (
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        value={
                                                            newRecord.program ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setNewRecord(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    program:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        {programOptions.map(
                                                            (option) => (
                                                                console.log(
                                                                    option.value,
                                                                ),
                                                                (
                                                                    <MenuItem
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </MenuItem>
                                                                )
                                                            ),
                                                        )}
                                                    </TextField>
                                                ) : (
                                                    <TextField
                                                        fullWidth
                                                        value={
                                                            (newRecord as any)[
                                                                field
                                                            ]
                                                        }
                                                        onChange={(e) =>
                                                            setNewRecord(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [field]:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {showNewRecordForm && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleAddNewRecord}
                            style={{ display: 'block', margin: '10px auto' }}
                        >
                            Submit New Record
                        </Button>
                    )}

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
                                        <TableCell>Student ID</TableCell>
                                        <TableCell>Full name</TableCell>
                                        <TableCell>Birthday</TableCell>
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
                                                    {record.username}
                                                </TableCell>
                                                <TableCell>
                                                    {record.fullname}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        new Date(
                                                            record.birthday,
                                                        )
                                                            .toISOString()
                                                            .split('T')[0]
                                                    }
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
                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                record,
                                                            )
                                                        }
                                                        style={{
                                                            marginLeft: '10px',
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {selectedRecord && (
                        <Dialog
                            open={Boolean(selectedRecord)}
                            onClose={handleCloseDetails}
                        >
                            <DialogTitle>Record Details</DialogTitle>
                            <DialogContent>
                                {Object.entries(selectedRecord).map(
                                    ([key, value]) => {
                                        if (key === 'id') return null;

                                        const displayKey =
                                            key === 'fullname'
                                                ? 'Full name'
                                                : key === 'username'
                                                  ? 'Student ID'
                                                  : key === 'birthday'
                                                    ? 'Birthday'
                                                    : key === 'gender'
                                                      ? 'Gender'
                                                      : key === 'faculty'
                                                        ? 'Faculty'
                                                        : key === 'classYear'
                                                          ? 'Class Year'
                                                          : key === 'program'
                                                            ? 'Program'
                                                            : key === 'address'
                                                              ? 'Address'
                                                              : key === 'email'
                                                                ? 'Email'
                                                                : key ===
                                                                    'phone'
                                                                  ? 'Phone number'
                                                                  : key ===
                                                                      'status'
                                                                    ? 'Status'
                                                                    : key ===
                                                                        'role'
                                                                      ? 'Role'
                                                                      : key;

                                        return (
                                            <Typography
                                                key={key}
                                                gutterBottom
                                                style={{
                                                    width: '500px', // Fixed width for the box
                                                    height: '30px', // Fixed height for the box
                                                    textAlign: 'left', // Center the text inside the box
                                                    lineHeight: '32px', // Adjust the line height to center the text vertically
                                                    overflow: 'hidden', // Prevent overflow in case the text is too long
                                                }}
                                            >
                                                <strong>{displayKey}:</strong>{' '}
                                                {key === 'birthday'
                                                    ? new Date(value as string)
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : String(value)}
                                            </Typography>
                                        );
                                    },
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleCloseDetails}
                                    color="primary"
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}

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
