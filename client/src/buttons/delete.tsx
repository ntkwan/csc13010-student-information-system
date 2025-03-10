'use client';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

interface DeleteButtonProps {
    open: boolean;
    handleCloseDelete: () => void;
    handleDelete: (record: any) => void;
    selectedRecord: any;
}

const DeleteButton = (props: DeleteButtonProps) => {
    const { open, handleCloseDelete, handleDelete, selectedRecord } = props;

    return (
        <Dialog open={open} onClose={handleCloseDelete}>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogContent>Are you sure you want to delete?</DialogContent>
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
    );
};

export default DeleteButton;
