export interface FormMetaData extends Record<string, unknown> {

}

export interface FormMeta extends FormMetaData {
    formMetaId: string;
    createdAt: string;
    updatedAt: string;
}