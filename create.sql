CREATE TABLE packages (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(64) NOT NULL,
    body TEXT(65535) NOT NULL
)
-- run me first
