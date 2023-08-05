const express = require("express");
const router = express.Router();
const pool = require("../config/config.js");
const { authorization } = require("../middlewares/auth.js");
// router.get("/", async (req, res, next) => {
//     try {
//         const findQuery = `
//             SELECT * FROM movies
//         `;
//         const result = await pool.query(findQuery);
//         res.status(200).json(result.rows);
//     } catch (err) {
//         next(err);
//     }
// });

router.get("/", async (req, res, next) => {
    try {
        let { page, limit } = req.query;
        const findQuery = `
            SELECT 
                *
            FROM movies
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
        const query = "SELECT * FROM movies WHERE id = $1";
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

// ROLE Engineer Only
// INSERT
router.post("/", authorization, async (req, res, next) => {
    try {
        const { title, genres, year } = req.body;
        const insertQuery = `
        INSERT INTO movies(id, title, genres, year)
        VALUES
        ($1, $2, $3, $4)
        `;
        const userCountQuery = `
            SELECT 
                COUNT(*) 
            FROM 
            movies;
            `;
        const userCount = await pool.query(userCountQuery);
        console.log(userCount);
        const result = await pool.query(insertQuery, [
            +userCount.rows[0].count + 1,
            title,
            genres,
            year,
        ]);
        res.status(201).json({ message: "Movies created succesfully" });
    } catch (err) {
        next(err);
    }
});

// PUT
router.put("/:id", authorization, async (req, res, next) => {
    try {
        const { title, genres, year } = req.body;
        const { id } = req.params;

        const updateQuery = `
            UPDATE movies
            SET title = $1, genres = $2, year = $3
            WHERE id = $4
            RETURNING *
        `;
        const result = await pool.query(updateQuery, [title, genres, year, id]);
        if (result.rows.length === 0) {
            throw { name: "ErrorNotFound" };
        } else {
            res.status(200).json({ message: "Data Update successfully" });
        }
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", authorization, async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleteQuery = `
            DELETE FROM movies
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
