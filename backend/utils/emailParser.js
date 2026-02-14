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
 * Email Patterns:
 * - Faculty: <name>@bitsathy.ac.in (e.g., john.doe@bitsathy.ac.in)
 * - HOD: hod<dept>@bitsathy.ac.in (e.g., hodcs@bitsathy.ac.in)
 * - Club: nss@bitsathy.ac.in, ncc@bitsathy.ac.in, rotaract@bitsathy.ac.in
 * - Infrastructure Admin: infraadmin@bitsathy.ac.in
 * - IT Services Admin: itadmin@bitsathy.ac.in
 * 
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

    // Check for deprecated ADMIN
    if (localPart === 'admin') {
        return {
            isValid: false,
            error: 'Generic admin role has been deprecated. Please use infraadmin or itadmin email addresses.'
        };
    }

    // Check for Infrastructure Admin
    if (localPart === 'infraadmin') {
        return {
            isValid: true,
            role: 'infra_admin',
            department: null,
            year: null
        };
    }

    // Check for IT Services Admin
    if (localPart === 'itadmin') {
        return {
            isValid: true,
            role: 'it_admin',
            department: null,
            year: null
        };
    }

    // Check for CLUB (exact match)
    if (CLUB_EMAILS.includes(localPart)) {
        return {
            isValid: true,
            role: 'club',
            clubName: localPart.charAt(0).toUpperCase() + localPart.slice(1), // Capitalize
            department: null,
            year: null
        };
    }

    // Check for HOD pattern: hod<dept>@bitsathy.ac.in (e.g., hodcs@bitsathy.ac.in)
    if (localPart.startsWith('hod')) {
        const deptCode = localPart.substring(3).toUpperCase(); // Extract dept code after 'hod'

        if (!deptCode || deptCode.length === 0) {
            return {
                isValid: false,
                error: 'HOD email must include department code (e.g., hodcs@bitsathy.ac.in)'
            };
        }

        if (!isValidDepartmentCode(deptCode)) {
            return {
                isValid: false,
                error: `Invalid department code: ${deptCode}. Valid codes: CS, AL, AD, IT, MZ, ME, EE, EC, EI, CE, FD, FT, BT`
            };
        }

        return {
            isValid: true,
            role: 'department', // HOD role is 'department' in the system
            department: deptCode,
            year: null
        };
    }

    // REJECT STUDENT pattern - students cannot register/login
    // Pattern: <name>.<dept><year>@bitsathy.ac.in
    // Example: anuj.cs23@bitsathy.ac.in
    const studentPattern = /^[a-z]+\.([a-z]{2})(\d{2})$/i;
    const studentMatch = localPart.match(studentPattern);

    if (studentMatch) {
        return {
            isValid: false,
            error: 'Student accounts are not allowed. Only Faculty, HOD, Club, and Admin roles can access the system.'
        };
    }

    // Check for FACULTY pattern: <name>@bitsathy.ac.in (simple pattern, no dept/year)
    // Examples: john.doe@bitsathy.ac.in, kumar@bitsathy.ac.in, dr.sharma@bitsathy.ac.in
    // Faculty can have dots in their name, but no department code or year
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
        error: 'Email format does not match any recognized pattern (faculty, HOD, club, or admin)'
    };
};

/**
 * Extract name from email
 * @param {string} email 
 * @returns {string}
 */
const extractNameFromEmail = (email) => {
    const localPart = email.split('@')[0];

    // For HOD, return "HOD <Department>"
    if (localPart.startsWith('hod')) {
        const deptCode = localPart.substring(3).toUpperCase();
        return `HOD ${deptCode}`;
    }

    // For clubs, capitalize the club name
    if (CLUB_EMAILS.includes(localPart)) {
        return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }

    // For admins
    if (localPart === 'infraadmin') return 'Infrastructure Admin';
    if (localPart === 'itadmin') return 'IT Services Admin';

    // For faculty with dots, replace dots with spaces and capitalize each word
    if (localPart.includes('.')) {
        return localPart
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    // For simple names, capitalize first letter
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
};

module.exports = {
    isValidEmail,
    parseEmail,
    extractNameFromEmail,
    ALLOWED_DOMAIN,
    CLUB_EMAILS
};
