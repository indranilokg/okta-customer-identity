// Product type definition
/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} imageUrl
 */

// CartItem type definition
/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 */

// OrderItem type definition
/**
 * @typedef {CartItem} OrderItem
 */

// Order type definition
/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {OrderItem[]} items
 * @property {number} total
 * @property {'pending'|'completed'|'failed'} status
 * @property {string} createdAt
 */

// PaymentInfo type definition
/**
 * @typedef {Object} PaymentInfo
 * @property {'credit_card'} method
 * @property {string} cardNumber
 * @property {string} expiryDate
 * @property {string} cvv
 */ 