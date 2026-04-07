package com.smartcampus.operations_hubdemo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SchemaRepairRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaRepairRunner.class);
    private final JdbcTemplate jdbcTemplate;

    public SchemaRepairRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            if (!tableExists("buildings1")) {
                return;
            }

            if (tableExists("floors")) {
                repairForeignKey(
                        "floors",
                        "building_id",
                        "buildings1",
                        "id",
                        "fk_floor_building",
                        "ON DELETE CASCADE"
                );
            }

            if (tableExists("rooms")) {
                repairForeignKey(
                        "rooms",
                        "building_id",
                        "buildings1",
                        "id",
                        "fk_room_building",
                        "ON DELETE RESTRICT"
                );
            }
        } catch (Exception ex) {
            log.warn("Schema repair skipped due to error: {}", ex.getMessage());
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
                Integer.class,
                tableName
        );
        return count != null && count > 0;
    }

    private void repairForeignKey(
            String tableName,
            String columnName,
            String referencedTable,
            String referencedColumn,
            String preferredConstraintName,
            String deleteRule
    ) {
        List<String> allFkNames = jdbcTemplate.queryForList(
                """
                        SELECT CONSTRAINT_NAME
                        FROM information_schema.KEY_COLUMN_USAGE
                        WHERE TABLE_SCHEMA = DATABASE()
                          AND TABLE_NAME = ?
                          AND COLUMN_NAME = ?
                          AND REFERENCED_TABLE_NAME IS NOT NULL
                        """,
                String.class,
                tableName,
                columnName
        );

        for (String fkName : allFkNames) {
            String currentReferencedTable = jdbcTemplate.queryForObject(
                    """
                            SELECT REFERENCED_TABLE_NAME
                            FROM information_schema.KEY_COLUMN_USAGE
                            WHERE TABLE_SCHEMA = DATABASE()
                              AND TABLE_NAME = ?
                              AND COLUMN_NAME = ?
                              AND CONSTRAINT_NAME = ?
                            LIMIT 1
                            """,
                    String.class,
                    tableName,
                    columnName,
                    fkName
            );

            if (currentReferencedTable != null && !referencedTable.equalsIgnoreCase(currentReferencedTable)) {
                jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP FOREIGN KEY " + fkName);
                log.info("Dropped foreign key {}.{} -> {}", tableName, fkName, currentReferencedTable);
            }
        }

        Integer validFkCount = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(*)
                        FROM information_schema.KEY_COLUMN_USAGE
                        WHERE TABLE_SCHEMA = DATABASE()
                          AND TABLE_NAME = ?
                          AND COLUMN_NAME = ?
                          AND REFERENCED_TABLE_NAME = ?
                          AND REFERENCED_COLUMN_NAME = ?
                        """,
                Integer.class,
                tableName,
                columnName,
                referencedTable,
                referencedColumn
        );

        if (validFkCount == null || validFkCount == 0) {
            jdbcTemplate.execute(
                    "ALTER TABLE " + tableName +
                            " ADD CONSTRAINT " + preferredConstraintName +
                            " FOREIGN KEY (" + columnName + ")" +
                            " REFERENCES " + referencedTable + "(" + referencedColumn + ") " +
                            deleteRule
            );
            log.info("Added foreign key {} on {}({}) -> {}({})",
                    preferredConstraintName, tableName, columnName, referencedTable, referencedColumn);
        }
    }
}
