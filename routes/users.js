const express = require("express");
const router = express.Router();
const pool = require("../config/config.js");
const { authorization } = require("../middlewares/auth.js");

router.get("/", async (req, res, next) => {
    try {
        let { page, limit } = req.query;
        const findQuery = `
            SELECT 
                *
            FROM users
                LIMIT $1 OFFSET $2
        `;

        page = +page || DEFAULT_PAGE;
        limit = +limit || DEFAULT_LIMIT;
        let itemsPerPage = (page - 1) * limit;
        const result = await pool.query(findQuery, [limit, itemsPerPage]);

        res.status(200).json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await pool.query(query, [id]);
        // res.json(rows);
        if (result.rows.length === 0) {
            throw { name: "ErrorNotFound" };
        } else {
            res.status(200).json(result.rows[0]);
        }
    } catch (err) {
        next(err);
    }
});

router.post("/",authorization, async (req, res, next) => {
    try {
        const { email, gender, password, role } = req.body;
        const insertQuery = `
        INSERT INTO users(id, email, gender, password, role)
        VALUES
        ($1, $2, $3, $4, $5)
        `;
        const userCountQuery = `
            SELECT 
                COUNT(*) 
            FROM 
            users;
            `;
        const userCount = await pool.query(userCountQuery);
        console.log(userCount);
        const result = await pool.query(insertQuery, [
            +userCount.rows[0].count + 1,
            email,
            gender,
            password,
            role,
        ]);
        res.status(201).json({ message: "Users created succesfully" });
    } catch (err) {
        next(err);
    }
});

router.put("/:id",authorization, async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const { id } = req.params;

        const updateQuery = `
            UPDATE users
            SET email = $1, role = $2
            WHERE id = $3
        `;
        const result = await pool.query(updateQuery, [email, role, id]);
        if (result.rowsCount === 0) {
            throw { name: "ErrorNotFound" };
        } else {
            res.status(200).json({ message: "Data Update successfully" });
        }
    } catch (err) {
        next(err);
    }
});

router.delete("/:id",authorization, async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleteQuery = `
            DELETE FROM users
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(deleteQuery, [id]);
        if (result.rows.length === 0) {
            throw { name: "ErrorNotFound" };
        } else {
            res.status(200).json({ message: "Data delete successfuly" });
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
