const PASSWORD_VALIDATION = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$");
const EMAIL_VALIDATION = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
const PHONE_NUMBER_VALIDATION = /^\d{10}$/;
const ORDER_CODE_VALIDATION = new RegExp("^[a-zA-Z0-9]{8}$");

module.exports = {
    PASSWORD_VALIDATION,
    EMAIL_VALIDATION,
    PHONE_NUMBER_VALIDATION,
    ORDER_CODE_VALIDATION
};