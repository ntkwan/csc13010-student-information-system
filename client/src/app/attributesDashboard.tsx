'use client';
import React, { useEffect, useState } from 'react';
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
    Box,
} from '@mui/material';

interface AttributesDashboardProps {
    categoryRecords: any[];
    selectedCategory: string;
    handleCategoryEditClick: (record: any) => void;
    handleViewDetails: (record: any) => void;
}

const AttributesDashboard = (props: AttributesDashboardProps) => {
    const {
        categoryRecords,
        selectedCategory,
        handleCategoryEditClick,
        handleViewDetails,
    } = props;

    return (
        <Box display="flex" justifyContent="center" alignItems="center" mb={6}>
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
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AttributesDashboard;
