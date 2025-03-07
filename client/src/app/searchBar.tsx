'use client';
import {
    TextField,
    Button,
    Box,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import { useState } from 'react';

interface SearchBarProps {
    loading: boolean;
    fetchRecords: (params: { searchQuery: string; faculty: string }) => void;
    errorMessage: string;
    facultyOptions: { label: string; value: string }[];
}

const SearchBar = (props: SearchBarProps) => {
    const { loading, fetchRecords, facultyOptions, errorMessage } = props;

    const [isFilteringByFaculty, setIsFilteringByFaculty] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('');

    const handleSearch = () => {
        fetchRecords({
            searchQuery,
            faculty: isFilteringByFaculty ? facultyFilter : '',
        });
    };

    return (
        <>
            <Box
                mb={6}
                display="flex"
                justifyContent="center"
                alignItems="center"
                style={{ width: '100%' }}
            >
                <Box width="50%" minWidth="300px" display="flex" gap={2}>
                    <TextField
                        label="Search by student ID or full name"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                        variant="contained"
                        style={{ height: '35px', marginTop: '10px' }}
                        onClick={() =>
                            setIsFilteringByFaculty(!isFilteringByFaculty)
                        }
                    >
                        {isFilteringByFaculty ? 'Cancel' : 'Faculty'}
                    </Button>
                </Box>

                {isFilteringByFaculty && (
                    <Select
                        value={facultyFilter}
                        onChange={(e) => setFacultyFilter(e.target.value)}
                        displayEmpty
                        variant="outlined"
                        style={{
                            marginLeft: '10px',
                            minWidth: '200px',
                        }}
                    >
                        <MenuItem value="">Select faculty</MenuItem>
                        {facultyOptions.map((faculty) => (
                            <MenuItem key={faculty.label} value={faculty.value}>
                                {faculty.value}
                            </MenuItem>
                        ))}
                    </Select>
                )}

                <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                    style={{ marginLeft: '10px' }}
                >
                    Search
                </Button>
            </Box>

            {errorMessage && (
                <Typography
                    color="error"
                    variant="body2"
                    style={{
                        alignContent: 'center',
                        marginBottom: '50px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {errorMessage}
                </Typography>
            )}

            {!errorMessage && (
                <Typography
                    variant="body2"
                    style={{ marginBottom: '118px' }}
                ></Typography>
            )}
        </>
    );
};

export default SearchBar;
