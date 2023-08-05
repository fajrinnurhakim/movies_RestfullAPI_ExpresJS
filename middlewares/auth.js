const { verifyToken } = require("../lib/jwt.js");
const pool = require("../config/config.js");

const authentication = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization.split(" ")[1];
        console.log(accessToken, "<<<"); // decode Token
        const { id, email, gender, role } = verifyToken(accessToken);
        console.log(id);
        const findQuery = `
            SELECT *
            FROM users
            WHERE id = $1
        `;
        const result = await pool.query(findQuery, [id]);

        if (result.rows.length === 0) {
            throw { name: "Unauthenticated" };
        } else {
            // terautentikasi
            const foundUser = result.rows[0];
            // Custom Property
            req.loggedUser = {
                id: foundUser.id,
                email: foundUser.email,
                gender: foundUser.gender,
                role: foundUser.role,
            };
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Authentication failed" });
    }
};

const authorization = (req, res, next) => {
    // Dieksekusi Setelah authentication
    try {
        const { role } = req.loggedUser; 
        if (role === "Engineer") {
            next();
        } else {
            throw { name: "Unauthorized" };
        }
    } catch (err) { 
        next(err);
    }
};
module.exports = {
    authentication,
    authorization,
};
