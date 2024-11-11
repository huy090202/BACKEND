const generatePassword = (length) => {
    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "@#$%^&*()";

    // Kết hợp tất cả các ký tự
    const allChars = upperCaseChars + lowerCaseChars + numbers + specialChars;

    // Tạo mật khẩu ngẫu nhiên
    let password = '';

    // Đảm bảo mật khẩu có ít nhất một ký tự trong mỗi loại
    password += upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
    password += lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Tạo mật khẩu ngẫu nhiên với độ dài cần thiết
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Trộn mật khẩu
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    return password;
};

module.exports = generatePassword;