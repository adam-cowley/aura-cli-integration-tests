import { Person } from "../Person";

export interface PersonRepository {

    /**
     * Get an array of all people
     *
     * @returns {Promise<Person[]>}
     */
    all(): Promise<Person[]>;

    /**
     * Create a new Person record
     *
     * @param {string} name
     * @returns {Promise<Person>}
     */
    create(name: string): Promise<Person>;

    /**
     * Find a Person by their ID
     *
     * @param {string} id
     * @returns {Promise<Person | undefined>}
     */
    find(id: string): Promise<Person | undefined>;

    /**
     * Update a Person record by their ID
     *
     * @param {string} id
     * @param {string} name
     * @returns {Promise<Person | undefined>}
     */
    update(id: string, name: string): Promise<Person | undefined>;

    /**
     * Delete a Person by their ID
     *
     * @param {string} id
     * @returns {Promise<void>}
     */
    delete(id: string): Promise<void>;
}
