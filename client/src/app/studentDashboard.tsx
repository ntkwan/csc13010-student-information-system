'use client';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Paper,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import ItemViewDetails from './itemViewDetails';

interface StudentDashboardProps {
    records: any;
    setUpdatedRecord: (record: any) => void;
    setValidationErrorMessage: (message: string) => void;
    setEmailError: (error: boolean) => void;
    setPhoneError: (error: boolean) => void;
    setEditingRecord: (record: any) => void;
    setEditDialogOpen: (open: boolean) => void;
    setErrorMessage: (message: string) => void;
    fetchRecords: (params: any) => void;
}

const StudentDashboard = (props: StudentDashboardProps) => {
    const {
        records,
        setUpdatedRecord,
        setValidationErrorMessage,
        setEmailError,
        setPhoneError,
        setEditingRecord,
        setEditDialogOpen,
        setErrorMessage,
        fetchRecords,
    } = props;
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isOpenRecord, setIsOpenRecord] = useState(false);
    const [open, setOpen] = useState(false);

    const handleEditClick = (record: any) => {
        setUpdatedRecord({ ...record });
        setValidationErrorMessage('');
        setEmailError(false);
        setPhoneError(false);
        setEditingRecord(record);
        setEditDialogOpen(true);
    };

    const handleViewDetails = (record: any) => {
        setSelectedRecord(record);
        setIsOpenRecord(true);
    };

    const handleClickOpen = (record: any) => {
        setSelectedRecord(record);
        setOpen(true);
    };

    const handleCloseDelete = () => {
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

    return (
        <>
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
                                <TableCell>Student ID</TableCell>
                                <TableCell>Full name</TableCell>
                                <TableCell>Birthday</TableCell>
                                <TableCell>Faculty</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {records.map((record: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{record.username}</TableCell>
                                    <TableCell>{record.fullname}</TableCell>
                                    <TableCell>
                                        {
                                            new Date(record.birthday)
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                    </TableCell>
                                    <TableCell>{record.faculty}</TableCell>
                                    <TableCell>{record.status}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() =>
                                                handleEditClick(record)
                                            }
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() =>
                                                handleViewDetails(record)
                                            }
                                            style={{
                                                marginLeft: '10px',
                                            }}
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() =>
                                                handleClickOpen(record)
                                            }
                                            style={{
                                                marginLeft: '10px',
                                            }}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            onClick={() =>
                                                handleClickOpen(record)
                                            }
                                            style={{
                                                marginLeft: '10px',
                                            }}
                                        >
                                            Export
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <ItemViewDetails
                isOpenRecord={isOpenRecord}
                setSelectedRecord={setSelectedRecord}
                setIsOpenRecord={setIsOpenRecord}
                selectedRecord={selectedRecord}
            />

            {open && (
                <Dialog open={open} onClose={handleCloseDelete}>
                    <DialogTitle>Confirm deletion</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDelete} color="primary">
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
        </>
    );
};

export default StudentDashboard;
