// short Number

export default function shortNumber(number){
    const lastSixStr = number.toString().slice(-6);
    return Number(lastSixStr);
}

