-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(60) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ALTER TABLE posts ADD subredditId INT; 
-- ALTER TABLE posts add FOREIGN KEY (`subredditId`) REFERENCES `subreddits` (`id`) ON DELETE SET NULL;

-- this table will hold subreddits, each post is associated to a subredditId
CREATE TABLE `subreddits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) UNIQUE NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- a table that will create comments and relate it to its replies as well with a parentId
CREATE TABLE `comments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `parentId` INT(11) DEFAULT NULL,
  `comment` VARCHAR (10000) NOT NULL,
  `userId` INT (11),
  `postId` INT (11),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `postId` (`postId`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;



CREATE TABLE `votes` (
  `vote` TINYINT,
  `userId` INT,
  `postId` INT,
  `createdAt` DATETIME,
  `updatedAt` TIMESTAMP,
  PRIMARY KEY (`userId`, `postId`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  FOREIGN KEY (`postId`) REFERENCES `posts` (`id`)
);


CREATE TABLE `sessions` (
  `userId` INT,
  `token` VARCHAR(10000)
);


