
CREATE TABLE IF NOT EXISTS trefresh_token (
    idToken VARCHAR(36) PRIMARY KEY,
    idUser VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiryDate DATETIME NOT NULL,
    revoked TINYINT(1) DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    deletedAt DATETIME NULL,
    FOREIGN KEY (idUser) REFERENCES tuser(idUser) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (idUser),
    INDEX idx_expiry (expiryDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
