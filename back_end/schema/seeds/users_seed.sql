-- myapp/schema/seeds/01_users_seed.sql
INSERT INTO `users` (`username`, `email`, `password_hash`)
VALUES 
('user1', 'admin@example.com', 'pbkdf2:sha256:150000$LtHJgAp8$26c3f94348e9d11d10ec65f7664b216972325748ca8bb11b9ddd9d8941eac35f'),
('user2', 'user1@example.com', 'pbkdf2:sha256:150000$WKZtODjq$9a51edfaf7cf4bab132b0fa3d61e026dc3f248fe48ede48e79fbc934a21e699b')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);