import args from "./args";
import AwaitLock = require("await-lock");
import * as csv from "fast-csv";
import * as fs from "fs";
import * as mysql from "mysql";
import MySQLService from "./mysqlService";
import * as path from "path";
import { promisify } from "util";
import { Course } from "./interfaces";

export default class CourseNameMappingService {
    async getCourseNameMappingFilesFromDirectory(coursesDirectory: string): Promise<string[]> {
        const readdir = promisify(fs.readdir);
        return readdir(coursesDirectory);
    }

    async readAllCourseNameMappings(sql: MySQLService, connection: mysql.Connection, database: string): Promise<void> {
        const coursesDirectory = args.coursesDirectory;
        const coursesFiles = await this.getCourseNameMappingFilesFromDirectory(coursesDirectory);
        for (let i = 0; i < coursesFiles.length; i++) {
            const courseFileName = path.basename(coursesFiles[i]);
            process.stdout.write(`Importing ${courseFileName}...`);
            await this.populateCourseNameMappings(sql, connection, database, coursesDirectory, courseFileName);
            console.log(`Done`);
        }
    }

    async populateCourseNameMappings(sql: MySQLService, connection: mysql.Connection, database: string, coursesDirectory: string, courseFileName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const file = path.join(coursesDirectory, courseFileName);
            const lock = new AwaitLock();
            csv.fromPath(file, { headers: true })
                .on("data", async (line) => {
                    const course: Course = {
                        courseName: line["CourseName"],
                        teachableName: line["Teachable"] || undefined,
                        udemyName: line["Udemy"] || undefined
                    };
                    await lock.acquireAsync();
                    try {
                        let existingCourse = await sql.selectCourseByCourseName(connection, database, course.courseName);
                        if (!existingCourse) {
                            await sql.insertCourse(connection, database, course);
                        }
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
