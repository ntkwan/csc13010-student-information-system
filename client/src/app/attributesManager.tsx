'use client';

import { useState } from "react";
import AttributesDashboard from "./attributesDashboard";
import AttributesEditForm from "./attributesEditForm";
import axios from "axios";

interface AttributesManagerProps {
    selectedCategory: string;
    categoryRecords: any[];
    fetchFacultyOptions: () => void;
    fetchProgramOptions: () => void;
    fetchStatusOptions: () => void;
};

const AttributesManager = (props: AttributesManagerProps) => {
    const {
        selectedCategory,
        categoryRecords,
        fetchFacultyOptions,
        fetchProgramOptions,
        fetchStatusOptions,
     } = props;

    const [updatedCategoryRecord, setUpdatedCategoryRecord] = useState<any>(null);
    const [editingCategoryRecord, setEditingCategoryRecord] =
        useState<any>(null);

    const [isEditCategoryDialogOpen, setEditCategoryDialogOpen] =
        useState(false);

    const handleCategoryEditClick = (record: any) => {
        setUpdatedCategoryRecord({ ...record });
        setEditingCategoryRecord(record);
        setEditCategoryDialogOpen(true);
    };

    const handleCategorySaveChanges = async () => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute?attribute=${selectedCategory.toLowerCase()}&oldName=${editingCategoryRecord.value}&newName=${updatedCategoryRecord.value}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                },
            );
            setEditCategoryDialogOpen(false);
            setEditingCategoryRecord(null);
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
            console.error('Error updating record:', error);
        }
    };

    const handleStatusCategorySaveChanges = async () => {
        try {
            if (updatedCategoryRecord.value) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute?attribute=${selectedCategory.toLowerCase()}&oldName=${editingCategoryRecord.value}&newName=${updatedCategoryRecord.value}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                    },
                );
            }
            if (updatedCategoryRecord.order) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/attribute/status?name=${updatedCategoryRecord.value}&order=${updatedCategoryRecord.order}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                    },
                );
            }
            setEditCategoryDialogOpen(false);
            setEditingCategoryRecord(null);
            fetchStatusOptions();
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    return (
        <>
            <AttributesDashboard
                categoryRecords={categoryRecords}
                selectedCategory={selectedCategory}
                handleCategoryEditClick={handleCategoryEditClick}
            ></AttributesDashboard>
            <AttributesEditForm
                editingCategoryRecord={editingCategoryRecord}
                selectedCategory={selectedCategory}
                isEditCategoryDialogOpen={isEditCategoryDialogOpen}
                setEditCategoryDialogOpen={setEditCategoryDialogOpen}
                handleCategorySaveChanges={handleCategorySaveChanges}
                handleStatusCategorySaveChanges={handleStatusCategorySaveChanges}
                setUpdatedCategoryRecord={setUpdatedCategoryRecord}
                updatedCategoryRecord={updatedCategoryRecord}
                setEditingCategoryRecord={setEditingCategoryRecord}
            ></AttributesEditForm>
        </>
    );
};

export default AttributesManager;
