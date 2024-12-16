

const YEAR = 2024;
const MONTH = 11;


export const startDate = new Date(YEAR, MONTH - 1, 2).toISOString().split('T')[0];
export const endDate = new Date(YEAR, MONTH, 1).toISOString().split('T')[0];

export const accessToken = "RTFM";
