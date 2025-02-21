'use client';
import { Box, Container, Typography, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useEffect, useState } from 'react';

interface BuildInfo {
    version: string;
    buildDate: string;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).format(date);
};

const Footer = () => {
    const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);

    useEffect(() => {
        const fetchBuildInfo = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/build`,
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch build info');
                }
                const data = await response.json();
                setBuildInfo(data);
            } catch (error) {
                console.error('Error fetching build info:', error);
            }
        };

        fetchBuildInfo();
    }, []);

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#1976d2',
                color: '#fff',
                py: 2,
                textAlign: 'center',
                mt: 'auto',
                width: '100%',
            }}
        >
            <Container>
                {buildInfo && (
                    <Typography
                        variant="caption"
                        sx={{ display: 'block', mt: 1 }}
                    >
                        Version: {buildInfo.version} | Built:{' '}
                        {formatDate(buildInfo.buildDate)}
                    </Typography>
                )}
                <Box mt={1}>
                    <IconButton
                        href="https://github.com/ntkwan"
                        target="_blank"
                        sx={{ color: '#fff' }}
                    >
                        <GitHubIcon />
                    </IconButton>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
