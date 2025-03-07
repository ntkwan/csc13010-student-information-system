'use client';

import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button } from "@mui/material";

interface ItemViewDetailsProps {
    isOpenRecord: boolean;
    selectedRecord: any;
    setSelectedRecord: (record: any) => void;
    setIsOpenRecord: (open: boolean) => void;
}

const ItemViewDetails = (props: ItemViewDetailsProps) => {
    const { isOpenRecord, selectedRecord, setSelectedRecord, setIsOpenRecord } = props;

    const handleCloseDetails = () => {
        setSelectedRecord(null);
        setIsOpenRecord(false);
    };

    return (
        <>
        {isOpenRecord && (
            <Dialog
                open={isOpenRecord}
                onClose={handleCloseDetails}
            >
                <DialogTitle>Record Details</DialogTitle>
                <DialogContent>
                    {Object.entries(selectedRecord || {}).map(
                        ([key, value]) => {
                            if (key === 'id') return null;
                            if (key === 'label') return null;
                            const displayKey =
                                key === 'fullname'
                                    ? 'Full name'
                                    : key === 'username'
                                      ? 'Student ID'
                                      : key === 'birthday'
                                        ? 'Birthday'
                                        : key === 'gender'
                                          ? 'Gender'
                                          : key === 'faculty'
                                            ? 'Faculty'
                                            : key === 'classYear'
                                              ? 'Class Year'
                                              : key === 'program'
                                                ? 'Program'
                                                : key === 'address'
                                                  ? 'Address'
                                                  : key === 'email'
                                                    ? 'Email'
                                                    : key ===
                                                        'phone'
                                                      ? 'Phone number'
                                                      : key ===
                                                          'status'
                                                        ? 'Status'
                                                        : key ===
                                                            'role'
                                                          ? 'Role'
                                                          : key;

                            return (
                                <Typography
                                    key={key}
                                    gutterBottom
                                    style={{
                                        width: '500px',
                                        height: '30px',
                                        textAlign: 'left',
                                        lineHeight: '32px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <strong>{displayKey}:</strong>{' '}
                                    {key === 'birthday'
                                        ? new Date(value as string)
                                              .toISOString()
                                              .split('T')[0]
                                        : String(value)}
                                </Typography>
                            );
                        },
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDetails}
                        color="primary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        )}
        </>
    )
};

export default ItemViewDetails;
