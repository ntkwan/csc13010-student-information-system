'use client';
import React, { useEffect, useState } from 'react';
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
import ItemViewDetails from './itemViewDetails';
import DeleteButton from '@/buttons/delete';
import axios from 'axios';

interface AttributesDashboardProps {
    categoryRecords: any[];
    setCategoryRecords: (records: any[]) => void;
    selectedCategory: string;
    handleCategoryEditClick: (record: any) => void;
    setErrorMessage: (message: string) => void;
}

const AttributesDashboard = (props: AttributesDashboardProps) => {
    const {
        categoryRecords,
        setCategoryRecords,
        selectedCategory,
        handleCategoryEditClick,
        setErrorMessage,
    } = props;
    const [isOpenRecord, setIsOpenRecord] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const handleViewDetails = (record: any) => {
        setSelectedRecord(record);
        setIsOpenRecord(true);
    };

    const handleCloseDelete = () => {
        setSelectedRecord(null);
        setOpen(false);
    };

    const handleClickOpen = (record: any) => {
        setSelectedRecord(record);
        setOpen(true);
    };

    const handleDelete = async (record: any) => {
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute?attribute=${selectedCategory.toLowerCase()}&name=${record.value}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            setOpen(false);
            if (response.status === 200) {
                switch (selectedCategory) {
                    case 'Status':
                        setCategoryRecords(
                            categoryRecords.filter(
                                (item) => item.value !== record.value,
                            ),
                        );
                        break;
                    case 'Faculty':
                        setCategoryRecords(
                            categoryRecords.filter(
                                (item) => item.value !== record.value,
                            ),
                        );
                        break;
                    case 'Program':
                        setCategoryRecords(
                            categoryRecords.filter(
                                (item) => item.value !== record.value,
                            ),
                        );
                        break;
                    default:
                        break;
                }
            }
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message ||
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
                        maxHeight: '600px',
                        overflow: 'auto',
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {selectedCategory === 'Status' && (
                                    <TableCell style={{ width: '300px' }}>
                                        Order
                                    </TableCell>
                                )}
                                <TableCell style={{ width: '300px' }}>
                                    Name
                                </TableCell>
                                <TableCell style={{ width: '200px' }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categoryRecords.map((record, index) => (
                                <TableRow key={index}>
                                    {selectedCategory === 'Status' && (
                                        <TableCell>{record.order}</TableCell>
                                    )}
                                    <TableCell>{record.value}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() =>
                                                handleCategoryEditClick(record)
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
                                            style={{ marginLeft: '10px' }}
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
            <ItemViewDetails
                isOpenRecord={isOpenRecord}
                selectedRecord={selectedRecord}
                setSelectedRecord={setSelectedRecord}
                setIsOpenRecord={setIsOpenRecord}
            ></ItemViewDetails>
            <DeleteButton
                open={open}
                handleCloseDelete={handleCloseDelete}
                handleDelete={handleDelete}
                selectedRecord={selectedRecord}
            />
        </>
    );
};

export default AttributesDashboard;
