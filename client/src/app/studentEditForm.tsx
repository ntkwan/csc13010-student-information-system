'use client';

import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    MenuItem,
    Typography,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface StudentEditFormProps {
    editingRecord: boolean;
    updatedRecord: any;
    handleSaveChanges: () => void;
    setValidationErrorMessage: (message: string) => void;
    setEmailError: (error: boolean) => void;
    setPhoneError: (error: boolean) => void;
    validateEmail: (email: string) => boolean;
    validatePhone: (phone: string) => boolean;
    setUpdatedRecord: (record: any) => void;
    emailSuffix: string;
    phonePrefix: string;
    facultyOptions: any[];
    classYearOptions: any[];
    programOptions: any[];
    statusOptions: any[];
    errorValidationMessage: string;
    emailError: boolean;
    phoneError: boolean;
    genderOptions: any[];
    isEditDialogOpen: boolean;
    setEditDialogOpen: (open: boolean) => void;
}

const StudentEditForm = (props: StudentEditFormProps) => {
    const {
        isEditDialogOpen,
        setEditDialogOpen,
        setUpdatedRecord,
        validateEmail,
        validatePhone,
        setEmailError,
        setPhoneError,
        genderOptions,
        editingRecord,
        updatedRecord,
        handleSaveChanges,
        setValidationErrorMessage,
        errorValidationMessage,
        phoneError,
        emailError,
        emailSuffix,
        phonePrefix,
        facultyOptions,
        classYearOptions,
        programOptions,
        statusOptions,
    } = props;

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

    return (
        <>
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
                                            field.charAt(0).toUpperCase() +
                                            field.slice(1)
                                        }
                                        value={updatedRecord[field] || ''}
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
                                            field.charAt(0).toUpperCase() +
                                            field.slice(1)
                                        }
                                        value={updatedRecord[field] || ''}
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

                                const isStatusField = field === 'status';

                                return (
                                    <TextField
                                        key={field}
                                        select
                                        label={
                                            field.charAt(0).toUpperCase() +
                                            field.slice(1)
                                        }
                                        fullWidth
                                        margin="dense"
                                        value={updatedRecord[field] || ''}
                                        onChange={(e) => {
                                            const newValue = e.target.value;

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

                                            handleInputChange(field, newValue);
                                        }}
                                        disabled={
                                            updatedRecord[field] ===
                                            'Unassigned'
                                        }
                                        {...(isStatusField &&
                                        errorValidationMessage === '.'
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
                                            field.charAt(0).toUpperCase() +
                                            field.slice(1)
                                        }
                                        fullWidth
                                        margin="dense"
                                        value={updatedRecord[field] || ''}
                                        onChange={(e) =>
                                            handleInputChange(
                                                field,
                                                e.target.value,
                                            )
                                        }
                                        disabled={
                                            field === 'id' || field === 'role'
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
        </>
    );
};

export default StudentEditForm;
