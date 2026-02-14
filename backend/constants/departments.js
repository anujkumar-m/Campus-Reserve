/**
 * Department Constants
 * Valid department codes for the college
 */

const DEPARTMENTS = {
    CS: 'Computer Science',
    AL: 'Artificial Intelligence & Machine Learning',
    AD: 'Artificial Intelligence & Data Science',
    IT: 'Information Technology',
    MZ: 'Mechatronics',
    ME: 'Mechanical Engineering',
    EE: 'Electrical Engineering',
    EC: 'Electronics & Communication',
    EI: 'Electronics & Instrumentation',
    CE: 'Civil Engineering',
    FD: 'Fashion Design',
    FT: 'Fashion Technology',
    BT: 'Biotechnology'
};

const DEPARTMENT_CODES = Object.keys(DEPARTMENTS);

/**
 * Check if a department code is valid
 * @param {string} code - Department code to validate
 * @returns {boolean}
 */
const isValidDepartmentCode = (code) => {
    if (!code || typeof code !== 'string') return false;
    return DEPARTMENT_CODES.includes(code.toUpperCase());
};

/**
 * Get department name from code
 * @param {string} code - Department code
 * @returns {string|null}
 */
const getDepartmentName = (code) => {
    if (!code) return null;
    return DEPARTMENTS[code.toUpperCase()] || null;
};

module.exports = {
    DEPARTMENTS,
    DEPARTMENT_CODES,
    isValidDepartmentCode,
    getDepartmentName
};
