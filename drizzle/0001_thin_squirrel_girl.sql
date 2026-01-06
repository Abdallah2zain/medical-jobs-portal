CREATE TABLE `facility_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`note` text NOT NULL,
	`images` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facility_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationNumber` varchar(20) NOT NULL,
	`userId` int,
	`city` varchar(100) NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('submitted','processing','delivered') NOT NULL DEFAULT 'submitted',
	`matchedJobs` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `job_applications_applicationNumber_unique` UNIQUE(`applicationNumber`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleEn` varchar(255),
	`description` text,
	`requirements` text,
	`city` varchar(100) NOT NULL,
	`salaryMin` int,
	`salaryMax` int,
	`jobType` enum('full_time','part_time','contract','temporary') DEFAULT 'full_time',
	`experienceYears` int,
	`sourceUrl` text,
	`verificationStatus` enum('verified','pending','unverified') NOT NULL DEFAULT 'unverified',
	`verifiedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loginAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	`userAgent` text,
	CONSTRAINT `login_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_facilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`type` enum('hospital','complex','center','clinic','other') NOT NULL,
	`city` varchar(100) NOT NULL,
	`address` text,
	`googleMapsUrl` text,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`phone` varchar(20),
	`whatsapp` varchar(20),
	`email` varchar(320),
	`website` text,
	`imageUrl` text,
	`snapchat` varchar(100),
	`instagram` varchar(100),
	`facebook` varchar(100),
	`twitter` varchar(100),
	`tiktok` varchar(100),
	`verificationStatus` enum('verified','pending','unverified') NOT NULL DEFAULT 'unverified',
	`verifiedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medical_facilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uniqueId` varchar(36) NOT NULL,
	`userId` int,
	`language` enum('ar','en') NOT NULL DEFAULT 'ar',
	`templateId` varchar(50) DEFAULT 'classic',
	`headingFont` varchar(100),
	`headingSize` int,
	`headingColor` varchar(20),
	`subheadingFont` varchar(100),
	`subheadingSize` int,
	`subheadingColor` varchar(20),
	`bodyFont` varchar(100),
	`bodySize` int,
	`bodyColor` varchar(20),
	`fullName` varchar(255),
	`photoUrl` text,
	`address` text,
	`phone` varchar(20),
	`email` varchar(320),
	`mumaresNumber` varchar(50),
	`dataflowNumber` varchar(50),
	`iqamaNumber` varchar(50),
	`entryDate` varchar(20),
	`summary` text,
	`education` json,
	`experience` json,
	`courses` json,
	`skills` json,
	`languages` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resumes_id` PRIMARY KEY(`id`),
	CONSTRAINT `resumes_uniqueId_unique` UNIQUE(`uniqueId`)
);
--> statement-breakpoint
CREATE TABLE `site_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`pageViews` int DEFAULT 0,
	`uniqueVisitors` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_stats_id` PRIMARY KEY(`id`)
);
