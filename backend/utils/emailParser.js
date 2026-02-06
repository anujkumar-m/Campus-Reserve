const { isValidDepartmentCode } = require('../constants/departments');

/**
 * Email Parser Utility
 * Parses @bitsathy.ac.in emails to extract role, department, and year
 */

const ALLOWED_DOMAIN = '@bitsathy.ac.in';

// Known club email prefixes
const CLUB_EMAILS = ['nss', 'ncc', 'rotaract'];

/**
 * Validate if email is from allowed domain
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    return email.toLowerCase().endsWith(ALLOWED_DOMAIN);
};

/**
 * Parse email and extract user information
 * @param {string} email 
 * @returns {Object} { role, department, year, isValid, error }
 */
const parseEmail = (email) => {
    // Validate domain
    if (!isValidEmail(email)) {
        return {
            isValid: false,
            error: 'Only @bitsathy.ac.in email addresses are allowed'
        };
    }

    const emailLower = email.toLowerCase();
    const localPart = emailLower.split('@')[0]; // Part before @

    // Check for ADMIN
    if (localPart === 'admin') {
        return {
            isValid: true,
            role: 'admin',
            department: null,
            year: null
        };
    }

    // Check for CLUB
    if (CLUB_EMAILS.includes(localPart)) {
        return {
            isValid: true,
            role: 'club',
            clubName: localPart.charAt(0).toUpperCase() + localPart.slice(1), // Capitalize
            department: null,
            year: null
        };
    }

    // Check for HOD pattern: hod<dept>@bitsathy.ac.in
    if (localPart.startsWith('hod')) {
        const deptCode = localPart.substring(3).toUpperCase(); // Extract dept code after 'hod'

        if (!isValidDepartmentCode(deptCode)) {
            return {
                isValid: false,
                error: `Invalid department code: ${deptCode}`
            };
        }

        return {
            isValid: true,
            role: 'department', // HOD role is 'department' in the system
            department: deptCode,
            year: null
        };
    }

    // Check for STUDENT pattern: <name>.<dept><year>@bitsathy.ac.in
    // Example: anuj.cs23@bitsathy.ac.in
    const studentPattern = /^[a-z]+\.([a-z]{2})(\d{2})$/i;
    const studentMatch = localPart.match(studentPattern);

    if (studentMatch) {
        const deptCode = studentMatch[1].toUpperCase();
        const year = studentMatch[2];

        if (!isValidDepartmentCode(deptCode)) {
            return {
                isValid: false,
                error: `Invalid department code: ${deptCode}`
            };
        }

        return {
            isValid: true,
            role: 'student',
            department: deptCode,
            year: `20${year}`, // Convert 23 to 2023
        };
    }

    // Check for FACULTY pattern: <name>@bitsathy.ac.in (simple pattern, no dept/year)
    // Example: dr.kumar@bitsathy.ac.in, prof.sharma@bitsathy.ac.in
    const facultyPattern = /^[a-z.]+$/i;
    const facultyMatch = localPart.match(facultyPattern);

    if (facultyMatch) {
        return {
            isValid: true,
            role: 'faculty',
            department: null, // Will be selected on first login
            year: null
        };
    }

    // If no pattern matches
    return {
        isValid: false,
        error: 'Email format does not match any recognized pattern (student, faculty, HOD, club, or admin)'
    };
};

/**
 * Extract name from email
 * @param {string} email 
 * @returns {string}
 */
const extractNameFromEmail = (email) => {
    const localPart = email.split('@')[0];

    // For students, extract name before the dot
    if (localPart.includes('.')) {
        const name = localPart.split('.')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // For others, capitalize first letter
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
};

module.exports = {
    isValidEmail,
    parseEmail,
    extractNameFromEmail,
    ALLOWED_DOMAIN
};
