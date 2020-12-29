const express = require("express")
const expressError = require('../expressError')
const router = express.Router();
const db = require("../db.js");
const ExpressError = require("../expressError.js");

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM companies`)
        return res.json({companies: results.rows})
    } catch(e){
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try{
        const {code, name, description} = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *', [code, name, description])
        return res.json({company: results.rows})
    } catch(e){
        return next(e)
    }
})

router.get('/:code', async (req, res, next) => {
    try{
        const {code} = req.params
        const compResult = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`,
          [code]
      );
  
      const invResult = await db.query(
            `SELECT id
             FROM invoices
             WHERE comp_code = $1`,
          [code]
      );
        if (compResult.rows.length === 0){
            throw new ExpressError(`Can't find company: ${code}`, 404)
        }

        const company = compResult.rows[0]
        const invoices = invResult.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.json({company: company})
    } catch(e){
        return next(e)
    }
})


router.put('/:code', async (req, res, next) => {
    try{
        const {code} = req.params
        const {description, name} = req.body
        const results = await db.query('UPDATE companies SET name=$1, description=$2 where code=$3 RETURNING *', [name, description, code])
        if (results.rows.length === 0){
            throw new ExpressError(`Cannot find company with code ${code}`, 404)
        }
        return res.json({company: results.rows[0]})
    } catch(e){
        return next(e)
    }
})


router.delete('/:code', async (req, res, next) => {
    try{
        const {code} = req.params
        const results = await db.query('DELETE FROM companies WHERE code = $1', [code])
        return res.json({msg: "deleted"})
    } catch(e){
        return next(e)
    }
})

module.exports = router