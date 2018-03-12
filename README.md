# sales-csv-to-mysql

Description
----
A node package that will search through a CSV file and import records into a MySQL database. This will create various tables if they do not exist: courses, statements, teachable, and udemy. This will read all CSV files in both the teachable and udemy directories. All CSV file names that appear in the statements table will have the corresponding statement record deleted (cascading to delete all the corresponding teachable and udemy records). After a CSV file has been processed, it will be inserted into the statements directory to be re-imported next time. All rows in the CSV files will be processed. If a row represents a valid transaction, its data will be inserted into either the teachable or udemy table. Otherwise, the row will be skipped.

Command Line Interface
----
This package is only usable via a command line interface (CLI). This package has the following arguments:

* *--mysql-host* - **Optional.** This is the server name to connect to MySQL. This will default to `localhost`.
* *--mysql-port* - **Optional.** This is the port to connect to MySQL. This will default to `3306`.
* *--mysql-database* - **Optional.** This is the name of the MySQL database to connect to. This will default to `sales`.
* *--mysql-user* - **Optional.** This is the username to connect to MySQL. This will default to `root`.
* *--mysql-password* - **Optional.** This is the passwrod to connect to MySQL. This will default to an empty password.
* *--teachable-directory* - **Optional.** This is an optional directory to read the teachable CSV files from. This will default to a teachable subdirectory in the current executing directory.
* *--udemy-directory* - **Optional.** This is an optional directory to read the udemy CSV files from. This will default to a udemy subdirectory in the current executing directory.
