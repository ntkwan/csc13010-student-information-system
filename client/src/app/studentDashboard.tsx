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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
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
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');
    const [purpose, setPurpose] = useState<
        'loan' | 'military' | 'job' | 'other'
    >('job');
    const [otherReason, setOtherReason] = useState<string>('');

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
            fetchRecords({ searchQuery: '', faculty: '' });
            setOpen(false);
        } catch (error: any) {
            console.error('Error deleting record:', error);
            setErrorMessage(
                error.response?.data?.message ||
                    'An error occurred while deleting the record.',
            );
            setOpen(false);
        }
    };

    const handleOpenExportDialog = (record: any) => {
        setSelectedRecord(record);
        setExportDialogOpen(true);
    };

    const handleExport = async () => {
        if (!selectedRecord) return;
        try {
            console.log(selectedRecord);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/export/certificate/${selectedRecord.id}?format=${format}&purpose=${purpose}&otherReason=${otherReason}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        purpose,
                        otherReason:
                            purpose === 'other' ? otherReason : undefined,
                    },
                    responseType: 'blob',
                },
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate.${format}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            console.error('Error exporting record:', error);
            setErrorMessage(
                error.response?.data?.message ||
                    'An error occurred while exporting the record.',
            );
        }
        setExportDialogOpen(false);
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
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() =>
                                                handleClickOpen(record)
                                            }
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            onClick={() =>
                                                handleOpenExportDialog(record)
                                            }
                                            style={{ marginLeft: '10px' }}
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

            <Dialog
                open={exportDialogOpen}
                onClose={() => setExportDialogOpen(false)}
            >
                <DialogTitle>Export Certificate</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Format</InputLabel>
                        <Select
                            value={format}
                            onChange={(e) =>
                                setFormat(e.target.value as 'pdf' | 'docx')
                            }
                        >
                            <MenuItem value="pdf">PDF</MenuItem>
                            <MenuItem value="docx">DOCX</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Purpose</InputLabel>
                        <Select
                            value={purpose}
                            onChange={(e) =>
                                setPurpose(
                                    e.target.value as
                                        | 'loan'
                                        | 'military'
                                        | 'job'
                                        | 'other',
                                )
                            }
                        >
                            <MenuItem value="loan">Loan</MenuItem>
                            <MenuItem value="military">Military</MenuItem>
                            <MenuItem value="job">Job</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    {purpose === 'other' && (
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Other Reason"
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} color="primary">
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StudentDashboard;
