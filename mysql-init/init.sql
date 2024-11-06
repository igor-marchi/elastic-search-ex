-- /mysql-init/init.sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES
    ('João Silva', 'joao@example.com'),
    ('Maria Santos', 'maria@example.com'),
    ('Pedro Oliveira', 'pedro@example.com');