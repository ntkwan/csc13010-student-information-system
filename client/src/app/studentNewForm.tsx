'use client';

import {
    TextField,
    MenuItem,
    Dialog,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Box,
    Button,
    Typography,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';

interface StudentNewFormProps {
    emailError: boolean;
    setEmailError: (error: boolean) => void;
    phoneError: boolean;
    setPhoneError: (error: boolean) => void;
    emailSuffix: string;
    phonePrefix: string;
    genderOptions: any[];
    facultyOptions: any[];
    classYearOptions: any[];
    programOptions: any[];
    errorValidationMessage: string;
    setValidationErrorMessage: (message: string) => void;
    validateEmail: (email: string) => boolean;
    validatePhone: (phone: string) => boolean;
    enableValidation: boolean;
    fetchAllProfiles: () => void;
}

const StudentNewForm = (props: StudentNewFormProps) => {
    const {
        enableValidation,
        emailError,
        setEmailError,
        phoneError,
        setPhoneError,
        emailSuffix,
        phonePrefix,
        genderOptions,
        facultyOptions,
        classYearOptions,
        programOptions,
        errorValidationMessage,
        setValidationErrorMessage,
        validateEmail,
        validatePhone,
        fetchAllProfiles,
    } = props;
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

    const handleAddNewRecord = async () => {
        setValidationErrorMessage('');
        try {
            if (enableValidation) {
                if (
                    !validateEmail(newRecord.email) ||
                    !validatePhone(newRecord.phone)
                ) {
                    setValidationErrorMessage(
                        'Invalid email or phone number format',
                    );
                    return;
                }
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

    const renderField = (
        field: string,
        value: string,
        handleChange: (field: string, value: string) => void,
    ) => {
        switch (field) {
            case 'email':
                return (
                    <TextField
                        fullWidth
                        value={value || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={emailError}
                        helperText={
                            emailError
                                ? `The suffix must be ${emailSuffix.split('@')[1]}`
                                : ''
                        }
                    />
                );
            case 'phone':
                return (
                    <TextField
                        fullWidth
                        value={value || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        error={phoneError}
                        helperText={
                            phoneError
                                ? `Phone number must be 10 digits or start with ${phonePrefix}`
                                : ''
                        }
                    />
                );
            case 'birthday':
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            value={value ? dayjs(value) : null}
                            onChange={(date: any) =>
                                handleChange(
                                    'birthday',
                                    date ? date.format('YYYY-MM-DD') : '',
                                )
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>
                );
            case 'gender':
                return (
                    <TextField
                        select
                        fullWidth
                        value={value || ''}
                        onChange={(e) => handleChange('gender', e.target.value)}
                    >
                        {genderOptions
                            .filter((option) => option.value !== 'Unassigned')
                            .map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                    </TextField>
                );
            case 'faculty':
                return (
                    <TextField
                        select
                        fullWidth
                        value={value || ''}
                        onChange={(e) =>
                            handleChange('faculty', e.target.value)
                        }
                    >
                        {facultyOptions
                            .filter((option) => option.value !== 'Unassigned')
                            .map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                    </TextField>
                );
            case 'classYear':
                return (
                    <TextField
                        select
                        fullWidth
                        value={value || ''}
                        onChange={(e) =>
                            handleChange('classYear', e.target.value)
                        }
                    >
                        {classYearOptions
                            .filter((option) => option.value !== 'Unassigned')
                            .map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                    </TextField>
                );
            case 'program':
                return (
                    <TextField
                        select
                        fullWidth
                        value={value || ''}
                        onChange={(e) =>
                            handleChange('program', e.target.value)
                        }
                    >
                        {programOptions
                            .filter((option) => option.value !== 'Unassigned')
                            .map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                    </TextField>
                );
            default:
                return (
                    <TextField
                        fullWidth
                        value={value}
                        onChange={(e) => handleChange(field, e.target.value)}
                    />
                );
        }
    };

    const renderDisplayKey = (key: string) => {
        switch (key) {
            case 'fullname':
                return 'Full name';
            case 'username':
                return 'Student ID';
            case 'birthday':
                return 'Birthday';
            case 'gender':
                return 'Gender';
            case 'faculty':
                return 'Faculty';
            case 'classYear':
                return 'Class Year';
            case 'program':
                return 'Program';
            case 'address':
                return 'Address';
            case 'email':
                return 'Email';
            case 'phone':
                return 'Phone number';
            case 'status':
                return 'Status';
            case 'role':
                return 'Role';
            case 'password':
                return 'Default password';
            default:
                return key;
        }
    };

    const handleValidation = (field: string, value: string) => {
        if (enableValidation) {
            if (field === 'email') {
                setEmailError(!validateEmail(value));
            }
            if (field === 'phone') {
                setPhoneError(!validatePhone(value));
            }
        }

        setNewRecord((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <>
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
                                <TableCell style={{ fontWeight: 'bold' }}>
                                    {renderDisplayKey(field)}
                                </TableCell>
                                <TableCell>
                                    {renderField(
                                        field,
                                        (newRecord as any)[field],
                                        handleValidation,
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
    );
};

export default StudentNewForm;
