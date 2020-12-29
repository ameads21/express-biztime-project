const express = require("express");
const expressError = require("../expressError");
const router = express.Router();
const db = require("../db.js");
const ExpressError = require("../expressError.js");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT id, comp_code FROM invoices order by id`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(
      `SELECT i.id,
                    i.amt,
                    i.paid,
                    i.add_date,
                    i.paid_date,
                    c.name,
                    c.description
            FROM invoices as i
                INNER JOIN companies as c on (i.comp_code = c.code)
            WHERE id = $1`,
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Cannot find invoice with id of ${id}`, 404);
    }
    const data = results.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      }
    };
    return res.send({ invoice: invoice });
  } catch (e) {
    return next(e);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *",
      [comp_code, amt]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});


router.put('/:id', async (req, res, next) => {
    try{
        const {id} = req.params
        const {amt} = req.body
        const results = await db.query('UPDATE invoices SET amt=$1 where id=$2 RETURNING *', [amt, id])
        if (results.rows.length === 0){
            throw new ExpressError(`Cannot find invoice with id of ${code}`, 404)
        }
        return res.json({invoice: results.rows[0]})
    } catch(e){
        return next(e)
    }
})

router.delete('/:id', async(req, res, next) => {
    try{
        const {id} = req.params
        const results = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
          }      
        return res.send({msg: "DELETED"})
    }
    catch (e){
        return next(e)
    }
})
module.exports = router;
