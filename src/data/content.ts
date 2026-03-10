import content from './content.json';

export interface Writing {
    id: number;
    title: string;
    category: string;
    date: string;
    image?: string;
    content?: string;
}

export const projectsData = content.projectsData;
export const writingsData: Writing[] = content.writingsData;
export const curationsData = content.curationsData;
export const footerData = content.footerData;
