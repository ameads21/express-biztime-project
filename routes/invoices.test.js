process.env.NODE_ENV = 'test';

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testInvoice;
let testCompany;
beforeEach(async() => {
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('testComp', 'Test Computer', 'Maker of tests') RETURNING code, name, description`)
    const invoiceResults = await db.query(`INSERT INTO invoices (comp_code, amt, paid) VALUES ('testComp', 100, false) RETURNING *`)
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

describe("GET /invoices", () => {
    test("Get a list of invoices", async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "invoices": [
              {
                "id": testInvoice[0].id,
                "comp_code": testInvoice[0].comp_code
              }
            ]
          })
    })
})



describe("POST /invoices", () => {
    test("Create a new invoice", async () => {
        const res = await request(app).post('/invoices').send({comp_code: 'testComp', amt:"200"})
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            "invoice": {
              "id": expect.any(Number),
              "comp_code": "testComp",
              "amt": 200,
              "paid": false,
              "add_date": expect.any(String),
              "paid_date": null
            }
          })
    })
})



describe("GET /invoices/:id", () => {
    test("Get a specified invoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice[0].id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "invoice": {
              "id": expect.any(Number),
              "amt": 100,
              "paid": false,
              "add_date": expect.any(String),
              "paid_date": null,
              "company": {
                "name": "Test Computer",
                "description": "Maker of tests"
              }
            }
          })
    })
})



// describe("PUT /invoices/:id", () => {
//     test("Update an invoice", async () => {
//         const res = await request(app).put(`/invoices/${testInvoice.id}`).send({name:"Update test", description: "Updating the computer"})
//         expect(res.statusCode).toBe(200)
//         expect(res.body).toEqual({
//             "company": {
//               "code": testCompany.code,
//               "name": "Update test",
//               "description": "Updating the computer"
//             }
//           })
//     })
// })


describe("DELETE /invoices/:id", () => {
    test("Delete an invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice[0].id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"msg": "DELETED"})
    })
})