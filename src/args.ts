import * as argv from "argv";
import * as path from "path";
import * as utils from "./utils";

class Args {
    mysqlHost: string;
    mysqlPort: number;
    mysqlDatabase: string;
    mysqlUser: string;
    mysqlPassword: string;
    teachableDirectory: string;
    udemyDirectory: string;

    constructor() {
        const args = argv
            .option({ name: "mysql-host", type: "string" })
            .option({ name: "mysql-port", type: "number" })
            .option({ name: "mysql-database", type: "string" })
            .option({ name: "mysql-user", type: "string" })
            .option({ name: "mysql-password", type: "string" })
            .option({ name: "teachable-directory", type: "string" })
            .option({ name: "udemy-directory", type: "string" })
            .run();
        const argMysqlHost = args.options["mysql-host"];
        const argMysqlPort = utils.coerceInt(args.options["mysql-port"]);
        const argMysqlDatabase = args.options["mysql-database"];
        const argMysqlUser = args.options["mysql-user"];
        const argMysqlPassword = args.options["mysql-password"];
        const argTeachableDirectory = args.options["teachable-directory"];
        const argUdemyDirectory = args.options["udemy-directory"];
        this.validate(argMysqlHost, argMysqlPort, argMysqlDatabase, argMysqlUser, argMysqlPassword, argTeachableDirectory, argUdemyDirectory);
    }

    validate(argMysqlHost: string, argMysqlPort: number, argMysqlDatabase: string, argMysqlUser: string, argMysqlPassword: string, argTeachableDirectory: string, argUdemyDirectory: string): void {
        // Validate mysql-host
        this.mysqlHost = argMysqlHost || "localhost";
        if (!this.mysqlHost) {
            console.error("The --mysql-host argument must be supplied.");
            process.exit();
        }

        // Validate mysql-port
        this.mysqlPort = argMysqlPort || 3306;
        if (!this.mysqlPort) {
            console.error("The --mysql-port argument must be supplied.");
            process.exit();
        }

        // Validate mysql-database
        this.mysqlDatabase = argMysqlDatabase || "sales";
        if (!this.mysqlDatabase) {
            console.error("The --mysql-database argument must be supplied.");
            process.exit();
        }

        // Validate mysql-user
        this.mysqlUser = argMysqlUser || "root";
        if (!this.mysqlUser) {
            console.error("The --mysql-user argument must be supplied.");
            process.exit();
        }

        // Validate mysql-password
        this.mysqlPassword = argMysqlPassword || "";

        // Validate teachable-directory
        this.teachableDirectory = argTeachableDirectory || path.join(__dirname, "..", "teachable");
        if (!this.teachableDirectory) {
            console.error("The --teachable-directory argument must be supplied.");
            process.exit();
        }

        // Validate udemy-directory
        this.udemyDirectory = argUdemyDirectory || path.join(__dirname, "..", "udemy");
        if (!this.udemyDirectory) {
            console.error("The --udemy-directory argument must be supplied.");
            process.exit();
        }
    }
}

export default new Args();
