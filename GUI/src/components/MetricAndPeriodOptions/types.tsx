export interface Option {
    id: string;
    labelKey: string;
    additionalKey?: string;
    subOptions?: SubOption[];
}

export interface SubOption {
    id: string;
    labelKey: string;
    color: string,
}
