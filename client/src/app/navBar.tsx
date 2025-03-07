'use client';

import { Box, Button } from '@mui/material';

const categories = ['Student', 'Faculty', 'Program', 'Status', 'Settings'];

interface NavBarProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
}

const NavBar = (props: NavBarProps) => {
    const { selectedCategory, setSelectedCategory } = props;
    return (
        <Box display="flex" justifyContent="center" gap={2} mb={3}>
            {categories.map((category) => (
                <Button
                    key={category}
                    variant={
                        selectedCategory === category ? 'contained' : 'outlined'
                    }
                    onClick={() => setSelectedCategory(category)}
                >
                    {category}
                </Button>
            ))}
        </Box>
    );
};

export default NavBar;
