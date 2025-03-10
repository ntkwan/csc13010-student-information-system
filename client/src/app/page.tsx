/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './header';
import SearchBar from './searchBar';
import SettingDashboard from './settingDashboard';
import NavBar from './navBar';
import AttributesManager from './attributesManager';
import StudentManager from './studentManager';
import StudentNewForm from './studentNewForm';
import AttributesNewForm from './attributesNewForm';

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
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Không xác định', label: 'Không xác định' },
];

const UsersPage = () => {
    const [loading, setLoading] = useState(false);
    const [errorValidationMessage, setValidationErrorMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Student');
    const [emailSuffix, setEmailSuffix] = useState('');
    const [phonePrefix, setPhonePrefix] = useState('');
    const [creationDeleteWindow, setCreationDeleteWindow] = useState(0);
    const [records, setRecords] = useState([]);
    const [categoryRecords, setCategoryRecords] = useState<any[]>([]);
    const [user, setUser] = useState<{
        username: string;
        avatar: string;
    } | null>(null);
    const [enableValidation, setEnableValidation] = useState(true);

    useEffect(() => {
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
        } catch (error: any) {
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
            setCreationDeleteWindow(data.creationDeleteWindow);
            setEnableValidation(data.enableValidation);
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
                        errorMessage={errorMessage}
                    ></SearchBar>

                    <NavBar
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    ></NavBar>

                    {selectedCategory === 'Student' && (
                        <StudentManager
                            records={records}
                            fetchRecords={fetchRecords}
                            setValidationErrorMessage={
                                setValidationErrorMessage
                            }
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
                            validateEmail={validateEmail}
                            validatePhone={validatePhone}
                            genderOptions={genderOptions}
                            setErrorMessage={setErrorMessage}
                            enableValidation={enableValidation}
                        ></StudentManager>
                    )}
                    {(selectedCategory === 'Faculty' ||
                        selectedCategory === 'Program' ||
                        selectedCategory === 'Status') && (
                        <AttributesManager
                            selectedCategory={selectedCategory}
                            categoryRecords={categoryRecords}
                            setCategoryRecords={setCategoryRecords}
                            fetchFacultyOptions={fetchFacultyOptions}
                            fetchProgramOptions={fetchProgramOptions}
                            fetchStatusOptions={fetchStatusOptions}
                            setErrorMessage={setErrorMessage}
                        ></AttributesManager>
                    )}
                    {selectedCategory === 'Settings' && (
                        <SettingDashboard
                            emailSuffix={emailSuffix}
                            setEmailSuffix={setEmailSuffix}
                            phonePrefix={phonePrefix}
                            setPhonePrefix={setPhonePrefix}
                            creationDeleteWindow={creationDeleteWindow}
                            setCreationDeleteWindow={setCreationDeleteWindow}
                            setEnableValidation={setEnableValidation}
                            enableValidation={enableValidation}
                        ></SettingDashboard>
                    )}

                    {selectedCategory === 'Student' && (
                        <StudentNewForm
                            enableValidation={enableValidation}
                            emailError={emailError}
                            setEmailError={setEmailError}
                            phoneError={phoneError}
                            setPhoneError={setPhoneError}
                            emailSuffix={emailSuffix}
                            phonePrefix={phonePrefix}
                            genderOptions={genderOptions}
                            facultyOptions={facultyOptions}
                            classYearOptions={classYearOptions}
                            programOptions={programOptions}
                            errorValidationMessage={errorValidationMessage}
                            setValidationErrorMessage={
                                setValidationErrorMessage
                            }
                            validateEmail={validateEmail}
                            validatePhone={validatePhone}
                            fetchAllProfiles={fetchAllProfiles}
                        ></StudentNewForm>
                    )}

                    {(selectedCategory === 'Faculty' ||
                        selectedCategory === 'Program' ||
                        selectedCategory === 'Status') && (
                        <AttributesNewForm
                            selectedCategory={selectedCategory}
                            fetchFacultyOptions={fetchFacultyOptions}
                            fetchProgramOptions={fetchProgramOptions}
                            fetchStatusOptions={fetchStatusOptions}
                        ></AttributesNewForm>
                    )}
                </>
            )}
        </div>
    );
};

export default UsersPage;
