/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState } from 'react';
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
    Select,
    Menu,
    Tab,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListAltIcon from '@mui/icons-material/ListAlt';

interface Option {
    value: string;
    label: string;
}

let facultyOptions: Option[] = [];
let programOptions: Option[] = [];
let statusOptions: Option[] = [];

const classYearOptions = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => ({
    value: `${1990 + i}`,
    label: `${1990 + i}`,
}));

const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Unassigned', label: 'Unassigned' },
];

const categories = ['Student', 'Faculty', 'Program', 'Status'];

const UsersPage = () => {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorValidationMessage, setValidationErrorMessage] = useState('');
    const [user, setUser] = useState<{
        username: string;
        avatar: string;
    } | null>(null);
    const [showCategoryRecordForm, setShowCategoryRecordForm] = useState(false);
    const [newCategoryRecord, setNewCategoryRecord] = useState({
        value: '',
    });
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

    const [selectedCategory, setSelectedCategory] = useState('Student');
    const [categoryRecords, setCategoryRecords] = useState<any[]>([]);

    useEffect(() => {
        console.log(selectedCategory);
        switch (selectedCategory) {
            case 'Faculty':
                setCategoryRecords(facultyOptions);
                break;
            case 'Program':
                setCategoryRecords(programOptions);
                break;
            case 'Status':
                setCategoryRecords(statusOptions);
                break;
        }
        console.log(categoryRecords);
    }, [selectedCategory]);

    const validateEmail = (email: any) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('');
    const [isFilteringByFaculty, setIsFilteringByFaculty] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClickMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleSearch = () => {
        fetchRecords({
            searchQuery,
            faculty: isFilteringByFaculty ? facultyFilter : '',
        });
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

    const [editingCategoryRecord, setEditingCategoryRecord] =
        useState<any>(null);
    const [updatedCategoryRecord, setUpdatedCategoryRecord] =
        useState<any>(null);
    const [isEditCategoryDialogOpen, setEditCategoryDialogOpen] =
        useState(false);

    const handleCategoryEditClick = (record: any) => {
        setUpdatedCategoryRecord({ ...record });
        setEditingCategoryRecord(record);
        setEditCategoryDialogOpen(true);
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
            fetchRecords({ searchQuery: '', faculty: '' });
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    const handleCategoryInputChange = (field: string, value: any) => {
        setUpdatedCategoryRecord((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCategorySaveChanges = async () => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute?attribute=${selectedCategory.toLowerCase()}&oldName=${editingCategoryRecord.value}&newName=${updatedCategoryRecord.value}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            setEditCategoryDialogOpen(false);
            setEditingCategoryRecord(null);
            switch (selectedCategory) {
                case 'Faculty':
                    fetchFacultyOptions();
                    break;
                case 'Program':
                    fetchProgramOptions();
                    break;
                case 'Status':
                    fetchStatusOptions();
                    break;
            }
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
            fetchRecords({ searchQuery: '', faculty: '' }); // Re-fetch records after deletion
            setOpen(false);
        } catch (error: any) {
            console.error('Error deleting record:', error);
            setErrorMessage(
                error.response.data.message ||
                    'An error occurred while deleting the record.',
            );
            setOpen(false);
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

    const fetchRecords = async (searchItems: {
        searchQuery: string;
        faculty: string;
    }) => {
        console.log('hi', searchItems);
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/search?name=${searchItems.searchQuery}&faculty=${searchItems.faculty}`,
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
                const err = error as any;
                setErrorMessage(
                    err.response?.data?.message ||
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

    const handleAddNewCategoryRecord = async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute?attribute=${selectedCategory.toLowerCase()}&name=${newCategoryRecord.value}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            setNewCategoryRecord({ value: '' });
            setShowCategoryRecordForm(false);
            switch (selectedCategory) {
                case 'Faculty':
                    fetchFacultyOptions();
                    break;
                case 'Program':
                    fetchProgramOptions();
                    break;
                case 'Status':
                    fetchStatusOptions();
                    break;
            }
        } catch (error) {
            console.error('Error adding new category record:', error);
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
        } catch (error: any) {
            setValidationErrorMessage(
                error.response?.data?.message ||
                    'An error occurred. Please try again.',
            );
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

            handleClose(); // Close menu after download
        } catch (error) {
            console.error('Failed to download logs:', error);
        }
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    const fetchFacultyOptions = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attributes?attribute=faculty`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            const data = response.data;
            facultyOptions = data.map((faculty: any) => ({
                value: faculty.name,
                label: faculty.name,
            }));
            setCategoryRecords(facultyOptions);
        } catch (error) {
            console.error('Error fetching faculty options:', error);
        }
    };

    const fetchProgramOptions = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attributes?attribute=program`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            const data = response.data;
            programOptions = data.map((program: any) => ({
                value: program.name,
                label: program.name,
            }));
            setCategoryRecords(programOptions);
        } catch (error) {
            console.error('Error fetching program options:', error);
        }
    };

    const fetchStatusOptions = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attributes?attribute=status`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            const data = response.data;
            statusOptions = data.map((status: any) => ({
                value: status.name,
                label: status.name,
            }));
            setCategoryRecords(statusOptions);
        } catch (error) {
            console.error('Error fetching status options:', error);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (localStorage.getItem('authToken')) {
            fetchUserProfile();
            fetchAllProfiles();
            fetchFacultyOptions();
            fetchProgramOptions();
            fetchStatusOptions();
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

            {isLoggedIn && (
                <>
                    <Box
                        mb={6}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        style={{ width: '100%' }}
                    >
                        <Box
                            width="50%"
                            minWidth="300px"
                            display="flex"
                            gap={2}
                        >
                            <TextField
                                label="Search by student ID or full name"
                                variant="outlined"
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                            />
                            <Button
                                variant="contained"
                                style={{ height: '35px', marginTop: '10px' }}
                                onClick={() =>
                                    setIsFilteringByFaculty(
                                        !isFilteringByFaculty,
                                    )
                                }
                            >
                                {isFilteringByFaculty ? 'Cancel' : 'Faculty'}
                            </Button>
                        </Box>

                        {isFilteringByFaculty && (
                            <Select
                                value={facultyFilter}
                                onChange={(e) =>
                                    setFacultyFilter(e.target.value)
                                }
                                displayEmpty
                                variant="outlined"
                                style={{
                                    marginLeft: '10px',
                                    minWidth: '200px',
                                }}
                            >
                                <MenuItem value="">Select faculty</MenuItem>
                                {facultyOptions.map((faculty) => (
                                    <MenuItem
                                        key={faculty.label}
                                        value={faculty.value}
                                    >
                                        {faculty.value}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}

                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={loading}
                            style={{ marginLeft: '10px' }}
                        >
                            Search
                        </Button>
                    </Box>

                    {errorMessage && (
                        <Typography
                            color="error"
                            variant="body2"
                            style={{
                                alignContent: 'center',
                                marginBottom: '50px',
                                marginLeft: '800px',
                            }}
                        >
                            {errorMessage}
                        </Typography>
                    )}

                    {!errorMessage && (
                        <Typography
                            variant="body2"
                            style={{ marginBottom: '118px' }}
                        ></Typography>
                    )}

                    <Box display="flex" justifyContent="center" gap={2} mb={3}>
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={
                                    selectedCategory === category
                                        ? 'contained'
                                        : 'outlined'
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </Box>
                    {selectedCategory === 'Student' && (
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
                                                                marginLeft:
                                                                    '10px',
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
                                                                marginLeft:
                                                                    '10px',
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
                    )}
                    {(selectedCategory === 'Faculty' ||
                        selectedCategory === 'Program' ||
                        selectedCategory === 'Status') && (
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
                                    maxHeight: '600px',
                                    overflow: 'auto',
                                }}
                            >
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                style={{ width: '300px' }}
                                            >
                                                Name
                                            </TableCell>
                                            <TableCell
                                                style={{ width: '200px' }}
                                            >
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {categoryRecords.map(
                                            (record, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {record.value}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() =>
                                                                handleCategoryEditClick(
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
                                                                marginLeft:
                                                                    '10px',
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>
                                                        {/*
                                                        <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleClickOpen(record)}
                                                        style={{ marginLeft: "10px" }}
                                                        >
                                                        Delete
                                                        </Button>
                                                        */}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                    {editingCategoryRecord && (
                        <Dialog
                            open={isEditCategoryDialogOpen}
                            onClose={() => setEditCategoryDialogOpen(false)}
                        >
                            <DialogTitle>Edit record</DialogTitle>
                            <DialogContent>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="Name"
                                    value={updatedCategoryRecord.value || ''}
                                    onChange={(e) =>
                                        handleCategoryInputChange(
                                            'value',
                                            e.target.value,
                                        )
                                    }
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={() =>
                                        setEditCategoryDialogOpen(false)
                                    }
                                    color="secondary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCategorySaveChanges}
                                    variant="contained"
                                    color="primary"
                                >
                                    Save
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}
                    {editingRecord && (
                        <Dialog
                            open={isEditDialogOpen}
                            onClose={() => setEditDialogOpen(false)}
                        >
                            <DialogTitle>Edit record</DialogTitle>
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
                            <DialogTitle>Confirm deletion</DialogTitle>
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
                                        if (key === 'label') return null;
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

                    {showCategoryRecordForm && (
                        <Dialog
                            open={showCategoryRecordForm}
                            onClose={() => setShowCategoryRecordForm(false)}
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
                                    <TableRow>
                                        <TableCell
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            Name
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                value={
                                                    newCategoryRecord.value ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setNewCategoryRecord(
                                                        (prev) => ({
                                                            ...prev,
                                                            value: e.target
                                                                .value,
                                                        }),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

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
                                    onClick={handleAddNewCategoryRecord}
                                >
                                    Submit New Record
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() =>
                                        setShowCategoryRecordForm(false)
                                    }
                                >
                                    Cancel
                                </Button>
                            </Box>
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

                    {selectedCategory === 'Student' && (
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
                    )}
                    {(selectedCategory === 'Faculty' ||
                        selectedCategory === 'Program' ||
                        selectedCategory === 'Status') && (
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
                                    setShowCategoryRecordForm(
                                        !showCategoryRecordForm,
                                    );
                                }}
                            >
                                Add New Record
                            </Button>
                        </Box>
                    )}
                </>
            )}
        </div>
    );
};

export default UsersPage;
