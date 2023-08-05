const express = require("express");
const router = express.Router();
const pool = require("../config/config.js");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const { generateToken } = require("../lib/jwt.js");

router.post("/register", async (req, res, next) => {
    try {
        const { email, gender, password, role } = req.body;
        const hashPassword = bcrypt.hashSync(password, salt);
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
            hashPassword,
            role,
        ]);

        res.status(201).json({
            message: "User created succesfully",
            email,
            gender,
            role,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const findQuery = `
       SELECT
            *
       FROM users
            WHERE email = $1
       `;
        const result = await pool.query(findQuery, [email]);
        console.log(result.rows[0]);
        if (result.rows.length === 0) {
            throw { name: "ErrorNotFound" };
        } else {
            const foundUser = result.rows[0];
            // Compare password with hashhashpassword
            const isValid = bcrypt.compareSync(password, foundUser.password);
            // check password valid
            if (isValid) {
                const accessToken = generateToken({
                    id: foundUser.id,
                    gender: foundUser.gender,
                    email: foundUser.email,
                    role: foundUser.role
                });
                res.status(200).json({
                    message: "Login success",
                    accessToken,
                });
            } else {
                throw { name: "InvalidCredentials" };
            }
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
