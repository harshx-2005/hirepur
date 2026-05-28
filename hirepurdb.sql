-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: hirepur
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `user_id` int NOT NULL,
  `resume_url` varchar(500) DEFAULT NULL,
  `cover_letter` text,
  `status` enum('applied','under_review','interview','accepted','rejected') DEFAULT 'applied',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,2,6,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','interview','2026-03-16 05:02:39'),(2,2,7,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','under_review','2026-03-16 05:02:39'),(3,2,8,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','interview','2026-03-16 05:02:39'),(4,3,7,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','rejected','2026-03-16 05:02:39'),(5,3,8,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','rejected','2026-03-16 05:02:39'),(6,3,4,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','accepted','2026-03-16 05:02:39'),(7,4,8,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','under_review','2026-03-16 05:02:39'),(8,4,4,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','interview','2026-03-16 05:02:39'),(9,4,5,'https://res.cloudinary.com/demo/image/upload/v1596707323/sample.jpg','This is a sample cover letter for testing.','interview','2026-03-16 05:02:39');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,9,2,'Hi ','2026-03-16 10:57:18'),(2,9,2,'hi','2026-03-16 11:10:19'),(3,9,2,'whats','2026-03-16 11:17:48'),(4,9,2,'good','2026-03-16 11:18:20');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employer_profile`
--

DROP TABLE IF EXISTS `employer_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employer_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `company_logo` varchar(500) DEFAULT NULL,
  `company_website` varchar(255) DEFAULT NULL,
  `company_size` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `company_description` text,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `employer_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_profile`
--

LOCK TABLES `employer_profile` WRITE;
/*!40000 ALTER TABLE `employer_profile` DISABLE KEYS */;
INSERT INTO `employer_profile` VALUES (1,2,'Demo Company',NULL,NULL,NULL,NULL,NULL,NULL),(2,12,'New Company',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `employer_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_seeker_profile`
--

DROP TABLE IF EXISTS `job_seeker_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_seeker_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `headline` varchar(255) DEFAULT NULL,
  `summary` text,
  `skills` json DEFAULT NULL,
  `experience` json DEFAULT NULL,
  `education` json DEFAULT NULL,
  `projects` json DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `resume_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `job_seeker_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_seeker_profile`
--

LOCK TABLES `job_seeker_profile` WRITE;
/*!40000 ALTER TABLE `job_seeker_profile` DISABLE KEYS */;
INSERT INTO `job_seeker_profile` VALUES (1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,2,NULL,NULL,NULL,'[\"\"]','[{\"role\": \"\", \"period\": \"\", \"company\": \"\", \"description\": \"\"}]','[{\"year\": \"\", \"degree\": \"\", \"institution\": \"\"}]',NULL,NULL,NULL,NULL,NULL),(3,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,9,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,10,'','','','[\"React\"]','[]','[]','[]','','','',NULL),(10,11,'','','','[\"React\", \"Node.js\", \"Express.js\", \"MySQL\", \"MongoDB\"]','[]','[{\"year\": \"2023-2026\", \"degree\": \"BSC. CS\", \"institution\": \"SIIT\"}]','[]','','','',NULL);
/*!40000 ALTER TABLE `job_seeker_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employer_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `experience_required` varchar(100) DEFAULT NULL,
  `job_type` varchar(100) DEFAULT NULL,
  `work_mode` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `skills_required` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employer_id` (`employer_id`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `employer_profile` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (2,1,'Senior React Developer','We are looking for an experienced React developer to lead our frontend architecture. Must have strong skills in Next.js and TailwindCSS.','18 LPA - 25 LPA','5+ Years','full-time','remote','Bengaluru / Remote','[\"React\", \"Next.js\", \"TypeScript\", \"TailwindCSS\"]','2026-03-16 05:02:39'),(3,1,'Backend Node.js Engineer','Join our core infrastructure team building scalable APIs. Experience with Express, microservices, and MySQL is highly required.','12 LPA - 18 LPA','2-4 Years','full-time','hybrid','Pune','[\"Node.js\", \"Express\", \"MySQL\", \"Redis\"]','2026-03-16 05:02:39'),(4,1,'UI/UX Designer','Create beautiful and intuitive interfaces for our fintech products. Must have a strong portfolio demonstrating SaaS web app designs.','8 LPA - 14 LPA','1-3 Years','full-time','office','Mumbai','[\"Figma\", \"Prototyping\", \"Wireframing\", \"User Research\"]','2026-03-16 05:02:39'),(5,2,'Node Js Developer','Fresher or Experienced both are welcome.','3LPA-4LPA','Any','full-time','office','Delhi','[\"Node.js\", \"React.js\", \"Next.js\"]','2026-03-23 05:26:36'),(6,2,'DBA ','Database expert ','4LPA-6LPA','2Years','full-time','office','Pune','[\"mysql\", \"postgresql\"]','2026-03-23 07:34:40');
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `job_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`job_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `saved_jobs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_jobs_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_jobs`
--

LOCK TABLES `saved_jobs` WRITE;
/*!40000 ALTER TABLE `saved_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('job_seeker','employer','admin') NOT NULL,
  `profile_pic` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Demo','demouser@gmail.com','$2b$10$s1v6xOcKRKRXAN.Br3atFu8sV7suRbZCTOcUqE2/2nzZ0DIz1CwhO','job_seeker',NULL,'2026-03-07 04:42:29'),(2,'Demo','demouser1@gmail.com','$2b$10$ZSG3gcDSb29QkUd1Ztw36uNggstJ/HTqUnjItESHHpRGjQ3E5gyyu','employer',NULL,'2026-03-07 05:22:41'),(3,'System Admin','admin@gmail.com','$2b$10$gLEZbuzG1kdCHsZYdfp1IeAq4U.YtiT26eK8kBNBh9AKmvo3j.mju','admin',NULL,'2026-03-14 14:02:46'),(4,'Candidate 1','candidate1@gmail.com','$2b$10$gqyBtj1Wl4fOBIUum1pDvO8QrIjNOi1z8j6kJhjfsrpOy4yjTnVF2','job_seeker',NULL,'2026-03-16 05:02:38'),(5,'Candidate 2','candidate2@gmail.com','$2b$10$VlKPmxfMUXhf6Zo4GHlhVOwFDvYVfgAByI.d7wS6N1gWO6WH8myVy','job_seeker',NULL,'2026-03-16 05:02:38'),(6,'Candidate 3','candidate3@gmail.com','$2b$10$N.CRjI5PwAueXLpgGz3fwOh3iVuOv.a9ee6YmUqFpzVZMN1m6MQKa','job_seeker',NULL,'2026-03-16 05:02:38'),(7,'Candidate 4','candidate4@gmail.com','$2b$10$icNxc62i/qcj8VAponPe.uH5CS.bYuNXSx5Sof5zOSMJP3WZc8GVq','job_seeker',NULL,'2026-03-16 05:02:38'),(8,'Candidate 5','candidate5@gmail.com','$2b$10$jVtU6Y10HEJE1RBdqcw4Je9GAH78cpbxXIsJ/.I/LTseVmJ3/UKSu','job_seeker',NULL,'2026-03-16 05:02:39'),(9,'newuser','newuser@gmail.com','$2b$10$/LS1ZgryN67Yy6chuVfx8uLpWo1VT0cFXnS7WHWg9d2eQ1kd2p.t.','job_seeker',NULL,'2026-03-16 10:56:28'),(10,'jobseeker','jobseeker@gmail.com','$2b$10$/yyp9MpQb2W85eu8m1YNheTclOqeDPguCtJUUDLTIu3o5in1BNzg.','job_seeker',NULL,'2026-03-18 13:40:10'),(11,'Harsh','harshkshirsagar1289@gmail.com','$2b$10$9jGslDKPWESUZR/Ssnyp9upwT.jZvh0l2.msX0JtVxPloKz3X5PWq','job_seeker','https://res.cloudinary.com/dsttnp1op/image/upload/v1774248704/hirepur/qj2pcqdydumy5w7vtnmj.jpg','2026-03-23 02:49:26'),(12,'New Employer','new@gmail.com','$2b$10$avQU3VPmOyO.PNsJ3g9uduInbj.gOlJbgh9PAuqvdtNveaD4h2JBm','employer',NULL,'2026-03-23 05:22:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11 15:53:16
