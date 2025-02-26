/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import {
    TextField,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Button,
    Box,
    Typography,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import Header from './header';
import SearchBar from './searchBar';
import StudentDashboard from './studentDashboard';
import AttributesDashboard from './attributesDashboard';
import SettingDashboard from './settingDashboard';

interface CommonOption {
    value: string;
    label: string;
}

interface StatusOption extends CommonOption {
    order: number;
}

let facultyOptions: CommonOption[] = [];
let programOptions: CommonOption[] = [];
let statusOptions: StatusOption[] = [];

const classYearOptions = Array.from({ length: 2025 - 2000 + 1 }, (_, i) => ({
    value: `${2000 + i}`,
    label: `${2000 + i}`,
}));

const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Unassigned', label: 'Unassigned' },
];

const categories = ['Student', 'Faculty', 'Program', 'Status', 'Settings'];

const UsersPage = () => {
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
        order: '',
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
    const [emailSuffix, setEmailSuffix] = useState('');
    const [phonePrefix, setPhonePrefix] = useState('');

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
        if (!email) {
            return false;
        }

        if (emailSuffix) {
            const suffix = emailSuffix.split('@')[1];
            const emailParts = email.split('@');
            if (emailParts.length === 2) {
                const domain = emailParts[1];
                if (domain !== suffix) {
                    return false;
                }
            }
        }

        return emailRegex.test(email);
    };

    const escapeRegExp = (str: string): string => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const validatePhone = (phone: string): boolean => {
        if (!phone) return false;

        const trimmedPhone = phone.trim();

        if (!phonePrefix) return false;

        const escapedPrefix = escapeRegExp(phonePrefix);
        const regex = new RegExp(`^${escapedPrefix}(\\d{9,})$`);

        return regex.test(trimmedPhone);
    };

    const handleValidation = (field: string, value: string) => {
        if (field === 'email') {
            console.log(value);
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
        } catch (error: any) {
            setValidationErrorMessage(
                error.response?.data?.message ||
                    'An error occurred. Please try again.',
            );
        }
    };

    const handleViewDetails = (record: any) => {
        setSelectedRecord(record);
        setIsOpenRecord(true);
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

    const handleStatusCategorySaveChanges = async () => {
        try {
            if (updatedCategoryRecord.value) {
                console.log(selectedCategory.toLowerCase());
                await axios.put(
                    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute?attribute=${selectedCategory.toLowerCase()}&oldName=${editingCategoryRecord.value}&newName=${updatedCategoryRecord.value}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                    },
                );
            }
            if (updatedCategoryRecord.order) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute/status?name=${updatedCategoryRecord.value}&order=${updatedCategoryRecord.order}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                    },
                );
            }
            setEditCategoryDialogOpen(false);
            setEditingCategoryRecord(null);
            fetchStatusOptions();
        } catch (error) {
            console.error('Error updating record:', error);
        }
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

    const handleCloseDetails = () => {
        setSelectedRecord(null);
        setIsOpenRecord(false);
    };

    const fetchRecords = async (searchItems: {
        searchQuery: string;
        faculty: string;
    }) => {
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
            setNewCategoryRecord({ value: '', order: '' });
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

    const handleAddNewStatusCategoryRecord = async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute/status?name=${newCategoryRecord.value}&order=${newCategoryRecord.order}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            setNewCategoryRecord({ value: '', order: '' });
            setShowCategoryRecordForm(false);
            fetchStatusOptions();
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
                order: status.order,
            }));
            statusOptions.sort((a, b) => b.order - a.order);
            setCategoryRecords(statusOptions);
        } catch (error) {
            console.error('Error fetching status options:', error);
        }
    };

    const fetchUniversitySettings = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/settings`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            const data = response.data;
            setEmailSuffix(data.emailSuffix);
            setPhonePrefix(data.phonePrefix);
        } catch (error) {
            console.error('Error fetching university settings:', error);
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
            fetchUniversitySettings();
        }
    }, []);

    const isLoggedIn =
        typeof window !== 'undefined'
            ? localStorage.getItem('authToken')
            : null;

    return (
        <div style={{ padding: '20px' }}>
            <Header
                isLoggedIn={!!isLoggedIn}
                fetchAllProfiles={fetchAllProfiles}
                user={user}
                setUser={setUser}
            ></Header>

            {isLoggedIn && (
                <>
                    <SearchBar
                        fetchRecords={fetchRecords}
                        loading={loading}
                        facultyOptions={facultyOptions}
                    ></SearchBar>

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
                        <StudentDashboard
                            records={records}
                            handleViewDetails={handleViewDetails}
                            setSelectedRecord={setSelectedRecord}
                            setOpen={setOpen}
                            setUpdatedRecord={setUpdatedRecord}
                            setValidationErrorMessage={
                                setValidationErrorMessage
                            }
                            setEmailError={setEmailError}
                            setPhoneError={setPhoneError}
                            setEditingRecord={setEditingRecord}
                            setEditDialogOpen={setEditDialogOpen}
                        ></StudentDashboard>
                    )}
                    {(selectedCategory === 'Faculty' ||
                        selectedCategory === 'Program' ||
                        selectedCategory === 'Status') && (
                        <AttributesDashboard
                            categoryRecords={categoryRecords}
                            selectedCategory={selectedCategory}
                            handleCategoryEditClick={handleCategoryEditClick}
                            handleViewDetails={handleViewDetails}
                        ></AttributesDashboard>
                    )}
                    {selectedCategory === 'Settings' && (
                        <SettingDashboard
                            emailSuffix={emailSuffix}
                            setEmailSuffix={setEmailSuffix}
                            phonePrefix={phonePrefix}
                            setPhonePrefix={setPhonePrefix}
                        ></SettingDashboard>
                    )}
                    {editingCategoryRecord &&
                        (selectedCategory === 'Program' ||
                            selectedCategory === 'Faculty') && (
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
                                        value={
                                            updatedCategoryRecord.value || ''
                                        }
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
                    {editingCategoryRecord && selectedCategory === 'Status' && (
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
                                <TextField
                                    margin="dense"
                                    fullWidth
                                    label="Order"
                                    value={updatedCategoryRecord.order || ''}
                                    onChange={(e) =>
                                        handleCategoryInputChange(
                                            'order',
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
                                    onClick={handleStatusCategorySaveChanges}
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
                                                        ? `The suffix must be ${emailSuffix.split('@')[1]}`
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
                                                        ? `Phone number must be 10 digits or start with ${phonePrefix}`
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

                                        const isStatusField =
                                            field === 'status';

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
                                                onChange={(e) => {
                                                    const newValue =
                                                        e.target.value;

                                                    if (isStatusField) {
                                                        const currentStatusValue =
                                                            updatedRecord.status;
                                                        const currentOption =
                                                            statusOptions.find(
                                                                (option) =>
                                                                    option.value ===
                                                                    currentStatusValue,
                                                            );
                                                        const newOption =
                                                            statusOptions.find(
                                                                (option) =>
                                                                    option.value ===
                                                                    newValue,
                                                            );

                                                        if (
                                                            currentOption &&
                                                            newOption &&
                                                            newOption.order <
                                                                currentOption.order
                                                        ) {
                                                            setValidationErrorMessage(
                                                                '.',
                                                            );
                                                            return;
                                                        } else {
                                                            setValidationErrorMessage(
                                                                '',
                                                            );
                                                        }
                                                    }

                                                    handleInputChange(
                                                        field,
                                                        newValue,
                                                    );
                                                }}
                                                disabled={
                                                    updatedRecord[field] ===
                                                    'Unassigned'
                                                }
                                                {...(isStatusField &&
                                                errorValidationMessage
                                                    ? {
                                                          error: true,
                                                          helperText:
                                                              'You can only switch from lower order to higher order status.',
                                                      }
                                                    : {})}
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

                    {showCategoryRecordForm &&
                        (selectedCategory === 'Program' ||
                            selectedCategory === 'Faculty') && (
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
                    {showCategoryRecordForm &&
                        selectedCategory === 'Status' && (
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
                                        <TableRow>
                                            <TableCell
                                                style={{ fontWeight: 'bold' }}
                                            >
                                                Order
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    value={
                                                        newCategoryRecord.order ||
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        setNewCategoryRecord(
                                                            (prev) => ({
                                                                ...prev,
                                                                order: e.target
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
                                        onClick={
                                            handleAddNewStatusCategoryRecord
                                        }
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
                                                                ? `The suffix must be ${emailSuffix.split('@')[1]}`
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
                                                                ? `Phone number must be 10 digits or start with ${phonePrefix}`
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
