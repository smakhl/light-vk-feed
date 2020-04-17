export function makeDateFromUnixTime(unixTimeStamp) {
    return new Date(unixTimeStamp * 1000);
}
