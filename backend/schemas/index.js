/**
 * Schema Index - Central export point for all database schemas
 * 
 * This file provides a convenient way to import all schemas from a single location.
 * It helps maintain clean imports and provides better organization.
 */

export { default as UserSchema } from './UserSchema.js';
export { default as CitySchema } from './CitySchema.js';
export { default as FlightSchema } from './FlightSchema.js';
