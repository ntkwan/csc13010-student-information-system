'use client';

import { useState } from 'react';
import StudentDashboard from './studentDashboard';
import StudentEditForm from './studentEditForm';
import axios from 'axios';

interface StudentManagerProps {
    records: any[];
    fetchRecords: (searchItems: {
        searchQuery: string;
        faculty: string;
    }) => void;
    setValidationErrorMessage: (message: string) => void;
    errorValidationMessage: string;
    phoneError: boolean;
    emailError: boolean;
    emailSuffix: string;
    phonePrefix: string;
    facultyOptions: any[];
    classYearOptions: any[];
    programOptions: any[];
    statusOptions: any[];
    setEmailError: (error: boolean) => void;
    setPhoneError: (error: boolean) => void;
    validateEmail: (email: string) => boolean;
    validatePhone: (phone: string) => boolean;
    genderOptions: any[];
    setErrorMessage: (message: string) => void;
}

const StudentManager = (props: StudentManagerProps) => {
    const {
        records,
        fetchRecords,
        setValidationErrorMessage,
        errorValidationMessage,
        phoneError,
        emailError,
        setEmailError,
        setPhoneError,
        validateEmail,
        validatePhone,
        genderOptions,
        setErrorMessage,
        emailSuffix,
        phonePrefix,
        facultyOptions,
        classYearOptions,
        programOptions,
        statusOptions,
    } = props;
    const [updatedRecord, setUpdatedRecord] = useState<any>(null);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);

    const handleSaveChanges = async () => {
        setValidationErrorMessage('');
        console.log(
            validateEmail(updatedRecord.email),
            validatePhone(updatedRecord.phone),
            updatedRecord.email,
            updatedRecord.phone,
        );
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

    return (
        <>
            <StudentDashboard
                records={records}
                setUpdatedRecord={setUpdatedRecord}
                setValidationErrorMessage={setValidationErrorMessage}
                setEmailError={setEmailError}
                setPhoneError={setPhoneError}
                setEditingRecord={setEditingRecord}
                setEditDialogOpen={setEditDialogOpen}
                setErrorMessage={setErrorMessage}
                fetchRecords={fetchRecords}
            ></StudentDashboard>
            <StudentEditForm
                isEditDialogOpen={isEditDialogOpen}
                setEditDialogOpen={setEditDialogOpen}
                validateEmail={validateEmail}
                validatePhone={validatePhone}
                genderOptions={genderOptions}
                editingRecord={editingRecord}
                updatedRecord={updatedRecord}
                handleSaveChanges={handleSaveChanges}
                setValidationErrorMessage={setValidationErrorMessage}
                errorValidationMessage={errorValidationMessage}
                phoneError={phoneError}
                emailError={emailError}
                emailSuffix={emailSuffix}
                phonePrefix={phonePrefix}
                facultyOptions={facultyOptions}
                classYearOptions={classYearOptions}
                programOptions={programOptions}
                statusOptions={statusOptions}
                setEmailError={setEmailError}
                setPhoneError={setPhoneError}
                setUpdatedRecord={setUpdatedRecord}
            ></StudentEditForm>
        </>
    );
};

export default StudentManager;
