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
} from '@mui/material';

interface StudentDashboardProps {
    records: any;
    setSelectedRecord: (record: any) => void;
    setOpen: (open: boolean) => void;
    setUpdatedRecord: (record: any) => void;
    setValidationErrorMessage: (message: string) => void;
    setEmailError: (error: boolean) => void;
    setPhoneError: (error: boolean) => void;
    setEditingRecord: (record: any) => void;
    setEditDialogOpen: (open: boolean) => void;
    handleViewDetails: (record: any) => void;
}

const StudentDashboard = (props: StudentDashboardProps) => {
    const {
        records,
        setSelectedRecord,
        setOpen,
        setUpdatedRecord,
        setValidationErrorMessage,
        setEmailError,
        setPhoneError,
        setEditingRecord,
        setEditDialogOpen,
        handleViewDetails,
    } = props;

    const handleClickOpen = (record: any) => {
        setSelectedRecord(record);
        setOpen(true);
    };

    const handleEditClick = (record: any) => {
        setUpdatedRecord({ ...record });
        setValidationErrorMessage('');
        setEmailError(false);
        setPhoneError(false);
        setEditingRecord(record);
        setEditDialogOpen(true);
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" mb={6}>
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
                                        onClick={() => handleEditClick(record)}
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
                                        View Details
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleClickOpen(record)}
                                        style={{
                                            marginLeft: '10px',
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentDashboard;
