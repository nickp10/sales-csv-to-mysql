#! /usr/bin/env node

import args from "./args";
import * as mysql from "mysql";
import MySQLService from "./mysqlService";
import TeachableService from "./teachableService";
import UdemyService from "./udemyService";

async function connect(sql: MySQLService): Promise<mysql.Connection> {
    try {
        return await sql.connect({
            host: args.mysqlHost,
            port: args.mysqlPort,
            user: args.mysqlUser,
            password: args.mysqlPassword
        });
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}

async function createDatabase(sql: MySQLService, connection: mysql.Connection): Promise<void> {
    try {
        process.stdout.write(`Creating database ${args.mysqlDatabase} if it does not exist...`);
        await sql.createDatabase(connection, args.mysqlDatabase);
        console.log("Done");
    } catch (error) {
        console.log(error.message);
        await sql.disconnect(connection);
        process.exit();
    }
}

async function createTables(sql: MySQLService, connection: mysql.Connection): Promise<void> {
    try {
        process.stdout.write(`Creating table courses if it does not exist...`);
        await sql.createCoursesTable(connection, args.mysqlDatabase);
        console.log("Done");

        process.stdout.write(`Creating table statements if it does not exist...`);
        await sql.createStatementsTable(connection, args.mysqlDatabase);
        console.log("Done");

        process.stdout.write(`Creating table udemy if it does not exist...`);
        await sql.createUdemyTable(connection, args.mysqlDatabase);
        console.log("Done");

        process.stdout.write(`Creating table teachable if it does not exist...`);
        await sql.createTeachableTable(connection, args.mysqlDatabase);
        console.log("Done");
    } catch (error) {
        console.log(error.message);
        await sql.disconnect(connection);
        process.exit();
    }
}

async function processUdemy(sql: MySQLService, connection: mysql.Connection): Promise<void> {
    try {
        const service = new UdemyService();
        await service.readAllUdemyFiles(sql, connection, args.mysqlDatabase);
    } catch (error) {
        console.log(error.message);
        await sql.disconnect(connection);
        process.exit();
    }
}

async function processTeachables(sql: MySQLService, connection: mysql.Connection): Promise<void> {
    try {
        const service = new TeachableService();
        await service.readAllTeachables(sql, connection, args.mysqlDatabase);
    } catch (error) {
        console.log(error.message);
        await sql.disconnect(connection);
        process.exit();
    }
}

async function main(): Promise<void> {
    const sql = new MySQLService();
    const connection = await connect(sql);
    await createDatabase(sql, connection);
    await createTables(sql, connection);
    await processUdemy(sql, connection);
    await processTeachables(sql, connection);
    await sql.disconnect(connection);
    process.exit();
}

main();
