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
    { value: 'Unassigned', label: 'Unassigned' },
];

const programOptions = [
    { value: 'Formal Program', label: 'Formal Program' },
    { value: 'High-Quality Program', label: 'High-Quality Program' },
    { value: 'Advanced Program', label: 'Advanced Program' },
    { value: 'Unassigned', label: 'Unassigned' },
];

const classYearOptions = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => ({
    value: `${1990 + i}`,
    label: `${1990 + i}`,
}));

const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Unassigned', label: 'Unassigned' },
];

const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Graduated', label: 'Graduated' },
    { value: 'Leave', label: 'Leave' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Unassigned', label: 'Unassigned' },
];

const UsersPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorValidationMessage, setValidationErrorMessage] = useState('');
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
    const [open, setOpen] = useState(false);
    const [isOpenRecord, setIsOpenRecord] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [updatedRecord, setUpdatedRecord] = useState<any>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const validateEmail = (email: any) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: any) => {
        const phoneRegex = /^\d{10}$/; // For a 10-digit phone number
        return phoneRegex.test(phone);
    };

    const handleValidation = (field: string, value: string) => {
        if (field === 'email') {
            setEmailError(!validateEmail(value));
        }
        if (field === 'phone') {
            setPhoneError(!validatePhone(value));
        }

        setNewRecord((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEditClick = (record: any) => {
        setUpdatedRecord({ ...record });
        setValidationErrorMessage('');
        setEmailError(false);
        setPhoneError(false);
        setEditingRecord(record);
        setEditDialogOpen(true);
    };

    const handleInputChange = (field: string, value: any) => {
        if (field === 'email') {
            setEmailError(!validateEmail(value));
        }
        if (field === 'phone') {
            setPhoneError(!validatePhone(value));
        }

        setUpdatedRecord((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveChanges = async () => {
        try {
            if (
                !validateEmail(updatedRecord.email) ||
                !validatePhone(updatedRecord.phone)
            ) {
                setValidationErrorMessage(
                    'Invalid email or phone number format',
                );
                return;
            }

            const recordToUpdate = {
                id: updatedRecord.id,
                updates: {
                    username: updatedRecord.username,
                    email: updatedRecord.email,
                    birthday: updatedRecord.birthday,
                    fullname: updatedRecord.fullname,
                    gender: updatedRecord.gender,
                    faculty: updatedRecord.faculty,
                    classYear: updatedRecord.classYear,
                    program: updatedRecord.program,
                    address: updatedRecord.address,
                    phone: updatedRecord.phone,
                    status: updatedRecord.status,
                },
            };
            await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users`,
                [recordToUpdate],
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            setEditDialogOpen(false);
            setEditingRecord(null);
            fetchRecords();
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };
    const handleClickOpen = (record: any) => {
        setSelectedRecord(record);
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedRecord(null);
        setOpen(false);
    };

    const handleDelete = async (record: any) => {
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/user/${record.username}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            fetchRecords(); // Re-fetch records after deletion
            setOpen(false);
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const handleViewDetails = (record: any) => {
        setSelectedRecord(record);
        setIsOpenRecord(true);
    };

    const handleCloseDetails = () => {
        setSelectedRecord(null);
        setIsOpenRecord(false);
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
        setValidationErrorMessage('');
        try {
            if (
                !validateEmail(newRecord.email) ||
                !validatePhone(newRecord.phone)
            ) {
                setValidationErrorMessage(
                    'Invalid email or phone number format',
                );
                return;
            }

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
            setValidationErrorMessage(
                error.response?.data?.message ||
                    'An error occurred. Please try again.',
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
                                                        onClick={() =>
                                                            handleEditClick(
                                                                record,
                                                            )
                                                        }
                                                    >
                                                        Edit
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
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() =>
                                                            handleClickOpen(
                                                                record,
                                                            )
                                                        }
                                                        style={{
                                                            marginLeft: '10px',
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {editingRecord && (
                        <Dialog
                            open={isEditDialogOpen}
                            onClose={() => setEditDialogOpen(false)}
                        >
                            <DialogTitle>Edit Record</DialogTitle>
                            <DialogContent>
                                {Object.keys(editingRecord).map((field) => {
                                    if (field === 'birthday') {
                                        return (
                                            <LocalizationProvider
                                                dateAdapter={AdapterDayjs}
                                                key={field}
                                            >
                                                <DatePicker
                                                    label="Birthday"
                                                    value={
                                                        updatedRecord.birthday
                                                            ? dayjs(
                                                                  updatedRecord.birthday,
                                                              )
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        handleInputChange(
                                                            field,
                                                            date
                                                                ? date.format(
                                                                      'YYYY-MM-DD',
                                                                  )
                                                                : '',
                                                        )
                                                    }
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            margin: 'dense',
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        );
                                    } else if (field === 'email') {
                                        return (
                                            <TextField
                                                margin="dense"
                                                fullWidth
                                                key={field}
                                                label={
                                                    field
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    field.slice(1)
                                                }
                                                value={
                                                    updatedRecord[field] || ''
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                error={emailError}
                                                helperText={
                                                    emailError
                                                        ? 'Invalid email format'
                                                        : ''
                                                }
                                            />
                                        );
                                    } else if (field === 'phone') {
                                        return (
                                            <TextField
                                                fullWidth
                                                key={field}
                                                margin="dense"
                                                label={
                                                    field
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    field.slice(1)
                                                }
                                                value={
                                                    updatedRecord[field] || ''
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                error={phoneError}
                                                helperText={
                                                    phoneError
                                                        ? 'Phone number must be 10 digits'
                                                        : ''
                                                }
                                            />
                                        );
                                    } else if (
                                        [
                                            'gender',
                                            'faculty',
                                            'classYear',
                                            'program',
                                            'status',
                                        ].includes(field)
                                    ) {
                                        const options =
                                            field === 'gender'
                                                ? genderOptions
                                                : field === 'faculty'
                                                  ? facultyOptions
                                                  : field === 'classYear'
                                                    ? classYearOptions
                                                    : field === 'program'
                                                      ? programOptions
                                                      : statusOptions;

                                        return (
                                            <TextField
                                                key={field}
                                                select
                                                label={
                                                    field
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    field.slice(1)
                                                }
                                                fullWidth
                                                margin="dense"
                                                value={
                                                    updatedRecord[field] || ''
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        field,
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={
                                                    updatedRecord[field] ===
                                                    'Unassigned'
                                                }
                                            >
                                                {options
                                                    .filter(
                                                        (option) =>
                                                            option.value !==
                                                            'Unassigned',
                                                    )
                                                    .map((option) => (
                                                        <MenuItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                {updatedRecord[field] ===
                                                    'Unassigned' && (
                                                    <MenuItem
                                                        key="Unassigned"
                                                        value="Unassigned"
                                                        style={{
                                                            display: 'none',
                                                        }}
                                                    >
                                                        Unassigned
                                                    </MenuItem>
                                                )}
                                            </TextField>
                                        );
                                    } else {
                                        return (
                                            <TextField
                                                key={field}
                                                label={
                                                    field
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    field.slice(1)
                                                }
                                                fullWidth
                                                margin="dense"
                                                value={
                                                    updatedRecord[field] || ''
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        field,
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={
                                                    field === 'id' ||
                                                    field === 'role'
                                                }
                                            />
                                        );
                                    }
                                })}
                            </DialogContent>

                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                marginTop="30px"
                            >
                                {errorValidationMessage && (
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{ marginBottom: 2 }}
                                    >
                                        {errorValidationMessage}
                                    </Typography>
                                )}
                            </Box>

                            <DialogActions>
                                <Button
                                    onClick={() => setEditDialogOpen(false)}
                                    color="secondary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveChanges}
                                    variant="contained"
                                    color="primary"
                                >
                                    Save
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}

                    {open && (
                        <Dialog open={open} onClose={handleClose}>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogContent>
                                Are you sure you want to delete?
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleDelete(selectedRecord)}
                                    color="error"
                                >
                                    Delete
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}

                    {isOpenRecord && (
                        <Dialog
                            open={isOpenRecord}
                            onClose={handleCloseDetails}
                        >
                            <DialogTitle>Record Details</DialogTitle>
                            <DialogContent>
                                {Object.entries(selectedRecord || {}).map(
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
                                                    width: '500px',
                                                    height: '30px',
                                                    textAlign: 'left',
                                                    lineHeight: '32px',
                                                    overflow: 'hidden',
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

                    {showNewRecordForm && (
                        <Dialog
                            open={showNewRecordForm}
                            onClose={() => setShowNewRecordForm(false)}
                            maxWidth="md"
                            fullWidth
                            sx={{
                                '& .MuiDialog-paper': {
                                    width: '1000px',
                                    maxHeight: '70vh',
                                },
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
                                                                                  : key ===
                                                                                      'password'
                                                                                    ? 'Default password'
                                                                                    : key;
                                                    return displayKey;
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {field === 'email' ? (
                                                    <TextField
                                                        fullWidth
                                                        value={
                                                            newRecord.email ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            handleValidation(
                                                                'email',
                                                                e.target.value,
                                                            )
                                                        }
                                                        error={emailError}
                                                        helperText={
                                                            emailError
                                                                ? 'Invalid email format'
                                                                : ''
                                                        }
                                                    />
                                                ) : field === 'phone' ? (
                                                    <TextField
                                                        fullWidth
                                                        value={
                                                            newRecord.phone ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            handleValidation(
                                                                'phone',
                                                                e.target.value,
                                                            )
                                                        }
                                                        error={phoneError}
                                                        helperText={
                                                            phoneError
                                                                ? 'Phone number must be 10 digits'
                                                                : ''
                                                        }
                                                    />
                                                ) : field === 'birthday' ? (
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
                                                        {genderOptions
                                                            .filter(
                                                                (option) =>
                                                                    option.value !==
                                                                    'Unassigned',
                                                            )
                                                            .map((option) => (
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
                                                            ))}
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
                                                        {facultyOptions
                                                            .filter(
                                                                (option) =>
                                                                    option.value !==
                                                                    'Unassigned',
                                                            )
                                                            .map((option) => (
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
                                                            ))}
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
                                                        {classYearOptions
                                                            .filter(
                                                                (option) =>
                                                                    option.value !==
                                                                    'Unassigned',
                                                            )
                                                            .map((option) => (
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
                                                            ))}
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
                                                        {programOptions
                                                            .filter(
                                                                (option) =>
                                                                    option.value !==
                                                                    'Unassigned',
                                                            )
                                                            .map(
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

                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                marginTop="30px"
                            >
                                {errorValidationMessage && (
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{ marginBottom: 2 }}
                                    >
                                        {errorValidationMessage}
                                    </Typography>
                                )}
                            </Box>
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                gap={2}
                                sx={{ padding: 2 }}
                            >
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleAddNewRecord}
                                >
                                    Submit New Record
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setShowNewRecordForm(false)}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Dialog>
                    )}
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                        sx={{ padding: 2 }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setShowNewRecordForm(!showNewRecordForm);
                                setValidationErrorMessage('');
                                setEmailError(false);
                                setPhoneError(false);
                            }}
                        >
                            Add New Record
                        </Button>
                    </Box>
                </>
            )}
        </div>
    );
};

export default UsersPage;
