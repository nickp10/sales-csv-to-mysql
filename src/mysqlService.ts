import { Course, Statement, Teachable, Udemy } from "./interfaces";
import * as mysql from "mysql";

export default class MySQLService {
    async connect(connectionUri: string | mysql.ConnectionConfig): Promise<mysql.Connection> {
        return new Promise<mysql.Connection>((resolve, reject) => {
            const connection = mysql.createConnection(connectionUri);
            connection.connect((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });
    }

    async disconnect(connection: mysql.Connection): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (connection.state === "connected") {
                connection.end((error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    async createDatabase(connection: mysql.Connection, database: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `CREATE DATABASE IF NOT EXISTS ${database}`;
            connection.query(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        }); 
    }

    async createCoursesTable(connection: mysql.Connection, database: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `CREATE TABLE IF NOT EXISTS \`${database}\`.\`courses\` (
                \`id\` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                \`courseName\` NVARCHAR(255) NULL,
                \`teachableName\` NVARCHAR(255) NULL,
                \`udemyName\` NVARCHAR(255) NULL,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY (\`teachableName\`),
                UNIQUE KEY (\`udemyName\`)
            );`;
            connection.query(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            })
        });
    }

    async insertCourse(connection: mysql.Connection, database: string, course: Course): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO \`${database}\`.\`courses\` (\`courseName\`, \`teachableName\`, \`udemyName\`) VALUES (?, ?, ?)`;
            connection.query(sql, [ course.courseName, course.teachableName, course.udemyName ], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    course.id = result.insertId;
                    resolve();
                }
            })
        });
    }

    async updateCourse(connection: mysql.Connection, database: string, course: Course): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `UPDATE \`${database}\`.\`courses\` SET \`courseName\` = ?, \`teachableName\` = ?, \`udemyName\` = ? WHERE \`id\` = ?`;
            connection.query(sql, [ course.courseName, course.teachableName, course.udemyName, course.id ], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            })
        });
    }

    async selectCourseByTeachableName(connection: mysql.Connection, database: string, teachableName: string): Promise<Course> {
        return new Promise<Course>((resolve, reject) => {
            const sql = `SELECT * FROM \`${database}\`.\`courses\` WHERE \`teachableName\` = ?`;
            connection.query(sql, [ teachableName ], (error, rows) => {
                if (error) {
                    reject(error);
                } else if (!Array.isArray(rows)) {
                    reject("An invalid reponse was returned from the SQL query.");
                } else if (rows.length < 1) {
                    resolve(undefined);
                } else {
                    const row = rows[0];
                    resolve({ id: row["id"], courseName: row["courseName"], teachableName: row["teachableName"], udemyName: row["udemyName"] });
                }
            });
        });
    }

    async selectCourseByUdemyName(connection: mysql.Connection, database: string, udemyName: string): Promise<Course> {
        return new Promise<Course>((resolve, reject) => {
            const sql = `SELECT * FROM \`${database}\`.\`courses\` WHERE \`udemyName\` = ?`;
            connection.query(sql, [ udemyName ], (error, rows) => {
                if (error) {
                    reject(error);
                } else if (!Array.isArray(rows)) {
                    reject("An invalid reponse was returned from the SQL query.");
                } else if (rows.length < 1) {
                    resolve(undefined);
                } else {
                    const row = rows[0];
                    resolve({ id: row["id"], courseName: row["courseName"], teachableName: row["teachableName"], udemyName: row["udemyName"] });
                }
            });
        });
    }

    async createStatementsTable(connection: mysql.Connection, database: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `CREATE TABLE IF NOT EXISTS \`${database}\`.\`statements\` (
                \`id\` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                \`fileName\` NVARCHAR(255) NULL,
                PRIMARY KEY (\`id\`)
            );`;
            connection.query(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            })
        });
    }

    async selectStatements(connection: mysql.Connection, database: string): Promise<Statement[]> {
        return new Promise<Statement[]>((resolve, reject) => {
            const sql = `SELECT * FROM \`${database}\`.\`statements\``;
            connection.query(sql, (error, rows) => {
                if (error) {
                    reject(error);
                } else if (!Array.isArray(rows)) {
                    reject("An invalid reponse was returned from the SQL query.");
                } else {
                    resolve(rows.map<Statement>(row => { return { id: row['id'], fileName: row['fileName'] }; }));
                }
            });
        });
    }

    async deleteStatement(connection: mysql.Connection, database: string, id: number): Promise<Statement[]> {
        return new Promise<Statement[]>((resolve, reject) => {
            const sql = `DELETE FROM \`${database}\`.\`statements\` WHERE \`id\` = ?`;
            connection.query(sql, [ id ], (error, rows) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    async insertStatement(connection: mysql.Connection, database: string, statement: Statement): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO \`${database}\`.\`statements\` (\`fileName\`) VALUES (?)`;
            connection.query(sql, [ statement.fileName ], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    statement.id = result.insertId;
                    resolve();
                }
            })
        });
    }

    async createTeachableTable(connection: mysql.Connection, database: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `CREATE TABLE IF NOT EXISTS \`${database}\`.\`teachable\` (
                \`id\` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                \`teachableID\` BIGINT NULL,
                \`purchasedAt\` DATETIME NULL,
                \`courseName\` NVARCHAR(255) NULL,
                \`finalPrice\` DECIMAL(20,2) NULL,
                \`earningsUSD\` DECIMAL(20,2) NULL,
                \`coupon\` NVARCHAR(255) NULL,
                \`userID\` BIGINT NULL,
                \`saleID\` BIGINT NULL,
                PRIMARY KEY (\`id\`),
                FOREIGN KEY (\`courseName\`) REFERENCES \`${database}\`.\`courses\` (\`teachableName\`)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE
            );`;
            connection.query(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            })
        });
    }

    async deleteTeachables(connection: mysql.Connection, database: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `DELETE FROM \`${database}\`.\`teachable\``;
            connection.query(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            })
        });
    }

    async insertTeachable(connection: mysql.Connection, database: string, teachable: Teachable): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO \`${database}\`.\`teachable\`
                (
                    \`teachableID\`, \`purchasedAt\`, \`courseName\`, \`finalPrice\`,
                    \`earningsUSD\`, \`coupon\`, \`userID\`, \`saleID\`
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
                teachable.teachableID, teachable.purchasedAt, teachable.courseName, teachable.finalPrice,
                teachable.earningsUSD, teachable.coupon, teachable.userID, teachable.saleID
            ];
            connection.query(sql, values, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    teachable.id = result.insertId;
                    resolve();
                }
            })
        });
    }

    async createUdemyTable(connection: mysql.Connection, database: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `CREATE TABLE IF NOT EXISTS \`${database}\`.\`udemy\` (
                \`id\` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                \`statementID\` BIGINT(20) UNSIGNED NOT NULL,
                \`transactionID\` BIGINT NULL,
                \`date\` DATETIME NULL,
                \`userName\` NVARCHAR(255) NULL,
                \`courseName\` NVARCHAR(255) NULL,
                \`couponCode\` NVARCHAR(255) NULL,
                \`revenueChannel\` NVARCHAR(255) NULL,
                \`vendor\` NVARCHAR(255) NULL,
                \`price\` DECIMAL(20,2) NULL,
                \`transactionCurrency\` NVARCHAR(255) NULL,
                \`taxAmount\` DECIMAL(20,2) NULL,
                \`storeFee\` DECIMAL(20,2) NULL,
                \`sharePrice\` DECIMAL(20,2) NULL,
                \`instructorShare\` DECIMAL(20,5) NULL,
                \`taxRate\` DECIMAL(20,5) NULL,
                \`exchangeRate\` DECIMAL(20,5) NULL,
                PRIMARY KEY (\`id\`),
                FOREIGN KEY (\`statementID\`) REFERENCES \`${database}\`.\`statements\` (\`id\`)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,
                FOREIGN KEY (\`courseName\`) REFERENCES \`${database}\`.\`courses\` (\`udemyName\`)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE
            );`;
            connection.query(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            })
        });
    }

    async insertUdemy(connection: mysql.Connection, database: string, udemy: Udemy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO \`${database}\`.\`udemy\`
                (
                    \`transactionID\`, \`statementID\`, \`date\`, \`userName\`,
                    \`courseName\`, \`couponCode\`, \`revenueChannel\`,\`vendor\`,
                    \`price\`, \`transactionCurrency\`, \`taxAmount\`, \`storeFee\`,
                    \`sharePrice\`, \`instructorShare\`, \`taxRate\`, \`exchangeRate\`
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
                udemy.transactionID, udemy.statementID, udemy.date, udemy.userName,
                udemy.courseName, udemy.couponCode, udemy.revenueChannel, udemy.vendor,
                udemy.price, udemy.transactionCurrency, udemy.taxAmount, udemy.storeFee,
                udemy.sharePrice, udemy.instructorShare, udemy.taxRate, udemy.exchangeRate
            ];
            connection.query(sql, values, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    udemy.id = result.insertId;
                    resolve();
                }
            })
        });
    }
}