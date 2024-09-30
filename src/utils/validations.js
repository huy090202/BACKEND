const PASSWORD_VALIDATION = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$");
const EMAIL_VALIDATION = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
const PHONE_NUMBER_VALIDATION = /^\d{10}$/;
const ORDER_CODE_VALIDATION = new RegExp("^[a-zA-Z0-9]{8}$");
const ENGINE_CHASSIS_NUMBER_VALIDATION = new RegExp("^[A-HJ-NPR-Z0-9]{1,17}$");
const LICENSE_PLATE_VALIDATION = new RegExp("^[0-9]{2}-[A-BD-FG-HKLMNPST-U-VXYZ]{1,2}[0-9]{0,1}[0-9]{5}$");

module.exports = {
    PASSWORD_VALIDATION,
    EMAIL_VALIDATION,
    PHONE_NUMBER_VALIDATION,
    ORDER_CODE_VALIDATION,
    ENGINE_CHASSIS_NUMBER_VALIDATION,
    LICENSE_PLATE_VALIDATION
};