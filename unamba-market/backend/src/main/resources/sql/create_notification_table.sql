
CREATE TABLE IF NOT EXISTS tnotification (
    idNotification VARCHAR(36) PRIMARY KEY,
    idUser VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    relatedId VARCHAR(36),
    isRead TINYINT(1) DEFAULT 0,
    readAt DATETIME NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    deletedAt DATETIME NULL,
    FOREIGN KEY (idUser) REFERENCES tuser(idUser) ON DELETE CASCADE,
    INDEX idx_user (idUser),
    INDEX idx_read (isRead),
    INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
