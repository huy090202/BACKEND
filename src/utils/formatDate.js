const formatDate = (data) => {
    const date = new Date(data);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

module.exports = formatDate;
