export function isValidPhone(phone) {
    var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    if (phoneRegex.test(phone)) {
        return phone.replace(phoneRegex, "($1) $2-$3");
    }

    return false;
};


export function isValidName(name) {
    // if there is no space in the middle, that means 2 names were not entered
    if (name.indexOf(" ") <= 0)
        return false;

    var regex = new RegExp("^[a-zA-Zàáâäãå????èéêë??ìíîï??òóôöõøùúûü??ÿý??ñç?šžÀÁÂÄÃÅ?????ÈÉÊËÌÍÎÏ???ÒÓÔÖÕØÙÚÛÜ??ŸÝ??ÑßÇŒÆ?ŠŽ?ð ,.'-]+$");

    if (regex.test(name)) {
        return name;
    }

    return false;
};