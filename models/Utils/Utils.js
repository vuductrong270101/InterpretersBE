const moment = require('moment')


const getDate = (timestamp, type = 1) => {
    if (timestamp == null) {
        return null;
    }
    let result = null;
    switch (type) {
        case 1:
            result = moment(timestamp).format('DD/MM/YYYY');
            break;
        case 2:
            result = moment(timestamp).format('DD.MM.yyyy - HH:mm');
            break;
        case 3:
            result = moment(timestamp).format('yyyy-MM-DD');
            break;
        case 4:
            result = moment(timestamp).format('HH:mm:ss - DD.MM.yyyy');
            break;
        case 5:
            result = moment(timestamp).format('DD.MM.yyyy - HH:mm');
            break;
        case 6:
            result = moment(timestamp).format('HH:mm');
            break;
        case 7:
            result = moment(timestamp).format('HH:mm  DD.MM.yyyy');
            break;
        case 8:
            result = moment(timestamp).format('MM/DD/YYYY');
            break;
        case 9:
            result = moment(timestamp).format('YYYY');
            break;
        case 10:
            result = moment(timestamp).format('MM');
            break;
        case 11:
            result = moment(timestamp).format('MM/YYYY');
            break;
        default:
            break;
    }
    return result;
}

const getTime = (inputTime) => {
    if (inputTime || inputTime === '0:00') {
        return moment(inputTime, 'HH:mm:ssZ').format('H:mm');
    }
    return '0'
}

const generateRandomNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000);
  };

module.exports = {
    getTime,
    getDate,
    generateRandomNumber
}