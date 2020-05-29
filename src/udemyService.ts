import args from "./args";
import AwaitLock from "await-lock";
import * as csv from "fast-csv";
import * as fs from "fs";
import * as mysql from "mysql";
import MySQLService from "./mysqlService";
import * as path from "path";
import { promisify } from "util";
import { Statement, Udemy } from "./interfaces";
import * as utils from "./utils";

export default class UdemyService {
    async getUdemyFilesFromDirectory(udemyDirectory: string): Promise<string[]> {
        const readdir = promisify(fs.readdir);
        return readdir(udemyDirectory);
    }

    getExistingStatement(statementRecords: Statement[], statementFileName: string): Statement {
        return statementRecords.find(record => record.fileName === statementFileName);
    }

    async readAllUdemyFiles(sql: MySQLService, connection: mysql.Connection, database: string): Promise<void> {
        const udemyDirectory = args.udemyDirectory;
        const udemyFiles = await this.getUdemyFilesFromDirectory(udemyDirectory);
        const statementRecords = await sql.selectStatements(connection, database);
        for (let i = 0; i < udemyFiles.length; i++) {
            const udemyFileName = path.basename(udemyFiles[i]);
            const existingStatement = this.getExistingStatement(statementRecords, udemyFileName);
            if (existingStatement) {
                await sql.deleteStatement(connection, database, existingStatement.id);
            }
            process.stdout.write(`Importing ${udemyFileName}...`);
            const newStatement: Statement = { fileName: udemyFileName };
            await sql.insertStatement(connection, database, newStatement);
            await this.handleUdemyFile(sql, connection, database, udemyDirectory, udemyFileName, newStatement);
            console.log(`Done`);
        }
    }

    async handleUdemyFile(sql: MySQLService, connection: mysql.Connection, database: string, udemyDirectory: string, udemyFileName: string, statement: Statement): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const file = path.join(udemyDirectory, udemyFileName);
            const lock = new AwaitLock();
            let monitorStatus = 0;
            csv.parseFile(file)
                .on("data", async (line) => {
                    if (!Array.isArray(line) || line.length === 0) {
                        return;
                    }
                    if (monitorStatus === 0 && line[0] === "Transaction Id") {
                        monitorStatus = 1;
                    } else if (monitorStatus === 1) {
                        if (line[0] === "Redemptions") {
                            monitorStatus = 2;
                        } else {
                            const udemy: Udemy = {
                                transactionID: utils.coerceInt(line[0]),
                                statementID: statement.id,
                                date: new Date(line[1]),
                                userName: line[2],
                                courseName: line[3],
                                couponCode: line[4],
                                revenueChannel: line[5],
                                vendor: line[6],
                                price: utils.coerceFloat(line[7]),
                                transactionCurrency: line[8],
                                taxAmount: utils.coerceFloat(line[9]),
                                storeFee: utils.coerceFloat(line[10]),
                                sharePrice: utils.coerceFloat(line[11]),
                                instructorShare: utils.coerceFloat(line[12]),
                                taxRate: utils.coerceFloat(line[13]),
                                exchangeRate: utils.coerceFloat(line[14])
                            };
                            await lock.acquireAsync();
                            try {
                                let course = await sql.selectCourseByUdemyName(connection, database, udemy.courseName);
                                if (!course) {
                                    course = await sql.selectCourseByTeachableName(connection, database, udemy.courseName);
                                    // Course not found by udemyName, but found by teachableName. Since this is a udemy,
                                    // update the course's udemyName so it can be found next time.
                                    if (course) {
                                        course.udemyName = udemy.courseName;
                                        await sql.updateCourse(connection, database, course);
                                    } else {
                                        course = { courseName: udemy.courseName, udemyName: udemy.courseName };
                                        await sql.insertCourse(connection, database, course);
                                    }
                                }
                                await sql.insertUdemy(connection, database, udemy);
                            } finally {
                                lock.release();
                            }
                        }
                    }
                })
                .on("end", async () => {
                    await lock.acquireAsync();
                    lock.release();
                    resolve();
                });
        });
    }
}
