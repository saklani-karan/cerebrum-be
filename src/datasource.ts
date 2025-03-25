import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
config();

const options: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: process.env.DB_SCHEMA,
    logging: !!process.env.DB_LOGGING,
    synchronize: false,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
};

const datasource = new DataSource(options);

export default datasource;
