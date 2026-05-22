class InsufficientStockError extends Error {
	constructor(message = "Not enough stock") {
		super(message);
		this.name = "InsufficientStockError";
	}
}

module.exports = {
	InsufficientStockError,
};
