const express = require("express");
const expressError = require("../expressError");
const router = express.Router();
const db = require("../db.js");
const ExpressError = require("../expressError.js");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`
        SELECT c.code, i.industry FROM companies as c
        left join industries as i
        on c.code = i.comp_code
        `);
    industries = {};
    results.rows.map(function (r) {
      if (!(r.industry in industries)) {
        industries[r.industry] = [];
      }
      industries[r.industry].push(r.code);
    });
    return res.json({ industries: industries });
  } catch (e) {
    return next(e);
  }
});


router.post('/', async (req, res, next) => {
    try{
        const {comp_code, industry} = req.body;
        if ((comp_code != true) || (industry != true)){
            throw new ExpressError("Please provide a comp_code and industry value", 404)
        }
        const results = await db.query('INSERT INTO industries (comp_code, industry) VALUES ($1, $2) RETURNING *', [comp_code, industry])
        return res.status(201).json({Industry: results.rows[0]})
    } catch(e){
        return next(e)
    }
})

module.exports = router;
