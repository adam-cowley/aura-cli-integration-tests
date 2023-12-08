import { config } from 'dotenv'
import type { Driver } from 'neo4j-driver'
import neo4j, { logging } from 'neo4j-driver'
import { Neo4jPersonRepository } from './neo4j-person.repository'

describe('Neo4jPersonRepository', () => {
    let driver: Driver

    beforeAll(async () => {
        config()

        driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(
                process.env.NEO4J_USERNAME,
                process.env.NEO4J_PASSWORD
            )
        )

        return await driver.verifyConnectivity()
    })

    afterAll(async () => {
        await driver.close()
    })

    describe('::create', () => {
        it('should create a node', async () => {
            const repository = new Neo4jPersonRepository(driver)
            const person = await repository.create('Test Person')

            // Check Response
            expect(person).toBeDefined()
            expect(person.id).toBeDefined()
            expect(person.name).toBe('Test Person')

            // Check Result
            const res = await driver.executeQuery(`MATCH (p:Person {id: $id}) RETURN p`, { id: person.id })

            expect(res.records).toHaveLength(1)
            expect(res.records[0].get('p').properties).toMatchObject(person)
        })
    })

    describe('::find', () => {
        it('should find a node by ID', async () => {
            const repository = new Neo4jPersonRepository(driver)

            const person = await repository.create('Find Test')
            const found = await repository.find(person.id)

            expect(found).toBeDefined()
            expect(found?.id).toBe(person.id)
            expect(found?.name).toBe(person.name)
        })
    })

    describe('::all', () => {
        beforeAll(async () => {
            await driver.executeQuery(`MATCH (p:Person) DETACH DELETE p`)
        })

        it('should return all nodes', async () => {
            const repository = new Neo4jPersonRepository(driver)

            const names = ['Person 3', 'Person 1', 'Person 2']

            for (const name of names) {
                await repository.create(name)
            }

            const sorted = names.sort()

            const all = await repository.all()

            expect(all).toBeDefined()
            expect(all.length).toBe(names.length)
            expect(all.map(el => el.name)).toEqual(sorted)
        })
    })

    describe('::update', () => {
        it('should update a node', async () => {
            const repository = new Neo4jPersonRepository(driver)

            const person = await repository.create('Update Test')
            const updated = await repository.update(person.id, 'Updated Successfully')

            expect(updated).toBeDefined()
            expect(updated?.id).toBe(person.id)
            expect(updated?.name).toBe('Updated Successfully')
        })
    })

    describe('::delete', () => {
        it('should delete a node', async () => {
            const repository = new Neo4jPersonRepository(driver)

            const person = await repository.create('Delete Test')
            await repository.delete(person.id)

            const res = await driver.executeQuery(`MATCH (p:Person {id: $id}) RETURN p`, { id: person.id })

            expect(res.records).toHaveLength(0)
        })
    })
})
