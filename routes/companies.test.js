process.env.NODE_ENV = 'test';

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testInvoice;
let testCompany;
beforeEach(async() => {
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('testComp', 'Test Computer', 'Maker of tests') RETURNING code, name, description`)
    const invoiceResults = await db.query(`INSERT INTO invoices (comp_code, amt, paid) VALUES ('testComp', 100, false) RETURNING comp_code, amt, paid`)
    testInvoice = invoiceResults.rows
    testCompany = compResult.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM invoices`)
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", () => {
    test("Get a list of companies", async () => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({companies: [testCompany]})
    })
})



describe("POST /companies", () => {
    test("Create a new company", async () => {
        const res = await request(app).post('/companies').send({code: 'test', name:"test another computer", description: "This is another test computer"})
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            "company": {
              "code": "test",
              "name": "test another computer",
              "description": "This is another test computer"
            }
          })
    })
})



describe("GET /companies/:code", () => {
    test("Get a specified company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        const iResults = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [testCompany.code])
        testCompany.invoices = [iResults.rows[0].id]
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({company: testCompany})
    })
})



describe("PUT /companies/:id", () => {
    test("Update a specified company", async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({name:"Update test", description: "Updating the computer"})
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "company": {
              "code": testCompany.code,
              "name": "Update test",
              "description": "Updating the computer"
            }
          })
    })
})


describe("DELETE /companies/:id", () => {
    test("Delete a specified company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"msg": "deleted"})
    })
})