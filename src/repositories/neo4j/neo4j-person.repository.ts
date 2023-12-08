import { Driver } from "neo4j-driver";
import { Person } from "../../Person";
import { PersonRepository } from "../person.repository";

export class Neo4jPersonRepository implements PersonRepository {

    /**
     * Neo4j Person Repository
     *
     * @param {neo4j.Driver} driver
     */
    constructor(private readonly driver: Driver) { }

    /**
     * Get an array of all people
     *
     * @returns {Promise<Person[]>}
     */
    all(): Promise<Person[]> {
        return this.driver.executeQuery(`
            MATCH (p:Person)
            RETURN p {.id, .name}
            ORDER BY p.name ASC
        `)
            .then(result => result.records.map(record => record.get("p")))
    }

    /**
     * Create a new Person record
     *
     * @param {string} name
     * @returns {Promise<Person>}
     */
    create(name: string): Promise<Person> {
        const session = this.driver.session()
        return session.executeWrite(
            tx => tx.run(`
                CREATE (p:Person {id: randomUuid()})
                SET p.name = $name
                RETURN p {.id, .name}
            `, { name })
        )
            .then(result => result.records[0].get("p"))
            .finally(() => session.close())
    }

    /**
     * Find a Person by their ID
     *
     * @param {string} id
     * @returns {Promise<Person | undefined>}
     */
    find(id: string): Promise<Person | undefined> {
        return this.driver.executeQuery(`
            MATCH (p:Person {id: $id})
            RETURN p {.id, .name}
        `, { id })
            .then(result => result.records[0]?.get("p"))

    }

    /**
     * Update a Person record by their ID
     *
     * @param {string} id
     * @param {string} name
     * @returns {Promise<Person | undefined>}
     */
    update(id: string, name: string): Promise<Person | undefined> {
        const session = this.driver.session()
        return session.executeWrite(
            tx => tx.run(`
                MATCH (p:Person {id: $id})
                SET p.name = $name
                RETURN p {.id, .name}
            `, { id, name })
        )
            .then(result => result.records[0].get("p"))
            .finally(() => session.close())
    }

    /**
     * Delete a Person by their ID
     *
     * @param {string} id
     * @returns {Promise<void>}
     */
    delete(id: string): Promise<void> {
        const session = this.driver.session()
        return session.executeWrite(
            tx => tx.run(`
                MATCH (p:Person {id: $id})
                DETACH DELETE p
            `, { id })
        )
            .then(result => { })
            .finally(() => session.close())
    }
}
