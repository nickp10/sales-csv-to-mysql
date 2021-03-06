import args from "./args";
import AwaitLock from "await-lock";
import * as csv from "fast-csv";
import * as fs from "fs";
import * as mysql from "mysql";
import MySQLService from "./mysqlService";
import * as path from "path";
import { promisify } from "util";
import { Teachable } from "./interfaces";
import * as utils from "./utils";

export default class TeachableService {
    async getTeachableFromDirectory(teachableDirectory: string): Promise<string[]> {
        const readdir = promisify(fs.readdir);
        return readdir(teachableDirectory);
    }

    async readAllTeachables(sql: MySQLService, connection: mysql.Connection, database: string): Promise<void> {
        const teachableDirectory = args.teachableDirectory;
        const teachableFiles = await this.getTeachableFromDirectory(teachableDirectory);
        await sql.deleteTeachables(connection, database);
        for (let i = 0; i < teachableFiles.length; i++) {
            const teachableFileName = path.basename(teachableFiles[i]);
            process.stdout.write(`Importing ${teachableFileName}...`);
            await this.handleTeachable(sql, connection, database, teachableDirectory, teachableFileName);
            console.log(`Done`);
        }
    }

    async handleTeachable(sql: MySQLService, connection: mysql.Connection, database: string, teachableDirectory: string, teachableFileName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const file = path.join(teachableDirectory, teachableFileName);
            const lock = new AwaitLock();
            csv.parseFile(file, { headers: true })
                .on("data", async (line) => {
                    const teachable: Teachable = {
                        teachableID: utils.coerceInt(line["id"]),
                        purchasedAt: new Date(line["purchased_at"]),
                        courseName: line["course_name"],
                        finalPrice: utils.coerceFloat(line["final_price"]),
                        earningsUSD: utils.coerceFloat(line["earnings_usd"]),
                        coupon: line["coupon"],
                        userID: utils.coerceInt(line["user_id"]),
                        saleID: utils.coerceInt(line["sale_id"]),
                        userName: line["user"],
                        userEmail: line["user_email"]
                    };
                    await lock.acquireAsync();
                    try {
                        let course = await sql.selectCourseByTeachableName(connection, database, teachable.courseName);
                        if (!course) {
                            course = await sql.selectCourseByUdemyName(connection, database, teachable.courseName);
                            // Course not found by teachableName, but found by udemyName. Since this is a teachable,
                            // update the course's teachableName so it can be found next time.
                            if (course) {
                                course.teachableName = teachable.courseName;
                                await sql.updateCourse(connection, database, course);
                            } else {
                                course = { courseName: teachable.courseName, teachableName: teachable.courseName };
                                await sql.insertCourse(connection, database, course);
                            }
                        }
                        await sql.insertTeachable(connection, database, teachable);
                    } finally {
                        lock.release();
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
