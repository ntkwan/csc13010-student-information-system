'use client';

import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

interface AttributesEditFormProps {
    editingCategoryRecord: boolean;
    selectedCategory: string;
    isEditCategoryDialogOpen: boolean;
    setEditCategoryDialogOpen: (open: boolean) => void;
    setEditingCategoryRecord: (record: any) => void;
    handleCategorySaveChanges: () => void;
    handleStatusCategorySaveChanges: () => void;
    setUpdatedCategoryRecord: (record: any) => void;
    updatedCategoryRecord: any;
}

const AttributesEditForm = (props: AttributesEditFormProps) => {
    const {
        editingCategoryRecord,
        selectedCategory,
        isEditCategoryDialogOpen,
        setEditCategoryDialogOpen,
        handleCategorySaveChanges,
        handleStatusCategorySaveChanges,
        setUpdatedCategoryRecord,
        updatedCategoryRecord,
    } = props;

    const handleCategoryInputChange = (field: string, value: any) => {
        setUpdatedCategoryRecord((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <>
            {editingCategoryRecord &&
                (selectedCategory === 'Program' ||
                    selectedCategory === 'Faculty') && (
                    <Dialog
                        open={isEditCategoryDialogOpen}
                        onClose={() => setEditCategoryDialogOpen(false)}
                    >
                        <DialogTitle>Edit record</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Name"
                                value={updatedCategoryRecord.value || ''}
                                onChange={(e) =>
                                    handleCategoryInputChange(
                                        'value',
                                        e.target.value,
                                    )
                                }
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setEditCategoryDialogOpen(false)}
                                color="secondary"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCategorySaveChanges}
                                variant="contained"
                                color="primary"
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}

            {editingCategoryRecord && selectedCategory === 'Status' && (
                <Dialog
                    open={isEditCategoryDialogOpen}
                    onClose={() => setEditCategoryDialogOpen(false)}
                >
                    <DialogTitle>Edit record</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Name"
                            value={updatedCategoryRecord.value || ''}
                            onChange={(e) =>
                                handleCategoryInputChange(
                                    'value',
                                    e.target.value,
                                )
                            }
                        />
                        <TextField
                            margin="dense"
                            fullWidth
                            label="Order"
                            value={updatedCategoryRecord.order || ''}
                            onChange={(e) =>
                                handleCategoryInputChange(
                                    'order',
                                    e.target.value,
                                )
                            }
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setEditCategoryDialogOpen(false)}
                            color="secondary"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStatusCategorySaveChanges}
                            variant="contained"
                            color="primary"
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default AttributesEditForm;
