class RoshApiError extends Error {
    constructor(message) {
        super(message);
        this.name = "RoshApiError";
    }
}
export default RoshApiError;