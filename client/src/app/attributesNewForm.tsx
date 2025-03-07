'use client';

import { Dialog, Table, TableBody, TableRow, TableCell, TextField, Box, Button } from "@mui/material";
import axios from "axios";
import { useState } from "react";

interface AttributesNewFormProps {
    selectedCategory: string;
    fetchFacultyOptions: () => void;
    fetchProgramOptions: () => void;
    fetchStatusOptions: () => void;
}


const AttributesNewForm = (props: AttributesNewFormProps) => {
    const {
        selectedCategory,
        fetchFacultyOptions,
        fetchProgramOptions,
        fetchStatusOptions,
    } = props;
    const [newCategoryRecord, setNewCategoryRecord] = useState({
        value: '',
        order: '',
    });
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

    const [showCategoryRecordForm, setShowCategoryRecordForm] = useState(false);

    return (
        <>
            {(selectedCategory === 'Program' ||
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
                                                (prev: any) => ({
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
            {selectedCategory === 'Status' && (
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
                                                        (prev: any) => ({
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
                                                    (prev: any) => ({
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
        </>
    );
};

export default AttributesNewForm;
